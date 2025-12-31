"use client";

import { useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette,
  List,
  Link as LinkIcon,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Unesi sadržaj...",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleHeading = (level: string) => {
    execCommand("formatBlock", level);
  };

  const handleColor = () => {
    const color = prompt("Unesi hex boju (npr. #000000):", "#000000");
    if (color) {
      execCommand("foreColor", color);
    }
  };

  const handleFontSize = () => {
    const size = prompt("Unesi veličinu fonta (npr. 14px, 16px, 18px, 20px):", "16px");
    if (size) {
      if (editorRef.current) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
          const range = selection.getRangeAt(0);
          const span = document.createElement("span");
          span.style.fontSize = size;
          try {
            range.surroundContents(span);
          } catch (e) {
            // Ako surroundContents ne radi, koristi alternativni pristup
            const contents = range.extractContents();
            span.appendChild(contents);
            range.insertNode(span);
          }
          onChange(editorRef.current.innerHTML);
          editorRef.current.focus();
        } else {
          // Ako nema odabranog teksta, primijeni na cijeli editor
          execCommand("fontSize", "7");
          if (editorRef.current) {
            const spans = editorRef.current.querySelectorAll("font[size='7']");
            spans.forEach((span) => {
              (span as HTMLElement).style.fontSize = size;
              (span as HTMLElement).removeAttribute("size");
            });
            onChange(editorRef.current.innerHTML);
          }
        }
      }
    }
  };

  return (
    <div className="rounded-lg border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-800">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 p-2 dark:border-neutral-700">
        {/* Headings */}
        <select
          onChange={(e) => handleHeading(e.target.value)}
          className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm text-gf-text-primary dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
          defaultValue=""
        >
          <option value="">Odaberi naslov</option>
          <option value="h1">Naslov 1</option>
          <option value="h2">Naslov 2</option>
          <option value="h3">Naslov 3</option>
          <option value="h4">Naslov 4</option>
          <option value="p">Paragraf</option>
        </select>

        <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-600" />

        {/* Text formatting */}
        <button
          type="button"
          onClick={() => execCommand("bold")}
          className="rounded p-1.5 text-gf-text-primary hover:bg-gf-bg-soft dark:text-neutral-300 dark:hover:bg-neutral-700"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("italic")}
          className="rounded p-1.5 text-gf-text-primary hover:bg-gf-bg-soft dark:text-neutral-300 dark:hover:bg-neutral-700"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("underline")}
          className="rounded p-1.5 text-gf-text-primary hover:bg-gf-bg-soft dark:text-neutral-300 dark:hover:bg-neutral-700"
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </button>

        <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-600" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => execCommand("justifyLeft")}
          className="rounded p-1.5 text-gf-text-primary hover:bg-gf-bg-soft dark:text-neutral-300 dark:hover:bg-neutral-700"
          title="Lijevo"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("justifyCenter")}
          className="rounded p-1.5 text-gf-text-primary hover:bg-gf-bg-soft dark:text-neutral-300 dark:hover:bg-neutral-700"
          title="Centrirano"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("justifyRight")}
          className="rounded p-1.5 text-gf-text-primary hover:bg-gf-bg-soft dark:text-neutral-300 dark:hover:bg-neutral-700"
          title="Desno"
        >
          <AlignRight className="h-4 w-4" />
        </button>

        <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-600" />

        {/* Font size */}
        <button
          type="button"
          onClick={handleFontSize}
          className="rounded p-1.5 text-gf-text-primary hover:bg-gf-bg-soft dark:text-neutral-300 dark:hover:bg-neutral-700"
          title="Veličina fonta"
        >
          <Type className="h-4 w-4" />
        </button>

        {/* Color */}
        <button
          type="button"
          onClick={handleColor}
          className="rounded p-1.5 text-gf-text-primary hover:bg-gf-bg-soft dark:text-neutral-300 dark:hover:bg-neutral-700"
          title="Boja teksta"
        >
          <Palette className="h-4 w-4" />
        </button>

        <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-600" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => execCommand("insertUnorderedList")}
          className="rounded p-1.5 text-gf-text-primary hover:bg-gf-bg-soft dark:text-neutral-300 dark:hover:bg-neutral-700"
          title="Nesređena lista"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("insertOrderedList")}
          className="rounded p-1.5 text-gf-text-primary hover:bg-gf-bg-soft dark:text-neutral-300 dark:hover:bg-neutral-700"
          title="Sređena lista"
        >
          <List className="h-4 w-4 rotate-90" />
        </button>

        <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-600" />

        {/* Link */}
        <button
          type="button"
          onClick={() => {
            const url = prompt("Unesi URL:", "https://");
            if (url) {
              execCommand("createLink", url);
            }
          }}
          className="rounded p-1.5 text-gf-text-primary hover:bg-gf-bg-soft dark:text-neutral-300 dark:hover:bg-neutral-700"
          title="Dodaj link"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={updateContent}
        onBlur={updateContent}
        className="min-h-[300px] px-4 py-3 text-gf-text-primary focus:outline-none dark:text-neutral-100"
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  );
}

