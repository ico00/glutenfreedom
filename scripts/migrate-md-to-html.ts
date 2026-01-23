/**
 * Skripta za migraciju postojećih .md fajlova u .html fajlove
 * Pokreni s: tsx scripts/migrate-md-to-html.ts
 */

import { readFile, writeFile, unlink, readdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const contentDir = path.join(process.cwd(), "content", "posts");

// Jednostavna konverzija Markdown u HTML
function markdownToHtml(markdown: string): string {
  if (!markdown) return "";
  
  let html = markdown;
  
  // Bold i italic
  html = html.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+?)__/g, '<strong>$1</strong>');
  html = html.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>');
  html = html.replace(/(?<!_)_([^_\n]+?)_(?!_)/g, '<em>$1</em>');
  
  // Naslovi
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Linkovi i slike
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
  
  // Liste
  const lines = html.split('\n');
  let inList = false;
  let listItems: string[] = [];
  const processedLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const unorderedMatch = line.match(/^[\-\*\+] (.+)$/);
    const orderedMatch = line.match(/^(\d+)\. (.+)$/);
    
    if (unorderedMatch || orderedMatch) {
      if (!inList) {
        inList = true;
        listItems = [];
      }
      listItems.push((unorderedMatch ? unorderedMatch[1] : orderedMatch![2]) || '');
    } else {
      if (inList) {
        processedLines.push('<ul>' + listItems.map(item => `<li>${item}</li>`).join('') + '</ul>');
        inList = false;
        listItems = [];
      }
      processedLines.push(line);
    }
  }
  
  if (inList) {
    processedLines.push('<ul>' + listItems.map(item => `<li>${item}</li>`).join('') + '</ul>');
  }
  
  html = processedLines.join('\n');
  
  // Paragrafi
  const paragraphs = html.split(/\n\s*\n/);
  html = paragraphs.map(para => {
    para = para.trim();
    if (!para) return '<p>&nbsp;</p>';
    if (!para.match(/^<(h[1-4]|ul|ol|img|p)/)) {
      return '<p>' + para + '</p>';
    }
    return para;
  }).join('\n');
  
  html = html.replace(/\n/g, '<br>');
  
  return html;
}

async function migrate() {
  try {
    if (!existsSync(contentDir)) {
      console.log("Content directory does not exist. Nothing to migrate.");
      return;
    }

    const files = await readdir(contentDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    if (mdFiles.length === 0) {
      console.log("No .md files found. Nothing to migrate.");
      return;
    }

    console.log(`Found ${mdFiles.length} .md file(s) to migrate...\n`);

    for (const mdFile of mdFiles) {
      const mdPath = path.join(contentDir, mdFile);
      const htmlFile = mdFile.replace('.md', '.html');
      const htmlPath = path.join(contentDir, htmlFile);

      // Provjeri da li HTML fajl već postoji
      if (existsSync(htmlPath)) {
        console.log(`⚠️  ${htmlFile} already exists. Skipping ${mdFile}.`);
        continue;
      }

      try {
        // Učitaj Markdown
        const markdown = await readFile(mdPath, "utf-8");
        
        // Konvertiraj u HTML
        const html = markdownToHtml(markdown);
        
        // Spremi HTML
        await writeFile(htmlPath, html, "utf-8");
        
        console.log(`✅ Migrated: ${mdFile} → ${htmlFile}`);
        
        // Opcionalno: obriši .md fajl nakon uspješne migracije
        // await unlink(mdPath);
        // console.log(`   Deleted: ${mdFile}`);
      } catch (error) {
        console.error(`❌ Error migrating ${mdFile}:`, error);
      }
    }

    console.log("\n✅ Migration completed!");
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  }
}

migrate();

