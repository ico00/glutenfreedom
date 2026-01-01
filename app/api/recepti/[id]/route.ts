import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readFile, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { Recipe, RecipeMetadata } from "@/types";
import {
  readRecipeMetadata,
  writeRecipeMetadata,
  readRecipeContent,
  writeRecipeContent,
  getFullRecipe,
  getAllRecipes,
} from "@/lib/recipeUtils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recipes = await getAllRecipes();
    const recipe = recipes.find((r) => r.id === id);

    if (!recipe) {
      return NextResponse.json({ message: "Recept nije pronađen" }, { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();

    const recipes = await getAllRecipes();
    const existingRecipe = recipes.find((r) => r.id === id);

    if (!existingRecipe) {
      return NextResponse.json({ message: "Recept nije pronađen" }, { status: 404 });
    }

    // Parsiraj form data
    const title = (formData.get("title") as string) || existingRecipe.title;
    const description = (formData.get("description") as string) || existingRecipe.description;
    const prepTime = parseInt(formData.get("prepTime") as string) || existingRecipe.prepTime;
    const cookTime = parseInt(formData.get("cookTime") as string) || existingRecipe.cookTime;
    const servings = parseInt(formData.get("servings") as string) || existingRecipe.servings;
    const difficulty = (formData.get("difficulty") as "lako" | "srednje" | "teško") || existingRecipe.difficulty;
    const category = (formData.get("category") as string) || existingRecipe.category;
    const tagsString = formData.get("tags") as string;
    const tags = tagsString ? tagsString.split(",").map((tag) => tag.trim()).filter(Boolean) : existingRecipe.tags;

    // Parsiraj sastojke
    const ingredients: string[] = [];
    let index = 0;
    while (formData.get(`ingredients[${index}]`)) {
      const ingredient = formData.get(`ingredients[${index}]`) as string;
      if (ingredient.trim()) {
        ingredients.push(ingredient.trim());
      }
      index++;
    }
    if (ingredients.length === 0) {
      ingredients.push(...existingRecipe.ingredients);
    }

    // Parsiraj upute
    const instructions: string[] = [];
    index = 0;
    while (formData.get(`instructions[${index}]`)) {
      const instruction = formData.get(`instructions[${index}]`) as string;
      if (instruction.trim()) {
        instructions.push(instruction.trim());
      }
      index++;
    }
    if (instructions.length === 0) {
      instructions.push(...existingRecipe.instructions);
    }

    // Upload slike (ako je nova)
    let imagePath = existingRecipe.image;
    const imageFile = formData.get("image") as File | null;

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generiraj jedinstveni naziv datoteke
      const fileExtension = path.extname(imageFile.name);
      const fileName = `${id}-${Date.now()}${fileExtension}`;
      const uploadPath = path.join(process.cwd(), "public", "images", "recipes", fileName);

      // Osiguraj da folder postoji
      const uploadDir = path.dirname(uploadPath);
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      // Spremi sliku
      await writeFile(uploadPath, buffer);
      imagePath = `/images/recipes/${fileName}`;

      // Obriši staru sliku ako postoji i nije default
      if (existingRecipe.image && existingRecipe.image.startsWith("/images/recipes/")) {
        try {
          const oldImagePath = path.join(process.cwd(), "public", existingRecipe.image);
          if (existsSync(oldImagePath)) {
            await unlink(oldImagePath);
          }
        } catch (error) {
          console.error("Error deleting old image:", error);
        }
      }
    }

    // Ažuriraj metadata
    const metadataList = await readRecipeMetadata();
    const metadataIndex = metadataList.findIndex((m) => m.id === id);

    if (metadataIndex === -1) {
      return NextResponse.json({ message: "Recept metadata nije pronađen" }, { status: 404 });
    }

    const updatedMetadata: RecipeMetadata = {
      ...metadataList[metadataIndex],
      title,
      description,
      image: imagePath,
      prepTime,
      cookTime,
      servings,
      difficulty,
      tags,
      category,
    };

    metadataList[metadataIndex] = updatedMetadata;
    await writeRecipeMetadata(metadataList);

    // Spremi Markdown sadržaj (ingredients i instructions)
    await writeRecipeContent(id, ingredients, instructions);

    // Vrati potpuni recept za response
    const updatedRecipe: Recipe = {
      ...updatedMetadata,
      ingredients,
      instructions,
    };

    return NextResponse.json({ success: true, recipe: updatedRecipe });
  } catch (error: any) {
    console.error("Error updating recipe:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Greška pri ažuriranju recepta" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const metadataList = await readRecipeMetadata();
    const metadataIndex = metadataList.findIndex((m) => m.id === id);

    if (metadataIndex === -1) {
      return NextResponse.json({ message: "Recept nije pronađen" }, { status: 404 });
    }

    const metadata = metadataList[metadataIndex];

    // Obriši sliku ako postoji
    if (metadata.image && metadata.image.startsWith("/images/recipes/")) {
      try {
        const imagePath = path.join(process.cwd(), "public", metadata.image);
        if (existsSync(imagePath)) {
          await unlink(imagePath);
        }
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }

    // Obriši Markdown fajl
    try {
      const contentPath = path.join(process.cwd(), "content", "recipes", `${id}.md`);
      if (existsSync(contentPath)) {
        await unlink(contentPath);
      }
    } catch (error) {
      console.error("Error deleting recipe content file:", error);
    }

    // Obriši metadata iz liste
    metadataList.splice(metadataIndex, 1);
    await writeRecipeMetadata(metadataList);

    return NextResponse.json({ success: true, message: "Recept obrisan" });
  } catch (error: any) {
    console.error("Error deleting recipe:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Greška pri brisanju recepta" },
      { status: 500 }
    );
  }
}

