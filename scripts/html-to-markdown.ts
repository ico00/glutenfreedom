/**
 * Skripta za konverziju HTML-a u Markdown
 */

function htmlToMarkdown(html: string): string {
  let markdown = html;
  
  // Ukloni <p> tagove i zamijeni s novim redovima
  markdown = markdown.replace(/<p>/g, '').replace(/<\/p>/g, '\n\n');
  
  // Naslovi
  markdown = markdown.replace(/<h1>/g, '# ').replace(/<\/h1>/g, '\n\n');
  markdown = markdown.replace(/<h2>/g, '## ').replace(/<\/h2>/g, '\n\n');
  markdown = markdown.replace(/<h3>/g, '### ').replace(/<\/h3>/g, '\n\n');
  markdown = markdown.replace(/<h4>/g, '#### ').replace(/<\/h4>/g, '\n\n');
  
  // Bold i italic
  markdown = markdown.replace(/<strong>/g, '**').replace(/<\/strong>/g, '**');
  markdown = markdown.replace(/<b>/g, '**').replace(/<\/b>/g, '**');
  markdown = markdown.replace(/<em>/g, '*').replace(/<\/em>/g, '*');
  markdown = markdown.replace(/<i>/g, '*').replace(/<\/i>/g, '*');
  
  // Underline (Markdown ne podržava underline, ali možemo ga ukloniti)
  markdown = markdown.replace(/<u>/g, '').replace(/<\/u>/g, '');
  
  // Line breaks
  markdown = markdown.replace(/<br\s*\/?>/g, '\n');
  markdown = markdown.replace(/\r\n/g, '\n');
  markdown = markdown.replace(/\r/g, '\n');
  
  // Liste
  markdown = markdown.replace(/<ul>/g, '').replace(/<\/ul>/g, '\n');
  markdown = markdown.replace(/<ol>/g, '').replace(/<\/ol>/g, '\n');
  markdown = markdown.replace(/<li>/g, '- ').replace(/<\/li>/g, '\n');
  
  // Linkovi
  markdown = markdown.replace(/<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/g, '[$2]($1)');
  
  // Slike
  markdown = markdown.replace(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/g, '![$2]($1)');
  markdown = markdown.replace(/<img[^>]+alt="([^"]*)"[^>]*src="([^"]+)"[^>]*>/g, '![$1]($2)');
  markdown = markdown.replace(/<img[^>]+src="([^"]+)"[^>]*>/g, '![]($1)');
  
  // Ukloni sve preostale HTML tagove
  markdown = markdown.replace(/<[^>]+>/g, '');
  
  // Očisti višestruke prazne linije (maksimalno 2 uzastopna)
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  
  // Očisti početne i završne prazne linije
  markdown = markdown.trim();
  
  return markdown;
}

// Ako se pokreće direktno
if (require.main === module) {
  const fs = require('fs');
  const path = require('path');
  
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: tsx html-to-markdown.ts <file-path>');
    process.exit(1);
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const markdown = htmlToMarkdown(content);
  fs.writeFileSync(filePath, markdown, 'utf-8');
  console.log(`Converted ${filePath} to Markdown`);
}

export { htmlToMarkdown };

