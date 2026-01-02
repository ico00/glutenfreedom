"use client";

/**
 * Dobij CSRF token iz cookie (client-side)
 */
export async function getCsrfToken(): Promise<string | null> {
  try {
    const response = await fetch("/api/csrf-token", {
      credentials: "include",
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.token || null;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    return null;
  }
}

