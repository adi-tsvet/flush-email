"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

// Dynamically import ReactQuill for client-side rendering
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface TextEditorProps {
  value: string;
  onChange: (val: string) => void;
}

export default function TextEditor({ value, onChange }: TextEditorProps) {
  // Force reinitialization of the editor when needed (e.g., modal open/close)
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    setEditorKey((prevKey) => prevKey + 1);
  }, []);

  // Memoize the modules to prevent unnecessary re-renders
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: "1" }, { header: "2" }, { font: [] }],
        [{ size: [] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
        ["link", "image", "video"],
        ["clean"],
        [
          { align: "" },
          { align: "center" },
          { align: "right" },
          { align: "justify" },
        ],
      ],
    }),
    []
  );

  return (
    <div>
      <ReactQuill
        key={editorKey} // Force reinitialization by changing the key
        modules={modules}
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder="Write something..."
      />
    </div>
  );
}
