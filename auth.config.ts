import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnApi = nextUrl.pathname.startsWith("/api");
      
      // Za API rute koje mijenjaju podatke, zahtijevamo autentifikaciju
      const isModifyingApi = isOnApi && 
        (nextUrl.pathname.includes("/api/blog") ||
         nextUrl.pathname.includes("/api/recepti") ||
         nextUrl.pathname.includes("/api/restorani") ||
         nextUrl.pathname.includes("/api/proizvodi") ||
         nextUrl.pathname.includes("/api/ducani"));
      
      const isModifyingMethod = ["POST", "PUT", "DELETE", "PATCH"].includes(
        nextUrl.searchParams.get("_method") || ""
      );
      
      // Ako je GET zahtjev na API, dozvoli pristup
      if (isOnApi && !isModifyingApi) {
        return true;
      }
      
      // Za admin stranice i modificirajuće API rute, zahtijevamo login
      if (isOnAdmin || isModifyingApi) {
        if (isLoggedIn) return true;
        return false; // Preusmjeri na login
      }
      
      return true;
    },
  },
  providers: [], // Dodat ćemo providers u auth.ts
} satisfies NextAuthConfig;

