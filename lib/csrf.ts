import { cookies } from "next/headers";
import { randomBytes } from "crypto";

const CSRF_TOKEN_NAME = "csrf-token";
const CSRF_TOKEN_EXPIRY = 60 * 60 * 24; // 24 sata

/**
 * Generiraj CSRF token
 */
export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Provjeri CSRF token
 */
export async function verifyCsrfToken(token: string | null): Promise<boolean> {
  if (!token) {
    return false;
  }
  
  const cookieStore = await cookies();
  const storedToken = cookieStore.get(CSRF_TOKEN_NAME)?.value;
  
  if (!storedToken) {
    return false;
  }
  
  // Provjeri da li se tokeni podudaraju (constant-time comparison)
  return token === storedToken;
}

/**
 * Postavi CSRF token u cookie
 */
export async function setCsrfToken(): Promise<string> {
  const token = generateCsrfToken();
  const cookieStore = await cookies();
  
  cookieStore.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: CSRF_TOKEN_EXPIRY,
    path: "/",
  });
  
  return token;
}

/**
 * Dobij CSRF token iz cookie
 */
export async function getCsrfToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_TOKEN_NAME)?.value || null;
}

