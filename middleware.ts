import { auth } from "./auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { addSecurityHeaders, enforceHttps } from "./lib/securityHeaders";

export default auth((req) => {
  // Provjeri HTTPS enforcement
  const httpsRedirect = enforceHttps(req);
  if (httpsRedirect) {
    return addSecurityHeaders(httpsRedirect, req);
  }

  const { nextUrl } = req;
  const isProduction = process.env.NODE_ENV === "production";

  // U produkciji admin je isključen – samo javna read-only stranica
  if (isProduction) {
    if (nextUrl.pathname.startsWith("/admin") || nextUrl.pathname.startsWith("/login")) {
      const response = NextResponse.redirect(new URL("/", nextUrl.origin));
      return addSecurityHeaders(response, req);
    }
    const isModifyingApiInProd = nextUrl.pathname.startsWith("/api") &&
      ["POST", "PUT", "PATCH", "DELETE"].includes(req.method) &&
      (nextUrl.pathname.includes("/api/blog") ||
       nextUrl.pathname.includes("/api/recepti") ||
       nextUrl.pathname.includes("/api/restorani") ||
       nextUrl.pathname.includes("/api/proizvodi") ||
       nextUrl.pathname.includes("/api/ducani"));
    if (isModifyingApiInProd) {
      const response = NextResponse.json({ error: "Forbidden" }, { status: 403 });
      return addSecurityHeaders(response, req);
    }
  }

  const isLoggedIn = !!req.auth;
  const isOnAdmin = nextUrl.pathname.startsWith("/admin");
  const isOnApi = nextUrl.pathname.startsWith("/api");

  // Zahtjev mijenja podatke samo ako je POST/PUT/PATCH/DELETE na zaštićenim API rutama
  const isDataApi = isOnApi &&
    (nextUrl.pathname.includes("/api/blog") ||
     nextUrl.pathname.includes("/api/recepti") ||
     nextUrl.pathname.includes("/api/restorani") ||
     nextUrl.pathname.includes("/api/proizvodi") ||
     nextUrl.pathname.includes("/api/ducani"));
  const isModifyingMethod = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
  const isModifyingApi = isDataApi && isModifyingMethod;

  // GET na API (uključujući /api/blog, /api/recepti, itd.) – javno, bez prijave
  if (isOnApi && req.method === "GET") {
    const response = NextResponse.next();
    return addSecurityHeaders(response, req);
  }

  // Za admin stranice i zahtjeve koji mijenjaju podatke (POST/PUT/PATCH/DELETE) – zahtijevamo login
  if ((isOnAdmin || isModifyingApi) && !isLoggedIn) {
    // Ako je API zahtjev, vrati 401
    if (isOnApi) {
      const response = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
      return addSecurityHeaders(response, req);
    }
    
    // Ako je admin stranica, preusmjeri na login
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    return addSecurityHeaders(redirectResponse, req);
  }
  
  // Sve provjere prošle, dozvoli pristup
  const response = NextResponse.next();
  return addSecurityHeaders(response, req);
});

export const config = {
  // Pokrij sve rute da bi security headers bili na svim zahtjevima
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

