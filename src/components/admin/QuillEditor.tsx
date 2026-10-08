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
    <div className="quill-wrapper bg-white rounded-xl overflow-hidden shadow-xs border border-slate-200">
      <style jsx global>{`
        .quill-wrapper .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid #e2e8f0 !important;
          background-color: #f8fafc !important;
          padding: 8px 12px !important;
        }
        .quill-wrapper .ql-container.ql-snow {
          border: none !important;
          background-color: #ffffff !important;
          font-family: inherit !important;
        }
        .quill-wrapper .ql-editor {
          color: #0f172a !important;
          font-size: 14px !important;
          line-height: 1.7 !important;
          min-height: 280px !important;
          padding: 16px !important;
        }
        .quill-wrapper .ql-editor p,
        .quill-wrapper .ql-editor span,
        .quill-wrapper .ql-editor li,
        .quill-wrapper .ql-editor strong,
        .quill-wrapper .ql-editor em {
          color: #0f172a !important;
        }
        .quill-wrapper .ql-editor h2 {
          color: #0f172a !important;
          font-size: 20px !important;
          font-weight: 700 !important;
          margin-top: 16px !important;
          margin-bottom: 8px !important;
        }
        .quill-wrapper .ql-editor h3 {
          color: #0f172a !important;
          font-size: 16px !important;
          font-weight: 700 !important;
          margin-top: 12px !important;
          margin-bottom: 6px !important;
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
