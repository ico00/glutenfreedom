import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Dodaj security headers na response
 */
export function addSecurityHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const isProduction = process.env.NODE_ENV === "production";
  const isHttps = request.headers.get("x-forwarded-proto") === "https" || 
                  request.url.startsWith("https://");

  // Content Security Policy
  // Prilagođeno za Next.js i aplikaciju
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval za Next.js dev mode
    "style-src 'self' 'unsafe-inline'", // unsafe-inline za Tailwind
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests", // Automatski upgrade HTTP na HTTPS
  ].join("; ");

  // Dodaj headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  
  // CSP samo u produkciji (u dev mode može biti previše restriktivan)
  if (isProduction) {
    response.headers.set("Content-Security-Policy", csp);
  }

  // HSTS samo u produkciji i samo za HTTPS
  if (isProduction && isHttps) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return response;
}

/**
 * Provjeri da li je zahtjev HTTPS i preusmjeri ako nije (samo u produkciji)
 */
export function enforceHttps(request: NextRequest): NextResponse | null {
  const isProduction = process.env.NODE_ENV === "production";
  
  if (!isProduction) {
    return null; // Ne provjeravaj u development
  }

  const protocol = request.headers.get("x-forwarded-proto") || 
                  (request.url.startsWith("https://") ? "https" : "http");

  if (protocol !== "https") {
    const httpsUrl = request.url.replace(/^http:/, "https:");
    return NextResponse.redirect(httpsUrl, 301);
  }

  return null;
}

