import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

// Učitaj postojeće recepte
async function getRecipes() {
  try {
    const filePath = path.join(process.cwd(), "data", "recipes.json");
    if (existsSync(filePath)) {
      const fileContents = await readFile(filePath, "utf-8");
      return JSON.parse(fileContents);
    }
    return [];
  } catch {
    return [];
  }
}

// Spremi recepte
async function saveRecipes(recipes: any[]) {
  const filePath = path.join(process.cwd(), "data", "recipes.json");
  await writeFile(filePath, JSON.stringify(recipes, null, 2), "utf-8");
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Parsiraj form data
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
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
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generiraj jedinstveni naziv datoteke
      const fileExtension = path.extname(imageFile.name);
      const fileName = `${randomUUID()}${fileExtension}`;
      const uploadPath = path.join(process.cwd(), "public", "images", "recipes", fileName);

      // Osiguraj da folder postoji
      const uploadDir = path.dirname(uploadPath);
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      // Spremi sliku
      await writeFile(uploadPath, buffer);
      imagePath = `/images/recipes/${fileName}`;
    }

    // Kreiraj novi recept
    const newRecipe = {
      id: randomUUID(),
      title,
      description,
      image: imagePath,
      prepTime,
      cookTime,
      servings,
      difficulty,
      ingredients,
      instructions,
      tags,
      category,
      createdAt: new Date().toISOString().split("T")[0],
    };

    // Učitaj postojeće recepte
    const existingRecipes = await getRecipes();
    
    // Dodaj novi recept
    const updatedRecipes = [...existingRecipes, newRecipe];

    // Spremi
    await saveRecipes(updatedRecipes);

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
    const recipes = await getRecipes();
    return NextResponse.json(recipes);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

