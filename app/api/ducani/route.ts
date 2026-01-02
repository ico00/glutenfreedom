import { NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
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

export async function GET() {
  const dynamicStores = await readStoresFile();
  const deletedIds = await readDeletedStoresFile();
  
  // Filtriraj mock dućane - ako postoji dinamički dućan s istim ID-om, koristi dinamički
  // Također filtriraj obrisane dućane
  const filteredMockStores = mockStores.filter(
    (mockStore) => 
      !dynamicStores.some((dynamicStore) => dynamicStore.id === mockStore.id) &&
      !deletedIds.includes(mockStore.id)
  );
  
  // Filtriraj dinamičke dućane - samo oni koji nisu obrisani
  const filteredDynamicStores = dynamicStores.filter(
    (store) => !deletedIds.includes(store.id)
  );
  
  return NextResponse.json([...filteredMockStores, ...filteredDynamicStores]);
}

export async function POST(request: Request) {
  try {
    // Provjeri autentifikaciju, rate limit i CSRF
    const authError = await protectApiRoute(request, {
      rateLimit: { maxRequests: 5, windowMs: 60000 },
    });
    if (authError) {
      return authError;
    }

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

    const newStore: Store = {
      id: randomUUID(),
      name,
      description,
      address,
      phone: sanitizeString(formData.get("phone") as string || "", 50) || undefined,
      website: sanitizeString(formData.get("website") as string || "", 500) || undefined,
      type: (formData.get("type") as "dućan" | "online" | "oboje") || "dućan",
      image: undefined,
    };

    // Upload slike ako postoji
    if (imageFile && imageFile.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "images", "stores");
      await mkdir(uploadDir, { recursive: true });
      const safeFilename = generateSafeFilename(imageFile.name, newStore.id);
      const filePath = path.join(uploadDir, safeFilename);
      await writeFile(filePath, Buffer.from(await imageFile.arrayBuffer()));
      newStore.image = `/images/stores/${safeFilename}`;
    }

    // Spremi u JSON fajl
    const currentStores = await readStoresFile();
    currentStores.push(newStore);
    await writeStoresFile(currentStores);

    return NextResponse.json({ message: "Store added successfully", store: newStore }, { status: 201 });
  } catch (error) {
    console.error("Error adding store:", error);
    return NextResponse.json(
      { message: "Error adding store" },
      { status: 500 }
    );
  }
}

