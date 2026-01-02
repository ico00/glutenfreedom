import { z } from "zod";

/**
 * Zod schemas za validaciju inputa
 */

// Blog post validation
export const blogPostSchema = z.object({
  title: z.string().min(3, "Naslov mora imati najmanje 3 znaka").max(200, "Naslov je predugačak"),
  excerpt: z.string().min(10, "Kratki opis mora imati najmanje 10 znakova").max(500, "Kratki opis je predugačak"),
  content: z.string().min(50, "Sadržaj mora imati najmanje 50 znakova"),
  tags: z.array(z.string().min(1).max(50)).min(1, "Dodaj barem jedan tag"),
  category: z.union([
    z.string().min(1),
    z.array(z.string().min(1)).min(1, "Odaberi barem jednu kategoriju"),
  ]),
  createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Neispravan format datuma"),
});

// Recipe validation
export const recipeSchema = z.object({
  title: z.string().min(3, "Naslov mora imati najmanje 3 znaka").max(200),
  description: z.string().min(10).max(1000),
  prepTime: z.number().int().min(0).max(1440), // max 24 sata
  cookTime: z.number().int().min(0).max(1440),
  servings: z.number().int().min(1).max(100),
  difficulty: z.enum(["lako", "srednje", "teško"]),
  category: z.string().min(1),
  tags: z.array(z.string().min(1).max(50)),
  ingredients: z.array(z.string().min(1)).min(1, "Dodaj barem jedan sastojak"),
  instructions: z.array(z.string().min(1)).min(1, "Dodaj barem jedan korak"),
});

// Restaurant validation
export const restaurantSchema = z.object({
  name: z.string().min(2, "Naziv mora imati najmanje 2 znaka").max(200),
  description: z.string().max(1000).optional(),
  address: z.union([
    z.string().min(5).max(500),
    z.array(z.string().min(5).max(500)).min(1),
  ]),
  phone: z.string().max(50).optional(),
  website: z.string().url("Neispravan URL").max(500).optional().or(z.literal("")),
  facebook: z.string().url("Neispravan URL").max(500).optional().or(z.literal("")),
  instagram: z.string().url("Neispravan URL").max(500).optional().or(z.literal("")),
  tiktok: z.string().url("Neispravan URL").max(500).optional().or(z.literal("")),
  cuisine: z.array(z.string().min(1)).min(1, "Odaberi barem jednu kuhinju"),
});

// Product validation
export const productSchema = z.object({
  name: z.string().min(2, "Naziv mora imati najmanje 2 znaka").max(200),
  description: z.string().max(1000).optional(),
  brand: z.string().min(1).max(100),
  category: z.string().min(1).max(100),
  store: z.string().max(200).optional(),
  tags: z.array(z.string().min(1).max(50)),
  certified: z.boolean(),
  price: z.number().positive().max(10000).optional(),
  weight: z.number().int().positive().max(100000).optional(), // max 100kg
});

// Store validation
export const storeSchema = z.object({
  name: z.string().min(2, "Naziv mora imati najmanje 2 znaka").max(200),
  description: z.string().max(1000).optional(),
  address: z.string().min(5).max(500),
  phone: z.string().max(50).optional(),
  website: z.string().url("Neispravan URL").max(500).optional().or(z.literal("")),
  type: z.enum(["dućan", "online", "oboje"]),
});

/**
 * Validiraj podatke s Zod schemom
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, errors: result.error };
}

