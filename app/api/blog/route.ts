import { NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const galleryCount = parseInt(formData.get("galleryCount") as string) || 0;

    // Konvertiraj HTML u Markdown (ili koristi direktno ako je već Markdown)
    let content = formData.get("content") as string;
    // Ako je HTML, konvertiraj u Markdown (osnovna konverzija)
    content = htmlToMarkdown(content);

    const postId = randomUUID();
    const readTime = calculateReadTime(content);

    // Spremi Markdown sadržaj u zaseban fajl
    await writePostContent(postId, content);

    // Kreiraj metadata objekt (bez content polja)
    const metadata: BlogPostMetadata = {
      id: postId,
      title: formData.get("title") as string,
      excerpt: formData.get("excerpt") as string,
      image: "", // Will be updated after image upload
      gallery: [], // Will be updated after gallery upload
      author: "Ivica Drusany", // Fiksni autor
      tags: JSON.parse(formData.get("tags") as string),
      category: formData.get("category") as string,
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
  markdown = markdown.replace(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/g, '![$2]($1)');
  
  // Ukloni sve preostale HTML tagove
  markdown = markdown.replace(/<[^>]+>/g, '');
  
  // Očisti višestruke prazne linije
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  
  return markdown.trim();
}
