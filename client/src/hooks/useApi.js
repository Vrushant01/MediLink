import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import { apiCache, clearApiCache } from '../utils/cache';

export { clearApiCache };

// Stale-while-revalidate API fetching hook with in-memory caching and zero-flash refetches
export function useApi(url, params = null) {
  // Stringify params to ensure clean, stable dependency tracking
  const paramsKey = params ? JSON.stringify(params) : '';
  const cacheKey = url ? `${url}?${paramsKey}` : '';

  // Initialize with cached data if available for instant rendering
  const initialCached = cacheKey ? apiCache.get(cacheKey) : null;
  const [data, setData] = useState(initialCached || null);
  const [isFetching, setIsFetching] = useState(!initialCached);
  const [error, setError] = useState(null);

  // Keep a reference to latest data to avoid resetting to null during param transitions
  const dataRef = useRef(data);
  dataRef.current = data;

  const fetchData = useCallback(async () => {
    if (!url) return;
    setIsFetching(true);
    setError(null);

    try {
      const response = await api.get(url, {
        params: params || undefined,
      });
      apiCache.set(cacheKey, response.data);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Request failed');
    } finally {
      setIsFetching(false);
    }
  }, [url, paramsKey, cacheKey]);

  useEffect(() => {
    if (!url) return;

    // Immediately display cached data on key change if present
    const entry = apiCache.get(cacheKey);
    if (entry) {
      setData(entry);
    }

    fetchData();
  }, [fetchData, cacheKey]);

  // Loading is true ONLY on initial cold load when there is zero data
  const loading = !data && isFetching;
  const isRefetching = Boolean(data && isFetching);

  return {
    data,
    loading,
    isRefetching,
    error,
    reload: fetchData,
  };
}

export default useApi;
