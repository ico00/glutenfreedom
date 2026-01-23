import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { BlogPost, BlogPostMetadata } from "@/types";

const contentDir = path.join(process.cwd(), "content", "posts");
const blogMetadataPath = path.join(process.cwd(), "data", "blog.json");

// Učitaj HTML sadržaj za post
export async function readPostContent(postId: string): Promise<string> {
  // Prvo pokušaj učitati .html fajl
  const htmlPath = path.join(contentDir, `${postId}.html`);
  if (existsSync(htmlPath)) {
    try {
      return await readFile(htmlPath, "utf-8");
    } catch (error) {
      console.error(`Error reading HTML content for ${postId}:`, error);
    }
  }
  
  // Fallback: ako ne postoji .html, pokušaj učitati .md (za backward compatibility)
  const mdPath = path.join(contentDir, `${postId}.md`);
  if (existsSync(mdPath)) {
    try {
      const markdown = await readFile(mdPath, "utf-8");
      // Konvertiraj Markdown u HTML za backward compatibility
      // Koristimo jednostavnu konverziju
      let html = markdown;
      html = html.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/__([^_]+?)__/g, '<strong>$1</strong>');
      html = html.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>');
      html = html.replace(/(?<!_)_([^_\n]+?)_(?!_)/g, '<em>$1</em>');
      html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
      html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
      html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
      html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
      html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
      html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
      html = html.split('\n\n').map(para => {
        para = para.trim();
        if (!para) return '<p>&nbsp;</p>';
        if (!para.match(/^<(h[1-4]|ul|ol|img|p)/)) {
          return '<p>' + para + '</p>';
        }
        return para;
      }).join('\n');
      html = html.replace(/\n/g, '<br>');
      return html;
    } catch (error) {
      console.error(`Error reading Markdown content for ${postId}:`, error);
    }
  }
  
  return "";
}

// Spremi HTML sadržaj za post
export async function writePostContent(postId: string, content: string): Promise<void> {
  await mkdir(contentDir, { recursive: true });
  const contentPath = path.join(contentDir, `${postId}.html`);
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

// Izračunaj vrijeme čitanja na temelju HTML sadržaja
export function calculateReadTime(content: string): number {
  // Ukloni HTML tagove i razdvoji riječi
  const text = content
    .replace(/<[^>]+>/g, ' ') // Ukloni HTML tagove
    .replace(/&nbsp;/g, ' ') // Ukloni &nbsp;
    .replace(/&[a-z]+;/gi, ' ') // Ukloni HTML entitete
    .replace(/\s+/g, ' ')
    .trim();
  
  const words = text.split(' ').filter(word => word.length > 0);
  
  // Prosječna brzina čitanja je 200-250 riječi po minuti
  const wordsPerMinute = 225;
  const readTime = Math.ceil(words.length / wordsPerMinute);
  
  return Math.max(1, readTime);
}

