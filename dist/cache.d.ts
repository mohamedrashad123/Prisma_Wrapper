import type { CacheAdapter } from "./types";
/**
 * Simple local in-memory cache adapter.
 */
export declare class MemoryCache implements CacheAdapter {
    private store;
    get<T = any>(key: string): T | null;
    set<T = any>(key: string, value: T, ttlSec?: number): Promise<void>;
    del(key: string): Promise<void>;
}
