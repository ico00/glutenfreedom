import { NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
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

async function getAllProducts(): Promise<Product[]> {
  const dynamicProducts = await readProductsFile();
  const deletedIds = await readDeletedProductsFile();
  
  const filteredMockProducts = mockProducts.filter(
    (mockProduct) => 
      !dynamicProducts.some((dynamicProduct) => dynamicProduct.id === mockProduct.id) &&
      !deletedIds.includes(mockProduct.id)
  );
  
  const filteredDynamicProducts = dynamicProducts.filter(
    (product) => !deletedIds.includes(product.id)
  );
  
  return [...filteredMockProducts, ...filteredDynamicProducts];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const allProducts = await getAllProducts();
  const product = allProducts.find((p) => p.id === id);

  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
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
    const allProducts = await getAllProducts();
    const productIndex = allProducts.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const existingProduct = allProducts[productIndex];
    
    // Validiraj upload slike ako postoji
    const imageFile = formData.get("image") as File | null;
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
    const name = sanitizeString((formData.get("name") as string) || existingProduct.name, 200);
    const description = sanitizeString(formData.get("description") as string || "", 1000);
    const brand = sanitizeString((formData.get("brand") as string) || existingProduct.brand, 100);
    const category = sanitizeString((formData.get("category") as string) || existingProduct.category, 100);
    
    if (!name || name.length < 2) {
      return NextResponse.json(
        { message: "Naziv mora imati najmanje 2 znaka" },
        { status: 400 }
      );
    }

    const priceValue = formData.get("price") as string;
    const weightValue = formData.get("weight") as string;
    const weightUnit = formData.get("weightUnit") as "g" | "ml" | null;
    const storeValue = sanitizeString(formData.get("store") as string || "", 200);

    const updatedProduct: Product = {
      ...existingProduct,
      name,
      description,
      brand,
      category,
      store: storeValue || undefined,
      certified: formData.get("certified") === "true",
      price: priceValue ? parseFloat(priceValue) : existingProduct.price,
      weight: weightValue ? parseInt(weightValue) : existingProduct.weight,
      weightUnit: weightUnit === "g" || weightUnit === "ml" ? weightUnit : existingProduct.weightUnit,
    };

    // Upload nove slike ako je dodana
    if (imageFile && imageFile.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "images", "products");
      await mkdir(uploadDir, { recursive: true });
      const safeFilename = generateSafeFilename(imageFile.name, updatedProduct.id);
      const filePath = path.join(uploadDir, safeFilename);
      await writeFile(filePath, Buffer.from(await imageFile.arrayBuffer()));
      updatedProduct.image = `/images/products/${safeFilename}`;
    }

    const dynamicProducts = await readProductsFile();
    const dynamicIndex = dynamicProducts.findIndex((p) => p.id === id);

    if (dynamicIndex !== -1) {
      dynamicProducts[dynamicIndex] = updatedProduct;
      await writeProductsFile(dynamicProducts);
    } else {
      const isMockProduct = mockProducts.some((p) => p.id === id);
      if (isMockProduct) {
        const existingDuplicateIndex = dynamicProducts.findIndex((p) => p.id === id);
        if (existingDuplicateIndex !== -1) {
          dynamicProducts[existingDuplicateIndex] = updatedProduct;
        } else {
          dynamicProducts.push(updatedProduct);
        }
        await writeProductsFile(dynamicProducts);
      } else {
        return NextResponse.json(
          { message: "Product not found in database" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { message: "Error updating product" },
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
    const dynamicProducts = await readProductsFile();
    const filteredProducts = dynamicProducts.filter((p) => p.id !== id);
    await writeProductsFile(filteredProducts);

    // Dodaj ID u listu obrisanih proizvoda (kako se ne bi prikazivao ni mock verzija)
    const deletedIds = await readDeletedProductsFile();
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      await writeDeletedProductsFile(deletedIds);
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { message: "Error deleting product" },
      { status: 500 }
    );
  }
}

