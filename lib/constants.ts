// Centralizirani popisi brandova, dućana, kategorija i tagova

export const BRANDS = [
  "Schär",
  "Barilla",
  "Dr. Schär",
  "No Gluten No Problem",
  "Glutano",
  "Vindija",
  "Gavrilović",
  "Vitaminka",
  "Alnavit",
  "Ostalo",
] as const;

export const STORES = [
  "Gluten Free Shop",
  "Bio Planet",
  "Garden",
  "Konzum",
  "Spar",
  "Lidl",
  "Kaufland",
  "Plodine",
  "DM",
  "Online",
  "Ostalo",
] as const;

export const PRODUCT_CATEGORIES = [
  "brašno",
  "tjestenine",
  "pekara",
  "slatkiši",
  "snack",
  "pića",
  "konzerve",
  "začini",
  "ostalo",
] as const;

export const RECIPE_CATEGORIES = [
  "Pekara",
  "Deserti",
  "Glavna jela",
  "Predjela",
  "Salate",
  "Pizze",
  "Torte i kolači",
  "Brza hrana",
  "Domaća jela",
  "Zimnica",
  "Napitci",
  "Ostalo",
] as const;

export const BLOG_CATEGORIES = [
  "Iskustva",
  "Savjeti",
  "Vijesti",
  "Recepti",
  "Zdravlje",
  "Dijagnoza",
  "Proizvodi",
  "Restorani",
  "Ostalo",
] as const;

// Predefinirani tagovi koji se mogu koristiti kao sugestije
export const COMMON_TAGS = [
  "celijakija",
  "gluten free",
  "bez glutena",
  "recept",
  "prehrana",
  "zdravlje",
  "savjeti",
  "iskustvo",
  "dijagnoza",
  "proizvodi",
  "restorani",
  "Zagreb",
  "bezglutenski",
  "bezglutensko",
  "bezglutenska",
  "alergija",
  "intolerancija",
  "prehrambeni",
  "zdravo",
  "prirodno",
] as const;

export type Brand = typeof BRANDS[number];
export type Store = typeof STORES[number];
export type ProductCategory = typeof PRODUCT_CATEGORIES[number];
export type RecipeCategory = typeof RECIPE_CATEGORIES[number];
export type BlogCategory = typeof BLOG_CATEGORIES[number];
export type CommonTag = typeof COMMON_TAGS[number];

