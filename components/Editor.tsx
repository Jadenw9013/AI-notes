import { useCallback, useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

type Mode = "continue" | "rewrite" | "summarize" | "todos";

export default function Editor() {
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [pdfText, setPdfText] = useState("");

  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: "Write notes here. Type / for commands…" })],
    content: "",
    autofocus: "end",
    immediatelyRender: false,
  });

  const runAI = useCallback(async (mode: Mode) => {
    if (!editor) return;
    setLoading(true);
    setStreamText("");

    // Move getSelectionText here
    const getSelectionText = () => {
      if (!editor) return "";
      const { from, to } = editor.state.selection;
      return editor.state.doc.textBetween(from, to, "\n");
    };

    const selection = getSelectionText();
    const text = editor.getText() + (pdfText ? `\n\n[PDF Notes]\n${pdfText}` : "");

    const res = await fetch("/api/ai/complete", {
      method: "POST",
      body: JSON.stringify({ mode, text, selection, instruction: mode === "rewrite" ? "clear and concise" : undefined }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    let acc = "";
    while (reader) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      acc += chunk;
      setStreamText(acc);
    }

    // Insert result
    if (mode === "rewrite" && selection) {
      editor.chain().focus().deleteSelection().insertContent(acc).run();
    } else {
      editor.chain().focus().insertContent(acc).run();
    }

    setStreamText("");
    setLoading(false);
  }, [editor, pdfText]);

  // simple slash commands
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
    if (json.text) setPdfText(json.text);
  };

  return (
    <div className="editor-wrap">
      <div className="toolbar">
        <button onClick={() => editor?.chain().focus().toggleBold().run()} aria-label="Bold"><b>B</b></button>
        <button onClick={() => editor?.chain().focus().toggleItalic().run()} aria-label="Italic"><i>I</i></button>
        <span className="spacer" />
        <button onClick={() => runAI("continue")} disabled={loading}>Continue (⌘/Ctrl+Space)</button>
        <button onClick={() => runAI("rewrite")} disabled={loading}>Rewrite (⌘/Ctrl+E)</button>
        <button onClick={() => runAI("summarize")} disabled={loading}>Summarize</button>
        <button onClick={() => runAI("todos")} disabled={loading}>Action items</button>
        <label className="upload">
          Upload PDF
          <input type="file" accept="application/pdf" onChange={(e) => e.target.files && onUploadPdf(e.target.files[0])} hidden />
        </label>
      </div>

      <div className={`editor ${loading ? "loading" : ""}`} aria-busy={loading}>
        <EditorContent editor={editor} />
        {streamText && <div className="ghost-suggestion">{streamText}</div>}
      </div>
    </div>
  );
}
