"use client";

import { useRef, useEffect, useState } from "react";
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
  ChevronDown,
  Check,
  ListOrdered,
  X,
  ExternalLink,
  Maximize2,
  Trash2,
} from "lucide-react";
import { getCsrfToken } from "@/lib/csrfClient";

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
  const lastSentContentRef = useRef<string>("");
  const skipNextSyncRef = useRef(false); // nakon umetanja slike ne prepisuj editor dok parent ne dobije novi value
  const savedInsertRangeRef = useRef<Range | null>(null); // pozicija za umetanje slike (prije otvaranja file dijaloga)
  const [isHeadingOpen, setIsHeadingOpen] = useState(false);
  const [selectedHeading, setSelectedHeading] = useState<string>("");
  const headingDropdownRef = useRef<HTMLDivElement>(null);
  
  // Link modal state
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkOpenInNewTab, setLinkOpenInNewTab] = useState(true);
  const [savedRange, setSavedRange] = useState<Range | null>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const [linkSuggestions, setLinkSuggestions] = useState<{ path: string; title: string; label: string }[]>([]);
  const [linkSuggestionsVisible, setLinkSuggestionsVisible] = useState(false);
  const [linkSuggestionsSource, setLinkSuggestionsSource] = useState<{ path: string; title: string; label: string }[]>([]);
  const [isEditingLink, setIsEditingLink] = useState(false);
  const editingLinkRef = useRef<HTMLAnchorElement | null>(null);
  
  // Font size modal state
  const [isFontSizeModalOpen, setIsFontSizeModalOpen] = useState(false);
  const [selectedFontSize, setSelectedFontSize] = useState("16px");
  
  // Color modal state
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");

  // Image align modal (nakon uploada slike)
  const [isImageAlignModalOpen, setIsImageAlignModalOpen] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);

  // Image edit modal (klik na sliku u editoru – ukloni ili promijeni poravnanje)
  const [isImageEditModalOpen, setIsImageEditModalOpen] = useState(false);
  const selectedImageRef = useRef<HTMLImageElement | null>(null);
  
  // Predefined font sizes
  const fontSizes = [
    { value: "12px", label: "Mali", preview: "Aa" },
    { value: "14px", label: "Normalni", preview: "Aa" },
    { value: "16px", label: "Srednji", preview: "Aa" },
    { value: "18px", label: "Veći", preview: "Aa" },
    { value: "20px", label: "Veliki", preview: "Aa" },
    { value: "24px", label: "Jako veliki", preview: "Aa" },
    { value: "28px", label: "Naslov", preview: "Aa" },
    { value: "32px", label: "Veliki naslov", preview: "Aa" },
  ];
  
  // Predefined colors
  const presetColors = [
    { value: "#000000", name: "Crna" },
    { value: "#374151", name: "Tamno siva" },
    { value: "#6B7280", name: "Siva" },
    { value: "#9CA3AF", name: "Svijetlo siva" },
    { value: "#EF4444", name: "Crvena" },
    { value: "#F97316", name: "Narančasta" },
    { value: "#EAB308", name: "Žuta" },
    { value: "#22C55E", name: "Zelena" },
    { value: "#14B8A6", name: "Teal" },
    { value: "#3B82F6", name: "Plava" },
    { value: "#6366F1", name: "Indigo" },
    { value: "#8B5CF6", name: "Ljubičasta" },
    { value: "#EC4899", name: "Roza" },
    { value: "#78350F", name: "Smeđa" },
    { value: "#166534", name: "Tamno zelena" },
    { value: "#1E40AF", name: "Tamno plava" },
  ];

  // Zatvori heading dropdown kada se klikne izvan
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        headingDropdownRef.current &&
        !headingDropdownRef.current.contains(event.target as Node)
      ) {
        setIsHeadingOpen(false);
      }
    };

    if (isHeadingOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isHeadingOpen]);

  // Učitaj blog, recepte i proizvode za predloške linkova kad se link modal otvori
  useEffect(() => {
    if (!isLinkModalOpen) {
      setLinkSuggestionsSource([]);
      setLinkSuggestions([]);
      setLinkSuggestionsVisible(false);
      return;
    }
    Promise.all([
      fetch("/api/blog", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/recepti", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/proizvodi", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([blogData, receptiData, proizvodiData]) => {
        const items: { path: string; title: string; label: string }[] = [];
        if (Array.isArray(blogData)) {
          blogData.forEach((p: { id: string; title: string }) => {
            items.push({ path: `/blog/${p.id}`, title: p.title, label: "Blog" });
          });
        }
        if (Array.isArray(receptiData)) {
          receptiData.forEach((r: { id: string; title: string }) => {
            items.push({ path: `/recepti/${r.id}`, title: r.title, label: "Recept" });
          });
        }
        if (Array.isArray(proizvodiData)) {
          proizvodiData.forEach((p: { id: string; name: string }) => {
            items.push({ path: `/proizvodi/${p.id}`, title: p.name, label: "Proizvod" });
          });
        }
        setLinkSuggestionsSource(items);
      })
      .catch(() => setLinkSuggestionsSource([]));
  }, [isLinkModalOpen]);

  // Filtriraj predloške linkova dok korisnik tipka
  useEffect(() => {
    if (!isLinkModalOpen) return;
    const q = linkUrl.trim().toLowerCase().replace(/^https?:\/\/*/, "").replace(/^\/*/, "");
    if (!q) {
      setLinkSuggestions(linkSuggestionsSource.slice(0, 10));
      setLinkSuggestionsVisible(linkSuggestionsSource.length > 0);
      return;
    }
    const filtered = linkSuggestionsSource.filter(
      (item) =>
        item.path.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q)
    ).slice(0, 12);
    setLinkSuggestions(filtered);
    setLinkSuggestionsVisible(filtered.length > 0);
  }, [linkUrl, linkSuggestionsSource, isLinkModalOpen]);

  // Kad se modal otvori za uređivanje, osiguraj da se URL prikaže u polju (iz refa)
  useEffect(() => {
    if (isLinkModalOpen && isEditingLink && editingLinkRef.current) {
      const href = editingLinkRef.current.getAttribute("href") || editingLinkRef.current.href || "";
      setLinkUrl(href || "https://");
      setLinkOpenInNewTab(editingLinkRef.current.target === "_blank");
    }
  }, [isLinkModalOpen, isEditingLink]);

  const headingOptions = [
    { value: "h1", label: "Naslov 1", preview: "text-2xl font-bold" },
    { value: "h2", label: "Naslov 2", preview: "text-xl font-bold" },
    { value: "h3", label: "Naslov 3", preview: "text-lg font-semibold" },
    { value: "h4", label: "Naslov 4", preview: "text-base font-semibold" },
    { value: "p", label: "Paragraf", preview: "text-base font-normal" },
  ];

  // Sync value iz parenta u editor samo kad je to novi sadržaj (npr. učitani post), ne kad parent vrati ono što smo upravo poslali – inače se gubi cursor/slika
  useEffect(() => {
    if (!editorRef.current) return;
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }
    if (value === lastSentContentRef.current) return;
    editorRef.current.innerHTML = value;
    lastSentContentRef.current = value;
  }, [value]);

  const updateContent = (skipSyncRef = false) => {
    if (editorRef.current) {
      let html = editorRef.current.innerHTML;

      // Normaliziraj bold tagove - zamijeni <b> s <strong>
      html = html.replace(/<b\b[^>]*>/gi, "<strong>");
      html = html.replace(/<\/b>/gi, "</strong>");

      // Normaliziraj italic tagove - zamijeni <i> s <em>
      html = html.replace(/<i\b[^>]*>/gi, "<em>");
      html = html.replace(/<\/i>/gi, "</em>");

      lastSentContentRef.current = html;
      if (skipSyncRef) skipNextSyncRef.current = true;
      onChange(html);
    }
  };

  // Helper funkcija za dobivanje trenutnog selectiona i rangea
  const getSelectionAndRange = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    if (!editorRef.current || !editorRef.current.contains(range.commonAncestorContainer)) {
      return null;
    }
    
    return { selection, range };
  };

  // Spremi poziciju kursora za umetanje slike (prije otvaranja file dijaloga se gubi selection)
  const saveInsertRange = () => {
    const sel = getSelectionAndRange();
    if (sel) savedInsertRangeRef.current = sel.range.cloneRange();
    else savedInsertRangeRef.current = null;
  };

  // Umetni sliku s odabranim poravnanjem (nakon odabira u modal-u)
  const insertImageWithAlign = (align: "left" | "right" | "center" | "full") => {
    const url = pendingImageUrl;
    if (!url || !editorRef.current) return;
    const img = document.createElement("img");
    img.src = url;
    img.alt = "";
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    if (align !== "full") {
      img.setAttribute("align", align);
    }
    const range = savedInsertRangeRef.current;
    const rangeValid = range && editorRef.current.contains(range.startContainer);
    if (rangeValid) {
      try {
        range.insertNode(img);
      } catch {
        editorRef.current.appendChild(img);
      }
    } else {
      editorRef.current.appendChild(img);
    }
    updateContent(true);
    editorRef.current.focus();
    setIsImageAlignModalOpen(false);
    setPendingImageUrl(null);
  };

  const closeImageAlignModal = () => {
    // Odustani = umetni s punom širinom da upload ne propadne
    if (pendingImageUrl) insertImageWithAlign("full");
    setIsImageAlignModalOpen(false);
    setPendingImageUrl(null);
  };

  const closeImageEditModal = () => {
    setIsImageEditModalOpen(false);
    selectedImageRef.current = null;
  };

  const removeSelectedImage = () => {
    const img = selectedImageRef.current;
    if (img?.parentNode) {
      img.parentNode.removeChild(img);
      updateContent();
    }
    closeImageEditModal();
  };

  const setSelectedImageAlign = (align: "left" | "right" | "center" | "full") => {
    const img = selectedImageRef.current;
    if (!img) return;
    if (align === "full") {
      img.removeAttribute("align");
    } else {
      img.setAttribute("align", align);
    }
    updateContent();
    closeImageEditModal();
  };

  // Helper funkcija za provjeru da li je element u određenom tagu
  const isInTag = (node: Node, tagNames: string[]): Element | null => {
    let current: Node | null = node;
    while (current && current !== editorRef.current) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        const element = current as Element;
        if (tagNames.includes(element.tagName.toUpperCase())) {
          return element;
        }
      }
      current = current.parentNode;
    }
    return null;
  };

  // Vrati trenutni blok (h1, h2, h3, h4, p) na temelju kursora/selekcije – za prikaz u izborniku stilova
  const getCurrentBlockTag = (): string => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editorRef.current) return "p";
    const range = sel.getRangeAt(0);
    let node: Node | null = range.startContainer;
    const blockTags = ["H1", "H2", "H3", "H4", "P", "DIV"];
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = (node as Element).tagName.toUpperCase();
        if (tag === "H1" || tag === "H2" || tag === "H3" || tag === "H4") return tag.toLowerCase();
        if (tag === "P") return "p";
        if (tag === "DIV") return "p";
      }
      node = node.parentNode;
    }
    return "p";
  };

  const updateSelectedHeadingFromSelection = () => {
    if (!editorRef.current) return;
    const tag = getCurrentBlockTag();
    setSelectedHeading(tag);
  };

  // Helper funkcija za uklanjanje bold tagova iz rangea
  const removeBoldTags = (range: Range): { text: string; newRange: Range | null } => {
    const contents = range.extractContents();
    const tempDiv = document.createElement("div");
    tempDiv.appendChild(contents);
    
    // Ukloni sve bold tagove
    const boldTags = tempDiv.querySelectorAll("strong, b");
    boldTags.forEach((tag) => {
      const text = tag.textContent || "";
      const textNode = document.createTextNode(text);
      tag.parentNode?.replaceChild(textNode, tag);
    });
    
    const text = tempDiv.textContent || "";
    
    // Vrati range s tekstom
    const newRange = document.createRange();
    try {
      newRange.setStart(range.startContainer, range.startOffset);
      newRange.setEnd(range.startContainer, range.startOffset);
      newRange.insertNode(document.createTextNode(text));
      newRange.setEnd(range.startContainer, range.startOffset + text.length);
    } catch (e) {
      return { text, newRange: null };
    }
    
    return { text, newRange };
  };

  // Custom bold toggle
  const handleBold = () => {
    const sel = getSelectionAndRange();
    if (!sel) {
      editorRef.current?.focus();
      return;
    }

    const { selection, range } = sel;
    
    if (range.collapsed) {
      // Ako nema odabranog teksta, provjeri da li je cursor u bold tagu
      const boldElement = isInTag(range.commonAncestorContainer, ["STRONG", "B"]);
      
      if (boldElement) {
        // Ukloni bold
        const text = boldElement.textContent || "";
        const textNode = document.createTextNode(text);
        boldElement.parentNode?.replaceChild(textNode, boldElement);
        
        const newRange = document.createRange();
        newRange.setStart(textNode, 0);
        newRange.setEnd(textNode, 0);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        // Dodaj bold placeholder
        const strong = document.createElement("strong");
        strong.textContent = "Bold tekst";
        range.insertNode(strong);
        const newRange = document.createRange();
        newRange.selectNodeContents(strong);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    } else {
      // Ako ima odabranog teksta
      // Provjeri da li je cijeli range unutar jednog bold taga
      let isCompletelyBold = false;
      let boldParent: Element | null = null;
      
      let current: Node | null = range.startContainer;
      while (current && current !== editorRef.current) {
        if (current.nodeType === Node.ELEMENT_NODE) {
          const el = current as Element;
          if (el.tagName === "STRONG" || el.tagName === "B") {
            // Provjeri da li je cijeli range unutar ovog elementa
            const elRange = document.createRange();
            elRange.selectNodeContents(el);
            
            const startCompare = range.compareBoundaryPoints(Range.START_TO_START, elRange);
            const endCompare = range.compareBoundaryPoints(Range.END_TO_END, elRange);
            
            if (startCompare >= 0 && endCompare <= 0) {
              isCompletelyBold = true;
              boldParent = el;
              break;
            }
          }
        }
        current = current.parentNode;
      }
      
      if (isCompletelyBold && boldParent) {
        // Ukloni bold - zamijeni s text nodeom
        const text = boldParent.textContent || "";
        const textNode = document.createTextNode(text);
        boldParent.parentNode?.replaceChild(textNode, boldParent);
        
        // Restauriraj selection
        const newRange = document.createRange();
        newRange.setStart(textNode, 0);
        newRange.setEnd(textNode, text.length);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        // Dodaj bold - prvo ukloni postojeće bold tagove iz rangea
        const contents = range.extractContents();
        const tempDiv = document.createElement("div");
        tempDiv.appendChild(contents);
        
        // Ukloni sve bold tagove iz sadržaja
        const boldTags = tempDiv.querySelectorAll("strong, b");
        boldTags.forEach((tag) => {
          const text = tag.textContent || "";
          const textNode = document.createTextNode(text);
          tag.parentNode?.replaceChild(textNode, tag);
        });
        
        // Kreiraj novi strong element
        const strong = document.createElement("strong");
        while (tempDiv.firstChild) {
          strong.appendChild(tempDiv.firstChild);
        }
        
        range.insertNode(strong);
        
        // Restauriraj selection
        const newRange = document.createRange();
        newRange.selectNodeContents(strong);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
    
    editorRef.current?.focus();
    updateContent();
  };

  // Custom italic toggle
  const handleItalic = () => {
    const sel = getSelectionAndRange();
    if (!sel) {
      editorRef.current?.focus();
      return;
    }

    const { selection, range } = sel;
    
    // Provjeri da li je već italic - slično kao za bold
    let isItalic = false;
    let italicElements: Element[] = [];
    
    if (!range.collapsed) {
      let current: Node | null = range.commonAncestorContainer;
      while (current && current !== editorRef.current) {
        if (current.nodeType === Node.ELEMENT_NODE) {
          const el = current as Element;
          if (el.tagName === "EM" || el.tagName === "I") {
            const elRange = document.createRange();
            elRange.selectNodeContents(el);
            if (elRange.compareBoundaryPoints(Range.START_TO_START, range) <= 0 &&
                elRange.compareBoundaryPoints(Range.END_TO_END, range) >= 0) {
              italicElements = [el];
              break;
            }
          }
        }
        current = current.parentNode;
      }
      isItalic = italicElements.length > 0;
    } else {
      const italicElement = isInTag(range.commonAncestorContainer, ["EM", "I"]);
      if (italicElement) {
        italicElements = [italicElement];
        isItalic = true;
      }
    }
    
    if (isItalic && italicElements.length > 0) {
      // Ukloni italic
      italicElements.forEach((italicEl) => {
        const text = italicEl.textContent || "";
        const textNode = document.createTextNode(text);
        italicEl.parentNode?.replaceChild(textNode, italicEl);
      });
      
      if (!range.collapsed) {
        const newRange = document.createRange();
        newRange.setStart(range.startContainer, range.startOffset);
        newRange.setEnd(range.endContainer, range.endOffset);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    } else {
      // Dodaj italic
      if (!range.collapsed) {
        const em = document.createElement("em");
        try {
          range.surroundContents(em);
        } catch (e) {
          const contents = range.extractContents();
          em.appendChild(contents);
          range.insertNode(em);
        }
      } else {
        const em = document.createElement("em");
        em.textContent = "Italic tekst";
        range.insertNode(em);
        const newRange = document.createRange();
        newRange.selectNodeContents(em);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
    
    editorRef.current?.focus();
    updateContent();
  };

  // Custom underline toggle
  const handleUnderline = () => {
    const sel = getSelectionAndRange();
    if (!sel) {
      editorRef.current?.focus();
      return;
    }

    const { selection, range } = sel;
    
    // Provjeri da li je već underline
    const underlineElement = isInTag(range.commonAncestorContainer, ["U"]);
    
    if (underlineElement) {
      // Ukloni underline
      const text = underlineElement.textContent || "";
      const textNode = document.createTextNode(text);
      underlineElement.parentNode?.replaceChild(textNode, underlineElement);
      
      const newRange = document.createRange();
      newRange.setStartBefore(textNode);
      newRange.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else {
      // Dodaj underline
      if (!range.collapsed) {
        const u = document.createElement("u");
        try {
          range.surroundContents(u);
        } catch (e) {
          const contents = range.extractContents();
          u.appendChild(contents);
          range.insertNode(u);
        }
      } else {
        const u = document.createElement("u");
        u.textContent = "Underline tekst";
        range.insertNode(u);
        const newRange = document.createRange();
        newRange.selectNodeContents(u);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
    
    editorRef.current?.focus();
    updateContent();
  };

  // Pomoć: pretvori tekst u siguran HTML (escape + newline -> <br>)
  const escapeAndBreaks = (s: string): string =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");

  // Iz fragmenta odabira napravi jedan string: tekst svakog bloka spojen s \n\n (da se pri Naslov 1 očuvaju prijelomi)
  const fragmentToBlockText = (fragment: DocumentFragment): string => {
    const parts: string[] = [];
    const blockTags = ["P", "H1", "H2", "H3", "H4", "H5", "H6", "DIV"];

    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const t = (node as Text).textContent?.trim() ?? "";
        if (t) parts.push((node as Text).textContent ?? "");
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const el = node as Element;
      if (blockTags.includes(el.tagName)) {
        const hasBlockChildren = el.querySelector("p, h1, h2, h3, h4, h5, h6, div");
        if (hasBlockChildren) {
          Array.from(el.childNodes).forEach(processNode);
        } else {
          const t = el.textContent?.trim() ?? "";
          if (t) parts.push(el.textContent ?? "");
        }
        return;
      }
      const t = el.textContent?.trim() ?? "";
      if (t) parts.push(el.textContent ?? "");
    };

    Array.from(fragment.childNodes).forEach(processNode);
    return parts.join("\n\n");
  };

  // Iz naslovnog elementa (h1–h6) napravi čisti string: samo tekst + \n za <br>, bez HTML-a da paragraf ne nasljeđuje veličinu
  const headingContentToPlainText = (el: Element): string => {
    const parts: string[] = [];
    el.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        parts.push((node as Text).textContent ?? "");
      } else if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === "BR") {
        parts.push("\n");
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        parts.push((node as Element).textContent ?? "");
      }
    });
    return parts.join("");
  };

  // Iz fragmenta odabira napravi niz <p> elemenata (jedan po bloku) – da se ne spoji sve u jedan blok
  const fragmentToParagraphs = (fragment: DocumentFragment): HTMLParagraphElement[] => {
    const paragraphs: HTMLParagraphElement[] = [];
    const blockTags = ["P", "H1", "H2", "H3", "H4", "H5", "H6", "DIV"];

    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = (node as Text).textContent?.trim() ?? "";
        if (text) {
          const p = document.createElement("p");
          p.innerHTML = escapeAndBreaks((node as Text).textContent ?? "");
          paragraphs.push(p);
        }
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const el = node as Element;
      if (blockTags.includes(el.tagName)) {
        const hasBlockChildren = el.querySelector("p, h1, h2, h3, h4, h5, h6, div");
        if (hasBlockChildren) {
          Array.from(el.childNodes).forEach(processNode);
        } else {
          const p = document.createElement("p");
          if (["H1", "H2", "H3", "H4", "H5", "H6"].includes(el.tagName)) {
            const plain = headingContentToPlainText(el);
            p.innerHTML = escapeAndBreaks(plain);
          } else {
            p.innerHTML = el.innerHTML || "";
          }
          paragraphs.push(p);
        }
        return;
      }
      const text = el.textContent?.trim() ?? "";
      if (text) {
        const p = document.createElement("p");
        p.innerHTML = escapeAndBreaks(el.textContent ?? "");
        paragraphs.push(p);
      }
    };

    Array.from(fragment.childNodes).forEach(processNode);
    return paragraphs;
  };

  // Primijeni stil (Paragraf ili Naslov 1–4) na odabrani tekst ili trenutni blok
  const handleHeading = (level: string) => {
    if (!level) return;

    const sel = getSelectionAndRange();
    if (!sel) {
      editorRef.current?.focus();
      return;
    }

    const { selection, range } = sel;
    const newBlock = document.createElement(level);

    if (!range.collapsed) {
      if (level === "p") {
        const headingElement = isInTag(range.commonAncestorContainer, ["H1", "H2", "H3", "H4", "H5", "H6"]);
        if (headingElement && editorRef.current?.contains(headingElement)) {
          // Odabir je unutar jednog naslova – zamijeni cijeli naslov s jednim paragrafom da vizualno ne ostane „ogroman”
          const p = document.createElement("p");
          p.innerHTML = escapeAndBreaks(headingContentToPlainText(headingElement));
          headingElement.parentNode?.replaceChild(p, headingElement);
          const endRange = document.createRange();
          endRange.selectNodeContents(p);
          endRange.collapse(false);
          selection.removeAllRanges();
          selection.addRange(endRange);
        } else {
          // Paragraf: više blokova ili odabir nije samo unutar naslova – sačuvaj blokove
          const fragment = range.cloneContents();
          const paragraphs = fragmentToParagraphs(fragment);
          range.deleteContents();
          if (paragraphs.length === 0) {
            const p = document.createElement("p");
            p.innerHTML = "<br>";
            range.insertNode(p);
          } else {
            const docFrag = document.createDocumentFragment();
            paragraphs.forEach((p) => docFrag.appendChild(p));
            range.insertNode(docFrag);
          }
          const last = paragraphs[paragraphs.length - 1];
          if (last) {
            const endRange = document.createRange();
            endRange.selectNodeContents(last);
            endRange.collapse(false);
            selection.removeAllRanges();
            selection.addRange(endRange);
          }
        }
      } else {
        // Naslov: cijeli odabir jedan blok; granice starih blokova ostaju kao \n\n -> <br><br>
        const fragment = range.cloneContents();
        const text = fragmentToBlockText(fragment);
        range.deleteContents();
        newBlock.innerHTML = escapeAndBreaks(text);
        range.insertNode(newBlock);
        const endRange = document.createRange();
        endRange.selectNodeContents(newBlock);
        endRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(endRange);
      }
    } else {
      // Samo cursor: zamijeni cijeli blok u kojem je cursor
      const headingElement = isInTag(range.commonAncestorContainer, ["H1", "H2", "H3", "H4", "H5", "H6"]);
      if (headingElement && headingElement.tagName.toLowerCase() === level && level !== "p") {
        // Već je taj naslov – pretvori u paragraf
        const text = headingElement.textContent || "";
        const p = document.createElement("p");
        p.textContent = text;
        headingElement.parentNode?.replaceChild(p, headingElement);
      } else {
        let blockElement: Node | null = range.commonAncestorContainer;
        while (blockElement && blockElement !== editorRef.current) {
          if (blockElement.nodeType === Node.ELEMENT_NODE) {
            const el = blockElement as Element;
            if (["P", "H1", "H2", "H3", "H4", "H5", "H6", "DIV"].includes(el.tagName)) {
              const text = el.textContent || "";
              newBlock.textContent = text;
              el.parentNode?.replaceChild(newBlock, el);
              break;
            }
          }
          blockElement = blockElement.parentNode;
        }
        if (!blockElement || blockElement === editorRef.current) {
          newBlock.textContent = level === "p" ? "" : "Novi naslov";
          range.insertNode(newBlock);
        }
      }
    }

    setSelectedHeading(level);
    editorRef.current?.focus();
    updateContent();
  };

  // Custom alignment
  const handleAlign = (align: "left" | "center" | "right") => {
    const sel = getSelectionAndRange();
    if (!sel) {
      editorRef.current?.focus();
      return;
    }

    const { range } = sel;
    
    // Pronađi blok element
    let blockElement: Node | null = range.commonAncestorContainer;
    while (blockElement && blockElement !== editorRef.current) {
      if (blockElement.nodeType === Node.ELEMENT_NODE) {
        const el = blockElement as HTMLElement;
        if (["P", "H1", "H2", "H3", "H4", "H5", "H6", "DIV"].includes(el.tagName)) {
          el.style.textAlign = align;
          editorRef.current?.focus();
          updateContent();
          return;
        }
      }
      blockElement = blockElement.parentNode;
    }
  };

  // Helper: RGB u HEX
  const rgbToHex = (rgb: string): string => {
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (match) {
      const r = parseInt(match[1]).toString(16).padStart(2, '0');
      const g = parseInt(match[2]).toString(16).padStart(2, '0');
      const b = parseInt(match[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
    return rgb.startsWith('#') ? rgb : '#000000';
  };

  // Custom color - otvori modal
  const handleColor = () => {
    const sel = getSelectionAndRange();
    if (!sel || sel.range.collapsed) {
      alert("Odaberi tekst kojem želiš promijeniti boju");
      return;
    }
    
    // Detektiraj trenutnu boju selektiranog teksta
    let currentColor = "#000000";
    const container = sel.range.commonAncestorContainer;
    const element = container.nodeType === Node.TEXT_NODE 
      ? container.parentElement 
      : container as HTMLElement;
    
    if (element) {
      const computedStyle = window.getComputedStyle(element);
      const color = computedStyle.color;
      currentColor = rgbToHex(color);
    }
    
    setSavedRange(sel.range.cloneRange());
    setSelectedColor(currentColor);
    setIsColorModalOpen(true);
  };
  
  // Potvrdi boju iz modala
  const confirmColor = (color: string) => {
    if (savedRange && editorRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedRange);
        
        const span = document.createElement("span");
        span.style.color = color;
        
        try {
          savedRange.surroundContents(span);
        } catch (e) {
          const contents = savedRange.extractContents();
          span.appendChild(contents);
          savedRange.insertNode(span);
        }
        
        updateContent();
      }
    }
    
    setIsColorModalOpen(false);
    setSavedRange(null);
    editorRef.current?.focus();
  };

  // Custom font size - otvori modal
  const handleFontSize = () => {
    const sel = getSelectionAndRange();
    if (!sel || sel.range.collapsed) {
      alert("Odaberi tekst kojem želiš promijeniti veličinu");
      return;
    }
    
    // Detektiraj trenutnu veličinu fonta selektiranog teksta
    let currentFontSize = "16px";
    const container = sel.range.commonAncestorContainer;
    const element = container.nodeType === Node.TEXT_NODE 
      ? container.parentElement 
      : container as HTMLElement;
    
    if (element) {
      const computedStyle = window.getComputedStyle(element);
      currentFontSize = computedStyle.fontSize || "16px";
    }
    
    setSavedRange(sel.range.cloneRange());
    setSelectedFontSize(currentFontSize);
    setIsFontSizeModalOpen(true);
  };
  
  // Potvrdi veličinu fonta iz modala
  const confirmFontSize = (size: string) => {
    if (savedRange && editorRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedRange);
        
        const span = document.createElement("span");
        span.style.fontSize = size;
        
        try {
          savedRange.surroundContents(span);
        } catch (e) {
          const contents = savedRange.extractContents();
          span.appendChild(contents);
          savedRange.insertNode(span);
        }
        
        updateContent();
      }
    }
    
    setIsFontSizeModalOpen(false);
    setSavedRange(null);
    editorRef.current?.focus();
  };

  // Helper: pronađi roditeljski blok element (p, div, ili direktni child editora)
  const findParentBlock = (node: Node): HTMLElement | null => {
    let current: Node | null = node;
    while (current && current !== editorRef.current) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        const el = current as HTMLElement;
        const tagName = el.tagName.toUpperCase();
        // Ako je blok element ili direktni child editora
        if (["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE"].includes(tagName)) {
          return el;
        }
      }
      current = current.parentNode;
    }
    return null;
  };

  // Helper: svi blok elementi obuhvaćeni selekcijom (od početka do kraja rangea), jedan blok = jedna stavka liste
  const getSelectedBlockElements = (range: Range): HTMLElement[] => {
    const startBlock = findParentBlock(range.startContainer);
    const endBlock = findParentBlock(range.endContainer);
    if (!startBlock) return [];
    const last = endBlock ?? startBlock;
    if (startBlock === last) return [startBlock];
    if (startBlock.parentNode !== last.parentNode) return [startBlock];
    const blocks: HTMLElement[] = [];
    let current: Element | null = startBlock;
    while (current) {
      blocks.push(current as HTMLElement);
      if (current === last) break;
      current = current.nextElementSibling;
    }
    return blocks;
  };

  // Helper: kreiraj listu s pravilnim stilom
  const createStyledList = (type: "ul" | "ol"): HTMLElement => {
    const list = document.createElement(type);
    list.style.listStyleType = type === "ul" ? "disc" : "decimal";
    list.style.paddingLeft = "1.5rem";
    list.style.marginTop = "0.5rem";
    list.style.marginBottom = "0.5rem";
    return list;
  };

  // Custom unordered list
  const handleUnorderedList = () => {
    // Fokusiraj editor ako nije fokusiran
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.focus();
    }
    
    const sel = getSelectionAndRange();
    
    if (!sel) {
      // Ako nema selekcije, dodaj praznu listu na kraj editora
      if (editorRef.current) {
        // Provjeri je li zadnji element UL lista
        const lastChild = editorRef.current.lastElementChild;
        if (lastChild && lastChild.tagName === "UL") {
          const li = document.createElement("li");
          li.innerHTML = "<br>";
          lastChild.appendChild(li);
          
          const range = document.createRange();
          range.setStart(li, 0);
          range.collapse(true);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        } else {
          const ul = createStyledList("ul");
          const li = document.createElement("li");
          li.innerHTML = "<br>";
          ul.appendChild(li);
          editorRef.current.appendChild(ul);
          
          const range = document.createRange();
          range.setStart(li, 0);
          range.collapse(true);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
        
        editorRef.current.focus();
        updateContent();
      }
      return;
    }

    const { selection, range } = sel;
    
    // Provjeri da li je već u listi
    const listElement = isInTag(range.commonAncestorContainer, ["UL", "OL", "LI"]);
    
    if (listElement) {
      // Ako je u listi, ukloni listu i pretvori u paragraf
      const li = listElement.tagName === "LI" ? listElement : listElement.querySelector("li");
      const parentList = li?.parentElement;
      
      if (li && parentList && parentList.parentNode) {
        const p = document.createElement("p");
        p.innerHTML = li.innerHTML || "<br>";
        parentList.parentNode.insertBefore(p, parentList);
        li.remove();
        
        // Ako lista više nema stavki, obriši je
        if (parentList.children.length === 0) {
          parentList.remove();
        }
        
        // Postavi kursor u novi paragraf
        const newRange = document.createRange();
        newRange.setStart(p, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    } else {
      // Svi blokovi obuhvaćeni selekcijom – jedan blok = jedna stavka liste
      const blocks = getSelectedBlockElements(range);
      const blockElement = blocks[0];
      
      if (blockElement && blockElement.parentNode) {
        const prevSibling = blockElement.previousElementSibling;
        const nextSibling = blockElement.nextElementSibling;
        const isMultipleBlocks = blocks.length > 1;

        if (isMultipleBlocks) {
          // Više odabranih redova: kreiraj jednu listu s jednom <li> po bloku
          const ul = createStyledList("ul");
          for (const block of blocks) {
            const li = document.createElement("li");
            li.innerHTML = block.innerHTML || "<br>";
            ul.appendChild(li);
          }
          blockElement.parentNode.insertBefore(ul, blockElement);
          blocks.forEach((b) => b.remove());
          const lastLi = ul.lastElementChild;
          const newRange = document.createRange();
          newRange.setStart(lastLi ?? ul, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        } else if (prevSibling && prevSibling.tagName === "UL") {
          const li = document.createElement("li");
          li.innerHTML = blockElement.innerHTML || "<br>";
          prevSibling.appendChild(li);
          blockElement.remove();
          const newRange = document.createRange();
          newRange.setStart(li, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        } else if (nextSibling && nextSibling.tagName === "UL") {
          const li = document.createElement("li");
          li.innerHTML = blockElement.innerHTML || "<br>";
          nextSibling.insertBefore(li, nextSibling.firstChild);
          blockElement.remove();
          const newRange = document.createRange();
          newRange.setStart(li, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        } else {
          const ul = createStyledList("ul");
          const li = document.createElement("li");
          li.innerHTML = blockElement.innerHTML || "<br>";
          ul.appendChild(li);
          blockElement.parentNode.replaceChild(ul, blockElement);
          const newRange = document.createRange();
          newRange.setStart(li, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      } else {
        // Ako nema blok elementa (tekst direktno u editoru), omotaj u listu
        const ul = createStyledList("ul");
        const li = document.createElement("li");
        li.innerHTML = "<br>";
        ul.appendChild(li);
        
        if (range.collapsed) {
          range.insertNode(ul);
        } else {
          const content = range.extractContents();
          li.innerHTML = "";
          li.appendChild(content);
          range.insertNode(ul);
        }
        
        const newRange = document.createRange();
        newRange.setStart(li, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
    
    editorRef.current?.focus();
    updateContent();
  };

  // Custom ordered list
  const handleOrderedList = () => {
    // Fokusiraj editor ako nije fokusiran
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.focus();
    }
    
    const sel = getSelectionAndRange();
    
    if (!sel) {
      // Ako nema selekcije, dodaj praznu listu na kraj editora
      if (editorRef.current) {
        // Provjeri je li zadnji element OL lista
        const lastChild = editorRef.current.lastElementChild;
        if (lastChild && lastChild.tagName === "OL") {
          const li = document.createElement("li");
          li.innerHTML = "<br>";
          lastChild.appendChild(li);
          
          const range = document.createRange();
          range.setStart(li, 0);
          range.collapse(true);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        } else {
          const ol = createStyledList("ol");
          const li = document.createElement("li");
          li.innerHTML = "<br>";
          ol.appendChild(li);
          editorRef.current.appendChild(ol);
          
          const range = document.createRange();
          range.setStart(li, 0);
          range.collapse(true);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
        
        editorRef.current.focus();
        updateContent();
      }
      return;
    }

    const { selection, range } = sel;
    
    // Provjeri da li je već u listi
    const listElement = isInTag(range.commonAncestorContainer, ["UL", "OL", "LI"]);
    
    if (listElement) {
      // Ako je u listi, ukloni listu i pretvori u paragraf
      const li = listElement.tagName === "LI" ? listElement : listElement.querySelector("li");
      const parentList = li?.parentElement;
      
      if (li && parentList && parentList.parentNode) {
        const p = document.createElement("p");
        p.innerHTML = li.innerHTML || "<br>";
        parentList.parentNode.insertBefore(p, parentList);
        li.remove();
        
        // Ako lista više nema stavki, obriši je
        if (parentList.children.length === 0) {
          parentList.remove();
        }
        
        // Postavi kursor u novi paragraf
        const newRange = document.createRange();
        newRange.setStart(p, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    } else {
      // Svi blokovi obuhvaćeni selekcijom – jedan blok = jedna stavka liste
      const blocks = getSelectedBlockElements(range);
      const blockElement = blocks[0];
      
      if (blockElement && blockElement.parentNode) {
        const prevSibling = blockElement.previousElementSibling;
        const nextSibling = blockElement.nextElementSibling;
        const isMultipleBlocks = blocks.length > 1;

        if (isMultipleBlocks) {
          // Više odabranih redova: kreiraj jednu numeriranu listu s jednom <li> po bloku
          const ol = createStyledList("ol");
          for (const block of blocks) {
            const li = document.createElement("li");
            li.innerHTML = block.innerHTML || "<br>";
            ol.appendChild(li);
          }
          blockElement.parentNode.insertBefore(ol, blockElement);
          blocks.forEach((b) => b.remove());
          const lastLi = ol.lastElementChild;
          const newRange = document.createRange();
          newRange.setStart(lastLi ?? ol, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        } else if (prevSibling && prevSibling.tagName === "OL") {
          const li = document.createElement("li");
          li.innerHTML = blockElement.innerHTML || "<br>";
          prevSibling.appendChild(li);
          blockElement.remove();
          const newRange = document.createRange();
          newRange.setStart(li, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        } else if (nextSibling && nextSibling.tagName === "OL") {
          const li = document.createElement("li");
          li.innerHTML = blockElement.innerHTML || "<br>";
          nextSibling.insertBefore(li, nextSibling.firstChild);
          blockElement.remove();
          const newRange = document.createRange();
          newRange.setStart(li, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        } else {
          const ol = createStyledList("ol");
          const li = document.createElement("li");
          li.innerHTML = blockElement.innerHTML || "<br>";
          ol.appendChild(li);
          blockElement.parentNode.replaceChild(ol, blockElement);
          const newRange = document.createRange();
          newRange.setStart(li, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      } else {
        // Ako nema blok elementa, omotaj u listu
        const ol = createStyledList("ol");
        const li = document.createElement("li");
        li.innerHTML = "<br>";
        ol.appendChild(li);
        
        if (range.collapsed) {
          range.insertNode(ol);
        } else {
          const content = range.extractContents();
          li.innerHTML = "";
          li.appendChild(content);
          range.insertNode(ol);
        }
        
        const newRange = document.createRange();
        newRange.setStart(li, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
    
    editorRef.current?.focus();
    updateContent();
  };

  // Custom link – otvori modal za dodavanje ili uređivanje linka
  const handleLink = () => {
    const sel = getSelectionAndRange();
    if (!sel) {
      alert("Odaberi tekst koji želiš pretvoriti u link");
      return;
    }

    const { range } = sel;

    if (range.collapsed) {
      alert("Odaberi tekst koji želiš pretvoriti u link");
      return;
    }

    // Kad je odabran cijeli link, commonAncestorContainer može biti roditelj (npr. <p>) – provjeri i start/end
    const linkElement = (isInTag(range.commonAncestorContainer, ["A"]) ||
      isInTag(range.startContainer, ["A"]) ||
      isInTag(range.endContainer, ["A"])) as HTMLAnchorElement | null;

    if (linkElement) {
      // Postojeći link – otvori modal za uređivanje (koristi getAttribute da ostane relativna putanja)
      editingLinkRef.current = linkElement;
      const href = linkElement.getAttribute("href") || linkElement.href || "https://";
      setLinkUrl(href);
      setLinkOpenInNewTab(linkElement.target === "_blank");
      setIsEditingLink(true);
      setIsLinkModalOpen(true);
      setTimeout(() => linkInputRef.current?.focus(), 100);
    } else {
      // Novi link – spremi range i otvori modal
      editingLinkRef.current = null;
      setSavedRange(range.cloneRange());
      setLinkUrl("https://");
      setLinkOpenInNewTab(true);
      setIsEditingLink(false);
      setIsLinkModalOpen(true);
      setTimeout(() => linkInputRef.current?.focus(), 100);
    }
  };
  
  // Potvrdi link iz modala (dodaj novi ili ažuriraj postojeći)
  const confirmLink = () => {
    if (!linkUrl || !linkUrl.trim() || linkUrl.trim() === "https://") {
      setIsLinkModalOpen(false);
      setIsEditingLink(false);
      editingLinkRef.current = null;
      return;
    }

    if (isEditingLink && editingLinkRef.current) {
      const a = editingLinkRef.current;
      a.href = linkUrl.trim();
      if (linkOpenInNewTab) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      } else {
        a.removeAttribute("target");
        a.removeAttribute("rel");
      }
      updateContent();
      editingLinkRef.current = null;
      setIsEditingLink(false);
    } else if (savedRange && editorRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedRange);

        const a = document.createElement("a");
        a.href = linkUrl.trim();
        if (linkOpenInNewTab) {
          a.target = "_blank";
          a.rel = "noopener noreferrer";
        }
        a.textContent = savedRange.toString() || linkUrl.trim();

        try {
          savedRange.surroundContents(a);
        } catch (e) {
          savedRange.deleteContents();
          savedRange.insertNode(a);
        }

        updateContent();
      }
      setSavedRange(null);
    }

    setIsLinkModalOpen(false);
    editorRef.current?.focus();
  };

  // Zatvori link modal
  const closeLinkModal = () => {
    setIsLinkModalOpen(false);
    setSavedRange(null);
    setIsEditingLink(false);
    editingLinkRef.current = null;
    editorRef.current?.focus();
  };

  // Ukloni postojeći link (ostavi samo tekst)
  const removeLink = () => {
    if (editingLinkRef.current) {
      const a = editingLinkRef.current;
      const text = a.textContent || "";
      const textNode = document.createTextNode(text);
      a.parentNode?.replaceChild(textNode, a);
      updateContent();
      editingLinkRef.current = null;
      setIsEditingLink(false);
    }
    setIsLinkModalOpen(false);
    editorRef.current?.focus();
  };

  return (
    <div className="rounded-lg border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-800">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 p-2 dark:border-neutral-700">
        {/* Headings - Custom Dropdown */}
        <div ref={headingDropdownRef} className="relative">
          <button
            type="button"
            onClick={() => {
              updateSelectedHeadingFromSelection();
              setIsHeadingOpen(!isHeadingOpen);
            }}
            className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm text-gf-text-primary transition-all hover:border-gf-cta dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
          >
            <Type className="h-4 w-4" />
            <span>{selectedHeading ? headingOptions.find(h => h.value === selectedHeading)?.label : "Stil teksta"}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isHeadingOpen ? "rotate-180" : ""}`} />
          </button>

          {isHeadingOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
              {headingOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    handleHeading(option.value);
                    setSelectedHeading(option.value);
                    setIsHeadingOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                    selectedHeading === option.value ? "bg-gf-cta/10 dark:bg-gf-cta/20" : ""
                  }`}
                >
                  <span className={`text-gf-text-primary dark:text-neutral-100 ${option.preview}`}>
                    {option.label}
                  </span>
                  {selectedHeading === option.value && (
                    <Check className="h-4 w-4 text-gf-cta" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-600" />

        {/* Text formatting */}
        <button
          type="button"
          onClick={handleBold}
          className="rounded p-1.5 text-gf-text-primary hover:bg-gf-bg-soft dark:text-neutral-300 dark:hover:bg-neutral-700"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleItalic}
          className="rounded p-1.5 text-gf-text-primary hover:bg-gf-bg-soft dark:text-neutral-300 dark:hover:bg-neutral-700"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleUnderline}
          className="rounded p-1.5 text-gf-text-primary hover:bg-gf-bg-soft dark:text-neutral-300 dark:hover:bg-neutral-700"
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </button>

        <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-600" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => handleAlign("left")}
          className="rounded p-1.5 text-gf-text-primary hover:bg-gf-bg-soft dark:text-neutral-300 dark:hover:bg-neutral-700"
          title="Lijevo"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleAlign("center")}
          className="rounded p-1.5 text-gf-text-primary hover:bg-gf-bg-soft dark:text-neutral-300 dark:hover:bg-neutral-700"
          title="Centrirano"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleAlign("right")}
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
          onClick={handleUnorderedList}
          className="rounded p-1.5 text-gf-text-primary hover:bg-gf-bg-soft dark:text-neutral-300 dark:hover:bg-neutral-700"
          title="Nesređena lista"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleOrderedList}
          className="rounded p-1.5 text-gf-text-primary hover:bg-gf-bg-soft dark:text-neutral-300 dark:hover:bg-neutral-700"
          title="Numerirana lista"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-600" />

        {/* Link */}
        <button
          type="button"
          onClick={handleLink}
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
                // Upload sliku (s CSRF tokenom)
                const uploadData = new FormData();
                uploadData.append("image", file);
                const csrfToken = await getCsrfToken();

                const uploadResponse = await fetch("/api/blog/upload-image", {
                  method: "POST",
                  body: uploadData,
                  headers: {
                    ...(csrfToken && { "x-csrf-token": csrfToken }),
                  },
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

                // Otvori modal za odabir poravnanja umjesto prompta
                setPendingImageUrl(url);
                setIsImageAlignModalOpen(true);
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
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.tagName === "IMG") {
            selectedImageRef.current = target as HTMLImageElement;
            setIsImageEditModalOpen(true);
            return;
          }
          saveInsertRange();
          updateSelectedHeadingFromSelection();
        }}
        onKeyUp={() => { saveInsertRange(); updateSelectedHeadingFromSelection(); }}
        onMouseUp={() => { saveInsertRange(); updateSelectedHeadingFromSelection(); }}
        className="min-h-[300px] px-4 py-3 text-gf-text-primary focus:outline-none dark:text-neutral-100 [&_a]:text-gf-cta [&_a]:underline [&_a:hover]:text-gf-cta-hover [&_a]:cursor-pointer [&_img]:cursor-pointer [&_img]:rounded-lg [&_a]:relative [&_a]:inline-flex [&_a]:items-center [&_a]:gap-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_li]:my-1 [&_h1]:mt-8 [&_h1]:mb-4 [&_h2]:mt-7 [&_h2]:mb-3 [&_h3]:mt-6 [&_h3]:mb-3 [&_h4]:mt-5 [&_h4]:mb-2 [&_h5]:mt-4 [&_h5]:mb-2 [&_h6]:mt-4 [&_h6]:mb-2 [&_p]:my-3 [&_p]:leading-relaxed"
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
        onContextMenu={(e) => {
          // Provjeri da li je klik na link
          const target = e.target as HTMLElement;
          if (target.tagName === "A") {
            e.preventDefault();
            const link = target as HTMLAnchorElement;
            const url = link.href;
            
            // Kreiraj custom context menu
            const menu = document.createElement("div");
            menu.style.position = "fixed";
            menu.style.left = `${e.clientX}px`;
            menu.style.top = `${e.clientY}px`;
            menu.style.backgroundColor = "white";
            menu.style.border = "1px solid #ccc";
            menu.style.borderRadius = "4px";
            menu.style.padding = "8px 0";
            menu.style.zIndex = "1000";
            menu.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
            menu.className = "dark:bg-neutral-800 dark:border-neutral-700";
            
            const openLink = document.createElement("button");
            openLink.textContent = "Otvori link";
            openLink.className = "w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-700 text-sm";
            openLink.onclick = () => {
              window.open(url, "_blank");
              document.body.removeChild(menu);
            };
            
            const openNewTab = document.createElement("button");
            openNewTab.textContent = "Otvori u novom tabu";
            openNewTab.className = "w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-700 text-sm";
            openNewTab.onclick = () => {
              window.open(url, "_blank", "noopener,noreferrer");
              document.body.removeChild(menu);
            };
            
            const copyLink = document.createElement("button");
            copyLink.textContent = "Kopiraj URL";
            copyLink.className = "w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-700 text-sm";
            copyLink.onclick = () => {
              navigator.clipboard.writeText(url);
              document.body.removeChild(menu);
            };
            
            const editLink = document.createElement("button");
            editLink.textContent = "Uredi link";
            editLink.className = "w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-700 text-sm";
            editLink.onclick = () => {
              const newUrl = prompt("Unesi novi URL:", link.href);
              if (newUrl && newUrl.trim()) {
                link.href = newUrl.trim();
                updateContent();
              }
              document.body.removeChild(menu);
            };
            
            const removeLink = document.createElement("button");
            removeLink.textContent = "Ukloni link";
            removeLink.className = "w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-700 text-sm border-t border-gray-200 dark:border-neutral-700";
            removeLink.onclick = () => {
              const text = link.textContent || "";
              const textNode = document.createTextNode(text);
              link.parentNode?.replaceChild(textNode, link);
              updateContent();
              document.body.removeChild(menu);
            };
            
            menu.appendChild(openLink);
            menu.appendChild(openNewTab);
            menu.appendChild(copyLink);
            menu.appendChild(editLink);
            menu.appendChild(removeLink);
            document.body.appendChild(menu);
            
            // Ukloni menu kada se klikne izvan
            const removeMenu = (event: MouseEvent) => {
              if (!menu.contains(event.target as Node)) {
                document.body.removeChild(menu);
                document.removeEventListener("click", removeMenu);
              }
            };
            setTimeout(() => {
              document.addEventListener("click", removeMenu);
            }, 0);
          }
        }}
      />

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeLinkModal}
          />
          
          {/* Modal */}
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-700 dark:bg-neutral-800">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gf-cta to-gf-cta-hover">
                  <LinkIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gf-text-primary dark:text-neutral-100">
                  {isEditingLink ? "Uredi link" : "Dodaj link"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeLinkModal}
                className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* URL Input + predlošci linkova */}
            <div className="relative mb-4">
              <label className="mb-2 block text-sm font-medium text-gf-text-secondary dark:text-neutral-400">
                URL adresa
              </label>
              <input
                ref={linkInputRef}
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onFocus={() => {
                  if (linkSuggestions.length > 0) setLinkSuggestionsVisible(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    confirmLink();
                  } else if (e.key === "Escape") {
                    setLinkSuggestionsVisible(false);
                    closeLinkModal();
                  }
                }}
                placeholder="https://... ili upiši /blog ili naslov posta"
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-gf-text-primary transition-all placeholder:text-neutral-400 focus:border-gf-cta focus:bg-white focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-gf-cta dark:focus:bg-neutral-700"
              />
              {linkSuggestionsVisible && linkSuggestions.length > 0 && (
                <ul
                  className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-auto rounded-xl border border-neutral-200 bg-white py-1 shadow-xl dark:border-neutral-600 dark:bg-neutral-800"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <li className="px-3 py-1.5 text-xs font-medium text-gf-text-secondary dark:text-neutral-400">
                    Blog, recepti, proizvodi – klikni za putanju
                  </li>
                  {linkSuggestions.map((item) => (
                    <li key={`${item.label}-${item.path}`}>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setLinkUrl(item.path);
                          setLinkSuggestionsVisible(false);
                        }}
                        className="flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm transition-colors hover:bg-gf-cta/10 dark:hover:bg-gf-cta/20"
                      >
                        <span className="flex items-center gap-2">
                          <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-xs font-medium text-gf-text-secondary dark:bg-neutral-600 dark:text-neutral-300">
                            {item.label}
                          </span>
                          <span className="font-medium text-gf-text-primary dark:text-neutral-100">
                            {item.title}
                          </span>
                        </span>
                        <span className="text-xs text-gf-text-secondary dark:text-neutral-400">
                          {item.path}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-1.5 text-xs text-gf-text-secondary dark:text-neutral-400">
                Upiši <code className="rounded bg-neutral-200 px-1 dark:bg-neutral-600">/blog</code> ili dio naslova – prikazat će se postovi za odabir (relativna putanja radi i lokalno i online).
              </p>
            </div>
            
            {/* Open in new tab checkbox */}
            <div className="mb-6">
              <label className="flex cursor-pointer items-center gap-3">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={linkOpenInNewTab}
                    onChange={(e) => setLinkOpenInNewTab(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-6 rounded-lg border-2 border-neutral-300 bg-white transition-all peer-checked:border-gf-cta peer-checked:bg-gf-cta dark:border-neutral-600 dark:bg-neutral-700 dark:peer-checked:border-gf-cta dark:peer-checked:bg-gf-cta">
                    {linkOpenInNewTab && (
                      <Check className="h-full w-full p-0.5 text-white" />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                  <span className="text-sm text-gf-text-primary dark:text-neutral-200">
                    Otvori u novom tabu
                  </span>
                </div>
              </label>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeLinkModal}
                  className="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-3 font-medium text-gf-text-primary transition-all hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600"
                >
                  Odustani
                </button>
                <button
                  type="button"
                  onClick={confirmLink}
                  className="flex-1 rounded-xl bg-gradient-to-r from-gf-cta to-gf-cta-hover px-4 py-3 font-medium text-white shadow-lg shadow-gf-cta/25 transition-all hover:shadow-xl hover:shadow-gf-cta/30"
                >
                  {isEditingLink ? "Spremi" : "Dodaj link"}
                </button>
              </div>
              {isEditingLink && (
                <button
                  type="button"
                  onClick={removeLink}
                  className="rounded-xl border border-red-300 bg-white px-4 py-3 font-medium text-red-600 transition-all hover:bg-red-50 dark:border-red-700 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Ukloni link (ostavi samo tekst)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image align modal – odabir poravnanja nakon uploada */}
      {isImageAlignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeImageAlignModal}
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-700 dark:bg-neutral-800">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gf-cta to-gf-cta-hover">
                  <ImageIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gf-text-primary dark:text-neutral-100">
                  Pozicija slike
                </h3>
              </div>
              <button
                type="button"
                onClick={closeImageAlignModal}
                className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-gf-text-secondary dark:text-neutral-400">
              Odaberi kako želiš poravnati sliku u tekstu.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => insertImageWithAlign("left")}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-left transition-colors hover:border-gf-cta hover:bg-gf-cta/10 dark:border-neutral-600 dark:bg-neutral-700 dark:hover:border-gf-cta dark:hover:bg-gf-cta/20"
              >
                <AlignLeft className="h-5 w-5 shrink-0 text-gf-cta" />
                <span className="text-sm font-medium text-gf-text-primary dark:text-neutral-100">Lijevo</span>
              </button>
              <button
                type="button"
                onClick={() => insertImageWithAlign("right")}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-left transition-colors hover:border-gf-cta hover:bg-gf-cta/10 dark:border-neutral-600 dark:bg-neutral-700 dark:hover:border-gf-cta dark:hover:bg-gf-cta/20"
              >
                <AlignRight className="h-5 w-5 shrink-0 text-gf-cta" />
                <span className="text-sm font-medium text-gf-text-primary dark:text-neutral-100">Desno</span>
              </button>
              <button
                type="button"
                onClick={() => insertImageWithAlign("center")}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-left transition-colors hover:border-gf-cta hover:bg-gf-cta/10 dark:border-neutral-600 dark:bg-neutral-700 dark:hover:border-gf-cta dark:hover:bg-gf-cta/20"
              >
                <AlignCenter className="h-5 w-5 shrink-0 text-gf-cta" />
                <span className="text-sm font-medium text-gf-text-primary dark:text-neutral-100">Centrirano</span>
              </button>
              <button
                type="button"
                onClick={() => insertImageWithAlign("full")}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-left transition-colors hover:border-gf-cta hover:bg-gf-cta/10 dark:border-neutral-600 dark:bg-neutral-700 dark:hover:border-gf-cta dark:hover:bg-gf-cta/20"
              >
                <Maximize2 className="h-5 w-5 shrink-0 text-gf-cta" />
                <span className="text-sm font-medium text-gf-text-primary dark:text-neutral-100">Puna širina</span>
              </button>
            </div>
            <button
              type="button"
              onClick={closeImageAlignModal}
              className="mt-4 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-gf-text-secondary transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
            >
              Odustani (umetni punu širinu)
            </button>
          </div>
        </div>
      )}

      {/* Image edit modal – klik na sliku: ukloni ili promijeni poravnanje */}
      {isImageEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeImageEditModal}
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-700 dark:bg-neutral-800">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gf-cta to-gf-cta-hover">
                  <ImageIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gf-text-primary dark:text-neutral-100">
                  Uredi sliku
                </h3>
              </div>
              <button
                type="button"
                onClick={closeImageEditModal}
                className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-gf-text-secondary dark:text-neutral-400">
              Promijeni poravnanje ili ukloni sliku iz teksta.
            </p>
            <div className="mb-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedImageAlign("left")}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-left transition-colors hover:border-gf-cta hover:bg-gf-cta/10 dark:border-neutral-600 dark:bg-neutral-700 dark:hover:border-gf-cta dark:hover:bg-gf-cta/20"
              >
                <AlignLeft className="h-5 w-5 shrink-0 text-gf-cta" />
                <span className="text-sm font-medium text-gf-text-primary dark:text-neutral-100">Lijevo</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedImageAlign("right")}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-left transition-colors hover:border-gf-cta hover:bg-gf-cta/10 dark:border-neutral-600 dark:bg-neutral-700 dark:hover:border-gf-cta dark:hover:bg-gf-cta/20"
              >
                <AlignRight className="h-5 w-5 shrink-0 text-gf-cta" />
                <span className="text-sm font-medium text-gf-text-primary dark:text-neutral-100">Desno</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedImageAlign("center")}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-left transition-colors hover:border-gf-cta hover:bg-gf-cta/10 dark:border-neutral-600 dark:bg-neutral-700 dark:hover:border-gf-cta dark:hover:bg-gf-cta/20"
              >
                <AlignCenter className="h-5 w-5 shrink-0 text-gf-cta" />
                <span className="text-sm font-medium text-gf-text-primary dark:text-neutral-100">Centrirano</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedImageAlign("full")}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-left transition-colors hover:border-gf-cta hover:bg-gf-cta/10 dark:border-neutral-600 dark:bg-neutral-700 dark:hover:border-gf-cta dark:hover:bg-gf-cta/20"
              >
                <Maximize2 className="h-5 w-5 shrink-0 text-gf-cta" />
                <span className="text-sm font-medium text-gf-text-primary dark:text-neutral-100">Puna širina</span>
              </button>
            </div>
            <button
              type="button"
              onClick={removeSelectedImage}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
              Ukloni sliku
            </button>
            <button
              type="button"
              onClick={closeImageEditModal}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-gf-text-secondary transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
            >
              Odustani
            </button>
          </div>
        </div>
      )}

      {/* Font Size Modal */}
      {isFontSizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setIsFontSizeModalOpen(false);
              setSavedRange(null);
            }}
          />
          
          {/* Modal */}
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-700 dark:bg-neutral-800">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gf-cta to-gf-cta-hover">
                  <Type className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gf-text-primary dark:text-neutral-100">
                  Veličina fonta
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsFontSizeModalOpen(false);
                  setSavedRange(null);
                }}
                className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Font Size Grid */}
            <div className="grid grid-cols-2 gap-2">
              {fontSizes.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => confirmFontSize(size.value)}
                  className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 transition-all hover:border-gf-cta/60 hover:bg-gf-cta/5 dark:hover:border-gf-cta/60 dark:hover:bg-gf-cta/10 ${
                    selectedFontSize === size.value
                      ? "border-gf-cta bg-gf-cta/10 dark:border-gf-cta dark:bg-gf-cta/20"
                      : "border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800"
                  }`}
                >
                  <span 
                    className="font-medium text-gf-text-primary dark:text-neutral-100"
                    style={{ fontSize: size.value }}
                  >
                    {size.preview}
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gf-text-primary dark:text-neutral-100">
                      {size.label}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      {size.value}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Custom size input */}
            <div className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Prilagođena veličina (npr. 22px)"
                value={selectedFontSize}
                onChange={(e) => setSelectedFontSize(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    confirmFontSize(selectedFontSize);
                  }
                }}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-gf-text-primary transition-all placeholder:text-neutral-400 focus:border-gf-cta focus:bg-white focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              />
              <button
                type="button"
                onClick={() => confirmFontSize(selectedFontSize)}
                className="w-full rounded-xl bg-gradient-to-r from-gf-cta to-gf-cta-hover px-4 py-3 font-medium text-white shadow-lg shadow-gf-cta/25 transition-all hover:shadow-xl hover:shadow-gf-cta/30"
              >
                Primijeni veličinu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Color Modal */}
      {isColorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setIsColorModalOpen(false);
              setSavedRange(null);
            }}
          />
          
          {/* Modal */}
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-700 dark:bg-neutral-800">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ background: `linear-gradient(135deg, ${selectedColor}, ${selectedColor}dd)` }}
                >
                  <Palette className="h-5 w-5 text-white drop-shadow" />
                </div>
                <h3 className="text-lg font-semibold text-gf-text-primary dark:text-neutral-100">
                  Boja teksta
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsColorModalOpen(false);
                  setSavedRange(null);
                }}
                className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Color Grid */}
            <div className="grid grid-cols-4 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`group relative h-12 w-full rounded-xl border-2 transition-all hover:scale-105 hover:shadow-lg ${
                    selectedColor === color.value
                      ? "border-gf-cta ring-2 ring-gf-cta/30"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color.value }}
                >
                  {selectedColor === color.value && (
                    <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-md" />
                  )}
                  <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-neutral-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-neutral-600 z-10">
                    {color.name}
                  </span>
                </button>
              ))}
            </div>
            
            {/* Custom color input */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="h-11 w-11 cursor-pointer rounded-xl border-2 border-neutral-200 p-1 dark:border-neutral-700"
                  />
                </div>
                <input
                  type="text"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  placeholder="#000000"
                  className="min-w-0 flex-1 rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 font-mono text-sm text-gf-text-primary transition-all placeholder:text-neutral-400 focus:border-gf-cta focus:bg-white focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
                />
              </div>
              <button
                type="button"
                onClick={() => confirmColor(selectedColor)}
                className="w-full rounded-xl bg-gradient-to-r from-gf-cta to-gf-cta-hover px-4 py-3 font-medium text-white shadow-lg shadow-gf-cta/25 transition-all hover:shadow-xl hover:shadow-gf-cta/30"
              >
                Primijeni boju
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
