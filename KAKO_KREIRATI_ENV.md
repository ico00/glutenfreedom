# Kako kreirati .env.local datoteku

## 📍 Lokacija i naziv

**Naziv datoteke:** `.env.local` (točka na početku!)

**Lokacija:** Root direktorij projekta (isti direktorij gdje je `package.json`)

```
GlutenFreedom/
├── package.json
├── .env.local          ← OVDJE
├── app/
├── components/
└── ...
```

## 🔧 Kako kreirati

### Opcija 1: Kroz terminal (macOS/Linux)

```bash
cd /Users/icom4/Desktop/GlutenFreedom
touch .env.local
```

Zatim otvori datoteku u editoru i dodaj sadržaj.

### Opcija 2: Kroz VS Code / Cursor

1. U Cursor/VS Code, klikni desni klik u root direktoriju
2. Odaberi "New File"
3. Unesi `.env.local` (uključujući točku na početku!)
4. Dodaj sadržaj

### Opcija 3: Kroz Finder (macOS)

1. Otvori Finder i idi u `/Users/icom4/Desktop/GlutenFreedom`
2. Pritisni `Cmd + Shift + .` (točka) da vidiš skrivene datoteke
3. Kreiraj novu datoteku i nazovi je `.env.local`

## 📝 Sadržaj datoteke

Kopiraj i zalijepi sljedeći sadržaj u `.env.local`:

```env
# NextAuth secret key (generiraj novi s: openssl rand -base64 32)
AUTH_SECRET=OVDJE_STAVI_GENERIRANI_SECRET

# Admin email adresa
ADMIN_EMAIL=admin@glutenfreedom.hr

# Admin lozinka (u produkciji koristi ADMIN_PASSWORD_HASH umjesto ovoga)
ADMIN_PASSWORD=tvoja-sigurna-lozinka-ovdje

# Node environment
NODE_ENV=development
```

## 🔐 Generiranje AUTH_SECRET

Pokreni u terminalu:

```bash
openssl rand -base64 32
```

Kopiraj generirani string i stavi ga u `AUTH_SECRET=`.

## ⚠️ VAŽNO - Sigurnost

1. **NIKADA ne commitaj `.env.local` u git!**
   - Datoteka je već u `.gitignore` (Next.js automatski)
   - Provjeri da nije slučajno commitana

2. **Za produkciju:**
   - Koristi environment varijable na hosting platformi (Vercel, Netlify, itd.)
   - Ili stvori `.env.production` datoteku na serveru

3. **Za hash lozinke (opcionalno, ali preporučeno):**
   ```bash
   node -e "const bcrypt=require('bcryptjs');bcrypt.hash('tvoja-lozinka',10).then(h=>console.log(h))"
   ```
   Zatim u `.env.local` dodaj:
   ```env
   ADMIN_PASSWORD_HASH=$2a$10$generirani-hash-ovdje
   ```

## ✅ Provjera

Nakon kreiranja datoteke, provjeri:

1. Da li se datoteka zove točno `.env.local` (s točkom na početku)
2. Da li je u root direktoriju (gdje je package.json)
3. Da li sadrži sve potrebne varijable
4. Restartaj development server: `npm run dev`

## 🚨 Troubleshooting

### Datoteka se ne vidi
- Na macOS/Linux, datoteke koje počinju s `.` su skrivene
- U terminalu: `ls -la` da vidiš skrivene datoteke
- U Finder: `Cmd + Shift + .` da vidiš skrivene datoteke

### Varijable se ne učitavaju
- Provjeri da li je datoteka u root direktoriju
- Provjeri da li ima točku na početku naziva
- Restartaj development server
- Provjeri da nema grešaka u sintaksi (nema razmaka oko `=`)

### Greška "AUTH_SECRET is missing"
- Provjeri da li je `AUTH_SECRET` postavljen u `.env.local`
- Provjeri da li je vrijednost između navodnika (nije potrebno, ali može pomoći)

