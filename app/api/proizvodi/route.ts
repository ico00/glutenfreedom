import { NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { Product } from "@/types";
import { mockProducts } from "@/data/mockData";
import { protectApiRoute } from "@/lib/apiAuth";
import { validateImageFile, generateSafeFilename, sanitizeString } from "@/lib/security";

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
    const description = sanitizeString(formData.get("description") as string, 1000);
    const brand = sanitizeString(formData.get("brand") as string, 100);
    const category = sanitizeString(formData.get("category") as string, 100);
    
    if (!name || name.length < 2) {
      return NextResponse.json(
        { message: "Naziv mora imati najmanje 2 znaka" },
        { status: 400 }
      );
    }

    const priceValue = formData.get("price") as string;
    const weightValue = formData.get("weight") as string;
    const weightUnit = formData.get("weightUnit") as "g" | "ml" | null;

    // Parsiraj tagove
    let tags: string[] = [];
    try {
      const tagsData = formData.get("tags") as string;
      if (tagsData) {
        tags = JSON.parse(tagsData);
        if (!Array.isArray(tags)) {
          tags = [];
        }
        tags = tags.map(tag => sanitizeString(tag, 50)).filter(Boolean);
      }
    } catch {
      tags = [];
    }

    const newProduct: Product = {
      id: randomUUID(),
      name,
      description,
      brand,
      category,
      store: sanitizeString(formData.get("store") as string || "", 200) || undefined,
      tags,
      certified: formData.get("certified") === "true",
      price: priceValue ? parseFloat(priceValue) : undefined,
      weight: weightValue ? parseInt(weightValue) : undefined,
      weightUnit: weightUnit === "g" || weightUnit === "ml" ? weightUnit : undefined,
      image: undefined,
    };

    // Upload slike
    if (imageFile && imageFile.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "images", "products");
      await mkdir(uploadDir, { recursive: true });
      const safeFilename = generateSafeFilename(imageFile.name, newProduct.id);
      const filePath = path.join(uploadDir, safeFilename);
      await writeFile(filePath, Buffer.from(await imageFile.arrayBuffer()));
      newProduct.image = `/images/products/${safeFilename}`;
    }

    const currentProducts = await readProductsFile();
    currentProducts.push(newProduct);
    await writeProductsFile(currentProducts);

    return NextResponse.json({ message: "Product added successfully", product: newProduct }, { status: 201 });
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json(
      { message: "Error adding product" },
      { status: 500 }
    );
  }
}

