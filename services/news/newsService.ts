import AsyncStorage from '@react-native-async-storage/async-storage';

import type { LanguageCode } from '../../types';
import { fetchCryptoNews } from './feeds/cryptoNewsService';
import { fetchEconomyNews } from './feeds/economyNewsService';
import { fetchPoliticsNews } from './feeds/politicsNewsService';
import { fetchTechnologyNews } from './feeds/technologyNewsService';
import { translateOrbitNewsItems } from './translationService';
import type { OrbitNewsCategory, OrbitNewsItem, OrbitNewsResult } from './types';

const NEWS_CACHE_PREFIX = 'orbitx:news:';
export const ORBIT_NEWS_REFRESH_MS = 60 * 60 * 1000;

const memoryCache = new Map<OrbitNewsCategory, OrbitNewsResult>();

function sliceNews(items: OrbitNewsItem[], limit: number) {
  return items.slice(0, Math.max(limit, 1));
}

function sanitizeNewsItem(item: Partial<OrbitNewsItem>, category: OrbitNewsCategory): OrbitNewsItem | null {
  if (!item?.title || !item?.url) {
    return null;
  }

  return {
    id: item.id || `${category}-${item.title.slice(0, 20).replace(/\s+/g, '-').toLowerCase()}`,
    title: item.title,
    source: item.source || '',
    provider: item.provider || 'unavailable',
    publishedAt: item.publishedAt || new Date().toISOString(),
    category: item.category || category,
    sentiment: item.sentiment || 'neutral',
    relatedSymbol: item.relatedSymbol,
    excerpt: item.excerpt || '',
    image: item.image || '',
    url: item.url,
  };
}

function sanitizeNewsResult(raw: Partial<OrbitNewsResult> | null | undefined, category: OrbitNewsCategory) {
  if (!raw || !Array.isArray(raw.items)) {
    return null;
  }

  const items = raw.items
    .map((item) => sanitizeNewsItem(item, category))
    .filter((item): item is OrbitNewsItem => item !== null);

  if (!items.length) {
    return null;
  }

  return {
    items,
    provider: raw.provider || 'unavailable',
    category,
    live: Boolean(raw.live),
    fetchedAt: typeof raw.fetchedAt === 'number' ? raw.fetchedAt : 0,
  } satisfies OrbitNewsResult;
}

function normalizeResult(result: OrbitNewsResult, limit: number, fromCache = false): OrbitNewsResult {
  return {
    ...result,
    items: sliceNews(result.items, limit),
    fromCache,
  };
}

function getCacheKey(category: OrbitNewsCategory) {
  return `${NEWS_CACHE_PREFIX}${category}`;
}

export function getNewsConfig() {
  return {
    cmcKey: process.env.EXPO_PUBLIC_CMC_API_KEY?.trim() || '',
    newsApiKey: process.env.EXPO_PUBLIC_NEWS_API_KEY?.trim() || '',
  };
}

function buildUnavailableResult(category: OrbitNewsCategory): OrbitNewsResult {
  return {
    items: [],
    provider: 'unavailable',
    category,
    live: false,
    fetchedAt: Date.now(),
  };
}

async function readNewsCache(category: OrbitNewsCategory) {
  const memoryEntry = memoryCache.get(category);
  if (memoryEntry && memoryEntry.provider !== 'unavailable') {
    return memoryEntry;
  }

  try {
    const stored = await AsyncStorage.getItem(getCacheKey(category));
    if (!stored) {
      return null;
    }

    const parsed = sanitizeNewsResult(JSON.parse(stored) as Partial<OrbitNewsResult>, category);
    if (!parsed || parsed.provider === 'unavailable') {
      return null;
    }

    memoryCache.set(category, parsed);
    return parsed;
  } catch {
    return null;
  }
}

async function writeNewsCache(result: OrbitNewsResult) {
  memoryCache.set(result.category, result);

  try {
    await AsyncStorage.setItem(getCacheKey(result.category), JSON.stringify(result));
  } catch {
    // Ignore cache write errors to keep the section resilient.
  }
}

function isStale(result: OrbitNewsResult) {
  return Date.now() - result.fetchedAt >= ORBIT_NEWS_REFRESH_MS;
}

async function fetchFreshOrbitNews(category: OrbitNewsCategory, limit: number): Promise<OrbitNewsResult> {
  const { cmcKey, newsApiKey } = getNewsConfig();

  if (category === 'crypto') {
    const result = await fetchCryptoNews({ cmcKey, newsApiKey, limit });
    return {
      items: sliceNews(result.items, limit),
      provider: result.provider,
      category,
      live: true,
      fetchedAt: Date.now(),
    };
  }

  if (category === 'economy') {
    const result = await fetchEconomyNews({ newsApiKey, limit });
    return {
      items: sliceNews(result.items, limit),
      provider: result.provider,
      category,
      live: true,
      fetchedAt: Date.now(),
    };
  }

  if (category === 'technology') {
    const result = await fetchTechnologyNews({ newsApiKey, limit });
    return {
      items: sliceNews(result.items, limit),
      provider: result.provider,
      category,
      live: true,
      fetchedAt: Date.now(),
    };
  }

  const result = await fetchPoliticsNews({ newsApiKey, limit });
  return {
    items: sliceNews(result.items, limit),
    provider: result.provider,
    category,
    live: true,
    fetchedAt: Date.now(),
  };
}

export async function fetchOrbitNews(
  category: OrbitNewsCategory,
  limit = 5,
  options?: { forceRefresh?: boolean; language?: LanguageCode },
): Promise<OrbitNewsResult> {
  const cached = await readNewsCache(category);
  const language = options?.language ?? 'en';

  const applyLanguage = async (result: OrbitNewsResult, fromCache: boolean) => ({
    ...normalizeResult(result, limit, fromCache),
    items: await translateOrbitNewsItems(sliceNews(result.items, limit), language),
  });

  if (cached && !options?.forceRefresh && !isStale(cached)) {
    return applyLanguage(cached, true);
  }

  try {
    const nextResult = await fetchFreshOrbitNews(category, limit);
    await writeNewsCache(nextResult);
    return applyLanguage(nextResult, false);
  } catch {
    if (cached) {
      return applyLanguage(cached, true);
    }

    const unavailableResult = buildUnavailableResult(category);
    return applyLanguage(unavailableResult, false);
  }
}

export async function prefetchOrbitNews(categories: OrbitNewsCategory[], limit = 5) {
  await Promise.all(
    categories.map(async (category) => {
      const cached = await readNewsCache(category);
      if (cached && !isStale(cached)) {
        return;
      }

      try {
        const nextResult = await fetchFreshOrbitNews(category, limit);
        await writeNewsCache(nextResult);
      } catch {
        if (!cached) {
          await writeNewsCache(buildUnavailableResult(category));
        }
      }
    }),
  );
}
