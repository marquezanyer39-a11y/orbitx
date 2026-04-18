import { inferNewsSentiment, inferRelatedSymbol, normalizeNewsItem } from '../helpers';
import type { OrbitNewsCategory, OrbitNewsItem } from '../types';

interface FetchNewsApiOptions {
  apiKey: string;
  limit: number;
  category: OrbitNewsCategory;
  query: string;
  domains?: string[];
}

interface NewsApiArticle {
  title?: string;
  url?: string;
  urlToImage?: string;
  publishedAt?: string;
  description?: string;
  source?: {
    name?: string;
  };
}

export async function fetchNewsApiNews({
  apiKey,
  limit,
  category,
  query,
  domains,
}: FetchNewsApiOptions): Promise<OrbitNewsItem[]> {
  const domainParam =
    domains && domains.length ? `&domains=${encodeURIComponent(domains.join(','))}` : '';

  const response = await fetch(
    `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      query,
    )}&language=en&sortBy=publishedAt&pageSize=${Math.max(limit, 5)}${domainParam}`,
    {
      headers: {
        'X-Api-Key': apiKey,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`NewsAPI failed with ${response.status}`);
  }

  const payload = (await response.json()) as {
    articles?: NewsApiArticle[];
  };
  const articles = Array.isArray(payload.articles) ? payload.articles : [];

  const normalized: Array<OrbitNewsItem | null> = articles.map((article, index) =>
    normalizeNewsItem(
      {
        id: `newsapi-${category}-${index}-${article.publishedAt ?? ''}`,
        title: article.title ?? '',
        source: article.source?.name ?? 'NewsAPI',
        publishedAt: article.publishedAt ?? '',
        sentiment: inferNewsSentiment(`${article.title ?? ''} ${article.description ?? ''}`),
        relatedSymbol: inferRelatedSymbol(`${article.title ?? ''} ${article.description ?? ''}`),
        image: article.urlToImage ?? '',
        url: article.url ?? '',
      },
      'newsapi',
      category,
    ),
  );

  return normalized.filter((item): item is OrbitNewsItem => item !== null).slice(0, limit);
}
