import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link,
  ImagePlus,
  Undo,
  Redo,
  Code,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  onImageUpload,
  placeholder = "Start writing your article...",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLinkPrompt, setIsLinkPrompt] = useState(false);
  const isInternalUpdate = useRef(false);

  // Sync external value changes into editor
  useEffect(() => {
    if (editorRef.current && !isInternalUpdate.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
    isInternalUpdate.current = false;
  }, [value]);

  const execCommand = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleInput();
  }, []);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalUpdate.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Tab key inserts spaces instead of moving focus
    if (e.key === "Tab") {
      e.preventDefault();
      document.execCommand("insertText", false, "  ");
    }
  }, []);

  const insertLink = useCallback(() => {
    const url = prompt("Enter URL:");
    if (url) {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        execCommand("createLink", url);
      } else {
        const linkText = prompt("Enter link text:") || url;
        const link = `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
        execCommand("insertHTML", link);
      }
    }
  }, [execCommand]);

  const insertImage = useCallback(async () => {
    if (onImageUpload) {
      fileInputRef.current?.click();
    } else {
      const url = prompt("Enter image URL:");
      if (url) {
        execCommand("insertHTML", `<img src="${url}" alt="" style="max-width:100%;border-radius:8px;margin:1rem 0;" />`);
      }
    }
  }, [onImageUpload, execCommand]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      try {
        const url = await onImageUpload(file);
        editorRef.current?.focus();
        document.execCommand("insertHTML", false, `<img src="${url}" alt="" style="max-width:100%;border-radius:8px;margin:1rem 0;" />`);
        handleInput();
      } catch (err) {
        alert("Failed to upload image. Please try again.");
      }
    }
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [onImageUpload, handleInput]);

  const formatBlock = useCallback((tag: string) => {
    execCommand("formatBlock", tag);
  }, [execCommand]);

  const toolbarButtons = [
    { icon: Bold, action: () => execCommand("bold"), title: "Bold (Ctrl+B)" },
    { icon: Italic, action: () => execCommand("italic"), title: "Italic (Ctrl+I)" },
    { type: "separator" },
    { icon: Heading2, action: () => formatBlock("h2"), title: "Heading 2" },
    { icon: Heading3, action: () => formatBlock("h3"), title: "Heading 3" },
    { type: "separator" },
    { icon: List, action: () => execCommand("insertUnorderedList"), title: "Bullet List" },
    { icon: ListOrdered, action: () => execCommand("insertOrderedList"), title: "Numbered List" },
    { icon: Quote, action: () => formatBlock("blockquote"), title: "Blockquote" },
    { type: "separator" },
    { icon: Link, action: insertLink, title: "Insert Link" },
    { icon: ImagePlus, action: insertImage, title: "Insert Image" },
    { type: "separator" },
    { icon: Undo, action: () => execCommand("undo"), title: "Undo" },
    { icon: Redo, action: () => execCommand("redo"), title: "Redo" },
  ];

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-gray-50">
        {toolbarButtons.map((btn, i) => {
          if (btn.type === "separator") {
            return <div key={i} className="w-px h-6 bg-gray-300 mx-1" />;
          }
          const Icon = btn.icon!;
          return (
            <Button
              key={i}
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={btn.action}
              title={btn.title}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[400px] p-4 prose prose-sm max-w-none focus:outline-none"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        style={{
          minHeight: "400px",
        }}
        suppressContentEditableWarning
      />

      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Placeholder styles */}
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contenteditable] img {
          max-width: 100%;
          border-radius: 8px;
          margin: 1rem 0;
        }
        [contenteditable] a {
          color: #2563eb;
          text-decoration: underline;
        }
        [contenteditable] blockquote {
          border-left: 3px solid #d1d5db;
          padding-left: 1rem;
          color: #6b7280;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  );
}
