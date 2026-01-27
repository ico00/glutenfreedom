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
  const [isHeadingOpen, setIsHeadingOpen] = useState(false);
  const [selectedHeading, setSelectedHeading] = useState<string>("");
  const headingDropdownRef = useRef<HTMLDivElement>(null);
  
  // Link modal state
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkOpenInNewTab, setLinkOpenInNewTab] = useState(true);
  const [savedRange, setSavedRange] = useState<Range | null>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  
  // Font size modal state
  const [isFontSizeModalOpen, setIsFontSizeModalOpen] = useState(false);
  const [selectedFontSize, setSelectedFontSize] = useState("16px");
  
  // Color modal state
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");
  
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

  const headingOptions = [
    { value: "h1", label: "Naslov 1", preview: "text-2xl font-bold" },
    { value: "h2", label: "Naslov 2", preview: "text-xl font-bold" },
    { value: "h3", label: "Naslov 3", preview: "text-lg font-semibold" },
    { value: "h4", label: "Naslov 4", preview: "text-base font-semibold" },
    { value: "p", label: "Paragraf", preview: "text-base font-normal" },
  ];

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const updateContent = () => {
    if (editorRef.current) {
      let html = editorRef.current.innerHTML;
      
      // Normaliziraj bold tagove - zamijeni <b> s <strong>
      html = html.replace(/<b\b[^>]*>/gi, '<strong>');
      html = html.replace(/<\/b>/gi, '</strong>');
      
      // Normaliziraj italic tagove - zamijeni <i> s <em>
      html = html.replace(/<i\b[^>]*>/gi, '<em>');
      html = html.replace(/<\/i>/gi, '</em>');
      
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

  // Custom heading
  const handleHeading = (level: string) => {
    if (!level) return;
    
    const sel = getSelectionAndRange();
    if (!sel) {
      editorRef.current?.focus();
      return;
    }

    const { selection, range } = sel;
    
    // Provjeri da li je već u heading tagu
    const headingElement = isInTag(range.commonAncestorContainer, ["H1", "H2", "H3", "H4", "H5", "H6"]);
    
    if (headingElement && headingElement.tagName.toLowerCase() === level) {
      // Ako je već taj heading, pretvori u paragraf
      const text = headingElement.textContent || "";
      const p = document.createElement("p");
      p.textContent = text;
      headingElement.parentNode?.replaceChild(p, headingElement);
    } else {
      // Kreiraj novi heading
      const heading = document.createElement(level);
      
      if (!range.collapsed) {
        const contents = range.extractContents();
        heading.appendChild(contents);
        range.insertNode(heading);
      } else {
        // Ako je u postojećem bloku, zamijeni ga
        let blockElement: Node | null = range.commonAncestorContainer;
        while (blockElement && blockElement !== editorRef.current) {
          if (blockElement.nodeType === Node.ELEMENT_NODE) {
            const el = blockElement as Element;
            if (["P", "H1", "H2", "H3", "H4", "H5", "H6", "DIV"].includes(el.tagName)) {
              const text = el.textContent || "";
              heading.textContent = text;
              el.parentNode?.replaceChild(heading, el);
              editorRef.current?.focus();
              updateContent();
              return;
            }
          }
          blockElement = blockElement.parentNode;
        }
        
        // Ako nije u bloku, kreiraj novi
        heading.textContent = "Novi naslov";
        range.insertNode(heading);
        const newRange = document.createRange();
        newRange.selectNodeContents(heading);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
    
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
      // Pronađi roditeljski blok element
      const blockElement = findParentBlock(range.commonAncestorContainer);
      
      if (blockElement && blockElement.parentNode) {
        // Kreiraj novu stavku liste
        const li = document.createElement("li");
        li.innerHTML = blockElement.innerHTML || "<br>";
        
        // Provjeri je li prethodni element UL lista
        const prevSibling = blockElement.previousElementSibling;
        // Provjeri je li sljedeći element UL lista
        const nextSibling = blockElement.nextElementSibling;
        
        if (prevSibling && prevSibling.tagName === "UL") {
          // Dodaj u postojeću prethodnu listu
          prevSibling.appendChild(li);
          blockElement.remove();
        } else if (nextSibling && nextSibling.tagName === "UL") {
          // Dodaj na početak sljedeće liste
          nextSibling.insertBefore(li, nextSibling.firstChild);
          blockElement.remove();
        } else {
          // Kreiraj novu listu
          const ul = createStyledList("ul");
          ul.appendChild(li);
          blockElement.parentNode.replaceChild(ul, blockElement);
        }
        
        // Postavi kursor u li
        const newRange = document.createRange();
        newRange.setStart(li, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
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
        
        // Postavi kursor u li
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
      // Pronađi roditeljski blok element
      const blockElement = findParentBlock(range.commonAncestorContainer);
      
      if (blockElement && blockElement.parentNode) {
        // Kreiraj novu stavku liste
        const li = document.createElement("li");
        li.innerHTML = blockElement.innerHTML || "<br>";
        
        // Provjeri je li prethodni element OL lista
        const prevSibling = blockElement.previousElementSibling;
        // Provjeri je li sljedeći element OL lista
        const nextSibling = blockElement.nextElementSibling;
        
        if (prevSibling && prevSibling.tagName === "OL") {
          // Dodaj u postojeću prethodnu listu
          prevSibling.appendChild(li);
          blockElement.remove();
        } else if (nextSibling && nextSibling.tagName === "OL") {
          // Dodaj na početak sljedeće liste
          nextSibling.insertBefore(li, nextSibling.firstChild);
          blockElement.remove();
        } else {
          // Kreiraj novu listu
          const ol = createStyledList("ol");
          ol.appendChild(li);
          blockElement.parentNode.replaceChild(ol, blockElement);
        }
        
        // Postavi kursor u li
        const newRange = document.createRange();
        newRange.setStart(li, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
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
        
        // Postavi kursor u li
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

  // Custom link - otvori modal
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
    
    // Provjeri da li je već link
    const linkElement = isInTag(range.commonAncestorContainer, ["A"]);
    
    if (linkElement) {
      // Ako je već link, ukloni link
      const text = linkElement.textContent || "";
      const textNode = document.createTextNode(text);
      linkElement.parentNode?.replaceChild(textNode, linkElement);
      editorRef.current?.focus();
      updateContent();
    } else {
      // Spremi range i otvori modal
      setSavedRange(range.cloneRange());
      setLinkUrl("https://");
      setLinkOpenInNewTab(true);
      setIsLinkModalOpen(true);
      // Focus input nakon što se modal otvori
      setTimeout(() => linkInputRef.current?.focus(), 100);
    }
  };
  
  // Potvrdi link iz modala
  const confirmLink = () => {
    if (!linkUrl || !linkUrl.trim() || linkUrl.trim() === "https://") {
      setIsLinkModalOpen(false);
      return;
    }
    
    if (savedRange && editorRef.current) {
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
    }
    
    setIsLinkModalOpen(false);
    setSavedRange(null);
    editorRef.current?.focus();
  };
  
  // Zatvori link modal
  const closeLinkModal = () => {
    setIsLinkModalOpen(false);
    setSavedRange(null);
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
            onClick={() => setIsHeadingOpen(!isHeadingOpen)}
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
        className="min-h-[300px] px-4 py-3 text-gf-text-primary focus:outline-none dark:text-neutral-100 [&_a]:text-gf-cta [&_a]:underline [&_a:hover]:text-gf-cta-hover [&_a]:cursor-pointer [&_a]:relative [&_a]:inline-flex [&_a]:items-center [&_a]:gap-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_li]:my-1 [&_h1]:mt-8 [&_h1]:mb-4 [&_h2]:mt-7 [&_h2]:mb-3 [&_h3]:mt-6 [&_h3]:mb-3 [&_h4]:mt-5 [&_h4]:mb-2 [&_h5]:mt-4 [&_h5]:mb-2 [&_h6]:mt-4 [&_h6]:mb-2 [&_p]:my-3 [&_p]:leading-relaxed"
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
                  Dodaj link
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
            
            {/* URL Input */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gf-text-secondary dark:text-neutral-400">
                URL adresa
              </label>
              <input
                ref={linkInputRef}
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    confirmLink();
                  } else if (e.key === "Escape") {
                    closeLinkModal();
                  }
                }}
                placeholder="https://primjer.com"
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-gf-text-primary transition-all placeholder:text-neutral-400 focus:border-gf-cta focus:bg-white focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-gf-cta dark:focus:bg-neutral-700"
              />
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
                Dodaj link
              </button>
            </div>
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
