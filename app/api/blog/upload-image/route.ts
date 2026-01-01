import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { message: "No image file provided" },
        { status: 400 }
      );
    }

    // Upload slike u blog/content direktorij
    const uploadDir = path.join(process.cwd(), "public", "images", "blog", "content");
    await mkdir(uploadDir, { recursive: true });
    
    // Generiraj jedinstveni filename
    const fileExtension = imageFile.name.split(".").pop();
    const filename = `${randomUUID()}-${Date.now()}.${fileExtension}`;
    const filePath = path.join(uploadDir, filename);
    
    // Spremi sliku
    await writeFile(filePath, Buffer.from(await imageFile.arrayBuffer()));
    
    // Vrati URL slike
    const imageUrl = `/images/blog/content/${filename}`;
    
    return NextResponse.json({ 
      message: "Image uploaded successfully", 
      url: imageUrl 
    }, { status: 200 });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { message: "Error uploading image", error: (error as Error).message },
      { status: 500 }
    );
  }
}

