/**
 * Jednostavan in-memory cache za API odgovore
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live u milisekundama
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Dohvati podatke iz cache-a
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Provjeri da li je cache istekao
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Spremi podatke u cache
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Obriši podatke iz cache-a
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Obriši sve podatke iz cache-a
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Očisti istekle cache unose
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance
const cache = new SimpleCache();

// Očisti cache svakih 10 minuta
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    cache.cleanup();
  }, 10 * 60 * 1000);
}

/**
 * Cache helper za API rute
 */
export function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minuta default
): Promise<T> {
  const cached = cache.get<T>(key);

  if (cached !== null) {
    return Promise.resolve(cached);
  }

  return fetcher().then((data) => {
    cache.set(key, data, ttl);
    return data;
  });
}

/**
 * Invalidate cache entry
 */
export function invalidateCache(key: string): void {
  cache.delete(key);
}

/**
 * Invalidate all cache
 */
export function clearCache(): void {
  cache.clear();
}

export default cache;

