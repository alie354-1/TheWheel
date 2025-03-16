/**
 * Simple in-memory cache service for LLM responses
 * This helps reduce API calls and improve response times
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export class CacheService<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private defaultTTL: number;
  private maxSize: number;
  
  /**
   * Create a new cache service
   * @param defaultTTL Default time to live in milliseconds (default: 5 minutes)
   * @param maxSize Maximum number of entries in the cache (default: 100)
   */
  constructor(defaultTTL = 5 * 60 * 1000, maxSize = 100) {
    this.defaultTTL = defaultTTL;
    this.maxSize = maxSize;
  }
  
  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns The cached value or undefined if not found or expired
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }
    
    // Check if the entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value;
  }
  
  /**
   * Set a value in the cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in milliseconds (optional, uses default if not provided)
   */
  set(key: string, value: T, ttl = this.defaultTTL): void {
    // If the cache is full, remove the oldest entry
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
  }
  
  /**
   * Check if a key exists in the cache and is not expired
   * @param key Cache key
   * @returns True if the key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    // Check if the entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  
  /**
   * Remove a value from the cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clear all entries from the cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get the number of entries in the cache
   */
  get size(): number {
    return this.cache.size;
  }
  
  /**
   * Get or set a value in the cache
   * If the key doesn't exist or is expired, the factory function is called to generate a new value
   * @param key Cache key
   * @param factory Function to generate a new value if not in cache
   * @param ttl Time to live in milliseconds (optional, uses default if not provided)
   * @returns The cached or newly generated value
   */
  async getOrSet(key: string, factory: () => Promise<T>, ttl = this.defaultTTL): Promise<T> {
    const cachedValue = this.get(key);
    
    if (cachedValue !== undefined) {
      return cachedValue;
    }
    
    const newValue = await factory();
    this.set(key, newValue, ttl);
    return newValue;
  }
}

// Create a singleton instance for LLM responses
export const llmCacheService = new CacheService<any>(10 * 60 * 1000); // 10 minute TTL
