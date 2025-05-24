/**
 * Simple In-Memory Cache Utility
 * 
 * Provides basic caching functionality with time-to-live (TTL) support.
 * Note: This is a very basic implementation. For production, consider
 * more robust libraries or strategies (e.g., using localStorage with size limits,
 * dedicated caching services, or libraries like TanStack Query's built-in caching).
 */

interface CacheEntry<T> {
  data: T;
  expiry: number; // Timestamp when the entry expires
}

const cache = new Map<string, CacheEntry<any>>();

const DEFAULT_TTL_MS = 5 * 60 * 1000; // Default 5 minutes

/**
 * Retrieves an item from the cache. Returns null if the item
 * doesn't exist or has expired.
 *
 * @param key - The cache key.
 * @returns The cached data or null.
 */
export function getCache<T>(key: string): T | null {
  const entry = cache.get(key);

  if (!entry) {
    return null; // Not found
  }

  if (Date.now() > entry.expiry) {
    cache.delete(key); // Expired
    return null;
  }

  return entry.data as T;
}

/**
 * Adds or updates an item in the cache.
 *
 * @param key - The cache key.
 * @param data - The data to cache.
 * @param ttlMs - Optional time-to-live in milliseconds. Defaults to DEFAULT_TTL_MS.
 */
export function setCache<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
  const expiry = Date.now() + ttlMs;
  const entry: CacheEntry<T> = { data, expiry };
  cache.set(key, entry);
}

/**
 * Removes an item from the cache.
 *
 * @param key - The cache key to remove.
 */
export function invalidateCache(key: string): void {
  cache.delete(key);
}

/**
 * Clears the entire cache.
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * A higher-order function to wrap an async function with caching.
 *
 * @param keyPrefix - A prefix for the cache key.
 * @param fn - The async function to wrap.
 * @param ttlMs - Optional TTL for cached results.
 * @returns A new async function that uses the cache.
 */
export function withCache<TArgs extends any[], TResult>(
  keyPrefix: string,
  fn: (...args: TArgs) => Promise<TResult>,
  ttlMs: number = DEFAULT_TTL_MS
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    // Generate a cache key based on prefix and arguments
    // Simple serialization - might need improvement for complex objects
    const argsString = JSON.stringify(args);
    const cacheKey = `${keyPrefix}:${argsString}`;

    const cachedData = getCache<TResult>(cacheKey);
    if (cachedData !== null) {
      // console.log(`[Cache Hit] Key: ${cacheKey}`);
      return cachedData;
    }

    // console.log(`[Cache Miss] Key: ${cacheKey}`);
    const result = await fn(...args);

    // Cache the result only if it's not null/undefined (or handle errors appropriately)
    if (result !== null && result !== undefined) {
      setCache(cacheKey, result, ttlMs);
    }

    return result;
  };
}

// Example Usage:
/*
import { withCache } from './cache';

async function fetchExpensiveData(userId: string): Promise<{ data: string } | null> {
  console.log('Fetching expensive data for user:', userId);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  return { data: `User data for ${userId}` };
}

const cachedFetchExpensiveData = withCache('expensiveData', fetchExpensiveData, 60000); // Cache for 1 minute

async function runExample() {
  console.log('First call:');
  const data1 = await cachedFetchExpensiveData('user123');
  console.log(data1);

  console.log('\nSecond call (should be cached):');
  const data2 = await cachedFetchExpensiveData('user123');
  console.log(data2);

  console.log('\nThird call with different arg:');
  const data3 = await cachedFetchExpensiveData('user456');
  console.log(data3);
}

runExample();
*/
