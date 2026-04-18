import { inferNewsSentiment, inferRelatedSymbol, normalizeNewsItem } from '../helpers';
import type { OrbitNewsItem } from '../types';

interface FetchCoinMarketCapNewsOptions {
  apiKey: string;
  limit: number;
}

function firstString(...values: unknown[]) {
  const next = values.find((value) => typeof value === 'string' && value.trim().length > 0);
  return typeof next === 'string' ? next.trim() : '';
}

function normalizeCmcItem(item: Record<string, unknown>) {
  const meta = (typeof item.meta === 'object' && item.meta !== null ? item.meta : {}) as Record<
    string,
    unknown
  >;
  const title = firstString(item.title, item.headline, meta.title, meta.headline);
  const url = firstString(item.url, item.link, meta.url, meta.link);
  const summary = firstString(item.summary, item.description, meta.description);

  return normalizeNewsItem(
    {
      id: firstString(item.id, item.slug, meta.slug),
      title,
      source: firstString(item.source_name, item.source, meta.source_name, 'CoinMarketCap'),
      publishedAt: firstString(item.published_at, item.created_at, meta.published_at),
      sentiment: inferNewsSentiment(`${title} ${summary}`),
      relatedSymbol: inferRelatedSymbol(`${title} ${summary}`),
      image: firstString(item.cover, item.image, meta.image, meta.cover),
      url,
    },
    'coinmarketcap',
    'crypto',
  );
}

export async function fetchCoinMarketCapNews({
  apiKey,
  limit,
}: FetchCoinMarketCapNewsOptions): Promise<OrbitNewsItem[]> {
  const response = await fetch(
    `https://pro-api.coinmarketcap.com/v1/content/latest?limit=${Math.max(
      limit,
      5,
    )}&news_type=news&symbol=BTC,ETH,SOL,BNB,TRX,XRP`,
    {
      headers: {
        Accept: 'application/json',
        'X-CMC_PRO_API_KEY': apiKey,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`CMC news failed with ${response.status}`);
  }

  const payload = (await response.json()) as {
    data?: unknown;
  };
  const rawItems = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray((payload.data as { items?: unknown[] } | undefined)?.items)
      ? ((payload.data as { items?: unknown[] }).items ?? [])
      : [];

  const normalized: Array<OrbitNewsItem | null> = rawItems.map((item) =>
    normalizeCmcItem((item ?? {}) as Record<string, unknown>),
  );

  return normalized.filter((item): item is OrbitNewsItem => item !== null).slice(0, limit);
}
