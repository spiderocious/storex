import NodeCache from 'node-cache';

const cache = new NodeCache();

interface CacheOptions {
  expiresIn?: number; // Time in milliseconds
}

/**
 * Gets data from cache or executes the function to retrieve it
 * @param key The cache key
 * @param executor Function to execute if data isn't in cache
 * @param options Cache options including expiry time in milliseconds
 * @returns The cached or newly retrieved data
 */
export const getFromCache = async <T>(
  key: string,
  executor: () => Promise<T>,
  options?: CacheOptions
): Promise<T> => {
  const value = cache.get<T>(key);
  if (value !== undefined) {
    return value;
  }

  const result = await executor();
  if (!result) return result;
  if (options?.expiresIn) {
    cache.set(key, result, Math.ceil(options.expiresIn / 1000)); // NodeCache uses seconds
  } else {
    cache.set(key, result);
  }

  return result;
};

/**
 * Stores data in the cache with optional expiration
 * @param key The cache key
 * @param value The value to store
 * @param options Cache options including expiry time in milliseconds
 */
export const storeInCache = <T>(key: string, value: T, options?: CacheOptions): void => {
  if (options?.expiresIn) {
    cache.set(key, value, Math.ceil(options.expiresIn / 1000)); // NodeCache uses seconds
  } else {
    cache.set(key, value);
  }
};

/**
 * Deletes data from the cache
 * @param key The cache key to delete
 * @returns Boolean indicating if the key was found and deleted
 */
export const deleteFromCache = (key: string): boolean => {
  return cache.del(key) > 0;
};

/**
 * Clears the entire cache
 */
export const clearCache = (): void => {
  cache.flushAll();
};

/**
 * Gets cache statistics
 * @returns Object with cache stats
 */
export const getCacheStats = () => {
  return cache.getStats();
};

/**
 * Retrieves data from cache by key
 * @param key The cache key
 * @returns The cached value or undefined if not found
 */
export const getCache = <T>(key: string): T | undefined => {
  return cache.get<T>(key);
};

/**
 * Gets the remaining TTL (time to live) for a key in milliseconds
 * @param key The cache key
 * @returns The remaining TTL in milliseconds or -1 if no TTL, -2 if key not found
 */
export const getCacheTTL = (key: string): number => {
  const ttl = cache.getTtl(key);
  if (ttl === undefined) {
    return -2; // Key not found
  }
  if (ttl === 0) {
    return -1; // No expiration
  }
  return Math.max(0, ttl - Date.now()); // Convert to milliseconds remaining
};

/**
 * Checks if a key exists in the cache
 * @param key The cache key
 * @returns Boolean indicating if the key exists
 */
export const hasCache = (key: string): boolean => {
  return cache.has(key);
};

/**
 * Updates the expiry time for an existing key
 * @param key The cache key
 * @param expiresIn Time in milliseconds until expiration
 * @returns Boolean indicating if the TTL was successfully updated
 */
export const updateCacheExpiry = (key: string, expiresIn: number): boolean => {
  return cache.ttl(key, Math.ceil(expiresIn / 1000));
};
