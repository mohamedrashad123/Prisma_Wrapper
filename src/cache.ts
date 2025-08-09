// -------------------------
// FILE: src/cache.ts
// -------------------------
import type { CacheAdapter } from "./types";

/**
 * Simple local in-memory cache adapter.
 */
export class MemoryCache implements CacheAdapter {
  private store = new Map<string, { value: any; expiresAt?: number }>();

  get<T = any>(key: string): T | null {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value as T;
  }

  async set<T = any>(key: string, value: T, ttlSec?: number): Promise<void> {
    const expiresAt = ttlSec ? Date.now() + ttlSec * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}
