"use client";

import { useEffect, useRef, useState } from "react";
import "quill/dist/quill.snow.css";

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

interface QuillLike {
  root: { innerHTML: string };
  on: (event: string, handler: () => void) => void;
}

export default function QuillEditor({ value, onChange, placeholder }: QuillEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<QuillLike | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    let active = true;

    async function loadQuill() {
      if (!editorRef.current || quillInstance.current) return;

      const QuillModule = await import("quill");
      const Quill = QuillModule.default || QuillModule;

      if (!active || !editorRef.current) return;

      const quill = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: placeholder || "Tulis isi artikel di sini...",
        modules: {
          toolbar: [
            [{ header: [2, 3, 4, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            ["blockquote", "code-block"],
            ["link", "clean"],
          ],
        },
      });

      quillInstance.current = quill as unknown as QuillLike;

      if (value) {
        quill.root.innerHTML = value;
      }

      quill.on("text-change", () => {
        const html = quill.root.innerHTML;
        onChangeRef.current(html === "<p><br></p>" ? "" : html);
      });

      setIsLoaded(true);
    }

    loadQuill();

    return () => {
      active = false;
      quillInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync value if updated externally (like when selecting a different blog to edit)
  useEffect(() => {
    if (quillInstance.current && isLoaded) {
      if (quillInstance.current.root.innerHTML !== (value || "")) {
        quillInstance.current.root.innerHTML = value || "";
      }
    }
  }, [value, isLoaded]);

  return (
    <div className="quill-wrapper bg-white rounded-xl shadow-xs border border-slate-200">
      <style jsx global>{`
        .quill-wrapper {
          position: relative;
        }
        .quill-wrapper .ql-toolbar.ql-snow {
          position: sticky !important;
          top: 64px !important;
          z-index: 20 !important;
          border: none !important;
          border-bottom: 1px solid #e2e8f0 !important;
          background-color: #f8fafc !important;
          padding: 8px 12px !important;
          border-top-left-radius: 0.75rem !important;
          border-top-right-radius: 0.75rem !important;
          box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.05) !important;
        }
        .quill-wrapper .ql-container.ql-snow {
          border: none !important;
          background-color: #ffffff !important;
          font-family: inherit !important;
          border-bottom-left-radius: 0.75rem !important;
          border-bottom-right-radius: 0.75rem !important;
        }
        .quill-wrapper .ql-editor {
          color: #0f172a;
          font-size: 14px;
          line-height: 1.7;
          min-height: 320px;
          padding: 16px;
        }
        .quill-wrapper .ql-editor h2 {
          color: #0f172a;
          font-size: 20px;
          font-weight: 700;
          margin-top: 18px;
          margin-bottom: 8px;
        }
        .quill-wrapper .ql-editor h3 {
          color: #0f172a;
          font-size: 16px;
          font-weight: 700;
          margin-top: 14px;
          margin-bottom: 6px;
        }
        .quill-wrapper .ql-editor a {
          color: #4f46e5 !important;
          text-decoration: underline !important;
          font-weight: 600 !important;
        }
        .quill-wrapper .ql-editor blockquote {
          border-left: 4px solid #6366f1 !important;
          background-color: #f8fafc !important;
          padding: 8px 16px !important;
          border-radius: 0 8px 8px 0 !important;
          color: #334155 !important;
          font-style: italic !important;
          margin: 12px 0 !important;
        }
        .quill-wrapper .ql-editor pre.ql-syntax,
        .quill-wrapper .ql-editor pre {
          background-color: #0f172a !important;
          color: #f8fafc !important;
          border-radius: 8px !important;
          padding: 12px 16px !important;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
          font-size: 13px !important;
          margin: 12px 0 !important;
        }
        .quill-wrapper .ql-editor code {
          background-color: #f1f5f9;
          color: #4338ca;
          padding: 2px 4px;
          border-radius: 4px;
          font-size: 85%;
        }
        .quill-wrapper .ql-editor pre code {
          background-color: transparent !important;
          color: inherit !important;
          padding: 0 !important;
        }
        .quill-wrapper .ql-editor.ql-blank::before {
          color: #94a3b8 !important;
          font-style: normal !important;
          left: 16px !important;
        }
      `}</style>
      <div ref={editorRef} />
    </div>
  );
}
