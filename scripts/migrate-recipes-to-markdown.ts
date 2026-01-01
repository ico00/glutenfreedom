import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { Recipe, RecipeMetadata } from "@/types";
import { writeRecipeMetadata, writeRecipeContent } from "@/lib/recipeUtils";

async function migrateRecipes() {
  try {
    const oldRecipesPath = path.join(process.cwd(), "data", "recipes.json");
    
    if (!existsSync(oldRecipesPath)) {
      console.log("Nema postojećih recepata za migraciju.");
      return;
    }

    const oldRecipes: Recipe[] = JSON.parse(await readFile(oldRecipesPath, "utf-8"));
    console.log(`Pronađeno ${oldRecipes.length} recepata za migraciju.`);

    const metadataList: RecipeMetadata[] = [];

    for (const recipe of oldRecipes) {
      // Kreiraj metadata (bez ingredients i instructions)
      const metadata: RecipeMetadata = {
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        image: recipe.image,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        tags: recipe.tags,
        category: recipe.category,
        createdAt: recipe.createdAt,
      };

      metadataList.push(metadata);

      // Spremi Markdown sadržaj (ingredients i instructions)
      await writeRecipeContent(recipe.id, recipe.ingredients, recipe.instructions);

      console.log(`Migriran recept: ${recipe.title}`);
    }

    // Spremi metadata
    await writeRecipeMetadata(metadataList);

    // Napravi backup starog fajla
    const backupPath = path.join(process.cwd(), "data", "recipes.json.backup");
    await writeFile(backupPath, JSON.stringify(oldRecipes, null, 2), "utf-8");

    // Obriši ingredients i instructions iz starog fajla (ostavi samo metadata za backward compatibility)
    const metadataOnly = oldRecipes.map(({ ingredients, instructions, ...rest }) => rest);
    await writeFile(oldRecipesPath, JSON.stringify(metadataOnly, null, 2), "utf-8");

    console.log(`\nMigracija završena!`);
    console.log(`- Migrirano ${metadataList.length} recepata`);
    console.log(`- Backup kreiran: ${backupPath}`);
    console.log(`- Markdown fajlovi kreirani u: content/recipes/`);
  } catch (error) {
    console.error("Greška pri migraciji recepata:", error);
    process.exit(1);
  }
}

migrateRecipes();

