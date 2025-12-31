# Kako dodati nove recepte i fotografije

## 📝 Dodavanje novog recepta

### 1. Otvori datoteku s podacima
Otvori `data/mockData.ts` i pronađi `mockRecipes` array.

### 2. Dodaj novi recept
Dodaj novi objekt u `mockRecipes` array. Evo primjera strukture:

```typescript
{
  id: "4", // Jedinstveni ID (koristi sljedeći broj)
  title: "Naziv tvog recepta",
  description: "Kratki opis recepta",
  image: "/images/recipes/tvoj-recept.jpg", // Putanja do slike
  prepTime: 15, // Vrijeme pripreme u minutama
  cookTime: 30, // Vrijeme kuhanja u minutama
  servings: 4, // Broj porcija
  difficulty: "lako", // "lako" | "srednje" | "teško"
  ingredients: [
    "Sastojak 1",
    "Sastojak 2",
    "Sastojak 3",
  ],
  instructions: [
    "Korak 1",
    "Korak 2",
    "Korak 3",
  ],
  tags: ["tag1", "tag2", "tag3"], // Tagovi za pretraživanje
  category: "kategorija", // npr. "pekara", "deserti", "glavna jela"
  createdAt: "2024-01-20", // Datum u formatu YYYY-MM-DD
}
```

### 3. Primjer kompletnog recepta

```typescript
{
  id: "4",
  title: "Bezglutenski palačinke - savršene za vikend",
  description: "Mekane i ukusne palačinke koje su potpuno bez glutena. Idealne za doručak ili desert.",
  image: "/images/recipes/pancakes.jpg",
  prepTime: 10,
  cookTime: 20,
  servings: 8,
  difficulty: "lako",
  ingredients: [
    "200g bezglutenskog brašna",
    "2 jaja",
    "300ml mlijeka",
    "1 žličica šećera",
    "1 žličica vanilije",
    "Maslac za prženje",
  ],
  instructions: [
    "Pomiješaj sve suhe sastojke u posudi",
    "Dodaj jaja i mlijeko, dobro promiješaj",
    "Ostavi da odstoji 10 minuta",
    "Zagrij tavu i dodaj malo maslaca",
    "Peci palačinke dok ne budu zlatne s obje strane",
  ],
  tags: ["palačinke", "doručak", "desert", "brzo"],
  category: "doručak",
  createdAt: "2024-01-20",
}
```

## 📸 Dodavanje fotografija

### 1. Pripremi fotografiju
- Preporučena veličina: **1200x800px** ili sličan omjer (16:9)
- Format: **JPG** ili **PNG**
- Optimiziraj sliku prije dodavanja (koristi npr. TinyPNG ili slično)

### 2. Spremi fotografiju
Spremi fotografiju u folder:
```
public/images/recipes/tvoj-recept.jpg
```

**Napomena:** Koristi opisne nazive datoteka (npr. `bezglutenski-kruh.jpg` umjesto `img1.jpg`)

### 3. Ažuriraj putanju u receptu
U `mockData.ts`, postavi `image` property na putanju do tvoje slike:
```typescript
image: "/images/recipes/tvoj-recept.jpg"
```

### 4. Ako nemaš fotografiju
Ako nemaš fotografiju, možeš ostaviti placeholder. Aplikacija će automatski prikazati emoji placeholder umjesto slike.

## 🎨 Kategorije recepta

Dostupne kategorije:
- `"pekara"` - kruh, peciva, kolači
- `"deserti"` - slatki recepti
- `"glavna jela"` - glavna jela
- `"doručak"` - doručak
- `"predjela"` - predjela
- `"salate"` - salate
- ili bilo koja druga kategorija

## 🏷️ Tagovi

Tagovi pomažu korisnicima pronaći recepte. Koristi kratke, opisne tagove:
- `["kruh", "doručak", "osnovno"]`
- `["desert", "čokolada", "slatko"]`
- `["glavno jelo", "tjestenina", "brzo"]`

## ✅ Provjera

Nakon dodavanja novog recepta:
1. Spremi `mockData.ts`
2. Ako koristiš `npm run dev`, stranica će se automatski osvježiti
3. Otvori `/recepti` stranicu i provjeri da se novi recept prikazuje
4. Klikni na recept i provjeri da se sve prikazuje ispravno

## 💡 Savjeti

- **Jedinstveni ID**: Uvijek koristi jedinstveni ID za svaki recept
- **Datum**: Koristi format `YYYY-MM-DD` za datum
- **Opisi**: Budi opisiv u opisu recepta - to pomaže korisnicima
- **Sastojci**: Navedi količine gdje je to relevantno
- **Uputstva**: Budi jasan i konkretan u uputama

## 📁 Struktura foldera

```
public/
  images/
    recipes/          # Slike za recepte
    blog/             # Slike za blog postove
    restaurants/      # Slike za restorane
```

## 🔄 Ažuriranje postojećeg recepta

Da ažuriraš postojeći recept:
1. Pronađi recept u `mockData.ts` po ID-u
2. Ažuriraj željena polja
3. Ako mijenjaš sliku, zamijeni datoteku u `public/images/recipes/`
4. Spremi promjene

