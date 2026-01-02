# Sljedeći koraci - Sigurnosna implementacija

## ✅ Što je gotovo

1. ✅ `.env.local` datoteka kreirana
2. ✅ Autentifikacija implementirana
3. ✅ Sigurnosne komponente kreirane
4. ✅ Blog i recepti API rute zaštićene

## 🚀 Korak 1: Testiraj da li aplikacija radi

### 1.1 Pokreni development server

```bash
npm run dev
```

### 1.2 Provjeri greške

Ako vidiš greške u konzoli:
- **"AUTH_SECRET is missing"** → Provjeri da li je `.env.local` u root direktoriju i da sadrži `AUTH_SECRET`
- **Import errors** → Provjeri da li su svi paketi instalirani (`npm install`)

### 1.3 Testiraj login

1. Otvori browser i idi na: `http://localhost:3000/login`
2. Pokušaj se prijaviti s emailom i lozinkom iz `.env.local`
3. Ako uspiješ, trebao bi biti preusmjeren na `/admin`

## 🔒 Korak 2: Ažuriraj preostale API rute

Trebamo dodati sigurnosne mjere u sljedeće API rute:

### 2.1 `/api/recepti/[id]/route.ts` (PUT, DELETE)
### 2.2 `/api/restorani/route.ts` (POST)
### 2.3 `/api/restorani/[id]/route.ts` (PUT, DELETE)
### 2.4 `/api/proizvodi/route.ts` (POST)
### 2.5 `/api/proizvodi/[id]/route.ts` (PUT, DELETE)
### 2.6 `/api/ducani/route.ts` (POST)
### 2.7 `/api/ducani/[id]/route.ts` (PUT, DELETE)

## 📝 Korak 3: Dodaj CSRF tokene u admin forme

Trebamo ažurirati sve admin forme da koriste CSRF tokene:

### 3.1 Admin forme koje treba ažurirati:
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

## 🎯 Prioriteti

### Visoki prioritet (hitno):
1. **Testiraj aplikaciju** - provjeri da li radi
2. **Ažuriraj preostale API rute** - bez ovoga, restorani, proizvodi i ducani nisu zaštićeni

### Srednji prioritet:
3. **Dodaj CSRF tokene u forme** - bez ovoga, forme neće raditi s novim sigurnosnim mjerama

### Niski prioritet:
4. **Sakrij admin link u produkciji** - estetski, ali nije kritično

## 🆘 Troubleshooting

### Aplikacija se ne pokreće
- Provjeri da li je `.env.local` u root direktoriju
- Provjeri da li sadrži sve potrebne varijable
- Provjeri konzolu za greške

### Login ne radi
- Provjeri da li su email i lozinka točni u `.env.local`
- Provjeri da li je `AUTH_SECRET` postavljen
- Provjeri browser konzolu za greške

### API rute vraćaju 401 (Unauthorized)
- To je normalno! API rute su sada zaštićene
- Trebaš biti prijavljen da bi pristupio API rutama
- Provjeri da li si prijavljen (`/login`)

## 📋 Checklist

- [ ] Aplikacija se pokreće bez grešaka
- [ ] Login funkcionalnost radi
- [ ] Možeš pristupiti `/admin` nakon login
- [ ] Ažurirane sve API rute s sigurnosnim mjerama
- [ ] CSRF tokene dodane u sve admin forme
- [ ] Testirano dodavanje novog blog posta
- [ ] Testirano upload slike
- [ ] Testirano edit i delete funkcionalnosti

