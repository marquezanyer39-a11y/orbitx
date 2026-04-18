import { fetchNewsApiNews } from '../providers/newsApiService';
import { fetchRssNews } from '../providers/rssNewsService';
import type { OrbitNewsItem } from '../types';

interface TechnologyNewsServiceOptions {
  newsApiKey?: string;
  limit: number;
}

export async function fetchTechnologyNews({
  newsApiKey,
  limit,
}: TechnologyNewsServiceOptions): Promise<{
  items: OrbitNewsItem[];
  provider: 'reuters' | 'techcrunch' | 'the-verge' | 'google-news' | 'newsapi';
}> {
  try {
    const items = await fetchRssNews({
      url: 'https://feeds.reuters.com/reuters/technologyNews',
      limit,
      category: 'technology',
      provider: 'reuters',
      sourceName: 'Reuters',
    });
    return { items, provider: 'reuters' };
  } catch {
    // Try the next real provider.
  }

  try {
    const items = await fetchRssNews({
      url: 'https://techcrunch.com/feed/',
      limit,
      category: 'technology',
      provider: 'techcrunch',
      sourceName: 'TechCrunch',
    });
    return { items, provider: 'techcrunch' };
  } catch {
    // Try the next real provider.
  }

  try {
    const items = await fetchRssNews({
      url: 'https://www.theverge.com/rss/index.xml',
      limit,
      category: 'technology',
      provider: 'the-verge',
      sourceName: 'The Verge',
    });
    return { items, provider: 'the-verge' };
  } catch {
    // Try the next real provider.
  }

  try {
    const items = await fetchRssNews({
      url: 'https://news.google.com/rss/search?q=(technology%20OR%20AI%20OR%20semiconductors%20OR%20chips%20OR%20OpenAI%20OR%20NVIDIA)%20(markets%20OR%20economy%20OR%20crypto)&hl=en-US&gl=US&ceid=US:en',
      limit,
      category: 'technology',
      provider: 'google-news',
      sourceName: 'Google News',
    });
    return { items, provider: 'google-news' };
  } catch {
    // Fall through to NewsAPI if available.
  }

  if (!newsApiKey) {
    throw new Error('No technology news provider available');
  }

  const items = await fetchNewsApiNews({
    apiKey: newsApiKey,
    limit,
    category: 'technology',
    query:
      '("artificial intelligence" OR AI OR semiconductors OR chips OR NVIDIA OR OpenAI OR Microsoft OR Apple OR Google OR Amazon OR Meta) AND (markets OR stocks OR crypto OR economy OR regulation)',
    domains: ['reuters.com', 'bloomberg.com', 'theverge.com', 'techcrunch.com', 'ft.com'],
  });

  if (!items.length) {
    throw new Error('No technology articles found');
  }

  return { items, provider: 'newsapi' };
}
