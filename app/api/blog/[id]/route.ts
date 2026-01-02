import { NextResponse } from "next/server";
import { writeFile, mkdir, unlink, readFile, rename } from "fs/promises";
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
import { auth } from "@/auth";
import { validateImageFile, generateSafeFilename, sanitizeHtml, sanitizeString } from "@/lib/security";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { verifyCsrfToken } from "@/lib/csrf";
import { Logger } from "@/lib/logger";

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
async function ensureUniquePostId(baseId: string, excludeId?: string): Promise<string> {
  const metadata = await readBlogMetadata();
  let postId = baseId;
  let counter = 1;
  
  // Provjeri da li ID već postoji (osim trenutnog posta ako se edituje)
  while (metadata.some((post) => post.id === postId && post.id !== excludeId)) {
    // Ako postoji, dodaj broj na kraj
    const parts = baseId.split('-');
    const slug = parts.slice(1).join('-'); // Sve osim datuma
    const datePart = parts[0];
    postId = `${datePart}-${slug}-${counter}`;
    counter++;
  }
  
  return postId;
}

// Preimenuj sliku ako koristi stari ID
async function renameImage(oldId: string, newId: string, imagePath: string): Promise<string> {
  if (!imagePath || !imagePath.startsWith('/images/blog/')) {
    return imagePath; // Ako nije blog slika, vrati originalni path
  }

  const filename = path.basename(imagePath);
  
  // Provjeri da li filename počinje sa starim ID-om
  if (!filename.startsWith(oldId)) {
    return imagePath; // Ako ne počinje sa starim ID-om, vrati originalni path
  }

  // Kreiraj novi filename sa novim ID-om
  const newFilename = filename.replace(oldId, newId);
  const oldFullPath = path.join(process.cwd(), "public", imagePath);
  const newFullPath = path.join(process.cwd(), "public", imagePath.replace(filename, newFilename));

  try {
    if (existsSync(oldFullPath)) {
      await rename(oldFullPath, newFullPath);
      return imagePath.replace(filename, newFilename);
    }
  } catch (error) {
    console.error(`Error renaming image ${oldFullPath}:`, error);
  }

  return imagePath;
}

// Preimenuj sve slike u galeriji
async function renameGalleryImages(oldId: string, newId: string, galleryUrls: string[]): Promise<string[]> {
  const renamedUrls: string[] = [];
  
  for (const url of galleryUrls) {
    if (!url || !url.startsWith('/images/blog/gallery/')) {
      renamedUrls.push(url);
      continue;
    }

    const filename = path.basename(url);
    
    // Provjeri da li filename sadrži stari ID
    if (!filename.includes(oldId)) {
      renamedUrls.push(url);
      continue;
    }

    // Kreiraj novi filename sa novim ID-om
    const newFilename = filename.replace(oldId, newId);
    const oldFullPath = path.join(process.cwd(), "public", url);
    const newFullPath = path.join(process.cwd(), "public", url.replace(filename, newFilename));

    try {
      if (existsSync(oldFullPath)) {
        await rename(oldFullPath, newFullPath);
        renamedUrls.push(url.replace(filename, newFilename));
      } else {
        renamedUrls.push(url);
      }
    } catch (error) {
      console.error(`Error renaming gallery image ${oldFullPath}:`, error);
      renamedUrls.push(url);
    }
  }
  
  return renamedUrls;
}

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
    // Provjeri autentifikaciju
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Provjeri rate limit
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`blog-put-${clientIp}`, 10, 60000);
    if (!rateLimit.allowed) {
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
      return NextResponse.json(
        { message: "Invalid CSRF token" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const formData = await request.formData();
    const allPosts = await getAllPosts();
    const postIndex = allPosts.findIndex((p) => p.id === id);

    if (postIndex === -1) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const existingPost = allPosts[postIndex];
    const galleryCount = parseInt(formData.get("galleryCount") as string) || 0;

    // Validiraj upload slike ako postoji
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      const validation = await validateImageFile(imageFile);
      if (!validation.valid) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400 }
        );
      }
    }

    // Uzmi nove vrijednosti i sanitiziraj
    const newTitle = sanitizeString((formData.get("title") as string) || existingPost.title, 200);
    const newExcerpt = sanitizeString((formData.get("excerpt") as string) || existingPost.excerpt, 500);
    const newCreatedAt = (formData.get("createdAt") as string) || existingPost.createdAt;
    
    if (!newTitle || newTitle.length < 3) {
      return NextResponse.json(
        { message: "Naslov mora imati najmanje 3 znaka" },
        { status: 400 }
      );
    }
    
    // Provjeri da li se promijenio datum ili naslov - ako da, generiraj novi ID
    const titleChanged = newTitle !== existingPost.title;
    const dateChanged = newCreatedAt !== existingPost.createdAt;
    const needsIdChange = titleChanged || dateChanged;
    
    let newId = existingPost.id;
    let oldId = existingPost.id;
    
    if (needsIdChange) {
      // Generiraj novi ID na temelju novog datuma i naslova
      const baseNewId = generatePostId(newTitle, newCreatedAt);
      newId = await ensureUniquePostId(baseNewId, existingPost.id);
      
      // Preimenuj markdown fajl
      const oldContentPath = path.join(process.cwd(), "content", "posts", `${oldId}.md`);
      const newContentPath = path.join(process.cwd(), "content", "posts", `${newId}.md`);
      
      if (existsSync(oldContentPath)) {
        try {
          // Ako novi fajl već postoji (što ne bi trebalo), obriši ga prvo
          if (existsSync(newContentPath)) {
            await unlink(newContentPath);
          }
          await rename(oldContentPath, newContentPath);
          console.log(`Renamed markdown file: ${oldId}.md → ${newId}.md`);
        } catch (error) {
          console.error(`Error renaming markdown file:`, error);
        }
      }
    }

    // Konvertiraj HTML u Markdown
    let content = (formData.get("content") as string) || existingPost.content;
    // Sanitiziraj HTML prije konverzije
    content = sanitizeHtml(content);
    content = htmlToMarkdown(content);
    const readTime = calculateReadTime(content);

    // Ažuriraj Markdown sadržaj (koristi novi ID ako je promijenjen)
    await writePostContent(newId, content);

    // Ako je ID promijenjen, preimenuj slike
    let updatedImage = existingPost.image;
    let updatedGallery = existingPost.gallery || [];
    
    if (needsIdChange && newId !== oldId) {
      // Preimenuj glavnu sliku
      if (existingPost.image) {
        updatedImage = await renameImage(oldId, newId, existingPost.image);
      }
      
      // Preimenuj galeriju slika
      if (existingPost.gallery && existingPost.gallery.length > 0) {
        updatedGallery = await renameGalleryImages(oldId, newId, existingPost.gallery);
      }
    }

    // Parsiraj i validiraj tagove
    let tags: string[] = existingPost.tags;
    try {
      const tagsData = formData.get("tags") as string;
      if (tagsData) {
        tags = JSON.parse(tagsData);
        if (!Array.isArray(tags)) {
          tags = existingPost.tags;
        } else {
          // Sanitiziraj svaki tag
          tags = tags.map(tag => sanitizeString(tag, 50)).filter(Boolean);
        }
      }
    } catch {
      tags = existingPost.tags;
    }

    // Kreiraj ažurirani metadata objekt
    const updatedMetadata: BlogPostMetadata = {
      id: newId, // Koristi novi ID ako je promijenjen
      title: newTitle,
      excerpt: newExcerpt,
      image: updatedImage,
      gallery: updatedGallery,
      author: session.user.email || existingPost.author, // Koristi email iz sessiona
      tags,
      category: (() => {
        const categoryData = formData.get("category") as string;
        if (!categoryData) return existingPost.category;
        try {
          const parsed = JSON.parse(categoryData);
          return Array.isArray(parsed) ? parsed : categoryData;
        } catch {
          return categoryData;
        }
      })(),
      readTime: readTime,
      createdAt: newCreatedAt,
    };

    // Upload nove glavne slike ako je dodana
    if (imageFile && imageFile.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "images", "blog");
      await mkdir(uploadDir, { recursive: true });
      // Generiraj siguran filename
      const safeFilename = generateSafeFilename(imageFile.name, newId);
      const filePath = path.join(uploadDir, safeFilename);
      await writeFile(filePath, Buffer.from(await imageFile.arrayBuffer()));
      updatedMetadata.image = `/images/blog/${safeFilename}`;
    }

    // Obradi galeriju slika
    const existingGalleryJson = formData.get("existingGallery") as string | null;
    let galleryUrls: string[] = [];
    
    // Ako postoje postojeće slike koje treba zadržati, koristi ih
    if (existingGalleryJson) {
      try {
        galleryUrls = JSON.parse(existingGalleryJson);
      } catch (error) {
        console.error("Error parsing existing gallery:", error);
        // Fallback na postojeće slike iz baze
        galleryUrls = [...(existingPost.gallery || [])];
      }
    } else {
      // Ako nema informacije o postojećim slikama, zadrži postojeće
      galleryUrls = [...(existingPost.gallery || [])];
    }

    // Upload nove galerije slika ako su dodane
    if (galleryCount > 0) {
      for (let i = 0; i < galleryCount; i++) {
        const galleryFile = formData.get(`gallery_${i}`) as File | null;
        if (galleryFile && galleryFile.size > 0) {
          const uploadDir = path.join(process.cwd(), "public", "images", "blog", "gallery");
          await mkdir(uploadDir, { recursive: true });
          const filename = `${newId}-gallery-${Date.now()}-${i}-${galleryFile.name}`; // Koristi novi ID
          const filePath = path.join(uploadDir, filename);
          await writeFile(filePath, Buffer.from(await galleryFile.arrayBuffer()));
          galleryUrls.push(`/images/blog/gallery/${filename}`);
        }
      }
    }
    
    // Uvijek ažuriraj galeriju (čak i ako je prazna)
    updatedMetadata.gallery = galleryUrls;

    // Ažuriraj metadata u JSON
    const metadataList = await readBlogMetadata();
    const metadataIndex = metadataList.findIndex((p) => p.id === oldId);

    if (metadataIndex !== -1) {
      // Ako je ID promijenjen, ukloni stari i dodaj novi
      if (newId !== oldId) {
        metadataList.splice(metadataIndex, 1); // Ukloni stari
        metadataList.push(updatedMetadata); // Dodaj novi
      } else {
        // Ako ID nije promijenjen, samo ažuriraj
        metadataList[metadataIndex] = updatedMetadata;
      }
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

    // Ako je ID promijenjen, vrati i novi ID u response-u
    const response: any = { 
      message: "Post updated successfully", 
      post: updatedPost 
    };
    
    if (newId !== oldId) {
      response.newId = newId;
      response.idChanged = true;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { message: "Error updating post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Provjeri autentifikaciju
    const session = await auth();
    const clientIp = getClientIp(request);
    
    if (!session?.user) {
      await Logger.security("Unauthorized DELETE attempt to blog", undefined, clientIp);
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    await Logger.info("Blog post deletion attempt", {
      userId: session.user.email,
      postId: id,
      ip: clientIp,
    });

    // Provjeri rate limit
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`blog-delete-${clientIp}`, 5, 60000);
    if (!rateLimit.allowed) {
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
      return NextResponse.json(
        { message: "Invalid CSRF token" },
        { status: 403 }
      );
    }

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

    await Logger.info("Blog post deleted successfully", {
      userId: session.user.email,
      postId: id,
    });

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    await Logger.error("Error deleting blog post", error);
    return NextResponse.json(
      { message: "Error deleting post" },
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
