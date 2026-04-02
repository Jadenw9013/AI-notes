import { NextRequest, NextResponse } from 'next/server';
import {
  fetchNotes,
  createNote,
  fetchNote,
  updateNote,
  deleteNote,
} from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('id');

    if (noteId) {
      const note = await fetchNote(noteId);
      return NextResponse.json({ success: true, data: note });
    }

    const notes = await fetchNotes();
    return NextResponse.json({ success: true, data: notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, projectId } = body;

    const note = await createNote(title || 'Untitled', projectId);
    return NextResponse.json({ success: true, data: note });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing note ID' },
        { status: 400 }
      );
    }

    const note = await updateNote(id, updates);
    return NextResponse.json({ success: true, data: note });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('id');

    if (!noteId) {
      return NextResponse.json(
        { error: 'Missing note ID' },
        { status: 400 }
      );
    }

    await deleteNote(noteId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
