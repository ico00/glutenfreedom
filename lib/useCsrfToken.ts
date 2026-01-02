"use client";

import { useState, useEffect } from "react";
import { getCsrfToken } from "./csrfClient";

/**
 * Hook za dobivanje CSRF tokena
 */
export function useCsrfToken() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchToken() {
      try {
        const token = await getCsrfToken();
        setCsrfToken(token);
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchToken();
  }, []);

  return { csrfToken, isLoading };
}

/**
 * Helper funkcija za fetch s CSRF tokenom
 */
export async function fetchWithCsrf(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const csrfToken = await getCsrfToken();
  
  const headers = new Headers(options.headers);
  if (csrfToken) {
    headers.set("x-csrf-token", csrfToken);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

