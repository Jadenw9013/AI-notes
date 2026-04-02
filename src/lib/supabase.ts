import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  project_id: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

// Fetch all projects
export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Fetch all notes
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

// Create a new note
export async function createNote(
  title: string,
  projectId?: string
): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .insert([
      {
        title,
        content: '',
        project_id: projectId || null,
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
  description?: string
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert([
      {
        name,
        description: description || null,
        color: '#6366f1',
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
