import { NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { BlogPost, BlogPostMetadata } from "@/types";
import { mockBlogPosts } from "@/data/mockData";
import {
  readBlogMetadata,
  writeBlogMetadata,
  writePostContent,
  getAllBlogPosts,
  calculateReadTime,
} from "@/lib/blogUtils";

const deletedBlogPostsFilePath = path.join(process.cwd(), "data", "deletedBlogPosts.json");

async function readDeletedBlogPostsFile(): Promise<string[]> {
  try {
    if (existsSync(deletedBlogPostsFilePath)) {
      const fileContents = await readFile(deletedBlogPostsFilePath, "utf-8");
      return JSON.parse(fileContents);
    }
    return [];
  } catch (error) {
    console.error("Error reading deleted blog posts file:", error);
    return [];
  }
}

async function writeDeletedBlogPostsFile(deletedIds: string[]): Promise<void> {
  await mkdir(path.dirname(deletedBlogPostsFilePath), { recursive: true });
  await writeFile(deletedBlogPostsFilePath, JSON.stringify(deletedIds, null, 2), "utf8");
}

export async function GET() {
  const dynamicPosts = await getAllBlogPosts();
  const deletedIds = await readDeletedBlogPostsFile();
  
  // Vrati samo dinamičke postove - ukloni mock postove
  // Filtriraj dinamičke postove - samo oni koji imaju content i nisu obrisani
  const validDynamicPosts = dynamicPosts.filter(
    (post) => post.content && post.content.trim() !== "" && !deletedIds.includes(post.id)
  );
  
  return NextResponse.json(validDynamicPosts);
}

// Funkcija za generiranje slug-a iz naslova
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Ukloni sve znakove osim slova, brojeva, razmaka i crtica
    .replace(/[\s_-]+/g, '-') // Zamijeni razmake, podvlake i višestruke crtice s jednom crticom
    .replace(/^-+|-+$/g, ''); // Ukloni crtice s početka i kraja
}

// Generiraj ID u formatu yymmdd-naslov
function generatePostId(title: string, createdAt: string): string {
  // Parsiraj datum
  const date = new Date(createdAt);
  const year = date.getFullYear().toString().slice(-2); // Zadnje 2 znamenke godine
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mjesec s vodećom nulom
  const day = date.getDate().toString().padStart(2, '0'); // Dan s vodećom nulom
  
  // Kreiraj slug iz naslova
  const slug = slugify(title);
  
  // Kombiniraj datum i slug
  return `${year}${month}${day}-${slug}`;
}

// Provjeri da li ID već postoji i dodaj broj ako treba
async function ensureUniquePostId(baseId: string): Promise<string> {
  const metadata = await readBlogMetadata();
  let postId = baseId;
  let counter = 1;
  
  // Provjeri da li ID već postoji
  while (metadata.some((post) => post.id === postId)) {
    // Ako postoji, dodaj broj na kraj
    const parts = baseId.split('-');
    const slug = parts.slice(1).join('-'); // Sve osim datuma
    const datePart = parts[0];
    postId = `${datePart}-${slug}-${counter}`;
    counter++;
  }
  
  return postId;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const galleryCount = parseInt(formData.get("galleryCount") as string) || 0;

    // Konvertiraj HTML u Markdown (ili koristi direktno ako je već Markdown)
    let content = formData.get("content") as string;
    // Ako je HTML, konvertiraj u Markdown (osnovna konverzija)
    content = htmlToMarkdown(content);

    const title = formData.get("title") as string;
    const createdAt = (formData.get("createdAt") as string) || new Date().toISOString().split("T")[0];
    
    // Generiraj ID u formatu yymmdd-naslov
    const basePostId = generatePostId(title, createdAt);
    const postId = await ensureUniquePostId(basePostId);
    
    const readTime = calculateReadTime(content);

    // Spremi Markdown sadržaj u zaseban fajl
    await writePostContent(postId, content);

    // Parsiraj kategorije (može biti string ili JSON array)
    const categoryData = formData.get("category") as string;
    let category: string | string[];
    try {
      category = JSON.parse(categoryData); // Pokušaj parsirati kao JSON array
      if (!Array.isArray(category)) {
        category = categoryData; // Ako nije array, koristi kao string (backward compatibility)
      }
    } catch {
      category = categoryData; // Ako parsing ne uspije, koristi kao string
    }

    // Kreiraj metadata objekt (bez content polja)
    const metadata: BlogPostMetadata = {
      id: postId,
      title: formData.get("title") as string,
      excerpt: formData.get("excerpt") as string,
      image: "", // Will be updated after image upload
      gallery: [], // Will be updated after gallery upload
      author: "Ivica Drusany", // Fiksni autor
      tags: JSON.parse(formData.get("tags") as string),
      category: category,
      readTime: readTime,
      createdAt: (formData.get("createdAt") as string) || new Date().toISOString().split("T")[0],
    };

    // Upload glavne slike
    if (imageFile) {
      const uploadDir = path.join(process.cwd(), "public", "images", "blog");
      await mkdir(uploadDir, { recursive: true });
      const filename = `${postId}-${imageFile.name}`;
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, Buffer.from(await imageFile.arrayBuffer()));
      metadata.image = `/images/blog/${filename}`;
    }

    // Upload galerije slika
    const galleryUrls: string[] = [];
    for (let i = 0; i < galleryCount; i++) {
      const galleryFile = formData.get(`gallery_${i}`) as File | null;
      if (galleryFile) {
        const uploadDir = path.join(process.cwd(), "public", "images", "blog", "gallery");
        await mkdir(uploadDir, { recursive: true });
        const filename = `${postId}-gallery-${i}-${galleryFile.name}`;
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, Buffer.from(await galleryFile.arrayBuffer()));
        galleryUrls.push(`/images/blog/gallery/${filename}`);
      }
    }
    metadata.gallery = galleryUrls;

    // Spremi metadata u JSON
    const currentMetadata = await readBlogMetadata();
    currentMetadata.push(metadata);
    await writeBlogMetadata(currentMetadata);

    // Vrati potpuni post za response
    const newPost: BlogPost = {
      ...metadata,
      content,
    };

    return NextResponse.json({ message: "Blog post added successfully", post: newPost }, { status: 201 });
  } catch (error) {
    console.error("Error adding blog post:", error);
    return NextResponse.json(
      { message: "Error adding blog post", error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Osnovna konverzija HTML-a u Markdown
function htmlToMarkdown(html: string): string {
  let markdown = html;
  
  // Prvo, zamijeni prazne paragrafe (<p></p> ili <p> </p>) s praznim paragrafom u Markdownu
  // Koristimo &nbsp; ili razmak da osiguramo da se paragraf prikaže
  markdown = markdown.replace(/<p>\s*<\/p>/g, '\n\n&nbsp;\n\n');
  
  // Zamijeni HTML tagove s Markdown ekvivalentima
  markdown = markdown.replace(/<p>/g, '').replace(/<\/p>/g, '\n\n');
  markdown = markdown.replace(/<h1>/g, '# ').replace(/<\/h1>/g, '\n\n');
  markdown = markdown.replace(/<h2>/g, '## ').replace(/<\/h2>/g, '\n\n');
  markdown = markdown.replace(/<h3>/g, '### ').replace(/<\/h3>/g, '\n\n');
  markdown = markdown.replace(/<h4>/g, '#### ').replace(/<\/h4>/g, '\n\n');
  markdown = markdown.replace(/<strong>/g, '**').replace(/<\/strong>/g, '**');
  markdown = markdown.replace(/<b>/g, '**').replace(/<\/b>/g, '**');
  markdown = markdown.replace(/<em>/g, '*').replace(/<\/em>/g, '*');
  markdown = markdown.replace(/<i>/g, '*').replace(/<\/i>/g, '*');
  markdown = markdown.replace(/<u>/g, '').replace(/<\/u>/g, '');
  markdown = markdown.replace(/<br\s*\/?>/g, '\n');
  markdown = markdown.replace(/<ul>/g, '').replace(/<\/ul>/g, '\n');
  markdown = markdown.replace(/<ol>/g, '').replace(/<\/ol>/g, '\n');
  markdown = markdown.replace(/<li>/g, '- ').replace(/<\/li>/g, '\n');
  markdown = markdown.replace(/<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/g, '[$2]($1)');
  // Zadrži align atribut za slike
  markdown = markdown.replace(/<img[^>]+src="([^"]+)"[^>]*(?:align="([^"]*)")?[^>]*alt="([^"]*)"[^>]*>/g, (match, src, align, alt) => {
    if (align) {
      return `![${alt || ""}](${src} "align:${align}")`;
    }
    return `![${alt || ""}](${src})`;
  });
  
  // Ukloni sve preostale HTML tagove
  markdown = markdown.replace(/<[^>]+>/g, '');
  
  // Očisti višestruke prazne linije (ali zadrži &nbsp; za prazne paragrafe)
  markdown = markdown.replace(/\n{4,}/g, '\n\n\n');
  
  // Ukloni samo početne i završne prazne linije, ali zadrži &nbsp;
  return markdown.trim();
}
