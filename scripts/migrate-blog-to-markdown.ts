/**
 * Migracijska skripta za prebacivanje postojećih blog postova iz JSON-a u Markdown format
 * Pokreni sa: npx tsx scripts/migrate-blog-to-markdown.ts
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { BlogPost, BlogPostMetadata } from "../types/index";

const blogFilePath = path.join(process.cwd(), "data", "blog.json");
const contentDir = path.join(process.cwd(), "content", "posts");
const newBlogFilePath = path.join(process.cwd(), "data", "blog.json.backup");

async function migrate() {
  try {
    console.log("🔄 Počinje migracija blog postova u Markdown format...\n");

    // Učitaj postojeće postove
    if (!existsSync(blogFilePath)) {
      console.log("❌ Nema postojećih blog postova za migraciju.");
      return;
    }

    const fileContents = await readFile(blogFilePath, "utf-8");
    const posts: BlogPost[] = JSON.parse(fileContents);

    if (posts.length === 0) {
      console.log("ℹ️  Nema postova za migraciju.");
      return;
    }

    console.log(`📝 Pronađeno ${posts.length} postova za migraciju.\n`);

    // Kreiraj backup
    await writeFile(newBlogFilePath, fileContents, "utf-8");
    console.log("💾 Kreiran backup: data/blog.json.backup\n");

    // Kreiraj content direktorij
    await mkdir(contentDir, { recursive: true });

    // Migriraj svaki post
    const metadataList: BlogPostMetadata[] = [];

    for (const post of posts) {
      console.log(`📄 Migriram: ${post.title} (${post.id})`);

      // Spremi sadržaj u Markdown fajl
      const contentPath = path.join(contentDir, `${post.id}.md`);
      await writeFile(contentPath, post.content, "utf-8");

      // Kreiraj metadata (bez content polja)
      const metadata: BlogPostMetadata = {
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        image: post.image,
        gallery: post.gallery,
        author: post.author,
        tags: post.tags,
        category: post.category,
        createdAt: post.createdAt,
        readTime: post.readTime,
      };

      metadataList.push(metadata);
    }

    // Spremi novi metadata JSON (bez content polja)
    await writeFile(blogFilePath, JSON.stringify(metadataList, null, 2), "utf-8");

    console.log(`\n✅ Migracija završena!`);
    console.log(`   - ${posts.length} Markdown fajlova kreirano u content/posts/`);
    console.log(`   - Metadata ažurirana u data/blog.json`);
    console.log(`   - Backup kreiran: data/blog.json.backup`);
    console.log(`\n💡 Sada možeš obrisati backup fajl ako je sve u redu.`);
  } catch (error) {
    console.error("❌ Greška pri migraciji:", error);
    process.exit(1);
  }
}

migrate();

