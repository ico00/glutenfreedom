# Sigurnosna implementacija - Vodič

## ✅ Što je implementirano

### 1. Autentifikacija (NextAuth.js)
- ✅ NextAuth.js konfiguracija (`auth.ts`, `auth.config.ts`)
- ✅ Login stranica (`/login`)
- ✅ Middleware za zaštitu ruta (`middleware.ts`)
- ✅ API route za NextAuth (`/api/auth/[...nextauth]`)

### 2. Validacija uploada slika
- ✅ Provjera MIME tipa
- ✅ Provjera veličine datoteke (max 10MB)
- ✅ Provjera magic bytes
- ✅ Sanitizacija filenameova (path traversal zaštita)
- ✅ Generiranje sigurnih filenameova

### 3. Input sanitizacija
- ✅ DOMPurify za HTML sanitizaciju
- ✅ String sanitizacija
- ✅ Validacija duljine inputa

### 4. CSRF zaštita
- ✅ CSRF token generiranje i provjera
- ✅ API endpoint za dobivanje CSRF tokena (`/api/csrf-token`)
- ✅ Client-side helper za CSRF tokene

### 5. Rate limiting
- ✅ In-memory rate limiter
- ✅ Konfigurabilni limiti po endpointu
- ✅ IP-based rate limiting

### 6. Ažurirane API rute
- ✅ `/api/blog` (POST)
- ✅ `/api/blog/[id]` (PUT, DELETE)
- ✅ `/api/blog/upload-image` (POST)
- ✅ `/api/recepti` (POST)

## ⚠️ Što još treba napraviti

### 1. Ažurirati preostale API rute

Trebaš dodati sigurnosne mjere u sljedeće API rute:

#### `/api/recepti/[id]/route.ts`
```typescript
import { protectApiRoute } from "@/lib/apiAuth";
import { validateImageFile, generateSafeFilename, sanitizeString } from "@/lib/security";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Provjeri autentifikaciju
  const authError = await protectApiRoute(request);
  if (authError) return authError;
  
  // ... ostatak koda s validacijom
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Provjeri autentifikaciju
  const authError = await protectApiRoute(request);
  if (authError) return authError;
  
  // ... ostatak koda
}
```

#### `/api/restorani/route.ts` i `/api/restorani/[id]/route.ts`
- Dodati `protectApiRoute` u POST, PUT, DELETE metode
- Dodati validaciju uploada slika
- Dodati sanitizaciju inputa

#### `/api/proizvodi/route.ts` i `/api/proizvodi/[id]/route.ts`
- Dodati `protectApiRoute` u POST, PUT, DELETE metode
- Dodati validaciju uploada slika
- Dodati sanitizaciju inputa

#### `/api/ducani/route.ts` i `/api/ducani/[id]/route.ts`
- Dodati `protectApiRoute` u POST, PUT, DELETE metode
- Dodati validaciju uploada slika
- Dodati sanitizaciju inputa

### 2. Ažurirati admin stranice da koriste CSRF tokene

U svim admin formama, dodati:

```typescript
"use client";

import { useEffect, useState } from "react";
import { getCsrfToken } from "@/lib/csrfClient";

export default function AdminForm() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCsrfToken() {
      const token = await getCsrfToken();
      setCsrfToken(token);
    }
    fetchCsrfToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    // ... dodaj form data
    
    const response = await fetch("/api/endpoint", {
      method: "POST",
      body: formData,
      headers: {
        "x-csrf-token": csrfToken || "",
      },
    });
  };
}
```

Stranice koje treba ažurirati:
- `app/admin/blog/novi/page.tsx`
- `app/admin/blog/[id]/edit/page.tsx`
- `app/admin/recepti/novi/page.tsx`
- `app/admin/recepti/[id]/edit/page.tsx`
- `app/admin/restorani/novi/page.tsx`
- `app/admin/restorani/[id]/edit/page.tsx`
- `app/admin/proizvodi/novi/page.tsx`
- `app/admin/proizvodi/[id]/edit/page.tsx`
- `app/admin/ducani/novi/page.tsx`
- `app/admin/ducani/[id]/edit/page.tsx`
- `app/admin/page.tsx` (za DELETE zahtjeve)

### 3. Ažurirati Header komponentu

Ukloniti ili sakriti admin link u produkciji:

```typescript
// components/Header.tsx
{process.env.NODE_ENV === "development" && (
  <Link href="/admin">...</Link>
)}
```

### 4. Kreirati .env datoteku

Kreiraj `.env.local` datoteku s:

```env
AUTH_SECRET=generiraj-s-openssl-rand-base64-32
ADMIN_EMAIL=admin@glutenfreedom.hr
ADMIN_PASSWORD=tvoja-sigurna-lozinka
NODE_ENV=production
```

Za generiranje AUTH_SECRET:
```bash
openssl rand -base64 32
```

### 5. Instalirati pakete

```bash
npm install
```

## 🔧 Popravke potrebne u kodu

### 1. `lib/security.ts` - file-type import

Trenutno koristi `readChunk` iz `file-type`, ali možda treba ažurirati:

```typescript
import { fileTypeFromBuffer } from "file-type";

// U validateImageFile funkciji:
const fileType = await fileTypeFromBuffer(buffer.slice(0, 12));
```

### 2. `auth.ts` - bcrypt import

Provjeri da li bcryptjs radi ispravno. Ako ne, možda treba:

```typescript
import bcrypt from "bcryptjs";
// ili
const bcrypt = require("bcryptjs");
```

### 3. Middleware - ažurirati matcher

Provjeri da li middleware pokriva sve potrebne rute.

## 📋 Checklist prije deploya

- [ ] Instalirati sve pakete (`npm install`)
- [ ] Kreirati `.env.local` s potrebnim varijablama
- [ ] Ažurirati sve API rute s sigurnosnim mjerama
- [ ] Ažurirati sve admin forme s CSRF tokenima
- [ ] Testirati login funkcionalnost
- [ ] Testirati upload slika
- [ ] Testirati rate limiting
- [ ] Testirati CSRF zaštitu
- [ ] Sakriti admin link u produkciji
- [ ] Provjeriti da li sve GET rute rade bez autentifikacije
- [ ] Provjeriti da li sve POST/PUT/DELETE rute zahtijevaju autentifikaciju

## 🚀 Testiranje

### Test autentifikacije
1. Pokušaj pristupiti `/admin` bez login - trebao bi te preusmjeriti na `/login`
2. Prijavi se s ispravnim credentials
3. Pokušaj pristupiti API rute bez autentifikacije - trebao bi dobiti 401

### Test validacije uploada
1. Pokušaj uploadati nevaljanu datoteku (npr. .exe)
2. Pokušaj uploadati preveliku sliku (>10MB)
3. Provjeri da li se filename sanitizira

### Test rate limitinga
1. Pošalji više zahtjeva u kratkom vremenu
2. Trebao bi dobiti 429 nakon određenog broja zahtjeva

### Test CSRF zaštite
1. Pokušaj poslati POST zahtjev bez CSRF tokena
2. Trebao bi dobiti 403

## 📝 Napomene

- Rate limiter je trenutno in-memory - u produkciji koristi Redis ili Upstash
- CSRF tokeni se čuvaju u cookies - provjeri da li su secure u produkciji
- Admin credentials se čuvaju u environment varijablama - NIKADA ne commitaj `.env` datoteku

