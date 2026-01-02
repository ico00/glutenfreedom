# Srednji sigurnosni problemi - Implementacija

## ✅ Implementirano

### 1. Secure Headers
- ✅ Content Security Policy (CSP)
- ✅ HSTS (Strict-Transport-Security)
- ✅ X-Content-Type-Options
- ✅ X-Frame-Options
- ✅ X-XSS-Protection
- ✅ Referrer-Policy
- ✅ Permissions-Policy
- ✅ Uklonjen X-Powered-By header

**Lokacija:** `lib/securityHeaders.ts`, `middleware.ts`

### 2. HTTPS Enforcement
- ✅ Automatsko preusmjeravanje HTTP → HTTPS u produkciji
- ✅ Provjera protokola kroz X-Forwarded-Proto header

**Lokacija:** `lib/securityHeaders.ts` → `enforceHttps()`

### 3. Server-side Validacija
- ✅ Zod schemas za sve tipove podataka
- ✅ Validacija blog postova
- ✅ Validacija recepata
- ✅ Validacija restorana
- ✅ Validacija proizvoda
- ✅ Validacija dućana

**Lokacija:** `lib/validation.ts`

### 4. Backup Strategija
- ✅ Automatski backup JSON datoteka
- ✅ Automatski backup Markdown datoteka
- ✅ API endpoint za ručni backup (`/api/backup`)
- ✅ Skripta za automatski backup (`scripts/auto-backup.ts`)
- ✅ Automatsko čišćenje starih backupova

**Lokacija:** `lib/backup.ts`, `app/api/backup/route.ts`, `scripts/auto-backup.ts`

### 5. Structured Logging
- ✅ Logger klasa s razinama (INFO, WARN, ERROR, SECURITY)
- ✅ Logiranje u datoteke (dnevni logovi)
- ✅ Logiranje sigurnosnih događaja
- ✅ Context informacije (userId, IP, itd.)

**Lokacija:** `lib/logger.ts`

## 📋 Kako koristiti

### Backup

#### Ručni backup
```bash
# Kroz API (zahtijeva autentifikaciju)
POST /api/backup
```

#### Automatski backup
```bash
# Pokreni ručno
npm run backup

# Dodaj u cron (dnevno u 2:00)
0 2 * * * cd /path/to/project && npm run backup
```

Backupovi se spremaju u `backups/` direktorij.

### Logging

```typescript
import { Logger } from "@/lib/logger";

// Info log
await Logger.info("User logged in", { userId: "123" });

// Warning log
await Logger.warn("Rate limit approaching", { ip: "1.2.3.4" });

// Error log
await Logger.error("Database error", error, { query: "SELECT *" });

// Security log
await Logger.security("Failed login attempt", undefined, "1.2.3.4");
```

Logovi se spremaju u `logs/YYYY-MM-DD.log` datoteke.

### Validacija

```typescript
import { validateData, blogPostSchema } from "@/lib/validation";

const result = validateData(blogPostSchema, {
  title: "Naslov",
  excerpt: "Opis",
  // ...
});

if (!result.success) {
  // result.errors sadrži detalje grešaka
}
```

## 🔧 Konfiguracija

### Security Headers

Headers se automatski dodaju na sve zahtjeve kroz middleware. CSP je prilagođen za:
- Next.js development mode (nešto manje restriktivan)
- Tailwind CSS (unsafe-inline za style)
- Image uploads (blob: i data: za preview)

### HTTPS Enforcement

Automatski se aktivira samo u produkciji (`NODE_ENV=production`). U development modu ne provjerava HTTPS.

### Backup

- Backupovi se spremaju u `backups/` direktorij
- Zadržava se zadnjih 20 backupova (konfigurabilno)
- Svaki backup sadrži:
  - JSON datoteke iz `data/`
  - Markdown datoteke iz `content/`
  - `backup-info.json` s metapodacima

### Logging

- Logovi se spremaju u `logs/` direktorij
- Format: `YYYY-MM-DD.log`
- JSON format za lako parsiranje
- Automatski cleanup nije implementiran (može se dodati)

## ⚠️ Napomene

### CSP u Development Mode

CSP je manje restriktivan u development modu jer Next.js zahtijeva `unsafe-eval` za hot reload. U produkciji je striktniji.

### Backup Direktorij

`backups/` direktorij je u `.gitignore` - neće biti commitan u git. Provjeri da li postoji na serveru.

### Log Direktorij

`logs/` direktorij je također u `.gitignore`. Razmotri rotaciju logova za produkciju.

## 🚀 Sljedeći koraci (opcionalno)

1. **Log rotacija** - automatsko brisanje starih logova
2. **Backup na cloud** - automatski upload backupova na S3/Google Drive
3. **Monitoring** - integracija s Sentry ili sličnim servisom
4. **Alerting** - email notifikacije za kritične sigurnosne događaje

