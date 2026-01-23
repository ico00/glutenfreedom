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
import { auth } from "@/auth";
import { validateImageFile, generateSafeFilename, sanitizeHtml, sanitizeString } from "@/lib/security";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { verifyCsrfToken } from "@/lib/csrf";
import { Logger } from "@/lib/logger";
import { blogPostSchema, validateData } from "@/lib/validation";

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
    // Provjeri autentifikaciju
    const session = await auth();
    const clientIp = getClientIp(request);
    
    if (!session?.user) {
      await Logger.security("Unauthorized POST attempt to /api/blog", undefined, clientIp);
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    await Logger.info("Blog post creation attempt", {
      userId: session.user.email,
      ip: clientIp,
    });

    // Provjeri rate limit
    const rateLimit = checkRateLimit(`blog-post-${clientIp}`, 5, 60000); // 5 zahtjeva po minuti
    if (!rateLimit.allowed) {
      await Logger.security("Rate limit exceeded for blog POST", session.user.email, clientIp);
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { 
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Provjeri CSRF token
    const csrfToken = request.headers.get("x-csrf-token");
    if (!csrfToken || !(await verifyCsrfToken(csrfToken))) {
      await Logger.security("Invalid CSRF token for blog POST", session.user.email, clientIp);
      return NextResponse.json(
        { message: "Invalid CSRF token" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const galleryCount = parseInt(formData.get("galleryCount") as string) || 0;

    // Validiraj i sanitiziraj upload slike
    if (imageFile) {
      const validation = await validateImageFile(imageFile);
      if (!validation.valid) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400 }
        );
      }
    }

    // Uzmi HTML sadržaj i sanitiziraj ga
    let content = formData.get("content") as string;
    // Sanitiziraj HTML (dozvoljava samo sigurne tagove)
    content = sanitizeHtml(content);

    // Sanitiziraj i validiraj inpute
    const title = sanitizeString(formData.get("title") as string, 200);
    const excerpt = sanitizeString(formData.get("excerpt") as string, 500);
    const createdAt = (formData.get("createdAt") as string) || new Date().toISOString().split("T")[0];
    
    // Parsiraj kategorije
    const categoryData = formData.get("category") as string;
    let category: string | string[];
    try {
      category = JSON.parse(categoryData);
      if (!Array.isArray(category)) {
        category = categoryData;
      }
    } catch {
      category = categoryData;
    }
    
    // Parsiraj tagove
    let tags: string[] = [];
    try {
      const tagsData = formData.get("tags") as string;
      if (tagsData) {
        tags = JSON.parse(tagsData);
        if (!Array.isArray(tags)) {
          tags = [];
        }
        tags = tags.map(tag => sanitizeString(tag, 50)).filter(Boolean);
      }
    } catch {
      tags = [];
    }
    
    // Validiraj s Zod schemom
    const validation = validateData(blogPostSchema, {
      title,
      excerpt,
      content: formData.get("content") as string,
      tags,
      category,
      createdAt,
    });
    
    if (!validation.success) {
      await Logger.warn("Blog post validation failed", {
        userId: session.user.email,
        errors: validation.errors?.errors,
      });
      return NextResponse.json(
        { 
          message: "Validation failed",
          errors: validation.errors?.errors.map(e => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }
    
    // Generiraj ID u formatu yymmdd-naslov
    const basePostId = generatePostId(title, createdAt);
    const postId = await ensureUniquePostId(basePostId);
    
    const readTime = calculateReadTime(content);

    // Spremi Markdown sadržaj u zaseban fajl
    await writePostContent(postId, content);



    // Kreiraj metadata objekt (bez content polja)
    const metadata: BlogPostMetadata = {
      id: postId,
      title,
      excerpt,
      image: "", // Will be updated after image upload
      gallery: [], // Will be updated after gallery upload
      author: "Ivica Drusany",
      tags,
      category: category,
      readTime: readTime,
      createdAt,
    };

    // Upload glavne slike
    if (imageFile) {
      const uploadDir = path.join(process.cwd(), "public", "images", "blog");
      await mkdir(uploadDir, { recursive: true });
      // Generiraj siguran filename
      const safeFilename = generateSafeFilename(imageFile.name, postId);
      const filePath = path.join(uploadDir, safeFilename);
      await writeFile(filePath, Buffer.from(await imageFile.arrayBuffer()));
      metadata.image = `/images/blog/${safeFilename}`;
    }

    // Upload galerije slika
    const galleryUrls: string[] = [];
    for (let i = 0; i < galleryCount; i++) {
      const galleryFile = formData.get(`gallery_${i}`) as File | null;
      if (galleryFile) {
        // Validiraj galeriju sliku
        const validation = await validateImageFile(galleryFile);
        if (!validation.valid) {
          continue; // Preskoči nevaljanu sliku
        }
        
        const uploadDir = path.join(process.cwd(), "public", "images", "blog", "gallery");
        await mkdir(uploadDir, { recursive: true });
        // Generiraj siguran filename
        const safeFilename = generateSafeFilename(galleryFile.name, `${postId}-gallery-${i}`);
        const filePath = path.join(uploadDir, safeFilename);
        await writeFile(filePath, Buffer.from(await galleryFile.arrayBuffer()));
        galleryUrls.push(`/images/blog/gallery/${safeFilename}`);
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

    await Logger.info("Blog post created successfully", {
      userId: session.user.email,
      postId: postId,
      title,
    });
    
    return NextResponse.json({ message: "Blog post added successfully", post: newPost }, { status: 201 });
  } catch (error) {
    await Logger.error("Error adding blog post", error);
    return NextResponse.json(
      { message: "Error adding blog post" },
      { status: 500 }
    );
  }
}

