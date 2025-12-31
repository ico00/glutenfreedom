import { NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { Product } from "@/types";
import { mockProducts } from "@/data/mockData";

const productsFilePath = path.join(process.cwd(), "data", "products.json");
const deletedProductsFilePath = path.join(process.cwd(), "data", "deletedProducts.json");

async function readProductsFile(): Promise<Product[]> {
  try {
    if (existsSync(productsFilePath)) {
      const fileContents = await readFile(productsFilePath, "utf-8");
      return JSON.parse(fileContents);
    }
    return [];
  } catch (error) {
    console.error("Error reading products file:", error);
    return [];
  }
}

async function readDeletedProductsFile(): Promise<string[]> {
  try {
    if (existsSync(deletedProductsFilePath)) {
      const fileContents = await readFile(deletedProductsFilePath, "utf-8");
      return JSON.parse(fileContents);
    }
    return [];
  } catch (error) {
    console.error("Error reading deleted products file:", error);
    return [];
  }
}

async function writeProductsFile(products: Product[]): Promise<void> {
  await mkdir(path.dirname(productsFilePath), { recursive: true });
  await writeFile(productsFilePath, JSON.stringify(products, null, 2), "utf8");
}

async function writeDeletedProductsFile(deletedIds: string[]): Promise<void> {
  await mkdir(path.dirname(deletedProductsFilePath), { recursive: true });
  await writeFile(deletedProductsFilePath, JSON.stringify(deletedIds, null, 2), "utf8");
}

export async function GET() {
  const dynamicProducts = await readProductsFile();
  const deletedIds = await readDeletedProductsFile();
  
  // Filtriraj mock proizvode - ako postoji dinamički proizvod s istim ID-om, koristi dinamički
  // Također, filtriraj obrisane proizvode
  const filteredMockProducts = mockProducts.filter(
    (mockProduct) => 
      !dynamicProducts.some((dynamicProduct) => dynamicProduct.id === mockProduct.id) &&
      !deletedIds.includes(mockProduct.id)
  );
  
  // Filtriraj i dinamičke proizvode koji su obrisani
  const filteredDynamicProducts = dynamicProducts.filter(
    (product) => !deletedIds.includes(product.id)
  );
  
  return NextResponse.json([...filteredMockProducts, ...filteredDynamicProducts]);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    const priceValue = formData.get("price") as string;
    const weightValue = formData.get("weight") as string;

    const newProduct: Product = {
      id: randomUUID(),
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      brand: formData.get("brand") as string,
      category: formData.get("category") as string,
      store: formData.get("store") as string || undefined,
      tags: JSON.parse(formData.get("tags") as string),
      certified: formData.get("certified") === "true",
      price: priceValue ? parseFloat(priceValue) : undefined,
      weight: weightValue ? parseInt(weightValue) : undefined,
      image: undefined,
    };

    // Upload slike
    if (imageFile && imageFile.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "images", "products");
      await mkdir(uploadDir, { recursive: true });
      const filename = `${newProduct.id}-${imageFile.name}`;
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, Buffer.from(await imageFile.arrayBuffer()));
      newProduct.image = `/images/products/${filename}`;
    }

    const currentProducts = await readProductsFile();
    currentProducts.push(newProduct);
    await writeProductsFile(currentProducts);

    return NextResponse.json({ message: "Product added successfully", product: newProduct }, { status: 201 });
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json(
      { message: "Error adding product", error: (error as Error).message },
      { status: 500 }
    );
  }
}

