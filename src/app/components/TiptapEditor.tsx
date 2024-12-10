"use client";

import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import axios from "axios";


import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaLink,
  FaFileUpload,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
} from "react-icons/fa";

interface TiptapEditorProps {
  value: string;
  onChange: (val: string) => void;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({ value, onChange }) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [link, setLink] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string }[]>([]); // To track uploaded files
  // Initialize the editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update the editor's content when the `value` prop changes
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // Insert a link
  const handleInsertLink = () => {
    if (link) {
      editor?.chain().focus().setLink({ href: link }).run();
      setLink("");
      setShowLinkInput(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Request presigned URL from the backend
      const { data } = await axios.post("/api/file-upload", {
        fileName: file.name,
        fileType: file.type,
      });

      // Upload the file to S3
      await axios.put(data.uploadUrl, file, {
        headers: { "Content-Type": file.type },
      });

      // Add file to uploaded files list
      const fileData = { name: file.name, url: data.fileUrl };
      setUploadedFiles((prevFiles) => [...prevFiles, fileData]);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please try again.");
    }
  };

  // Remove an uploaded file
  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  if (!editor) {
    return <div>Loading Editor...</div>;
  }

  return (
    <div className="border p-3 rounded-lg">
      {/* Toolbar */}
      <div className="flex space-x-2 mb-3">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-md ${editor.isActive("bold") ? "bg-gray-300" : ""}`}
          title="Bold"
        >
          <FaBold />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-md ${editor.isActive("italic") ? "bg-gray-300" : ""}`}
          title="Italic"
        >
          <FaItalic />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded-md ${editor.isActive("underline") ? "bg-gray-300" : ""}`}
          title="Underline"
        >
          <FaUnderline />
        </button>

        {/* Link Button */}
        <button onClick={() => setShowLinkInput((prev) => !prev)} className="p-2 rounded-md" title="Insert Link">
          <FaLink />
        </button>

        {/* File Upload Button */}
        <label htmlFor="file-upload" className="p-2 rounded-md cursor-pointer hover:bg-gray-200" title="Upload File">
          <FaFileUpload />
        </label>
        <input
          id="file-upload"
          type="file"
          accept="*/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Text Align Buttons */}
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-2 rounded-md ${editor.isActive({ textAlign: "left" }) ? "bg-gray-300" : ""}`}
          title="Align Left"
        >
          <FaAlignLeft />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-2 rounded-md ${editor.isActive({ textAlign: "center" }) ? "bg-gray-300" : ""}`}
          title="Align Center"
        >
          <FaAlignCenter />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-2 rounded-md ${editor.isActive({ textAlign: "right" }) ? "bg-gray-300" : ""}`}
          title="Align Right"
        >
          <FaAlignRight />
        </button>
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <div className="flex items-center space-x-2 mb-3">
          <input
            type="text"
            placeholder="Enter URL"
            className="p-2 border rounded-lg flex-1"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <button
            onClick={handleInsertLink}
            className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      )}

      {/* Editor Content */}
      <div className="h-60 overflow-y-auto">
        <EditorContent editor={editor} className="min-h-[200px] p-2" />
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Uploaded Files:</h4>
          <ul className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <li key={index} className="flex items-center space-x-4">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {file.name}
                </a>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TiptapEditor;
