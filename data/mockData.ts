import { Recipe, BlogPost, Restaurant, Store, Product } from "@/types";

export const mockRecipes: Recipe[] = [
  {
    id: "1",
    title: "Moj omiljeni bezglutenski kruh - jednostavno i ukusno",
    description: "Nakon mnogo pokušaja, ovo je recept koji mi uvijek uspije. Hrskav vani, mekan iznutra - savršen za doručak s maslacem ili za sendviče.",
    image: "/images/recipes/bread.jpg",
    prepTime: 15,
    cookTime: 45,
    servings: 8,
    difficulty: "lako",
    ingredients: [
      "500g bezglutenskog brašna (koristim mješavinu koja već ima sve što treba)",
      "1 žličica soli",
      "1 žličica šećera (pomaže kvasu)",
      "7g suhog kvasca",
      "300ml mlake vode (ne vruće, inače ubije kvasac!)",
      "2 žlice maslinovog ulja",
      "100g orašastih plodova (opcionalno, ali dodaje teksturu)",
    ],
    instructions: [
      "Pomiješaj suhe sastojke u velikoj posudi - pazim da je sve dobro pomiješano",
      "Dodaj vodu i ulje, pa umijesi tijesto. Bezglutensko tijesto je drugačije - neće biti elastično kao obično, to je normalno!",
      "Ako koristiš orašaste plodove, dodaj ih sada i dobro promiješaj",
      "Ostavi da naraste 1 sat na toplom mjestu. Pokrij kuhinjskom krpom",
      "Pecite na 180°C oko 45 minuta. Provjeravam da li je gotovo tako što ga okrenem i tapnem - ako zvuči šuplje, gotovo je!",
    ],
    tags: ["kruh", "doručak", "orašasti plodovi", "osnovno"],
    category: "pekara",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Bezglutenski brownies - moj go-to desert",
    description: "Kad mi se jede nešto slatko, ovo je moj prvi izbor. Jednostavno, brzo, i uvijek uspije. Prijatelji ne mogu vjerovati da je bez glutena!",
    image: "/images/recipes/brownies.jpg",
    prepTime: 20,
    cookTime: 30,
    servings: 12,
    difficulty: "lako",
    ingredients: [
      "200g tamne čokolade (provjerim da je bezglutenska!)",
      "150g maslaca",
      "200g šećera",
      "3 jaja",
      "100g bezglutenskog brašna",
      "50g kakao praha (dodaje intenzivnu čokoladnu okus)",
    ],
    instructions: [
      "Rastopim čokoladu i maslac na pari ili u mikrovalnoj (pazim da se ne prepeče!)",
      "Dodam šećer i jaja, dobro promiješam",
      "Pomiješam brašno i kakao, pa dodam u smjesu",
      "Pecite na 170°C oko 30 minuta. Volim ih malo vlažne u sredini, ali ako voliš tvrđe, peci duže",
      "Ostavim da se ohlade prije rezanja - inače se raspadnu",
    ],
    tags: ["desert", "čokolada", "slatko", "brzo"],
    category: "deserti",
    createdAt: "2024-01-10",
  },
  {
    id: "3",
    title: "Jednostavna bezglutenska tjestenina - moj tjedni obrok",
    description: "Kad mi se jede nešto brzo i jednostavno, ovo je moj izbor. Koristim bezglutensku tjesteninu iz dućana i dodajem što imam u hladnjaku.",
    image: "/images/recipes/pasta.jpg",
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    difficulty: "lako",
    ingredients: [
      "200g bezglutenske tjestenine (volim onu od kukuruza i riže)",
      "2 žlice maslinovog ulja",
      "2 češnja češnjaka",
      "Cherry rajčice (koliko hoćeš)",
      "Bazilika (svježa, ako imaš)",
      "Parmezan (opcionalno)",
      "Sol i papar",
    ],
    instructions: [
      "Skuham tjesteninu prema uputama na pakiranju - bezglutenska se kuha brže, pazim da ne prekuham!",
      "Dok se kuha, na tavi zagrijem ulje i dodam narezan češnjak",
      "Dodam cherry rajčice (pola ih prerežem) i dinstam dok ne omekšaju",
      "Odcedim tjesteninu i dodam u tavu s rajčicama",
      "Pomiješam sve, dodam baziliku i parmezan ako imam, i gotovo!",
    ],
    tags: ["glavno jelo", "tjestenina", "brzo", "jednostavno"],
    category: "glavna jela",
    createdAt: "2024-01-12",
  },
  // Primjer: Dodaj novi recept ovdje
  // {
  //   id: "4",
  //   title: "Bezglutenski palačinke - savršene za vikend",
  //   description: "Mekane i ukusne palačinke koje su potpuno bez glutena. Idealne za doručak ili desert.",
  //   image: "/images/recipes/pancakes.jpg", // Dodaj sliku u public/images/recipes/
  //   prepTime: 10,
  //   cookTime: 20,
  //   servings: 8,
  //   difficulty: "lako",
  //   ingredients: [
  //     "200g bezglutenskog brašna",
  //     "2 jaja",
  //     "300ml mlijeka",
  //     "1 žličica šećera",
  //     "1 žličica vanilije",
  //     "Maslac za prženje",
  //   ],
  //   instructions: [
  //     "Pomiješaj sve suhe sastojke u posudi",
  //     "Dodaj jaja i mlijeko, dobro promiješaj",
  //     "Ostavi da odstoji 10 minuta",
  //     "Zagrij tavu i dodaj malo maslaca",
  //     "Peci palačinke dok ne budu zlatne s obje strane",
  //   ],
  //   tags: ["palačinke", "doručak", "desert", "brzo"],
  //   category: "doručak",
  //   createdAt: "2024-01-20",
  // },
];

export const mockBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Moj prvi dan bez glutena - što sam naučio",
    excerpt: "Kad su mi dijagnosticirali celijakiju prije tri godine, bio sam preplavljen informacijama i strahom. Evo što bih volio znati tada...",
    content: `Kad su mi dijagnosticirali celijakiju prije tri godine, bio sam preplavljen informacijama i strahom. Evo što bih volio znati tada.

Prvo, nije kraj svijeta. Zvuči kliše, ali stvarno nije. Prvih nekoliko tjedana sam proveo u panici - što mogu jesti? Gdje mogu jesti? Kako ću preživjeti bez kruha?

Iskreno, najteže je bilo prvo mjesec dana. Sve je bilo novo, sve je trebalo provjeravati, a činilo se da gluten ima sve. Ali onda sam shvatio da ima puno toga što mogu jesti - meso, riba, povrće, voće, riža, krumpir... lista je zapravo duga.

Najveći izazov je bio u restoranima. U početku sam se bojao ići vani jesti, ali s vremenom sam naučio kako komunicirati s konobarima i kuharima. Većina ih je razumijevajuća ako im objasniš situaciju.

Jedna stvar koju sam naučio - uvijek nosim sa sobom nešto za grickanje. Nikad ne znaš kad ćeš biti gladan, a opcije nisu uvijek dostupne.

Također, nije sramota pitati. Pitaj u restoranu, pitaj u dućanu, pitaj prijatelje. Ljudi su obično spremni pomoći ako znaju što ti treba.

Nakon tri godine, bezglutenski život mi je postao prirodan. Ne razmišljam više o tome kao o ograničenju, već kao o načinu života koji me čini zdravijim i sretnijim.

**Važno napomenuti:** Ovo je moje osobno iskustvo i nije medicinski savjet. Ako sumnjaš da imaš celijakiju ili probleme s glutenom, obrati se liječniku.`,
    image: "/images/blog/celiac.jpg",
    author: "Marko M.",
    tags: ["iskustvo", "početak", "savjeti"],
    category: "iskustva",
    createdAt: "2024-01-20",
    readTime: 5,
  },
  {
    id: "2",
    title: "Kako čitati etikete - moj vodič kroz supermarket",
    excerpt: "Naučio sam na teži način da gluten se skriva u najneobičnijim mjestima. Evo što sam naučio o čitanju etiketa...",
    content: `Naučio sam na teži način da gluten se skriva u najneobičnijim mjestima. Prvi put kad sam prošao kroz supermarket nakon dijagnoze, trebalo mi je sat vremena da napravim osnovnu kupnju. Danas mi treba možda 10 minuta više nego prije, ali znam što tražiti.

**Što prvo gledam:**
- Ikonu s prekriženim klasom žita (gluten-free simbol)
- Riječ "bezglutenski" ili "gluten free"
- Listu sastojaka (uvijek!)

**Gdje se gluten skriva:**
- U začinima i mješavinama začina (često!)
- U umacima i preljevima
- U sladoledima (ponekad)
- U čokoladi (rijetko, ali provjeravam)
- U mesnim proizvodima (čudno, ali istinito)

**Moj trik:**
Ako nisam siguran, ne kupujem. Bolje biti siguran nego žaliti. Također, imam nekoliko proizvoda koje uvijek kupujem jer znam da su sigurni - to mi ubrzava kupnju.

**Najveći izazov:**
Čitanje sitnih slova na etiketama! Često trebam naočale ili povećalo na mobitelu. Ali vrijedi - bolje nego biti bolestan.

**Savjet za početnike:**
Počni s proizvodima koji imaju jasno označeno "bezglutenski". Kako vremenom postaneš sigurniji, možeš proširiti izbor.

**Važno:** Ovo je moje osobno iskustvo. Uvijek provjeravaj etikete i ako nisi siguran, pitaj proizvođača ili liječnika.`,
    image: "/images/blog/labels.jpg",
    author: "Marko M.",
    tags: ["savjeti", "proizvodi", "supermarket"],
    category: "savjeti",
    createdAt: "2024-01-18",
    readTime: 4,
  },
  {
    id: "3",
    title: "Restorani u Zagrebu - gdje se osjećam sigurno",
    excerpt: "Nakon tri godine testiranja različitih mjesta, evo restorana gdje se osjećam sigurno i gdje me razumiju...",
    content: `Nakon tri godine testiranja različitih mjesta u Zagrebu, evo restorana gdje se osjećam sigurno i gdje me razumiju.

**Moj pristup:**
Uvijek zovem unaprijed i pitam imaju li bezglutenske opcije. Ako kažu da imaju, pitam kako pripremaju hranu - koriste li odvojene posude? Imaju li odvojeni dio kuhinje?

**Gdje idem s povjerenjem:**
Ima nekoliko mjesta gdje redovito idem jer znam da razumiju moje potrebe. Konobari znaju što je celijakija i kako je važno izbjegavati cross-contamination.

**Što tražim:**
- Razumijevanje osoblja
- Spremnost prilagoditi jelovnik
- Čistoću u pripremi
- Transparentnost o sastojcima

**Moj savjet:**
Ako konobar ili kuhar ne razumije što je celijakija ili se čini nesigurnim, bolje je otići negdje drugdje. Nije vrijedno rizika.

**Također:**
Nikad se ne sramim pitati. Bolje pitati nego biti bolestan. Većina ljudi je razumijevajuća ako im objasniš situaciju.

**Važno napomenuti:** Ovo su moja osobna iskustva i preporuke. Uvijek provjeravaj s restoranom direktno i slušaj svoje tijelo. Ako se ne osjećaš siguran, ne jedi tamo.`,
    image: "/images/blog/restaurants.jpg",
    author: "Marko M.",
    tags: ["restorani", "Zagreb", "iskustvo"],
    category: "restorani",
    createdAt: "2024-01-15",
    readTime: 6,
  },
];

export const mockRestaurants: Restaurant[] = [
  {
    id: "1",
    name: "Zelena Kuhinja",
    description: "Jedan od rijetkih restorana u Zagrebu gdje se osjećam potpuno siguran. Cijeli jelovnik je bezglutenski, a osoblje razumije što je celijakija. Nisam nikad imao problema ovdje.",
    address: "Ilica 123, Zagreb",
    phone: "+385 1 234 5678",
    website: "https://zelenakuhinja.hr",
    cuisine: ["mediteranska", "vegetarijanska"],
    priceRange: "€€",
    rating: 4.8,
    glutenFreeOptions: "potpuno",
    location: { lat: 45.8150, lng: 15.9819 },
  },
  {
    id: "2",
    name: "Bio & Organic",
    description: "Imaju dobre bezglutenske opcije, ali uvijek zovem unaprijed da provjerim što je dostupno. Konobari su razumijevajući i spremni prilagoditi jela.",
    address: "Trg bana Jelačića 5, Zagreb",
    phone: "+385 1 234 5679",
    cuisine: ["organička", "zdrava"],
    priceRange: "€€€",
    rating: 4.5,
    glutenFreeOptions: "djelomično",
    location: { lat: 45.8132, lng: 15.9775 },
  },
  {
    id: "3",
    name: "Mama's Kitchen",
    description: "Mali obiteljski restoran gdje sam otkrio da imaju nekoliko bezglutenskih jela. Majka vlasnika razumije celijakiju jer ima prijateljicu s istim problemom. Uvijek me pitaju kako mi je bilo nakon jela.",
    address: "Vlaška ulica 45, Zagreb",
    phone: "+385 1 234 5680",
    cuisine: ["tradicionalna", "obiteljska"],
    priceRange: "€",
    rating: 4.7,
    glutenFreeOptions: "djelomično",
    location: { lat: 45.8100, lng: 15.9750 },
  },
];

export const mockStores: Store[] = [
  {
    id: "1",
    name: "Gluten Free Shop",
    description: "Specijalizirani dućan za bezglutenske proizvode",
    address: "Savska cesta 32, Zagreb",
    phone: "+385 1 234 5680",
    website: "https://glutenfreeshop.hr",
    type: "dućan",
  },
  {
    id: "2",
    name: "Bio Planet",
    description: "Mreža dućana s širokim izborom bezglutenskih proizvoda",
    address: "Više lokacija u Zagrebu",
    website: "https://bioplanet.hr",
    type: "dućan",
  },
];

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Bezglutensko brašno",
    description: "Univerzalno brašno za pekaru",
    brand: "Schär",
    category: "brašno",
    tags: ["pekara", "osnovno"],
    certified: true,
  },
  {
    id: "2",
    name: "Bezglutenske tjestenine",
    description: "Tjestenine od kukuruza i riže",
    brand: "Barilla",
    category: "tjestenine",
    tags: ["glavno jelo", "tjestenine"],
    certified: true,
  },
];

