import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { RecipeMetadata } from "@/types";
import {
  readRecipeMetadata,
  writeRecipeMetadata,
  writeRecipeContent,
  getAllRecipes,
} from "@/lib/recipeUtils";
import { protectApiRoute } from "@/lib/apiAuth";
import { validateImageFile, generateSafeFilename, sanitizeString } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    // Provjeri autentifikaciju, rate limit i CSRF
    const authError = await protectApiRoute(request, {
      rateLimit: { maxRequests: 5, windowMs: 60000 },
    });
    if (authError) {
      return authError;
    }

    const formData = await request.formData();

    // Parsiraj i sanitiziraj form data
    const title = sanitizeString(formData.get("title") as string, 200);
    const description = sanitizeString(formData.get("description") as string, 1000);
    
    if (!title || title.length < 3) {
      return NextResponse.json(
        { success: false, message: "Naslov mora imati najmanje 3 znaka" },
        { status: 400 }
      );
    }
    const prepTime = parseInt(formData.get("prepTime") as string);
    const cookTime = parseInt(formData.get("cookTime") as string);
    const servings = parseInt(formData.get("servings") as string);
    const difficulty = formData.get("difficulty") as "lako" | "srednje" | "teško";
    const category = formData.get("category") as string;
    const tagsString = formData.get("tags") as string;
    const tags = tagsString.split(",").map((tag) => tag.trim()).filter(Boolean);

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

    // Upload slike
    const imageFile = formData.get("image") as File | null;
    let imagePath = "";

    if (imageFile && imageFile.size > 0) {
      // Validiraj upload slike
      const validation = await validateImageFile(imageFile);
      if (!validation.valid) {
        return NextResponse.json(
          { success: false, message: validation.error },
          { status: 400 }
        );
      }

      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generiraj siguran naziv datoteke
      const safeFileName = generateSafeFilename(imageFile.name, randomUUID());
      const uploadPath = path.join(process.cwd(), "public", "images", "recipes", safeFileName);

      // Osiguraj da folder postoji
      const uploadDir = path.dirname(uploadPath);
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      // Spremi sliku
      await writeFile(uploadPath, buffer);
      imagePath = `/images/recipes/${safeFileName}`;
    }

    // Upload galerije slika
    const galleryCount = parseInt(formData.get("galleryCount") as string) || 0;
    const galleryPaths: string[] = [];

    for (let i = 0; i < galleryCount; i++) {
      const galleryFile = formData.get(`gallery_${i}`) as File | null;
      if (galleryFile && galleryFile.size > 0) {
        // Validiraj galeriju sliku
        const validation = await validateImageFile(galleryFile);
        if (!validation.valid) {
          continue; // Preskoči nevaljanu sliku
        }

        const bytes = await galleryFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generiraj siguran naziv datoteke
        const safeFileName = generateSafeFilename(galleryFile.name, `${randomUUID()}-gallery-${i}`);
        const uploadPath = path.join(process.cwd(), "public", "images", "recipes", "gallery", safeFileName);

        // Osiguraj da folder postoji
        const uploadDir = path.dirname(uploadPath);
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true });
        }

        // Spremi sliku
        await writeFile(uploadPath, buffer);
        galleryPaths.push(`/images/recipes/gallery/${safeFileName}`);
      }
    }

    const recipeId = randomUUID();

    // Kreiraj metadata (bez ingredients i instructions)
    const metadata: RecipeMetadata = {
      id: recipeId,
      title,
      description,
      image: imagePath,
      gallery: galleryPaths.length > 0 ? galleryPaths : undefined,
      prepTime,
      cookTime,
      servings,
      difficulty,
      tags,
      category,
      createdAt: new Date().toISOString().split("T")[0],
    };

    // Spremi Markdown sadržaj (ingredients i instructions)
    await writeRecipeContent(recipeId, ingredients, instructions);

    // Učitaj postojeće metadata
    const existingMetadata = await readRecipeMetadata();
    
    // Dodaj novi metadata
    existingMetadata.push(metadata);

    // Spremi metadata
    await writeRecipeMetadata(existingMetadata);

    // Vrati potpuni recept za response
    const newRecipe = {
      ...metadata,
      ingredients,
      instructions,
    };

    return NextResponse.json({ success: true, recipe: newRecipe }, { status: 201 });
  } catch (error: any) {
    console.error("Error saving recipe:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Greška pri spremanju recepta" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const recipes = await getAllRecipes();
    return NextResponse.json(recipes);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

