import { NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
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

async function writeRestaurantsFile(restaurants: Restaurant[]): Promise<void> {
  await mkdir(path.dirname(restaurantsFilePath), { recursive: true });
  await writeFile(restaurantsFilePath, JSON.stringify(restaurants, null, 2), "utf8");
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

async function writeDeletedRestaurantsFile(deletedIds: string[]): Promise<void> {
  await mkdir(path.dirname(deletedRestaurantsFilePath), { recursive: true });
  await writeFile(deletedRestaurantsFilePath, JSON.stringify(deletedIds, null, 2), "utf8");
}

async function getAllRestaurants(): Promise<Restaurant[]> {
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
  
  return [...filteredMockRestaurants, ...filteredDynamicRestaurants];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const allRestaurants = await getAllRestaurants();
  const restaurant = allRestaurants.find((r) => r.id === id);

  if (!restaurant) {
    return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });
  }

  return NextResponse.json(restaurant);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dynamicRestaurants = await readRestaurantsFile();
    const filteredRestaurants = dynamicRestaurants.filter((r) => r.id !== id);
    await writeRestaurantsFile(filteredRestaurants);

    // Dodaj ID u listu obrisanih restorana (kako se ne bi prikazivao ni mock verzija)
    const deletedIds = await readDeletedRestaurantsFile();
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      await writeDeletedRestaurantsFile(deletedIds);
    }

    return NextResponse.json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    return NextResponse.json(
      { message: "Error deleting restaurant", error: (error as Error).message },
      { status: 500 }
    );
  }
}

