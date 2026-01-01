import { NextResponse } from "next/server";
import { readFile, writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
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
    const { id } = await params;
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

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
      const filename = `${id}-${imageFile.name}`;
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, Buffer.from(await imageFile.arrayBuffer()));
      imageUrl = `/images/stores/${filename}`;
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

    const updatedStore: Store = {
      ...existingStore,
      name: formData.get("name") as string,
      description: formData.get("description") as string || "",
      address: formData.get("address") as string,
      phone: formData.get("phone") as string || undefined,
      website: formData.get("website") as string || undefined,
      type: (formData.get("type") as "dućan" | "online" | "oboje") || "dućan",
      image: imageUrl,
    };

    currentStores[storeIndex] = updatedStore;
    await writeStoresFile(currentStores);

    return NextResponse.json({ message: "Store updated successfully", store: updatedStore });
  } catch (error) {
    console.error("Error updating store:", error);
    return NextResponse.json(
      { message: "Error updating store", error: (error as Error).message },
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
      { message: "Error deleting store", error: (error as Error).message },
      { status: 500 }
    );
  }
}

