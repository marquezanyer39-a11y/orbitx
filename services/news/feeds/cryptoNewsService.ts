import { fetchCoinMarketCapNews } from '../providers/cmcNewsService';
import { fetchNewsApiNews } from '../providers/newsApiService';
import { fetchRssNews } from '../providers/rssNewsService';
import type { OrbitNewsItem } from '../types';

interface CryptoNewsServiceOptions {
  cmcKey?: string;
  newsApiKey?: string;
  limit: number;
}

export async function fetchCryptoNews({
  cmcKey,
  newsApiKey,
  limit,
}: CryptoNewsServiceOptions): Promise<{
  items: OrbitNewsItem[];
  provider: 'coinmarketcap' | 'newsapi' | 'cointelegraph' | 'decrypt';
}> {
  if (cmcKey) {
    const items = await fetchCoinMarketCapNews({ apiKey: cmcKey, limit });
    if (items.length) {
      return { items, provider: 'coinmarketcap' };
    }
  }

  try {
    const items = await fetchRssNews({
      url: 'https://cointelegraph.com/rss',
      limit,
      category: 'crypto',
      provider: 'cointelegraph',
      sourceName: 'Cointelegraph',
    });
    return { items, provider: 'cointelegraph' };
  } catch {
    // Try the next real provider.
  }

  try {
    const items = await fetchRssNews({
      url: 'https://decrypt.co/feed',
      limit,
      category: 'crypto',
      provider: 'decrypt',
      sourceName: 'Decrypt',
    });
    return { items, provider: 'decrypt' };
  } catch {
    // Fall through to NewsAPI if available.
  }

  if (newsApiKey) {
    const items = await fetchNewsApiNews({
      apiKey: newsApiKey,
      limit,
      category: 'crypto',
      query:
        '(crypto OR bitcoin OR ethereum OR solana OR base OR bnb OR meme coin OR memecoin) AND (market OR price OR trading OR ETF OR liquidity)',
      domains: ['coindesk.com', 'cointelegraph.com', 'decrypt.co', 'theblock.co', 'reuters.com'],
    });

    if (items.length) {
      return { items, provider: 'newsapi' };
    }
  }

  throw new Error('No crypto news provider available');
}
