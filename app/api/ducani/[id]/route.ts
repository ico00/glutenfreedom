import { NextResponse } from "next/server";
import { readFile, writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { Store } from "@/types";
import { mockStores } from "@/data/mockData";
import { protectApiRoute } from "@/lib/apiAuth";
import { validateImageFile, generateSafeFilename, sanitizeString } from "@/lib/security";

const storesFilePath = path.join(process.cwd(), "data", "stores.json");
const deletedStoresFilePath = path.join(process.cwd(), "data", "deletedStores.json");

async function readStoresFile(): Promise<Store[]> {
  try {
    if (existsSync(storesFilePath)) {
      const fileContents = await readFile(storesFilePath, "utf-8");
      return JSON.parse(fileContents);
    }
    return [];
  } catch (error) {
    console.error("Error reading stores file:", error);
    return [];
  }
}

async function readDeletedStoresFile(): Promise<string[]> {
  try {
    if (existsSync(deletedStoresFilePath)) {
      const fileContents = await readFile(deletedStoresFilePath, "utf-8");
      return JSON.parse(fileContents);
    }
    return [];
  } catch (error) {
    console.error("Error reading deleted stores file:", error);
    return [];
  }
}

async function writeStoresFile(stores: Store[]): Promise<void> {
  await mkdir(path.dirname(storesFilePath), { recursive: true });
  await writeFile(storesFilePath, JSON.stringify(stores, null, 2), "utf8");
}

async function writeDeletedStoresFile(deletedIds: string[]): Promise<void> {
  await mkdir(path.dirname(deletedStoresFilePath), { recursive: true });
  await writeFile(deletedStoresFilePath, JSON.stringify(deletedIds, null, 2), "utf8");
}

async function getAllStores(): Promise<Store[]> {
  const dynamicStores = await readStoresFile();
  const deletedIds = await readDeletedStoresFile();
  
  const filteredMockStores = mockStores.filter(
    (mockStore) => 
      !dynamicStores.some((dynamicStore) => dynamicStore.id === mockStore.id) &&
      !deletedIds.includes(mockStore.id)
  );
  
  const filteredDynamicStores = dynamicStores.filter(
    (store) => !deletedIds.includes(store.id)
  );
  
  return [...filteredMockStores, ...filteredDynamicStores];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const allStores = await getAllStores();
  const store = allStores.find((s) => s.id === id);

  if (!store) {
    return NextResponse.json({ message: "Store not found" }, { status: 404 });
  }

  return NextResponse.json(store);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Provjeri autentifikaciju, rate limit i CSRF
    const authError = await protectApiRoute(request, {
      rateLimit: { maxRequests: 10, windowMs: 60000 },
    });
    if (authError) {
      return authError;
    }

    const { id } = await params;
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    // Validiraj upload slike ako postoji
    if (imageFile && imageFile.size > 0) {
      const validation = await validateImageFile(imageFile);
      if (!validation.valid) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400 }
        );
      }
    }

    const currentStores = await readStoresFile();
    const storeIndex = currentStores.findIndex((s) => s.id === id);

    if (storeIndex === -1) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 });
    }

    const existingStore = currentStores[storeIndex];

    let imageUrl = existingStore.image;
    const imageRemoved = formData.get("image_removed") === "true";

    if (imageFile && imageFile.size > 0) {
      // Upload nove slike
      const uploadDir = path.join(process.cwd(), "public", "images", "stores");
      await mkdir(uploadDir, { recursive: true });
      const safeFilename = generateSafeFilename(imageFile.name, id);
      const filePath = path.join(uploadDir, safeFilename);
      await writeFile(filePath, Buffer.from(await imageFile.arrayBuffer()));
      imageUrl = `/images/stores/${safeFilename}`;
    } else if (imageRemoved && existingStore.image) {
      // Obriši postojeću sliku
      const imagePath = path.join(process.cwd(), "public", existingStore.image);
      try {
        if (existsSync(imagePath)) {
          await unlink(imagePath);
        }
      } catch (error) {
        console.error("Error deleting image:", error);
      }
      imageUrl = undefined;
    }

    // Sanitiziraj i validiraj inpute
    const name = sanitizeString(formData.get("name") as string, 200);
    const description = sanitizeString(formData.get("description") as string || "", 1000);
    const address = sanitizeString(formData.get("address") as string, 500);
    
    if (!name || name.length < 2) {
      return NextResponse.json(
        { message: "Naziv mora imati najmanje 2 znaka" },
        { status: 400 }
      );
    }

    const updatedStore: Store = {
      ...existingStore,
      name,
      description,
      address,
      phone: sanitizeString(formData.get("phone") as string || "", 50) || undefined,
      website: sanitizeString(formData.get("website") as string || "", 500) || undefined,
      type: (formData.get("type") as "dućan" | "online" | "oboje") || "dućan",
      image: imageUrl,
    };

    currentStores[storeIndex] = updatedStore;
    await writeStoresFile(currentStores);

    return NextResponse.json({ message: "Store updated successfully", store: updatedStore });
  } catch (error) {
    console.error("Error updating store:", error);
    return NextResponse.json(
      { message: "Error updating store" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Provjeri autentifikaciju, rate limit i CSRF
    const authError = await protectApiRoute(request, {
      rateLimit: { maxRequests: 5, windowMs: 60000 },
    });
    if (authError) {
      return authError;
    }

    const { id } = await params;
    const currentStores = await readStoresFile();
    const filteredStores = currentStores.filter((s) => s.id !== id);
    await writeStoresFile(filteredStores);

    // Dodaj ID u listu obrisanih dućana (kako se ne bi prikazivao ni mock verzija)
    const deletedIds = await readDeletedStoresFile();
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      await writeDeletedStoresFile(deletedIds);
    }

    return NextResponse.json({ message: "Store deleted successfully" });
  } catch (error) {
    console.error("Error deleting store:", error);
    return NextResponse.json(
      { message: "Error deleting store" },
      { status: 500 }
    );
  }
}

