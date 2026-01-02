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
  const isLoggedIn = !!req.auth;
  const isOnAdmin = nextUrl.pathname.startsWith("/admin");
  const isOnApi = nextUrl.pathname.startsWith("/api");
  
  // Provjeri da li je modificirajući API zahtjev
  const isModifyingApi = isOnApi && 
    (nextUrl.pathname.includes("/api/blog") ||
     nextUrl.pathname.includes("/api/recepti") ||
     nextUrl.pathname.includes("/api/restorani") ||
     nextUrl.pathname.includes("/api/proizvodi") ||
     nextUrl.pathname.includes("/api/ducani"));
  
  // Ako je GET zahtjev na API, dozvoli pristup
  if (isOnApi && req.method === "GET" && !isModifyingApi) {
    const response = NextResponse.next();
    return addSecurityHeaders(response, req);
  }
  
  // Za admin stranice i modificirajuće API rute, zahtijevamo login
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

