"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaLink,
  FaImage,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
} from "react-icons/fa";

interface TiptapEditorProps {
  value: string;
  onChange: (val: string) => void;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({ value, onChange }) => {
  // Initialize the editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value, // Initialize with the provided value
    onUpdate: ({ editor }) => {
      // Call the onChange prop when the editor content changes
      onChange(editor.getHTML());
    },
  });

  // Update the editor's content when the `value` prop changes
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return <div>Loading Editor...</div>;
  }

  const setLink = () => {
    const url = window.prompt("Enter the URL");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt("Enter the image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="border p-3 rounded-lg">
      {/* Toolbar */}
      <div className="flex space-x-2 mb-3">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-md ${editor.isActive("bold") ? "bg-gray-300" : ""}`}
        >
          <FaBold />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-md ${editor.isActive("italic") ? "bg-gray-300" : ""}`}
        >
          <FaItalic />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded-md ${editor.isActive("underline") ? "bg-gray-300" : ""}`}
        >
          <FaUnderline />
        </button>
        <button
          onClick={setLink}
          className="p-2 rounded-md"
        >
          <FaLink />
        </button>
        <button
          onClick={addImage}
          className="p-2 rounded-md"
        >
          <FaImage />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-2 rounded-md ${editor.isActive({ textAlign: "left" }) ? "bg-gray-300" : ""}`}
        >
          <FaAlignLeft />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-2 rounded-md ${editor.isActive({ textAlign: "center" }) ? "bg-gray-300" : ""}`}
        >
          <FaAlignCenter />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-2 rounded-md ${editor.isActive({ textAlign: "right" }) ? "bg-gray-300" : ""}`}
        >
          <FaAlignRight />
        </button>
      </div>

      {/* Editor Content */}
      <div className="h-60 overflow-y-auto">
        <EditorContent editor={editor} className="min-h-[200px] p-2" />
      </div>
    </div>
  );
};

export default TiptapEditor;
