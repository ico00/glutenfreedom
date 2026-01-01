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
  Image as ImageIcon,
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

        <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-600" />

        {/* Image */}
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            id="image-upload-input"
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              const input = e.target as HTMLInputElement;
              const button = input.parentElement;

              // Prikaži loading state
              if (button) {
                button.style.opacity = "0.5";
                button.style.pointerEvents = "none";
              }

              try {
                // Upload sliku
                const uploadData = new FormData();
                uploadData.append("image", file);

                const uploadResponse = await fetch("/api/blog/upload-image", {
                  method: "POST",
                  body: uploadData,
                });

                if (!uploadResponse.ok) {
                  const errorData = await uploadResponse.json().catch(() => ({}));
                  throw new Error(errorData.message || "Greška pri uploadu slike");
                }

                const result = await uploadResponse.json();
                const url = result.url;

                if (!url) {
                  throw new Error("Nije dobiven URL slike");
                }

                // Pitaj za poziciju
                const align = prompt("Pozicija slike (left/right/center/full):", "full") || "full";

                // Umetni sliku u editor
                if (editorRef.current) {
                  const img = document.createElement("img");
                  img.src = url;
                  img.alt = "";
                  img.style.maxWidth = "100%";
                  img.style.height = "auto";
                  if (align && align !== "full") {
                    img.setAttribute("align", align);
                  }
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    range.insertNode(img);
                  } else {
                    editorRef.current.appendChild(img);
                  }
                  updateContent();
                  editorRef.current.focus();
                }
              } catch (error) {
                console.error("Error uploading image:", error);
                alert(`Greška pri uploadu slike: ${error instanceof Error ? error.message : "Nepoznata greška"}`);
              } finally {
                // Resetiraj input i button state
                input.value = "";
                if (button) {
                  button.style.opacity = "1";
                  button.style.pointerEvents = "auto";
                }
              }
            }}
          />
          <label
            htmlFor="image-upload-input"
            className="cursor-pointer rounded p-1.5 text-gf-text-primary hover:bg-gf-bg-soft dark:text-neutral-300 dark:hover:bg-neutral-700 inline-block"
            title="Dodaj sliku"
          >
            <ImageIcon className="h-4 w-4" />
          </label>
        </div>
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

