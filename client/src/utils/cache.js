// Global in-memory cache for GET queries with automatic invalidation on mutations
export const apiCache = new Map();

// Clears all cached responses on mutation (POST/PUT/PATCH/DELETE) and auth state changes
export const clearApiCache = () => {
  apiCache.clear();
};
