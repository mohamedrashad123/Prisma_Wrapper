"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryCache = void 0;
/**
 * Simple local in-memory cache adapter.
 */
class MemoryCache {
    constructor() {
        this.store = new Map();
    }
    get(key) {
        const item = this.store.get(key);
        if (!item)
            return null;
        if (item.expiresAt && Date.now() > item.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return item.value;
    }
    async set(key, value, ttlSec) {
        const expiresAt = ttlSec ? Date.now() + ttlSec * 1000 : undefined;
        this.store.set(key, { value, expiresAt });
    }
    async del(key) {
        this.store.delete(key);
    }
}
exports.MemoryCache = MemoryCache;
