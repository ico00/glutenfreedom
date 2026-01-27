import DOMPurify from "isomorphic-dompurify";
import { fileTypeFromBuffer } from "file-type";

// Validni MIME tipovi za slike
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

// Maksimalna veličina datoteke (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Magic bytes za provjeru tipa datoteke
const MAGIC_BYTES: Record<string, string[]> = {
  "image/jpeg": ["FF D8 FF"],
  "image/png": ["89 50 4E 47"],
  "image/webp": ["52 49 46 46"],
  "image/gif": ["47 49 46 38"],
};

/**
 * Provjeri da li je datoteka valjana slika
 */
export async function validateImageFile(file: File): Promise<{
  valid: boolean;
  error?: string;
}> {
  // Provjera veličine
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Datoteka je prevelika. Maksimalna veličina je ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Provjera MIME tipa
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Nedozvoljeni tip datoteke. Dozvoljeni tipovi su: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    };
  }

  // Provjera magic bytes (provjera da je datoteka stvarno slika)
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const chunk = buffer.slice(0, 4100); // file-type čita do 4100 bytes
    
    // Provjeri magic bytes
    const fileType = await fileTypeFromBuffer(chunk);
    
    if (!fileType || !ALLOWED_IMAGE_TYPES.includes(fileType.mime)) {
      return {
        valid: false,
        error: "Datoteka nije valjana slika (provjera magic bytes neuspješna)",
      };
    }
  } catch (error) {
    // Ako file-type ne može detektirati tip, ali MIME type je valjan, dozvoli
    // (neki slučajevi gdje file-type ne prepoznaje sve formate)
    console.warn("File type detection warning:", error);
  }

  return { valid: true };
}

/**
 * Sanitiziraj filename da spriječi path traversal napade
 */
export function sanitizeFilename(filename: string): string {
  // Ukloni path traversal znakove
  let sanitized = filename
    .replace(/\.\./g, "") // Ukloni ..
    .replace(/\//g, "_") // Zamijeni / s _
    .replace(/\\/g, "_") // Zamijeni \ s _
    .replace(/[^a-zA-Z0-9._-]/g, "_"); // Ukloni sve posebne znakove osim . _ -

  // Ukloni višestruke podvlake
  sanitized = sanitized.replace(/_+/g, "_");

  // Ograniči duljinu
  if (sanitized.length > 255) {
    const ext = sanitized.substring(sanitized.lastIndexOf("."));
    sanitized = sanitized.substring(0, 255 - ext.length) + ext;
  }

  return sanitized;
}

/**
 * Generiraj siguran filename
 */
export function generateSafeFilename(originalName: string, prefix: string = ""): string {
  const sanitized = sanitizeFilename(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  
  // Ekstraktuj ekstenziju
  const ext = sanitized.includes(".") ? sanitized.substring(sanitized.lastIndexOf(".")) : "";
  const nameWithoutExt = sanitized.includes(".") 
    ? sanitized.substring(0, sanitized.lastIndexOf(".")) 
    : sanitized;
  
  return `${prefix ? prefix + "-" : ""}${timestamp}-${random}-${nameWithoutExt}${ext}`;
}

/**
 * Sanitiziraj HTML sadržaj
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "a", "img", "blockquote", "code", "pre",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class"],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Validiraj i sanitiziraj string input
 */
export function sanitizeString(input: string, maxLength: number = 10000): string {
  if (input.length > maxLength) {
    throw new Error(`Input je predugačak. Maksimalna duljina je ${maxLength} znakova`);
  }
  
  // Ukloni null bytes i kontrolne znakove
  return input
    .replace(/\0/g, "")
    .replace(/[\x00-\x1F\x7F]/g, "")
    .trim();
}

