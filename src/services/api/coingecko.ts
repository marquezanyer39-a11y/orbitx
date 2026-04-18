const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

interface CoinGeckoMarketRow {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_percentage_24h: number;
  sparkline_in_7d?: {
    price?: number[];
  };
  last_updated: string;
}

interface CoinGeckoCoinDetail {
  id: string;
  symbol: string;
  name: string;
  image?: {
    large?: string;
    thumb?: string;
  };
  platforms?: Record<string, string>;
  detail_platforms?: Record<
    string,
    {
      decimal_place?: number | null;
      contract_address?: string;
      geckoterminal_url?: string;
    }
  >;
  market_data?: {
    current_price?: Record<string, number>;
    high_24h?: Record<string, number>;
    low_24h?: Record<string, number>;
    total_volume?: Record<string, number>;
    price_change_percentage_24h?: number;
  };
}

interface CoinGeckoMarketChartResponse {
  prices: number[][];
  market_caps: number[][];
  total_volumes: number[][];
}

async function fetchJson<T>(path: string) {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (typeof document === 'undefined') {
    headers['User-Agent'] = 'OrbitX/1.0 (+https://orbitx.app)';
  }

  const response = await fetch(`${COINGECKO_BASE_URL}${path}`, {
    headers,
  });
  if (!response.ok) {
    throw new Error(`CoinGecko respondio ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchCoinMarkets(perPage = 40) {
  return fetchJson<CoinGeckoMarketRow[]>(
    `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=true&price_change_percentage=24h&locale=es&precision=full`,
  );
}

export async function fetchSimplePrices(coingeckoIds: string[]) {
  if (!coingeckoIds.length) {
    return {};
  }

  const ids = coingeckoIds.join(',');
  return fetchJson<Record<string, { usd?: number; usd_24h_change?: number }>>(
    `/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd&include_24hr_change=true`,
  );
}

export async function fetchCoinDetail(coinId: string) {
  return fetchJson<CoinGeckoCoinDetail>(
    `/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`,
  );
}

export async function fetchCoinMarketChart(
  coinId: string,
  options: {
    days: number | 'max';
    interval?: 'hourly' | 'daily';
  },
) {
  const params = new URLSearchParams({
    vs_currency: 'usd',
    days: String(options.days),
    precision: 'full',
  });

  if (options.interval) {
    params.set('interval', options.interval);
  }

  return fetchJson<CoinGeckoMarketChartResponse>(
    `/coins/${coinId}/market_chart?${params.toString()}`,
  );
}

export type { CoinGeckoCoinDetail, CoinGeckoMarketChartResponse, CoinGeckoMarketRow };
