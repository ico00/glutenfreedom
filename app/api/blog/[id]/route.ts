import { NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
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

async function getAllPosts(): Promise<BlogPost[]> {
  const dynamicPosts = await readBlogFile();
  
  // Filtriraj mock postove - ako postoji dinamički post s istim ID-om, koristi dinamički
  const filteredMockPosts = mockBlogPosts.filter(
    (mockPost) => !dynamicPosts.some((dynamicPost) => dynamicPost.id === mockPost.id)
  );
  
  // Dinamički postovi imaju prioritet - vraćaju se nakon mock postova
  return [...filteredMockPosts, ...dynamicPosts];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const allPosts = await getAllPosts();
  const post = allPosts.find((p) => p.id === id);

  if (!post) {
    return NextResponse.json({ message: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const allPosts = await getAllPosts();
    const postIndex = allPosts.findIndex((p) => p.id === id);

    if (postIndex === -1) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const existingPost = allPosts[postIndex];
    const galleryCount = parseInt(formData.get("galleryCount") as string) || 0;

    const content = (formData.get("content") as string) || existingPost.content;
    const readTime = calculateReadTime(content);

    const updatedPost: BlogPost = {
      ...existingPost,
      title: (formData.get("title") as string) || existingPost.title,
      excerpt: (formData.get("excerpt") as string) || existingPost.excerpt,
      content: content,
      author: (formData.get("author") as string) || existingPost.author,
      tags: formData.get("tags")
        ? JSON.parse(formData.get("tags") as string)
        : existingPost.tags,
      category: (formData.get("category") as string) || existingPost.category,
      readTime: readTime,
    };

    // Upload nove glavne slike ako je dodana
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "images", "blog");
      await mkdir(uploadDir, { recursive: true });
      const filename = `${updatedPost.id}-${imageFile.name}`;
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, Buffer.from(await imageFile.arrayBuffer()));
      updatedPost.image = `/images/blog/${filename}`;
    }

    // Upload nove galerije slika ako su dodane
    if (galleryCount > 0) {
      const galleryUrls: string[] = existingPost.gallery || [];
      for (let i = 0; i < galleryCount; i++) {
        const galleryFile = formData.get(`gallery_${i}`) as File | null;
        if (galleryFile && galleryFile.size > 0) {
          const uploadDir = path.join(process.cwd(), "public", "images", "blog", "gallery");
          await mkdir(uploadDir, { recursive: true });
          const filename = `${updatedPost.id}-gallery-${Date.now()}-${i}-${galleryFile.name}`;
          const filePath = path.join(uploadDir, filename);
          await writeFile(filePath, Buffer.from(await galleryFile.arrayBuffer()));
          galleryUrls.push(`/images/blog/gallery/${filename}`);
        }
      }
      updatedPost.gallery = galleryUrls;
    }

    // Ažuriraj samo dinamičke postove (ne mock)
    const dynamicPosts = await readBlogFile();
    const dynamicIndex = dynamicPosts.findIndex((p) => p.id === id);

    if (dynamicIndex !== -1) {
      // Ažuriraj postojeći dinamički post - ZAMIJENI postojeći, ne dodaj novi
      dynamicPosts[dynamicIndex] = updatedPost;
      await writeBlogFile(dynamicPosts);
    } else {
      // Provjeri da li je mock post - ako jest, dodaj kao novi dinamički
      const isMockPost = mockBlogPosts.some((p) => p.id === id);
      if (isMockPost) {
        // Mock post se dodaje kao novi dinamički post (prvi put kada se edita)
        // Provjeri da li već postoji post s istim ID-om u dinamičkim (zbog mogućih duplikata)
        const existingDuplicateIndex = dynamicPosts.findIndex((p) => p.id === id);
        if (existingDuplicateIndex !== -1) {
          // Ako već postoji, ažuriraj ga umjesto dodavanja novog
          dynamicPosts[existingDuplicateIndex] = updatedPost;
        } else {
          // Ako ne postoji, dodaj novi
          dynamicPosts.push(updatedPost);
        }
        await writeBlogFile(dynamicPosts);
      } else {
        // Ako post ne postoji ni u mock ni u dinamičkim, to je greška
        return NextResponse.json(
          { message: "Post not found in database" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({ message: "Post updated successfully", post: updatedPost });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { message: "Error updating post", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dynamicPosts = await readBlogFile();
    const filteredPosts = dynamicPosts.filter((p) => p.id !== id);
    await writeBlogFile(filteredPosts);

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { message: "Error deleting post", error: (error as Error).message },
      { status: 500 }
    );
  }
}

