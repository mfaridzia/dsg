"use client";

import { useEffect, useRef, useState } from "react";
import "quill/dist/quill.snow.css";

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function QuillEditor({ value, onChange, placeholder }: QuillEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadQuill() {
      if (!editorRef.current || quillInstance.current) return;

      const QuillModule = await import("quill");
      const Quill = QuillModule.default || QuillModule;

      if (!active || !editorRef.current) return;

      const quill = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: placeholder || "Tulis isi artikel yang lengkap dan menarik di sini...",
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

      quillInstance.current = quill;

      if (value) {
        quill.root.innerHTML = value;
      }

      quill.on("text-change", () => {
        const html = quill.root.innerHTML;
        onChange(html === "<p><br></p>" ? "" : html);
      });

      setIsLoaded(true);
    }

    loadQuill();

    return () => {
      active = false;
      quillInstance.current = null;
    };
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
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      <div ref={editorRef} style={{ minHeight: "280px" }} />
    </div>
  );
}
