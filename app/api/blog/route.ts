import { NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { BlogPost } from "@/types";
import { mockBlogPosts } from "@/data/mockData";

const blogFilePath = path.join(process.cwd(), "data", "blog.json");

async function readBlogFile(): Promise<BlogPost[]> {
  try {
    if (existsSync(blogFilePath)) {
      const fileContents = await readFile(blogFilePath, "utf-8");
      return JSON.parse(fileContents);
    }
    return [];
  } catch (error) {
    console.error("Error reading blog file:", error);
    return [];
  }
}

async function writeBlogFile(posts: BlogPost[]): Promise<void> {
  await mkdir(path.dirname(blogFilePath), { recursive: true });
  await writeFile(blogFilePath, JSON.stringify(posts, null, 2), "utf8");
}

// Funkcija za izračun vremena čitanja na temelju broja riječi
function calculateReadTime(content: string): number {
  // Ukloni HTML tagove ako postoje, i razdvoji riječi
  const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text.split(' ').filter(word => word.length > 0);
  
  // Prosječna brzina čitanja je 200-250 riječi po minuti
  // Koristimo 225 riječi po minuti kao prosjek
  const wordsPerMinute = 225;
  const readTime = Math.ceil(words.length / wordsPerMinute);
  
  // Minimum 1 minuta
  return Math.max(1, readTime);
}

export async function GET() {
  const dynamicPosts = await readBlogFile();
  
  // Filtriraj mock postove - ako postoji dinamički post s istim ID-om, koristi dinamički
  const mockPostIds = new Set(mockBlogPosts.map((p) => p.id));
  const filteredMockPosts = mockBlogPosts.filter(
    (mockPost) => !dynamicPosts.some((dynamicPost) => dynamicPost.id === mockPost.id)
  );
  
  return NextResponse.json([...filteredMockPosts, ...dynamicPosts]);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const galleryCount = parseInt(formData.get("galleryCount") as string) || 0;

    const content = formData.get("content") as string;
    const readTime = calculateReadTime(content);

    const newPost: BlogPost = {
      id: randomUUID(),
      title: formData.get("title") as string,
      excerpt: formData.get("excerpt") as string,
      content: content,
      image: "", // Will be updated after image upload
      gallery: [], // Will be updated after gallery upload
      author: formData.get("author") as string,
      tags: JSON.parse(formData.get("tags") as string),
      category: formData.get("category") as string,
      readTime: readTime,
      createdAt: new Date().toISOString().split("T")[0],
    };

    // Upload glavne slike
    if (imageFile) {
      const uploadDir = path.join(process.cwd(), "public", "images", "blog");
      await mkdir(uploadDir, { recursive: true });
      const filename = `${newPost.id}-${imageFile.name}`;
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, Buffer.from(await imageFile.arrayBuffer()));
      newPost.image = `/images/blog/${filename}`;
    }

    // Upload galerije slika
    const galleryUrls: string[] = [];
    for (let i = 0; i < galleryCount; i++) {
      const galleryFile = formData.get(`gallery_${i}`) as File | null;
      if (galleryFile) {
        const uploadDir = path.join(process.cwd(), "public", "images", "blog", "gallery");
        await mkdir(uploadDir, { recursive: true });
        const filename = `${newPost.id}-gallery-${i}-${galleryFile.name}`;
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, Buffer.from(await galleryFile.arrayBuffer()));
        galleryUrls.push(`/images/blog/gallery/${filename}`);
      }
    }
    newPost.gallery = galleryUrls;

    const currentPosts = await readBlogFile();
    currentPosts.push(newPost);
    await writeBlogFile(currentPosts);

    return NextResponse.json({ message: "Blog post added successfully", post: newPost }, { status: 201 });
  } catch (error) {
    console.error("Error adding blog post:", error);
    return NextResponse.json(
      { message: "Error adding blog post", error: (error as Error).message },
      { status: 500 }
    );
  }
}

