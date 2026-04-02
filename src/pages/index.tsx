import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import type { Note } from "@/lib/supabase";

const Editor = dynamic(() => import("../../components/Editor"), { ssr: false });

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);
  const [notesRefreshKey, setNotesRefreshKey] = useState(0);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Fetch notes when authenticated
  useEffect(() => {
    if (!user) return;

    const fetchInitialNote = async () => {
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
    fetchInitialNote();
  }, [user]);

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
        setNotesRefreshKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--muted)' }}>Loading...</p>
      </div>
    );
  }

  // Don't render main app if not authenticated
  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{activeNote?.title || "AI Notes"} - Intelligent Note Taking</title>
        <meta name="description" content="A professional AI-powered note taking application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="app-layout">
        <Sidebar 
          key={notesRefreshKey}
          activeNoteId={activeNote?.id} 
          onSelectNote={handleSelectNote} 
          onCreateNote={handleCreateNote} 
        />
        
        <main className="main-content">
          <Header userEmail={user.email} onSignOut={handleSignOut} />
          
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
              <div className="empty-state">
                <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
                <h2 className="empty-state-title">
                  {loading ? 'Loading...' : 'No notes yet'}
                </h2>
                <p className="empty-state-description">
                  {loading ? '' : 'Create your first note to get started with AI-powered note taking.'}
                </p>
                {!loading && (
                  <button className="btn btn-primary" onClick={handleCreateNote} style={{ marginTop: '16px' }}>
                    Create Note
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
