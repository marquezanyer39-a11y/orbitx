import { fetchNewsApiNews } from '../providers/newsApiService';
import { fetchRssNews } from '../providers/rssNewsService';
import type { OrbitNewsItem } from '../types';

interface PoliticsNewsServiceOptions {
  newsApiKey?: string;
  limit: number;
}

export async function fetchPoliticsNews({
  newsApiKey,
  limit,
}: PoliticsNewsServiceOptions): Promise<{
  items: OrbitNewsItem[];
  provider: 'newsapi' | 'reuters' | 'bbc-news' | 'the-guardian' | 'google-news';
}> {
  try {
    const items = await fetchRssNews({
      url: 'https://feeds.reuters.com/Reuters/worldNews',
      limit,
      category: 'politics',
      provider: 'reuters',
      sourceName: 'Reuters',
    });
    return { items, provider: 'reuters' };
  } catch {
    // Try the next real provider.
  }

  try {
    const items = await fetchRssNews({
      url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
      limit,
      category: 'politics',
      provider: 'bbc-news',
      sourceName: 'BBC News',
    });
    return { items, provider: 'bbc-news' };
  } catch {
    // Try the next real provider.
  }

  try {
    const items = await fetchRssNews({
      url: 'https://www.theguardian.com/world/rss',
      limit,
      category: 'politics',
      provider: 'the-guardian',
      sourceName: 'The Guardian',
    });
    return { items, provider: 'the-guardian' };
  } catch {
    // Try the next real provider.
  }

  try {
    const items = await fetchRssNews({
      url: 'https://news.google.com/rss/search?q=(geopolitics%20OR%20sanctions%20OR%20tariffs%20OR%20elections%20OR%20war%20OR%20regulation)%20(markets%20OR%20economy%20OR%20crypto%20OR%20technology)&hl=en-US&gl=US&ceid=US:en',
      limit,
      category: 'politics',
      provider: 'google-news',
      sourceName: 'Google News',
    });
    return { items, provider: 'google-news' };
  } catch {
    // Fall through to NewsAPI if available.
  }

  if (!newsApiKey) {
    throw new Error('No politics news provider available');
  }

  const items = await fetchNewsApiNews({
    apiKey: newsApiKey,
    limit,
    category: 'politics',
    query:
      '(geopolitics OR sanctions OR tariffs OR elections OR regulation OR parliament OR war OR diplomacy OR treaty OR "central bank policy") AND (markets OR economy OR crypto OR bitcoin OR technology OR trade)',
    domains: ['reuters.com', 'bloomberg.com', 'apnews.com', 'ft.com', 'theguardian.com', 'bbc.com'],
  });

  if (!items.length) {
    throw new Error('No politics articles found');
  }

  return { items, provider: 'newsapi' };
}
