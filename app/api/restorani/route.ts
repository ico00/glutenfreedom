import { NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { Restaurant } from "@/types";
import { mockRestaurants } from "@/data/mockData";

const restaurantsFilePath = path.join(process.cwd(), "data", "restaurants.json");

async function readRestaurantsFile(): Promise<Restaurant[]> {
  try {
    if (existsSync(restaurantsFilePath)) {
      const fileContents = await readFile(restaurantsFilePath, "utf-8");
      return JSON.parse(fileContents);
    }
    return [];
  } catch (error) {
    console.error("Error reading restaurants file:", error);
    return [];
  }
}

async function writeRestaurantsFile(restaurants: Restaurant[]): Promise<void> {
  await mkdir(path.dirname(restaurantsFilePath), { recursive: true });
  await writeFile(restaurantsFilePath, JSON.stringify(restaurants, null, 2), "utf8");
}

export async function GET() {
  const dynamicRestaurants = await readRestaurantsFile();
  
  // Filtriraj mock restorane - ako postoji dinamički restoran s istim ID-om, koristi dinamički
  const filteredMockRestaurants = mockRestaurants.filter(
    (mockRestaurant) => !dynamicRestaurants.some((dynamicRestaurant) => dynamicRestaurant.id === mockRestaurant.id)
  );
  
  return NextResponse.json([...filteredMockRestaurants, ...dynamicRestaurants]);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    const newRestaurant: Restaurant = {
      id: randomUUID(),
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      address: formData.get("address") as string,
      phone: formData.get("phone") as string || undefined,
      website: formData.get("website") as string || undefined,
      cuisine: JSON.parse(formData.get("cuisine") as string),
      priceRange: formData.get("priceRange") as "€" | "€€" | "€€€",
      rating: formData.get("rating") ? parseFloat(formData.get("rating") as string) : undefined,
      glutenFreeOptions: formData.get("glutenFreeOptions") as "djelomično" | "potpuno",
      location: {
        lat: parseFloat(formData.get("lat") as string),
        lng: parseFloat(formData.get("lng") as string),
      },
      image: undefined,
    };

    // Upload slike
    if (imageFile && imageFile.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "images", "restaurants");
      await mkdir(uploadDir, { recursive: true });
      const filename = `${newRestaurant.id}-${imageFile.name}`;
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, Buffer.from(await imageFile.arrayBuffer()));
      newRestaurant.image = `/images/restaurants/${filename}`;
    }

    const currentRestaurants = await readRestaurantsFile();
    currentRestaurants.push(newRestaurant);
    await writeRestaurantsFile(currentRestaurants);

    return NextResponse.json({ message: "Restaurant added successfully", restaurant: newRestaurant }, { status: 201 });
  } catch (error) {
    console.error("Error adding restaurant:", error);
    return NextResponse.json(
      { message: "Error adding restaurant", error: (error as Error).message },
      { status: 500 }
    );
  }
}

