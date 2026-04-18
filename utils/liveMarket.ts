import type { MarketFilter, MarketToken } from '../types';
import { roundAdaptivePrice, roundTo } from './simulate';

interface CoinGeckoMarketRow {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h?: number;
  sparkline_in_7d?: {
    price?: number[];
  };
}

const LAYER1_SYMBOLS = new Set(['btc', 'eth', 'sol', 'bnb', 'xrp', 'ada', 'trx', 'sui', 'ton']);
const MEME_SYMBOLS = new Set(['doge', 'shib', 'pepe', 'bonk', 'wif', 'popcat', 'floki']);
const STABLE_SYMBOLS = new Set(['usdt', 'usdc', 'dai', 'fdusd', 'usde', 'susds']);
const AI_SYMBOLS = new Set(['rndr', 'fet', 'tao']);
const COLOR_POOL = [
  '#7B3FE4',
  '#26A17B',
  '#F7931A',
  '#627EEA',
  '#14F195',
  '#FF7A59',
  '#4D7CFE',
  '#FF7AAB',
  '#00C2FF',
  '#FFB84D',
];

function titleCaseSymbol(symbol: string) {
  return symbol.toUpperCase();
}

function mapSparkline(values?: number[], fallbackPrice?: number) {
  if (values?.length) {
    return values.slice(-18).map((value) => roundAdaptivePrice(value));
  }

  void fallbackPrice;
  return [];
}

function getKind(row: CoinGeckoMarketRow): MarketToken['kind'] {
  const symbol = row.symbol.toLowerCase();

  if (STABLE_SYMBOLS.has(symbol)) {
    return 'cash';
  }

  if (AI_SYMBOLS.has(symbol)) {
    return 'ai';
  }

  if (MEME_SYMBOLS.has(symbol)) {
    return 'meme';
  }

  if (LAYER1_SYMBOLS.has(symbol)) {
    return symbol === 'btc' || symbol === 'eth' ? 'bluechip' : 'layer1';
  }

  return 'utility';
}

function getCategories(row: CoinGeckoMarketRow, index: number): MarketFilter[] {
  const categories = new Set<MarketFilter>();
  const change = Math.abs(row.price_change_percentage_24h ?? 0);

  if (index < 18 || STABLE_SYMBOLS.has(row.symbol.toLowerCase())) {
    categories.add('popular');
  }

  if (index < 12 || change >= 3.2) {
    categories.add('trending');
  }

  if (index >= 12 && index < 32) {
    categories.add('new');
  }

  if (!categories.size) {
    categories.add('popular');
  }

  return Array.from(categories);
}

function buildDescription(row: CoinGeckoMarketRow, kind: MarketToken['kind']) {
  if (kind === 'cash') {
    return `${row.name} funciona como stablecoin liquida para pares spot, rotacion y gestion de riesgo.`;
  }

  if (kind === 'meme') {
    return `${row.name} concentra flujo especulativo, momentum social y alta rotacion de traders.`;
  }

  if (kind === 'layer1') {
    return `${row.name} mueve liquidez de ecosistema, usuarios onchain y narrativa de infraestructura.`;
  }

  if (kind === 'ai') {
    return `${row.name} se beneficia de narrativa AI, infraestructura y volumen tematico.`;
  }

  if (kind === 'bluechip') {
    return `${row.name} sigue marcando la pauta del mercado por liquidez, dominio y profundidad institucional.`;
  }

  return `${row.name} mantiene relevancia por liquidez, comunidad activa y uso dentro del mercado cripto.`;
}

function estimateHolders(row: CoinGeckoMarketRow) {
  const base = row.market_cap / Math.max(row.current_price, 0.000001);
  return Math.max(Math.round(base / 1400), 1200);
}

function buildNewToken(row: CoinGeckoMarketRow, index: number): MarketToken {
  const kind = getKind(row);
  const symbol = titleCaseSymbol(row.symbol);

  return {
    id: `cg-${row.id}`,
    name: row.name,
    symbol,
    price: roundAdaptivePrice(row.current_price),
    change24h: roundTo(row.price_change_percentage_24h ?? 0, 2),
    marketCap: Math.round(row.market_cap),
    volume24h: Math.round(row.total_volume),
    holders: estimateHolders(row),
    color: COLOR_POOL[index % COLOR_POOL.length],
    categories: getCategories(row, index),
    description: buildDescription(row, kind),
    logo: row.image,
    coingeckoId: row.id,
    isTradeable: kind !== 'cash',
    kind,
    sparkline: mapSparkline(row.sparkline_in_7d?.price, row.current_price),
  };
}

export async function fetchLiveMarketRows() {
  const url =
    'https://api.coingecko.com/api/v3/coins/markets' +
    '?vs_currency=usd&order=market_cap_desc&per_page=40&page=1&sparkline=true&price_change_percentage=24h&locale=en&precision=full';

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`CoinGecko error ${response.status}`);
  }

  return (await response.json()) as CoinGeckoMarketRow[];
}

export function mergeLiveRows(tokens: MarketToken[], rows: CoinGeckoMarketRow[]) {
  const byCoingeckoId = new Map<string, MarketToken>();
  const usedIds = new Set(tokens.map((token) => token.id));

  for (const token of tokens) {
    if (token.coingeckoId) {
      byCoingeckoId.set(token.coingeckoId, token);
    }
  }

  const mergedTokens = rows.map((row, index) => {
    const existing = byCoingeckoId.get(row.id);
    const kind = getKind(row);
    const nextBase = buildNewToken(row, index);

    if (!existing) {
      let nextId = nextBase.id;
      if (usedIds.has(nextId)) {
        nextId = `${nextId}-${index}`;
      }
      usedIds.add(nextId);

      return {
        ...nextBase,
        id: nextId,
      };
    }

    return {
      ...existing,
      name: row.name,
      symbol: titleCaseSymbol(row.symbol),
      price: roundAdaptivePrice(row.current_price),
      change24h: roundTo(row.price_change_percentage_24h ?? existing.change24h, 2),
      marketCap: Math.round(row.market_cap),
      volume24h: Math.round(row.total_volume),
      holders: estimateHolders(row),
      categories: existing.isUserCreated ? existing.categories : getCategories(row, index),
      description: existing.isUserCreated ? existing.description : buildDescription(row, kind),
      logo: row.image || existing.logo,
      kind,
      isTradeable: kind !== 'cash',
      sparkline: mapSparkline(row.sparkline_in_7d?.price, row.current_price),
    };
  });

  const userTokens = tokens.filter((token) => token.isUserCreated);
  const mergedIds = new Set(mergedTokens.map((token) => token.id));
  const legacyTokens = tokens.filter(
    (token) => !token.isUserCreated && !mergedIds.has(token.id),
  );

  return [...userTokens, ...mergedTokens, ...legacyTokens];
}
