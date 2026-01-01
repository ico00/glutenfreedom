import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { Recipe, RecipeMetadata } from "@/types";

const contentDir = path.join(process.cwd(), "content", "recipes");
const recipeMetadataPath = path.join(process.cwd(), "data", "recipes.json");

// Format za Markdown: ingredients i instructions kao liste
// ## Sastojci
// - sastojak 1
// - sastojak 2
//
// ## Upute
// 1. korak 1
// 2. korak 2

// Parsiraj Markdown u ingredients i instructions
function parseRecipeContent(markdown: string): { ingredients: string[]; instructions: string[] } {
  const ingredients: string[] = [];
  const instructions: string[] = [];
  
  const lines = markdown.split('\n');
  let currentSection: 'ingredients' | 'instructions' | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('## Sastojci') || trimmed.startsWith('## Sastojci:')) {
      currentSection = 'ingredients';
      continue;
    }
    
    if (trimmed.startsWith('## Upute') || trimmed.startsWith('## Upute:')) {
      currentSection = 'instructions';
      continue;
    }
    
    if (currentSection === 'ingredients' && trimmed.startsWith('- ')) {
      ingredients.push(trimmed.substring(2).trim());
    }
    
    if (currentSection === 'instructions') {
      // Podržava format "1. korak" ili "- korak"
      const match = trimmed.match(/^(?:\d+\.\s*|- )(.+)$/);
      if (match) {
        instructions.push(match[1].trim());
      }
    }
  }
  
  return { ingredients, instructions };
}

// Konvertiraj ingredients i instructions u Markdown
function formatRecipeContent(ingredients: string[], instructions: string[]): string {
  let markdown = '## Sastojci\n\n';
  
  ingredients.forEach(ingredient => {
    markdown += `- ${ingredient}\n`;
  });
  
  markdown += '\n## Upute\n\n';
  
  instructions.forEach((instruction, index) => {
    markdown += `${index + 1}. ${instruction}\n`;
  });
  
  return markdown;
}

// Učitaj Markdown sadržaj za recept
export async function readRecipeContent(recipeId: string): Promise<{ ingredients: string[]; instructions: string[] }> {
  const contentPath = path.join(contentDir, `${recipeId}.md`);
  try {
    if (existsSync(contentPath)) {
      const markdown = await readFile(contentPath, "utf-8");
      return parseRecipeContent(markdown);
    }
    return { ingredients: [], instructions: [] };
  } catch (error) {
    console.error(`Error reading recipe content for ${recipeId}:`, error);
    return { ingredients: [], instructions: [] };
  }
}

// Spremi Markdown sadržaj za recept
export async function writeRecipeContent(recipeId: string, ingredients: string[], instructions: string[]): Promise<void> {
  await mkdir(contentDir, { recursive: true });
  const contentPath = path.join(contentDir, `${recipeId}.md`);
  const markdown = formatRecipeContent(ingredients, instructions);
  await writeFile(contentPath, markdown, "utf-8");
}

// Učitaj sve metadata recepata
export async function readRecipeMetadata(): Promise<RecipeMetadata[]> {
  try {
    if (existsSync(recipeMetadataPath)) {
      const fileContents = await readFile(recipeMetadataPath, "utf-8");
      const rawData = JSON.parse(fileContents);
      
      // Ukloni ingredients i instructions iz metadata (ako postoje - stari format)
      return rawData.map((item: any) => {
        const { ingredients, instructions, ...metadata } = item;
        return metadata as RecipeMetadata;
      });
    }
    return [];
  } catch (error) {
    console.error("Error reading recipe metadata:", error);
    return [];
  }
}

// Spremi metadata recepata
export async function writeRecipeMetadata(recipes: RecipeMetadata[]): Promise<void> {
  await mkdir(path.dirname(recipeMetadataPath), { recursive: true });
  await writeFile(recipeMetadataPath, JSON.stringify(recipes, null, 2), "utf8");
}

// Kombiniraj metadata + content u potpuni Recipe
export async function getFullRecipe(metadata: RecipeMetadata): Promise<Recipe> {
  const { ingredients, instructions } = await readRecipeContent(metadata.id);
  return {
    ...metadata,
    ingredients,
    instructions,
  };
}

// Kombiniraj sve metadata + content u potpune Recipe objekte
export async function getAllRecipes(): Promise<Recipe[]> {
  const metadataList = await readRecipeMetadata();
  const recipes: Recipe[] = [];
  
  for (const metadata of metadataList) {
    let { ingredients, instructions } = await readRecipeContent(metadata.id);
    
    // Fallback: ako Markdown fajl ne postoji, provjeri da li su ingredients/instructions u metadata (stari format)
    if ((ingredients.length === 0 && instructions.length === 0) && (metadata as any).ingredients && (metadata as any).instructions) {
      ingredients = (metadata as any).ingredients;
      instructions = (metadata as any).instructions;
      
      // Automatska migracija: spremi u Markdown format
      try {
        await writeRecipeContent(metadata.id, ingredients, instructions);
        console.log(`Migriran recept u Markdown: ${metadata.title}`);
      } catch (error) {
        console.error(`Greška pri migraciji recepta ${metadata.id}:`, error);
      }
    }
    
    recipes.push({
      ...metadata,
      ingredients: ingredients || [],
      instructions: instructions || [],
    });
  }
  
  return recipes;
}

