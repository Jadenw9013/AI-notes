import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  project_id: string | null;
  user_id: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

// Auth functions
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || 
        `${typeof window !== 'undefined' ? window.location.origin : ''}/`,
    },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

// Fetch all projects for current user
export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Fetch all notes for current user
export async function fetchNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Fetch notes by project
export async function fetchNotesByProject(projectId: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Fetch favorite notes
export async function fetchFavoriteNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('is_favorite', true)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Fetch a single note
export async function fetchNote(noteId: string): Promise<Note | null> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

// Create a new note (user_id automatically set via RLS)
export async function createNote(
  title: string,
  userId: string,
  projectId?: string
): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .insert([
      {
        title,
        content: '',
        project_id: projectId || null,
        user_id: userId,
        is_favorite: false,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update a note
export async function updateNote(
  noteId: string,
  updates: Partial<Note>
): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', noteId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a note
export async function deleteNote(noteId: string): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId);

  if (error) throw error;
}

// Create a new project
export async function createProject(
  name: string,
  userId: string,
  description?: string
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert([
      {
        name,
        description: description || null,
        color: '#6366f1',
        user_id: userId,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update a project
export async function updateProject(
  projectId: string,
  updates: Partial<Project>
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a project
export async function deleteProject(projectId: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) throw error;
}
