import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/auth";
import { validateImageFile, generateSafeFilename } from "@/lib/security";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { verifyCsrfToken } from "@/lib/csrf";

export async function POST(request: Request) {
  try {
    // Provjeri autentifikaciju
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Provjeri rate limit (striktniji za upload)
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`upload-image-${clientIp}`, 10, 60000); // 10 uploada po minuti
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "Too many upload requests. Please try again later." },
        { 
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Provjeri CSRF token
    const csrfToken = request.headers.get("x-csrf-token");
    if (!csrfToken || !(await verifyCsrfToken(csrfToken))) {
      return NextResponse.json(
        { message: "Invalid CSRF token" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { message: "No image file provided" },
        { status: 400 }
      );
    }

    // Validiraj upload slike
    const validation = await validateImageFile(imageFile);
    if (!validation.valid) {
      return NextResponse.json(
        { message: validation.error },
        { status: 400 }
      );
    }

    // Upload slike u blog/content direktorij
    const uploadDir = path.join(process.cwd(), "public", "images", "blog", "content");
    await mkdir(uploadDir, { recursive: true });
    
    // Generiraj siguran filename
    const safeFilename = generateSafeFilename(imageFile.name, "content");
    const filePath = path.join(uploadDir, safeFilename);
    
    // Spremi sliku
    await writeFile(filePath, Buffer.from(await imageFile.arrayBuffer()));
    
    // Vrati URL slike
    const imageUrl = `/images/blog/content/${safeFilename}`;
    
    return NextResponse.json({ 
      message: "Image uploaded successfully", 
      url: imageUrl 
    }, { status: 200 });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { message: "Error uploading image" },
      { status: 500 }
    );
  }
}

