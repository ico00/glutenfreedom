import { NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { Restaurant } from "@/types";
import { mockRestaurants } from "@/data/mockData";

const restaurantsFilePath = path.join(process.cwd(), "data", "restaurants.json");
const deletedRestaurantsFilePath = path.join(process.cwd(), "data", "deletedRestaurants.json");

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

async function readDeletedRestaurantsFile(): Promise<string[]> {
  try {
    if (existsSync(deletedRestaurantsFilePath)) {
      const fileContents = await readFile(deletedRestaurantsFilePath, "utf-8");
      return JSON.parse(fileContents);
    }
    return [];
  } catch (error) {
    console.error("Error reading deleted restaurants file:", error);
    return [];
  }
}

async function writeRestaurantsFile(restaurants: Restaurant[]): Promise<void> {
  await mkdir(path.dirname(restaurantsFilePath), { recursive: true });
  await writeFile(restaurantsFilePath, JSON.stringify(restaurants, null, 2), "utf8");
}

async function writeDeletedRestaurantsFile(deletedIds: string[]): Promise<void> {
  await mkdir(path.dirname(deletedRestaurantsFilePath), { recursive: true });
  await writeFile(deletedRestaurantsFilePath, JSON.stringify(deletedIds, null, 2), "utf8");
}

export async function GET() {
  const dynamicRestaurants = await readRestaurantsFile();
  const deletedIds = await readDeletedRestaurantsFile();
  
  // Filtriraj mock restorane - ako postoji dinamički restoran s istim ID-om, koristi dinamički
  // Također filtriraj obrisane restorane
  const filteredMockRestaurants = mockRestaurants.filter(
    (mockRestaurant) => 
      !dynamicRestaurants.some((dynamicRestaurant) => dynamicRestaurant.id === mockRestaurant.id) &&
      !deletedIds.includes(mockRestaurant.id)
  );
  
  // Filtriraj dinamičke restorane - samo oni koji nisu obrisani
  const filteredDynamicRestaurants = dynamicRestaurants.filter(
    (restaurant) => !deletedIds.includes(restaurant.id)
  );
  
  return NextResponse.json([...filteredMockRestaurants, ...filteredDynamicRestaurants]);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    // Parsiraj adrese (može biti array ili single value za backward compatibility)
    const addresses: string[] = [];
    let index = 0;
    while (formData.get(`addresses[${index}]`)) {
      const address = formData.get(`addresses[${index}]`) as string;
      if (address.trim()) {
        addresses.push(address.trim());
      }
      index++;
    }
    // Fallback: ako nema addresses array, provjeri staru "address" vrijednost
    if (addresses.length === 0) {
      const oldAddress = formData.get("address") as string;
      if (oldAddress) {
        addresses.push(oldAddress);
      }
    }

    const cuisineValue = formData.get("cuisine") as string;
    const newRestaurant: Restaurant = {
      id: randomUUID(),
      name: formData.get("name") as string,
      description: formData.get("description") as string || "",
      address: addresses.length === 1 ? addresses[0] : addresses, // Ako je jedna adresa, spremi kao string za backward compatibility
      phone: formData.get("phone") as string || undefined,
      website: formData.get("website") as string || undefined,
      facebook: formData.get("facebook") as string || undefined,
      instagram: formData.get("instagram") as string || undefined,
      tiktok: formData.get("tiktok") as string || undefined,
      cuisine: cuisineValue ? [cuisineValue] : [],
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

