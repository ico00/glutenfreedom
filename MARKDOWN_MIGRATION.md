# Migracija na Markdown + JSON Format

## 📋 Pregled

Aplikacija sada koristi **hibridno rješenje** za blog postove:
- **Markdown fajlovi** (`content/posts/[id].md`) - za sadržaj postova
- **JSON metadata** (`data/blog.json`) - za brzo pretraživanje i filtriranje

## 🎯 Prednosti

1. **Brzo pretraživanje** - JSON metadata omogućava brzo filtriranje po tagovima, kategorijama, autorima
2. **Čitljiv Git diff** - Markdown fajlovi su lako čitljivi u Git historiji
3. **Lakše editiranje** - Markdown je jednostavniji za ručno editiranje od HTML-a
4. **Skalabilnost** - Podržava do 100+ postova bez problema s performansama

## 📁 Struktura

```
GlutenFreedom/
├── content/
│   └── posts/
│       ├── [id-1].md
│       ├── [id-2].md
│       └── ...
├── data/
│   └── blog.json          # Samo metadata (bez content polja)
└── ...
```

## 🔄 Migracija postojećih postova

Za migraciju postojećih postova iz JSON-a u Markdown format:

```bash
npx tsx scripts/migrate-blog-to-markdown.ts
```

Ova skripta će:
1. Kreirati backup `data/blog.json.backup`
2. Ekstraktirati sadržaj svakog posta u zaseban `.md` fajl
3. Ažurirati `data/blog.json` da sadrži samo metadata

## 📝 Format Metadata

```json
{
  "id": "uuid",
  "title": "Naslov posta",
  "excerpt": "Kratki opis",
  "image": "/images/blog/image.jpg",
  "gallery": ["/images/blog/gallery/1.jpg"],
  "author": "Ime Autora",
  "tags": ["tag1", "tag2"],
  "category": "kategorija",
  "createdAt": "2024-01-20",
  "readTime": 5
}
```

## ✍️ Kako dodati novi post

1. Otvori `/admin/blog/novi`
2. Ispuni formu (RichTextEditor automatski konvertira HTML u Markdown)
3. Klikni "Spremi"

Sistem automatski:
- Sprema Markdown sadržaj u `content/posts/[id].md`
- Sprema metadata u `data/blog.json`

## 🔍 Pretraživanje

JSON metadata omogućava brzo pretraživanje:

```typescript
// Filtriranje po tagovima
const postsWithTag = metadata.filter(p => p.tags.includes("celijakija"));

// Filtriranje po kategoriji
const categoryPosts = metadata.filter(p => p.category === "iskustva");

// Pretraživanje po naslovu
const searchResults = metadata.filter(p => 
  p.title.toLowerCase().includes("dijagnoza")
);
```

## 🛠️ API Endpoints

- `GET /api/blog` - Vraća sve postove (metadata + content)
- `GET /api/blog/[id]` - Vraća jedan post
- `POST /api/blog` - Kreira novi post
- `PUT /api/blog/[id]` - Ažurira post
- `DELETE /api/blog/[id]` - Briše post

## 📚 Markdown sintaksa

Podržane Markdown sintakse:
- Naslovi: `# H1`, `## H2`, `### H3`
- **Bold**: `**tekst**`
- *Italic*: `*tekst*`
- Linkovi: `[tekst](url)`
- Slike: `![alt](url)`
- Liste: `- item` ili `1. item`

## ⚠️ Napomene

- RichTextEditor još uvijek koristi HTML, ali se automatski konvertira u Markdown pri spremanju
- Postojeći postovi trebaju biti migrirani pomoću migracijske skripte
- Backup se automatski kreira pri migraciji

