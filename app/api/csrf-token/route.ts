import { NextResponse } from "next/server";
import { getCsrfToken, setCsrfToken } from "@/lib/csrf";

export async function GET() {
  try {
    let token = await getCsrfToken();
    
    // Ako nema tokena, generiraj novi
    if (!token) {
      token = await setCsrfToken();
    }
    
    return NextResponse.json({ token });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate CSRF token" },
      { status: 500 }
    );
  }
}

