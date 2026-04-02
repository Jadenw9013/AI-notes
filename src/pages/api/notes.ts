import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the auth token from the request cookies or header
  const authHeader = req.headers.authorization;
  const cookieHeader = req.headers.cookie;
  
  // Extract token from cookies (Supabase stores it as sb-*-auth-token)
  let accessToken: string | null = null;
  
  if (authHeader?.startsWith('Bearer ')) {
    accessToken = authHeader.substring(7);
  } else if (cookieHeader) {
    // Parse cookies to find the Supabase auth token
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    // Look for any Supabase auth token cookie
    for (const [key, value] of Object.entries(cookies)) {
      if (key.includes('auth-token')) {
        try {
          const parsed = JSON.parse(decodeURIComponent(value));
          accessToken = parsed.access_token || parsed[0];
        } catch {
          // Try base64 decode
          try {
            const decoded = Buffer.from(value, 'base64').toString();
            const parsed = JSON.parse(decoded);
            accessToken = parsed.access_token;
          } catch {
            // Not a valid token
          }
        }
      }
    }
  }

  // Create Supabase client with auth context
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
  });

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const { id } = req.query;
        
        if (id) {
          const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;
          return res.status(200).json({ success: true, data });
        }
        
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .order('updated_at', { ascending: false });
        
        if (error) throw error;
        return res.status(200).json({ success: true, data });
      }

      case 'POST': {
        const { title, projectId } = req.body;
        
        const { data, error } = await supabase
          .from('notes')
          .insert([{
            title: title || 'Untitled',
            content: '',
            project_id: projectId || null,
            user_id: user.id,
            is_favorite: false,
          }])
          .select()
          .single();
        
        if (error) throw error;
        return res.status(201).json({ success: true, data });
      }

      case 'PUT': {
        const { id, ...updates } = req.body;
        
        if (!id) {
          return res.status(400).json({ error: 'Missing note ID' });
        }
        
        const { data, error } = await supabase
          .from('notes')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return res.status(200).json({ success: true, data });
      }

      case 'DELETE': {
        const { id } = req.query;
        
        if (!id) {
          return res.status(400).json({ error: 'Missing note ID' });
        }
        
        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('id', id as string);
        
        if (error) throw error;
        return res.status(200).json({ success: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Notes API error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
