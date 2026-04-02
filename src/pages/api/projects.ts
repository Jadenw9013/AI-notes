import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const { id, notes } = req.query;
        
        if (id && notes === 'true') {
          const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('project_id', id)
            .order('updated_at', { ascending: false });
          
          if (error) throw error;
          return res.status(200).json({ success: true, data });
        }
        
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return res.status(200).json({ success: true, data });
      }

      case 'POST': {
        const { name, description } = req.body;
        
        if (!name) {
          return res.status(400).json({ error: 'Project name is required' });
        }
        
        const { data, error } = await supabase
          .from('projects')
          .insert([{
            name,
            description: description || null,
            color: '#6366f1',
            user_id: user.id,
          }])
          .select()
          .single();
        
        if (error) throw error;
        return res.status(201).json({ success: true, data });
      }

      case 'PUT': {
        const { id, ...updates } = req.body;
        
        if (!id) {
          return res.status(400).json({ error: 'Missing project ID' });
        }
        
        const { data, error } = await supabase
          .from('projects')
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
          return res.status(400).json({ error: 'Missing project ID' });
        }
        
        const { error } = await supabase
          .from('projects')
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
    console.error('Projects API error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
