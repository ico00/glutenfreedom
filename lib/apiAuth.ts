import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { verifyCsrfToken } from "@/lib/csrf";

interface AuthOptions {
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  requireCsrf?: boolean;
}

/**
 * Provjeri autentifikaciju, rate limit i CSRF za API zahtjev
 */
export async function protectApiRoute(
  request: Request,
  options: AuthOptions = {}
): Promise<NextResponse | null> {
  const {
    rateLimit = { maxRequests: 10, windowMs: 60000 },
    requireCsrf = true,
  } = options;

  // Provjeri autentifikaciju
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  // Provjeri rate limit
  const clientIp = getClientIp(request);
  const rateLimitKey = `${request.method}-${request.url}`;
  const rateLimitResult = checkRateLimit(rateLimitKey, rateLimit.maxRequests, rateLimit.windowMs);
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { message: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // Provjeri CSRF token
  if (requireCsrf) {
    const csrfToken = request.headers.get("x-csrf-token");
    if (!csrfToken || !(await verifyCsrfToken(csrfToken))) {
      return NextResponse.json(
        { message: "Invalid CSRF token" },
        { status: 403 }
      );
    }
  }

  // Sve provjere prošle
  return null;
}

