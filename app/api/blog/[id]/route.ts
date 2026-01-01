import { NextResponse } from "next/server";
import { writeFile, mkdir, unlink, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { BlogPost, BlogPostMetadata } from "@/types";
import {
  readBlogMetadata,
  writeBlogMetadata,
  readPostContent,
  writePostContent,
  getFullBlogPost,
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

async function getAllPosts(): Promise<BlogPost[]> {
  const dynamicPosts = await getAllBlogPosts();
  const deletedIds = await readDeletedBlogPostsFile();
  
  // Vrati samo dinamičke postove - ukloni mock postove
  // Filtriraj dinamičke postove - samo oni koji nisu obrisani
  const filteredDynamicPosts = dynamicPosts.filter(
    (post) => !deletedIds.includes(post.id)
  );
  
  return filteredDynamicPosts;
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

    // Konvertiraj HTML u Markdown
    let content = (formData.get("content") as string) || existingPost.content;
    content = htmlToMarkdown(content);
    const readTime = calculateReadTime(content);

    // Ažuriraj Markdown sadržaj
    await writePostContent(id, content);

    // Kreiraj ažurirani metadata objekt
    const updatedMetadata: BlogPostMetadata = {
      id: existingPost.id,
      title: (formData.get("title") as string) || existingPost.title,
      excerpt: (formData.get("excerpt") as string) || existingPost.excerpt,
      image: existingPost.image,
      gallery: existingPost.gallery || [],
      author: "Ivica Drusany", // Fiksni autor
      tags: formData.get("tags")
        ? JSON.parse(formData.get("tags") as string)
        : existingPost.tags,
      category: (formData.get("category") as string) || existingPost.category,
      readTime: readTime,
      createdAt: (formData.get("createdAt") as string) || existingPost.createdAt,
    };

    // Upload nove glavne slike ako je dodana
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "images", "blog");
      await mkdir(uploadDir, { recursive: true });
      const filename = `${id}-${imageFile.name}`;
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, Buffer.from(await imageFile.arrayBuffer()));
      updatedMetadata.image = `/images/blog/${filename}`;
    }

    // Upload nove galerije slika ako su dodane
    if (galleryCount > 0) {
      const galleryUrls: string[] = [...(existingPost.gallery || [])];
      for (let i = 0; i < galleryCount; i++) {
        const galleryFile = formData.get(`gallery_${i}`) as File | null;
        if (galleryFile && galleryFile.size > 0) {
          const uploadDir = path.join(process.cwd(), "public", "images", "blog", "gallery");
          await mkdir(uploadDir, { recursive: true });
          const filename = `${id}-gallery-${Date.now()}-${i}-${galleryFile.name}`;
          const filePath = path.join(uploadDir, filename);
          await writeFile(filePath, Buffer.from(await galleryFile.arrayBuffer()));
          galleryUrls.push(`/images/blog/gallery/${filename}`);
        }
      }
      updatedMetadata.gallery = galleryUrls;
    }

    // Ažuriraj metadata u JSON
    const metadataList = await readBlogMetadata();
    const metadataIndex = metadataList.findIndex((p) => p.id === id);

    if (metadataIndex !== -1) {
      // Ažuriraj postojeći metadata
      metadataList[metadataIndex] = updatedMetadata;
      await writeBlogMetadata(metadataList);
    } else {
      return NextResponse.json(
        { message: "Post not found in database" },
        { status: 404 }
      );
    }

    const updatedPost: BlogPost = {
      ...updatedMetadata,
      content,
    };

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
    const metadataList = await readBlogMetadata();
    const filteredMetadata = metadataList.filter((p) => p.id !== id);
    await writeBlogMetadata(filteredMetadata);

    // Obriši Markdown fajl
    const contentPath = path.join(process.cwd(), "content", "posts", `${id}.md`);
    try {
      await unlink(contentPath);
    } catch (error) {
      // Ignoriraj grešku ako fajl ne postoji
      console.log(`Markdown file not found for ${id}`);
    }

    // Dodaj ID u listu obrisanih postova (kako se ne bi prikazivao ni mock verzija)
    const deletedIds = await readDeletedBlogPostsFile();
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      await writeDeletedBlogPostsFile(deletedIds);
    }

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { message: "Error deleting post", error: (error as Error).message },
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
