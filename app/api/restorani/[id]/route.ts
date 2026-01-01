import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir, unlink } from "fs/promises";
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const dynamicRestaurants = await readRestaurantsFile();
    const restaurantIndex = dynamicRestaurants.findIndex((r) => r.id === id);

    if (restaurantIndex === -1) {
      return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });
    }

    const existingRestaurant = dynamicRestaurants[restaurantIndex];
    const imageFile = formData.get("image") as File | null;
    const imageRemoved = formData.get("image_removed") === "true";

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

    // Ažuriraj podatke
    const cuisineValue = formData.get("cuisine") as string;
    const updatedRestaurant: Restaurant = {
      ...existingRestaurant,
      name: formData.get("name") as string,
      description: formData.get("description") as string || "",
      address: addresses.length === 1 ? addresses[0] : addresses, // Ako je jedna adresa, spremi kao string za backward compatibility
      phone: formData.get("phone") as string || undefined,
      website: formData.get("website") as string || undefined,
      facebook: formData.get("facebook") as string || undefined,
      instagram: formData.get("instagram") as string || undefined,
      tiktok: formData.get("tiktok") as string || undefined,
      cuisine: cuisineValue ? [cuisineValue] : [],
    };

    // Obradi sliku
    if (imageFile && imageFile.size > 0) {
      // Obriši staru sliku ako postoji
      if (existingRestaurant.image && existingRestaurant.image.startsWith("/images/restaurants/")) {
        const oldImagePath = path.join(process.cwd(), "public", existingRestaurant.image);
        if (existsSync(oldImagePath)) {
          await unlink(oldImagePath);
        }
      }

      // Upload nove slike
      const uploadDir = path.join(process.cwd(), "public", "images", "restaurants");
      await mkdir(uploadDir, { recursive: true });
      const filename = `${id}-${imageFile.name}`;
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, Buffer.from(await imageFile.arrayBuffer()));
      updatedRestaurant.image = `/images/restaurants/${filename}`;
    } else if (imageRemoved) {
      // Obriši sliku ako je eksplicitno uklonjena
      if (existingRestaurant.image && existingRestaurant.image.startsWith("/images/restaurants/")) {
        const oldImagePath = path.join(process.cwd(), "public", existingRestaurant.image);
        if (existsSync(oldImagePath)) {
          await unlink(oldImagePath);
        }
      }
      updatedRestaurant.image = undefined;
    } else {
      // Zadrži postojeću sliku
      updatedRestaurant.image = existingRestaurant.image;
    }

    dynamicRestaurants[restaurantIndex] = updatedRestaurant;
    await writeRestaurantsFile(dynamicRestaurants);

    return NextResponse.json({ message: "Restaurant updated successfully", restaurant: updatedRestaurant });
  } catch (error) {
    console.error("Error updating restaurant:", error);
    return NextResponse.json(
      { message: "Error updating restaurant", error: (error as Error).message },
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

