import { fetchNewsApiNews } from '../providers/newsApiService';
import { fetchRssNews } from '../providers/rssNewsService';
import type { OrbitNewsItem } from '../types';

interface EconomyNewsServiceOptions {
  newsApiKey?: string;
  limit: number;
}

export async function fetchEconomyNews({
  newsApiKey,
  limit,
}: EconomyNewsServiceOptions): Promise<{
  items: OrbitNewsItem[];
  provider: 'newsapi' | 'financial-times' | 'the-guardian' | 'yahoo-finance';
}> {
  try {
    const items = await fetchRssNews({
      url: 'https://www.ft.com/rss/home',
      limit,
      category: 'economy',
      provider: 'financial-times',
      sourceName: 'Financial Times',
    });
    return { items, provider: 'financial-times' };
  } catch {
    // Try the next real provider.
  }

  try {
    const items = await fetchRssNews({
      url: 'https://www.theguardian.com/business/rss',
      limit,
      category: 'economy',
      provider: 'the-guardian',
      sourceName: 'The Guardian',
    });
    return { items, provider: 'the-guardian' };
  } catch {
    // Try the next real provider.
  }

  try {
    const items = await fetchRssNews({
      url: 'https://feeds.finance.yahoo.com/rss/2.0/headline?s=%5EGSPC&region=US&lang=en-US',
      limit,
      category: 'economy',
      provider: 'yahoo-finance',
      sourceName: 'Yahoo Finance',
    });
    return { items, provider: 'yahoo-finance' };
  } catch {
    // Fall through to NewsAPI if available.
  }

  if (!newsApiKey) {
    throw new Error('No economy news provider available');
  }

  const items = await fetchNewsApiNews({
    apiKey: newsApiKey,
    limit,
    category: 'economy',
    query:
      '("interest rates" OR inflation OR CPI OR jobs report OR GDP OR recession OR "Federal Reserve" OR ECB OR treasury yields) AND (markets OR stocks OR crypto OR risk assets)',
    domains: ['reuters.com', 'bloomberg.com', 'cnbc.com', 'ft.com', 'wsj.com'],
  });

  if (!items.length) {
    throw new Error('No economy articles found');
  }

  return { items, provider: 'newsapi' };
}
