# Admin Panel - Vodič

## 📍 Pristup Admin Panelu

Admin panel je dostupan na: **`/admin`**

## ✨ Funkcionalnosti

### 1. Dodavanje novog recepta

1. Otvori `/admin`
2. Klikni na tab **"Recepti"**
3. Klikni na **"Dodaj novi recept"**
4. Ispuni formu:
   - **Osnovne informacije**: naziv, opis, vrijeme pripreme/kuhanja, broj porcija, težina, kategorija, tagovi
   - **Fotografija**: upload slike (JPG, PNG, WEBP - max 5MB)
   - **Sastojci**: dodaj sastojke jedan po jedan
   - **Upute**: dodaj korake pripreme jedan po jedan
5. Klikni **"Spremi recept"**

### 2. Kako funkcionira

- **Spremanje podataka**: Recepti se spremaju u `data/recipes.json`
- **Upload slika**: Slike se spremaju u `public/images/recipes/` folder
- **Automatsko osvježavanje**: Novi recepti se automatski prikazuju na `/recepti` stranici

## 🔧 Tehnički detalji

### API Endpoint

**POST** `/api/recepti`
- Prima FormData s podacima o receptu
- Sprema recept u `data/recipes.json`
- Upload slike u `public/images/recipes/`
- Vraća kreirani recept

**GET** `/api/recepti`
- Vraća sve recepte iz `data/recipes.json`

### Struktura podataka

Recept se sprema u sljedećem formatu:

```json
{
  "id": "uuid",
  "title": "Naziv recepta",
  "description": "Opis",
  "image": "/images/recipes/filename.jpg",
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "difficulty": "lako",
  "ingredients": ["Sastojak 1", "Sastojak 2"],
  "instructions": ["Korak 1", "Korak 2"],
  "tags": ["tag1", "tag2"],
  "category": "kategorija",
  "createdAt": "2024-01-20"
}
```

## 📝 Napomene

- **Validacija**: Forma provjerava da su sva obavezna polja popunjena
- **Slika**: Ako ne uploadaš sliku, koristit će se placeholder
- **ID**: Svaki recept dobiva jedinstveni UUID
- **Datum**: Automatski se postavlja današnji datum

## 🚀 Sljedeći koraci

U budućnosti će biti dostupno:
- ✅ Dodavanje blog postova
- ✅ Dodavanje restorana
- ✅ Dodavanje proizvoda
- ✅ Uređivanje postojećih sadržaja
- ✅ Brisanje sadržaja

## 🔒 Sigurnost

**Napomena**: Trenutno admin panel nema autentifikaciju. Za produkciju, preporučujem dodati:
- Login sistem
- Zaštitu API ruta
- Validaciju korisnika

