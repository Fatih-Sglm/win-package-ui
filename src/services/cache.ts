// Simple TTL-based localStorage cache service

const PREFIX = 'cache:'
const DEFAULT_TTL = 6 * 60 * 60 * 1000 // 6 hours
const CACHE_VERSION = 2 // Bump this to invalidate all cached data

interface CacheEntry<T> {
    data: T
    timestamp: number
    ttl: number
    version?: number
}

export const cacheService = {
    get<T>(key: string): T | null {
        try {
            const raw = localStorage.getItem(PREFIX + key)
            if (!raw) return null

            const entry: CacheEntry<T> = JSON.parse(raw)
            if ((entry.version || 0) < CACHE_VERSION) {
                localStorage.removeItem(PREFIX + key)
                return null
            }
            if (Date.now() - entry.timestamp > entry.ttl) {
                localStorage.removeItem(PREFIX + key)
                return null
            }

            return entry.data
        } catch {
            return null
        }
    },

    set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
        try {
            const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttl, version: CACHE_VERSION }
            localStorage.setItem(PREFIX + key, JSON.stringify(entry))
        } catch {
            // localStorage full or unavailable - silently ignore
        }
    },

    invalidate(key: string): void {
        localStorage.removeItem(PREFIX + key)
    },

    invalidatePrefix(prefix: string): void {
        const fullPrefix = PREFIX + prefix
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key?.startsWith(fullPrefix)) {
                keysToRemove.push(key)
            }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k))
    },

    clear(): void {
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key?.startsWith(PREFIX)) {
                keysToRemove.push(key)
            }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k))
    }
}
