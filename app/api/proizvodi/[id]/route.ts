import { NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
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
    const { id } = await params;
    const formData = await request.formData();
    const allProducts = await getAllProducts();
    const productIndex = allProducts.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const existingProduct = allProducts[productIndex];
    const priceValue = formData.get("price") as string;
    const weightValue = formData.get("weight") as string;
    // formData.get() uvijek vraća string ako polje postoji u formi (čak i ako je prazan)
    const descriptionValue = formData.get("description") as string;
    const storeValue = formData.get("store") as string;

    const updatedProduct: Product = {
      ...existingProduct,
      name: (formData.get("name") as string) || existingProduct.name,
      // Koristi poslanu vrijednost (može biti prazan string)
      description: descriptionValue,
      brand: (formData.get("brand") as string) || existingProduct.brand,
      category: (formData.get("category") as string) || existingProduct.category,
      // Ako je store prazan string, postavi na undefined
      store: storeValue || undefined,
      tags: formData.get("tags")
        ? JSON.parse(formData.get("tags") as string)
        : existingProduct.tags,
      certified: formData.get("certified") === "true",
      price: priceValue ? parseFloat(priceValue) : existingProduct.price,
      weight: weightValue ? parseInt(weightValue) : existingProduct.weight,
    };

    // Upload nove slike ako je dodana
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "images", "products");
      await mkdir(uploadDir, { recursive: true });
      const filename = `${updatedProduct.id}-${imageFile.name}`;
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, Buffer.from(await imageFile.arrayBuffer()));
      updatedProduct.image = `/images/products/${filename}`;
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
      { message: "Error updating product", error: (error as Error).message },
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
      { message: "Error deleting product", error: (error as Error).message },
      { status: 500 }
    );
  }
}

