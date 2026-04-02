import dynamic from "next/dynamic";
import Head from "next/head";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import type { Note } from "@/lib/supabase";

const Editor = dynamic(() => import("../../components/Editor"), { ssr: false });

export default function Home() {
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWelcomeNote = async () => {
      try {
        const res = await fetch('/api/notes');
        const result = await res.json();
        if (result.data && result.data.length > 0) {
          setActiveNote(result.data[0]);
        }
      } catch (error) {
        console.error('Failed to load notes:', error);
      }
    };
    fetchWelcomeNote();
  }, []);

  const handleSelectNote = async (noteId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notes?id=${noteId}`);
      const result = await res.json();
      if (result.data) {
        setActiveNote(result.data);
      }
    } catch (error) {
      console.error('Failed to load note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Note' }),
      });
      const result = await res.json();
      if (result.data) {
        setActiveNote(result.data);
      }
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  return (
    <>
      <Head>
        <title>{activeNote?.title || "AI Notes"} - Intelligent Note Taking</title>
        <meta name="description" content="A professional AI-powered note taking application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="app-layout">
        <Sidebar activeNoteId={activeNote?.id} onSelectNote={handleSelectNote} onCreateNote={handleCreateNote} />
        
        <main className="main-content">
          <Header />
          
          <div className="editor-container">
            {activeNote ? (
              <>
                <h1 className="editor-title">{activeNote.title || 'Untitled'}</h1>
                <div className="editor-meta">
                  <span>Last edited {new Date(activeNote.updated_at).toLocaleDateString()}</span>
                </div>
                <Editor 
                  noteId={activeNote.id}
                  noteTitle={activeNote.title}
                  initialContent={activeNote.content}
                  onContentChange={(content) => {
                    setActiveNote({ ...activeNote, content });
                  }}
                />
              </>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
                {loading ? 'Loading note...' : 'No notes found. Create a new note to get started.'}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
