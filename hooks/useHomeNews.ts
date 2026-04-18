import { useCallback, useEffect, useState } from 'react';

import {
  fetchOrbitNews,
  ORBIT_NEWS_REFRESH_MS,
  prefetchOrbitNews,
} from '../services/news/newsService';
import type {
  OrbitNewsCategory,
  OrbitNewsItem,
  OrbitNewsProvider,
} from '../services/news/types';
import { useOrbitStore } from '../store/useOrbitStore';

export function useHomeNews(
  category: OrbitNewsCategory,
  limit = 5,
  refreshIntervalMs = ORBIT_NEWS_REFRESH_MS,
) {
  const language = useOrbitStore((state) => state.settings.language);
  const [items, setItems] = useState<OrbitNewsItem[]>([]);
  const [provider, setProvider] = useState<OrbitNewsProvider>('unavailable');
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(0);

  const loadNews = useCallback(
    async (silent = false, forceRefresh = false) => {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const result = await fetchOrbitNews(category, limit, { forceRefresh, language });
        setItems(result.items);
        setProvider(result.provider);
        setLive(result.live);
        setFromCache(Boolean(result.fromCache));
        setLastUpdatedAt(result.fetchedAt);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [category, language, limit],
  );

  useEffect(() => {
    void loadNews();
  }, [loadNews]);

  useEffect(() => {
    const otherCategories: OrbitNewsCategory[] = ['crypto', 'economy', 'politics', 'technology'].filter(
      (item) => item !== category,
    ) as OrbitNewsCategory[];

    void prefetchOrbitNews(otherCategories, limit);
  }, [category, limit]);

  useEffect(() => {
    const timer = setInterval(() => {
      void loadNews(true, true);
    }, refreshIntervalMs);

    return () => {
      clearInterval(timer);
    };
  }, [loadNews, refreshIntervalMs]);

  return {
    items,
    provider,
    live,
    loading,
    refreshing,
    fromCache,
    lastUpdatedAt,
    refresh: () => loadNews(true, true),
  };
}
