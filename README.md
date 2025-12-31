# Gluten Freedom

Web aplikacija i informativna platforma vezana uz celijakiju, gluten free recepte, savjete, restorane i proizvode bez glutena.

## Funkcionalnosti

- 📚 Blog članci i savjeti o celijakiji
- 🍽️ Recepti bez glutena s detaljnim uputama
- 🏪 Lista restorana u Zagrebu s filtriranjem
- 🛒 Popis dućana i artikala bez glutena
- 🏷️ Tagovi i kategorije za lako pretraživanje
- 🔍 Napredno pretraživanje i filtriranje
- 📱 Responsive mobile-first dizajn
- ✨ Moderne animacije (Framer Motion)
- 🌓 Dark/Light tema s automatskim prepoznavanjem
- 🎨 Moderni i čist dizajn s prirodnim bojama

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Jezik**: TypeScript
- **Styling**: TailwindCSS
- **Animacije**: Framer Motion
- **Ikone**: Lucide React
- **SEO**: Next.js Metadata API

## Struktura projekta

```
GlutenFreedom/
├── app/                    # Next.js App Router stranice
│   ├── blog/              # Blog stranice
│   ├── recepti/           # Recepti stranice
│   ├── restorani/         # Restorani stranice
│   ├── proizvodi/         # Proizvodi stranice
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React komponente
│   ├── Header.tsx         # Navigacija i header
│   ├── Footer.tsx         # Footer
│   ├── ThemeProvider.tsx  # Dark/Light tema
│   └── ...                # Ostale komponente
├── data/                  # Mock podaci
│   └── mockData.ts
├── types/                 # TypeScript tipovi
│   └── index.ts
└── ...
```

## Pokretanje

```bash
# Instalacija ovisnosti
npm install

# Development server
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint
```

Aplikacija će biti dostupna na [http://localhost:3000](http://localhost:3000)

## Funkcionalnosti stranica

### Homepage
- Hero sekcija s pozivom na akciju
- Najnoviji blog postovi
- Izdvojeni recepti
- Pregled restorana
- CTA sekcija

### Recepti
- Lista svih recepata
- Pretraživanje po nazivu, opisu i tagovima
- Filtriranje po kategoriji i težini
- Detaljne stranice s uputama i sastojcima

### Blog
- Lista svih blog postova
- Pretraživanje po naslovu, sadržaju i tagovima
- Filtriranje po kategoriji
- Detaljne stranice s punim sadržajem

### Restorani
- Lista restorana u Zagrebu
- Pretraživanje po nazivu, adresi i opisu
- Filtriranje po tipu kuhinje i bezglutenskim opcijama
- Detaljne stranice s kontakt informacijama

### Proizvodi
- Lista bezglutenskih proizvoda
- Pretraživanje po nazivu, brandu i tagovima
- Filtriranje po kategoriji
- Lista dućana s bezglutenskim proizvodima

## Dizajn

- **Boje**: Prirodne zelene nijanse (primary), neutralne bež/bijele nijanse
- **Tipografija**: Inter font (Google Fonts)
- **Animacije**: Framer Motion za smooth transitions
- **Responsive**: Mobile-first pristup
- **Dark Mode**: Automatsko prepoznavanje i ručno prebacivanje

## Buduće funkcionalnosti

- Korisnički računi i spremanje favorita
- User submitted sadržaj
- Ocjenjivanje restorana i proizvoda
- Integracija s mapama za lokacije
- PWA instalacija
- Notifikacije za nove proizvode i članke

