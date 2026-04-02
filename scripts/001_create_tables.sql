-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#808080',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Untitled',
  content TEXT DEFAULT '',
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notes_project_id ON notes(project_id);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_is_favorite ON notes(is_favorite);

-- Insert a default project
INSERT INTO projects (name, description, color)
VALUES ('Personal', 'My personal notes', '#6366f1')
ON CONFLICT DO NOTHING;

-- Insert a welcome note
INSERT INTO notes (title, content, is_favorite)
VALUES (
  'Welcome to AI Notes',
  '<p>Welcome to <strong>AI Notes</strong> - your intelligent note-taking companion.</p><p>Here are some things you can do:</p><ul><li>Press <code>Ctrl+Space</code> to let AI continue your writing</li><li>Select text and press <code>Ctrl+E</code> to rewrite it</li><li>Use the toolbar buttons to summarize or extract action items</li><li>Upload PDFs to include their content as context</li></ul><p>Start typing below to create your first note!</p>',
  true
)
ON CONFLICT DO NOTHING;
