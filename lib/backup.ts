import { writeFile, mkdir, readFile, copyFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const backupDir = path.join(process.cwd(), "backups");
const dataDir = path.join(process.cwd(), "data");
const contentDir = path.join(process.cwd(), "content");

/**
 * Kreiraj backup JSON datoteka
 */
export async function backupJsonFiles(): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupDir, `backup-${timestamp}`);
  
  await mkdir(backupPath, { recursive: true });
  await mkdir(path.join(backupPath, "data"), { recursive: true });
  
  // Backup JSON datoteka iz data direktorija
  const jsonFiles = [
    "blog.json",
    "recipes.json",
    "restaurants.json",
    "products.json",
    "stores.json",
    "deletedBlogPosts.json",
    "deletedProducts.json",
    "deletedRestaurants.json",
  ];
  
  for (const file of jsonFiles) {
    const sourcePath = path.join(dataDir, file);
    if (existsSync(sourcePath)) {
      const destPath = path.join(backupPath, "data", file);
      await copyFile(sourcePath, destPath);
    }
  }
  
  return backupPath;
}

/**
 * Kreiraj backup Markdown datoteka
 */
export async function backupMarkdownFiles(): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupDir, `backup-${timestamp}`);
  
  await mkdir(backupPath, { recursive: true });
  await mkdir(path.join(backupPath, "content"), { recursive: true });
  await mkdir(path.join(backupPath, "content", "posts"), { recursive: true });
  await mkdir(path.join(backupPath, "content", "recipes"), { recursive: true });
  
  // Backup blog postova
  const postsDir = path.join(contentDir, "posts");
  if (existsSync(postsDir)) {
    const { readdir } = await import("fs/promises");
    const files = await readdir(postsDir);
    for (const file of files) {
      if (file.endsWith(".md")) {
        const sourcePath = path.join(postsDir, file);
        const destPath = path.join(backupPath, "content", "posts", file);
        await copyFile(sourcePath, destPath);
      }
    }
  }
  
  // Backup recepata
  const recipesDir = path.join(contentDir, "recipes");
  if (existsSync(recipesDir)) {
    const { readdir } = await import("fs/promises");
    const files = await readdir(recipesDir);
    for (const file of files) {
      if (file.endsWith(".md")) {
        const sourcePath = path.join(recipesDir, file);
        const destPath = path.join(backupPath, "content", "recipes", file);
        await copyFile(sourcePath, destPath);
      }
    }
  }
}

/**
 * Kreiraj kompletan backup
 */
export async function createFullBackup(): Promise<{
  success: boolean;
  backupPath?: string;
  error?: string;
}> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(backupDir, `full-backup-${timestamp}`);
    
    await mkdir(backupPath, { recursive: true });
    
    // Backup JSON datoteka
    await backupJsonFiles();
    
    // Backup Markdown datoteka
    await backupMarkdownFiles();
    
    // Kreiraj backup info datoteku
    const backupInfo = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      files: {
        json: await listJsonFiles(),
        markdown: await listMarkdownFiles(),
      },
    };
    
    await writeFile(
      path.join(backupPath, "backup-info.json"),
      JSON.stringify(backupInfo, null, 2)
    );
    
    return { success: true, backupPath };
  } catch (error) {
    console.error("Error creating backup:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Lista JSON datoteka
 */
async function listJsonFiles(): Promise<string[]> {
  const files: string[] = [];
  const jsonFiles = [
    "blog.json",
    "recipes.json",
    "restaurants.json",
    "products.json",
    "stores.json",
  ];
  
  for (const file of jsonFiles) {
    const filePath = path.join(dataDir, file);
    if (existsSync(filePath)) {
      files.push(file);
    }
  }
  
  return files;
}

/**
 * Lista Markdown datoteka
 */
async function listMarkdownFiles(): Promise<string[]> {
  const files: string[] = [];
  
  const postsDir = path.join(contentDir, "posts");
  if (existsSync(postsDir)) {
    const { readdir } = await import("fs/promises");
    const postFiles = await readdir(postsDir);
    files.push(...postFiles.filter(f => f.endsWith(".md")));
  }
  
  const recipesDir = path.join(contentDir, "recipes");
  if (existsSync(recipesDir)) {
    const { readdir } = await import("fs/promises");
    const recipeFiles = await readdir(recipesDir);
    files.push(...recipeFiles.filter(f => f.endsWith(".md")));
  }
  
  return files;
}

/**
 * Očisti stare backupove (zadrži samo zadnjih N)
 */
export async function cleanupOldBackups(keepCount: number = 10): Promise<void> {
  try {
    if (!existsSync(backupDir)) {
      return;
    }
    
    const { readdir, stat, rm } = await import("fs/promises");
    const backups = await readdir(backupDir);
    
    // Sortiraj po datumu (najnoviji prvi)
    const backupStats = await Promise.all(
      backups.map(async (backup) => {
        const backupPath = path.join(backupDir, backup);
        const stats = await stat(backupPath);
        return { name: backup, path: backupPath, mtime: stats.mtime };
      })
    );
    
    backupStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
    
    // Obriši stare backupove
    const toDelete = backupStats.slice(keepCount);
    for (const backup of toDelete) {
      await rm(backup.path, { recursive: true, force: true });
    }
  } catch (error) {
    console.error("Error cleaning up old backups:", error);
  }
}

