import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { BlogPost, BlogPostMetadata } from "@/types";

const contentDir = path.join(process.cwd(), "content", "posts");
const blogMetadataPath = path.join(process.cwd(), "data", "blog.json");

// Učitaj Markdown sadržaj za post
export async function readPostContent(postId: string): Promise<string> {
  const contentPath = path.join(contentDir, `${postId}.md`);
  try {
    if (existsSync(contentPath)) {
      return await readFile(contentPath, "utf-8");
    }
    return "";
  } catch (error) {
    console.error(`Error reading post content for ${postId}:`, error);
    return "";
  }
}

// Spremi Markdown sadržaj za post
export async function writePostContent(postId: string, content: string): Promise<void> {
  await mkdir(contentDir, { recursive: true });
  const contentPath = path.join(contentDir, `${postId}.md`);
  await writeFile(contentPath, content, "utf-8");
}

// Učitaj sve metadata postove
export async function readBlogMetadata(): Promise<BlogPostMetadata[]> {
  try {
    if (existsSync(blogMetadataPath)) {
      const fileContents = await readFile(blogMetadataPath, "utf-8");
      return JSON.parse(fileContents);
    }
    return [];
  } catch (error) {
    console.error("Error reading blog metadata:", error);
    return [];
  }
}

// Spremi metadata postove
export async function writeBlogMetadata(posts: BlogPostMetadata[]): Promise<void> {
  await mkdir(path.dirname(blogMetadataPath), { recursive: true });
  await writeFile(blogMetadataPath, JSON.stringify(posts, null, 2), "utf8");
}

// Kombiniraj metadata + content u potpuni BlogPost
export async function getFullBlogPost(metadata: BlogPostMetadata): Promise<BlogPost> {
  const content = await readPostContent(metadata.id);
  return {
    ...metadata,
    content,
  };
}

// Kombiniraj sve metadata + content u potpune BlogPost objekte
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const metadataList = await readBlogMetadata();
  const posts: BlogPost[] = [];
  
  for (const metadata of metadataList) {
    let content = await readPostContent(metadata.id);
    
    // Fallback: ako Markdown fajl ne postoji, provjeri da li je content u metadata (stari format)
    // Ovo je za backward compatibility s postojećim postovima koji još nisu migrirani
    if (!content && (metadata as any).content) {
      content = (metadata as any).content;
    }
    
    // Ako još uvijek nema content, koristi prazan string
    posts.push({
      ...metadata,
      content: content || "",
    });
  }
  
  return posts;
}

// Helper funkcija za učitavanje starih postova iz JSON-a (za migraciju)
export async function readOldBlogPosts(): Promise<BlogPost[]> {
  const oldBlogPath = path.join(process.cwd(), "data", "blog.json.backup");
  try {
    if (existsSync(oldBlogPath)) {
      const fileContents = await readFile(oldBlogPath, "utf-8");
      return JSON.parse(fileContents);
    }
  } catch (error) {
    console.error("Error reading old blog file:", error);
  }
  return [];
}

// Izračunaj vrijeme čitanja na temelju Markdown sadržaja
export function calculateReadTime(content: string): number {
  // Ukloni Markdown sintaksu i razdvoji riječi
  const text = content
    .replace(/[#*`_~\[\]()]/g, ' ') // Ukloni Markdown znakove
    .replace(/!\[.*?\]\(.*?\)/g, ' ') // Ukloni slike
    .replace(/\[.*?\]\(.*?\)/g, ' ') // Ukloni linkove
    .replace(/\s+/g, ' ')
    .trim();
  
  const words = text.split(' ').filter(word => word.length > 0);
  
  // Prosječna brzina čitanja je 200-250 riječi po minuti
  const wordsPerMinute = 225;
  const readTime = Math.ceil(words.length / wordsPerMinute);
  
  return Math.max(1, readTime);
}

