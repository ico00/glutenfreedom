import { readFile, writeFile, mkdir, rename, readdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const contentDir = path.join(process.cwd(), "content", "posts");
const blogMetadataPath = path.join(process.cwd(), "data", "blog.json");
const imagesBlogDir = path.join(process.cwd(), "public", "images", "blog");
const imagesGalleryDir = path.join(process.cwd(), "public", "images", "blog", "gallery");

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
function ensureUniquePostId(baseId: string, existingIds: string[]): string {
  let postId = baseId;
  let counter = 1;
  
  // Provjeri da li ID već postoji
  while (existingIds.includes(postId)) {
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

async function migrateBlogPosts() {
  try {
    console.log("🚀 Počinje migracija blog postova...\n");

    // Učitaj postojeće metadata
    if (!existsSync(blogMetadataPath)) {
      console.error("❌ blog.json ne postoji!");
      return;
    }

    const fileContents = await readFile(blogMetadataPath, "utf-8");
    const posts = JSON.parse(fileContents);

    console.log(`📝 Pronađeno ${posts.length} postova za migraciju\n`);

    const migrationMap: { oldId: string; newId: string }[] = [];
    const newPosts: any[] = [];

    // Generiraj nove ID-ove za sve postove
    for (const post of posts) {
      const baseNewId = generatePostId(post.title, post.createdAt);
      const existingIds = newPosts.map(p => p.id);
      const newId = ensureUniquePostId(baseNewId, existingIds);
      
      migrationMap.push({ oldId: post.id, newId });
      console.log(`  ${post.id} → ${newId} (${post.title})`);
    }

    console.log("\n📁 Preimenovanje markdown fajlova...\n");

    // Preimenuj markdown fajlove
    for (const { oldId, newId } of migrationMap) {
      const oldPath = path.join(contentDir, `${oldId}.md`);
      const newPath = path.join(contentDir, `${newId}.md`);

      if (existsSync(oldPath)) {
        try {
          await rename(oldPath, newPath);
          console.log(`  ✓ ${oldId}.md → ${newId}.md`);
        } catch (error) {
          console.error(`  ✗ Greška pri preimenovanju ${oldId}.md:`, error);
        }
      } else {
        console.log(`  ⚠ ${oldId}.md ne postoji, preskačem`);
      }
    }

    console.log("\n🖼️  Preimenovanje slika...\n");

    // Ažuriraj postove s novim ID-ovima i preimenuj slike
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const { oldId, newId } = migrationMap[i];

      // Preimenuj glavnu sliku
      let newImage = post.image;
      if (post.image) {
        newImage = await renameImage(oldId, newId, post.image);
        if (newImage !== post.image) {
          console.log(`  ✓ Slika: ${path.basename(post.image)} → ${path.basename(newImage)}`);
        }
      }

      // Preimenuj galeriju slika
      let newGallery: string[] = [];
      if (post.gallery && post.gallery.length > 0) {
        newGallery = await renameGalleryImages(oldId, newId, post.gallery);
        if (JSON.stringify(newGallery) !== JSON.stringify(post.gallery)) {
          console.log(`  ✓ Galerija: ${post.gallery.length} slika preimenovano`);
        }
      }

      // Kreiraj novi post s novim ID-om
      const newPost = {
        ...post,
        id: newId,
        image: newImage,
        gallery: newGallery,
      };

      newPosts.push(newPost);
    }

    console.log("\n💾 Spremanje ažuriranih metadata...\n");

    // Spremi ažurirane metadata
    await writeFile(blogMetadataPath, JSON.stringify(newPosts, null, 2), "utf-8");
    console.log("  ✓ blog.json ažuriran");

    // Napravi backup
    const backupPath = `${blogMetadataPath}.backup-${Date.now()}`;
    await writeFile(backupPath, fileContents, "utf-8");
    console.log(`  ✓ Backup kreiran: ${path.basename(backupPath)}`);

    console.log("\n✅ Migracija uspješno završena!\n");
    console.log("📊 Sažetak:");
    console.log(`  - Migrirano postova: ${posts.length}`);
    console.log(`  - Preimenovano markdown fajlova: ${migrationMap.length}`);
    console.log(`  - Backup kreiran: ${path.basename(backupPath)}\n`);

  } catch (error) {
    console.error("❌ Greška pri migraciji:", error);
    process.exit(1);
  }
}

// Pokreni migraciju
migrateBlogPosts();

