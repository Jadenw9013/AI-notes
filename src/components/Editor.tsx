import { useCallback, useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

type Mode = "continue" | "rewrite" | "summarize" | "actionItems";

interface EditorProps {
  noteId: string;
  noteTitle: string;
  initialContent: string;
  onContentChange?: (content: string) => void;
}

const BoldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/>
  </svg>
);

const ItalicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" x2="10" y1="4" y2="4"/>
    <line x1="14" x2="5" y1="20" y2="20"/>
    <line x1="15" x2="9" y1="4" y2="20"/>
  </svg>
);

const StrikethroughIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4H9a3 3 0 0 0-2.83 4"/>
    <path d="M14 12a4 4 0 0 1 0 8H6"/>
    <line x1="4" x2="20" y1="12" y2="12"/>
  </svg>
);

const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" x2="21" y1="6" y2="6"/>
    <line x1="8" x2="21" y1="12" y2="12"/>
    <line x1="8" x2="21" y1="18" y2="18"/>
    <line x1="3" x2="3.01" y1="6" y2="6"/>
    <line x1="3" x2="3.01" y1="12" y2="12"/>
    <line x1="3" x2="3.01" y1="18" y2="18"/>
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
);

const PenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
  </svg>
);

const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" x2="8" y1="13" y2="13"/>
    <line x1="16" x2="8" y1="17" y2="17"/>
    <line x1="10" x2="8" y1="9" y2="9"/>
  </svg>
);

const CheckSquareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" x2="12" y1="3" y2="15"/>
  </svg>
);

export default function Editor({ noteId, noteTitle, initialContent, onContentChange }: EditorProps) {
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [pdfText, setPdfText] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing, or press Ctrl+Space for AI...",
      }),
    ],
    content: initialContent,
    autofocus: "end",
    immediatelyRender: false,
    onUpdate({ editor }) {
      onContentChange?.(editor.getHTML());
      // Auto-save after user stops typing (2 seconds)
      if (isSaving) return;
      const timeout = setTimeout(() => {
        saveNote(editor.getHTML());
      }, 2000);
      return () => clearTimeout(timeout);
    },
  });

  const saveNote = useCallback(
    async (content: string) => {
      if (!noteId || isSaving) return;
      setIsSaving(true);
      try {
        await fetch('/api/notes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: noteId,
            title: noteTitle,
            content,
          }),
        });
      } catch (error) {
        console.error('Failed to save note:', error);
      } finally {
        setIsSaving(false);
      }
    },
    [noteId, noteTitle, isSaving]
  );

  const runAI = useCallback(
    async (mode: Mode) => {
      if (!editor) return;
      setLoading(true);
      setStreamText("");

      const getSelectionText = () => {
        if (!editor) return "";
        const { from, to } = editor.state.selection;
        return editor.state.doc.textBetween(from, to, "\n");
      };

      const selection = getSelectionText();
      const noteContent = editor.getHTML() + (pdfText ? `\n\n[PDF Notes]\n${pdfText}` : "");

      const res = await fetch("/api/ai/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: selection,
          noteContent,
          noteTitle,
          action: mode,
        }),
      });

      const result = await res.json();

      if (!result.success) {
        console.error('AI error:', result.error);
        setLoading(false);
        return;
      }

      const aiResponse = result.result;

      if (mode === "rewrite" && selection) {
        editor.chain().focus().deleteSelection().insertContent(aiResponse).run();
      } else {
        editor.chain().focus().insertContent(aiResponse).run();
      }

      setStreamText("");
      setLoading(false);
      
      // Save after AI operation
      setTimeout(() => saveNote(editor.getHTML()), 500);
    },
    [editor, pdfText, noteTitle, noteId, saveNote]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!editor) return;
      if (e.key === " " && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        runAI("continue");
      }
      if (e.key.toLowerCase() === "e" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        runAI("rewrite");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editor, runAI]);

  const onUploadPdf = async (file: File) => {
    const buf = await file.arrayBuffer();
    const res = await fetch("/api/upload", { method: "POST", body: buf });
    const json = await res.json();
    if (json.text) {
      setPdfText(json.text);
      setPdfName(file.name);
    }
  };

  return (
    <div className="editor-wrap">
      {/* Formatting Toolbar */}
      <div className="toolbar">
        <div className="toolbar-group">
          <button
            className={`toolbar-btn toolbar-btn-icon ${editor?.isActive("bold") ? "active" : ""}`}
            onClick={() => editor?.chain().focus().toggleBold().run()}
            aria-label="Bold"
            title="Bold"
          >
            <BoldIcon />
          </button>
          <button
            className={`toolbar-btn toolbar-btn-icon ${editor?.isActive("italic") ? "active" : ""}`}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            aria-label="Italic"
            title="Italic"
          >
            <ItalicIcon />
          </button>
          <button
            className={`toolbar-btn toolbar-btn-icon ${editor?.isActive("strike") ? "active" : ""}`}
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            aria-label="Strikethrough"
            title="Strikethrough"
          >
            <StrikethroughIcon />
          </button>
          <button
            className={`toolbar-btn toolbar-btn-icon ${editor?.isActive("bulletList") ? "active" : ""}`}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            aria-label="Bullet list"
            title="Bullet list"
          >
            <ListIcon />
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* AI Commands */}
        <div className="ai-commands">
          <button
            className="ai-command-btn"
            onClick={() => runAI("continue")}
            disabled={loading}
            title="Continue writing"
          >
            <SparklesIcon />
            Continue
          </button>
          <button
            className="ai-command-btn"
            onClick={() => runAI("rewrite")}
            disabled={loading}
            title="Rewrite selection"
          >
            <PenIcon />
            Rewrite
          </button>
          <button
            className="ai-command-btn"
            onClick={() => runAI("summarize")}
            disabled={loading}
            title="Summarize content"
          >
            <FileTextIcon />
            Summarize
          </button>
          <button
            className="ai-command-btn"
            onClick={() => runAI("actionItems")}
            disabled={loading}
            title="Extract action items"
          >
            <CheckSquareIcon />
            Actions
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Upload */}
        <label className="upload-btn" title="Upload PDF">
          <UploadIcon />
          {pdfName || "Upload PDF"}
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => e.target.files && onUploadPdf(e.target.files[0])}
            hidden
          />
        </label>
      </div>

      {/* Editor Content */}
      <div className={`editor ${loading ? "loading" : ""}`} aria-busy={loading}>
        <EditorContent editor={editor} />
        {streamText && <div className="ghost-suggestion">{streamText}</div>}
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div style={{ marginTop: "24px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "12px", color: "var(--muted)", display: "flex", alignItems: "center", gap: "6px" }}>
          <kbd>Ctrl</kbd>+<kbd>Space</kbd> Continue
        </span>
        <span style={{ fontSize: "12px", color: "var(--muted)", display: "flex", alignItems: "center", gap: "6px" }}>
          <kbd>Ctrl</kbd>+<kbd>E</kbd> Rewrite
        </span>
        <span style={{ fontSize: "12px", color: "var(--muted)", display: "flex", alignItems: "center", gap: "6px" }}>
          <kbd>/</kbd> Commands
        </span>
      </div>
    </div>
  );
}
