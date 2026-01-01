import { NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { Store } from "@/types";
import { mockStores } from "@/data/mockData";

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
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    const newStore: Store = {
      id: randomUUID(),
      name: formData.get("name") as string,
      description: formData.get("description") as string || "",
      address: formData.get("address") as string,
      phone: formData.get("phone") as string || undefined,
      website: formData.get("website") as string || undefined,
      type: (formData.get("type") as "dućan" | "online" | "oboje") || "dućan",
      image: undefined,
    };

    // Upload slike ako postoji
    if (imageFile && imageFile.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "images", "stores");
      await mkdir(uploadDir, { recursive: true });
      const filename = `${newStore.id}-${imageFile.name}`;
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, Buffer.from(await imageFile.arrayBuffer()));
      newStore.image = `/images/stores/${filename}`;
    }

    // Spremi u JSON fajl
    const currentStores = await readStoresFile();
    currentStores.push(newStore);
    await writeStoresFile(currentStores);

    return NextResponse.json({ message: "Store added successfully", store: newStore }, { status: 201 });
  } catch (error) {
    console.error("Error adding store:", error);
    return NextResponse.json(
      { message: "Error adding store", error: (error as Error).message },
      { status: 500 }
    );
  }
}

