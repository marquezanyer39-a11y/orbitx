export type OrbitNewsSentiment = 'bullish' | 'bearish' | 'neutral';
export type OrbitNewsProvider =
  | 'coinmarketcap'
  | 'newsapi'
  | 'cointelegraph'
  | 'decrypt'
  | 'reuters'
  | 'bbc-news'
  | 'financial-times'
  | 'the-guardian'
  | 'new-york-times'
  | 'yahoo-finance'
  | 'techcrunch'
  | 'the-verge'
  | 'google-news'
  | 'unavailable';
export type OrbitNewsCategory = 'crypto' | 'economy' | 'politics' | 'technology';

export interface OrbitNewsItem {
  id: string;
  title: string;
  source: string;
  provider: OrbitNewsProvider;
  publishedAt: string;
  category: OrbitNewsCategory;
  sentiment: OrbitNewsSentiment;
  relatedSymbol?: string;
  excerpt?: string;
  image?: string;
  url: string;
}

export interface OrbitNewsResult {
  items: OrbitNewsItem[];
  provider: OrbitNewsProvider;
  category: OrbitNewsCategory;
  live: boolean;
  fetchedAt: number;
  fromCache?: boolean;
}
