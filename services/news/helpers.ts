import type { LanguageCode } from '../../types';
import type {
  OrbitNewsCategory,
  OrbitNewsItem,
  OrbitNewsProvider,
  OrbitNewsSentiment,
} from './types';

const CATEGORY_LABELS: Record<LanguageCode, Record<OrbitNewsCategory, string>> = {
  en: {
    crypto: 'Crypto',
    economy: 'Markets',
    politics: 'Politics',
    technology: 'Technology',
  },
  es: {
    crypto: 'Crypto',
    economy: 'Mercados',
    politics: 'Politica',
    technology: 'Tecnologia',
  },
  pt: {
    crypto: 'Cripto',
    economy: 'Mercados',
    politics: 'Politica',
    technology: 'Tecnologia',
  },
  'zh-Hans': {
    crypto: '加密',
    economy: '市场',
    politics: '政治',
    technology: '科技',
  },
  hi: {
    crypto: 'क्रिप्टो',
    economy: 'बाजार',
    politics: 'राजनीति',
    technology: 'टेक',
  },
  ru: {
    crypto: 'Крипто',
    economy: 'Рынки',
    politics: 'Политика',
    technology: 'Технологии',
  },
  ar: {
    crypto: 'كريبتو',
    economy: 'الأسواق',
    politics: 'السياسة',
    technology: 'التقنية',
  },
  id: {
    crypto: 'Kripto',
    economy: 'Pasar',
    politics: 'Politik',
    technology: 'Teknologi',
  },
};

const SENTIMENT_LABELS: Record<LanguageCode, Record<OrbitNewsSentiment, string>> = {
  en: {
    bullish: 'Bullish',
    bearish: 'Bearish',
    neutral: 'Neutral',
  },
  es: {
    bullish: 'Alcista',
    bearish: 'Bajista',
    neutral: 'Neutral',
  },
  pt: {
    bullish: 'Altista',
    bearish: 'Baixista',
    neutral: 'Neutro',
  },
  'zh-Hans': {
    bullish: '看涨',
    bearish: '看跌',
    neutral: '中性',
  },
  hi: {
    bullish: 'तेजी',
    bearish: 'मंदी',
    neutral: 'तटस्थ',
  },
  ru: {
    bullish: 'Бычий',
    bearish: 'Медвежий',
    neutral: 'Нейтральный',
  },
  ar: {
    bullish: 'صاعد',
    bearish: 'هابط',
    neutral: 'محايد',
  },
  id: {
    bullish: 'Bullish',
    bearish: 'Bearish',
    neutral: 'Netral',
  },
};

const UNAVAILABLE_PROVIDER_LABELS: Record<LanguageCode, string> = {
  en: 'Unavailable source',
  es: 'Fuente no disponible',
  pt: 'Fonte indisponivel',
  'zh-Hans': '来源不可用',
  hi: 'स्रोत उपलब्ध नहीं',
  ru: 'Источник недоступен',
  ar: 'المصدر غير متاح',
  id: 'Sumber tidak tersedia',
};

const EXTERNAL_SOURCE_LABELS: Record<LanguageCode, string> = {
  en: 'External source',
  es: 'Fuente externa',
  pt: 'Fonte externa',
  'zh-Hans': '外部来源',
  hi: 'बाहरी स्रोत',
  ru: 'Внешний источник',
  ar: 'مصدر خارجي',
  id: 'Sumber eksternal',
};

const KEYWORD_MAP = [
  { symbol: 'BTC', terms: ['bitcoin', 'btc'] },
  { symbol: 'ETH', terms: ['ethereum', 'eth'] },
  { symbol: 'BNB', terms: ['bnb', 'binance coin', 'bnb chain'] },
  { symbol: 'SOL', terms: ['solana', 'sol'] },
  { symbol: 'TRX', terms: ['tron', 'trx'] },
  { symbol: 'XRP', terms: ['xrp', 'ripple'] },
  { symbol: 'DOGE', terms: ['dogecoin', 'doge'] },
  { symbol: 'LTC', terms: ['litecoin', 'ltc'] },
  { symbol: 'BASE', terms: ['base'] },
  { symbol: 'ARB', terms: ['arbitrum', 'arb'] },
  { symbol: 'OP', terms: ['optimism', 'op mainnet'] },
  { symbol: 'POL', terms: ['polygon', 'matic', 'pol'] },
  { symbol: 'PEPE', terms: ['pepe'] },
  { symbol: 'BONK', terms: ['bonk'] },
  { symbol: 'AI', terms: ['artificial intelligence', 'ai', 'openai', 'nvidia'] },
] as const;

const bullishTerms = [
  'surge',
  'rally',
  'breakout',
  'approval',
  'inflow',
  'bull',
  'gain',
  'jump',
  'record high',
  'partnership',
  'launch',
  'adoption',
  'rate cut',
  'stimulus',
  'eases',
];

const bearishTerms = [
  'drop',
  'sell-off',
  'selloff',
  'hack',
  'exploit',
  'lawsuit',
  'ban',
  'outflow',
  'fear',
  'crash',
  'delay',
  'liquidation',
  'tariff',
  'war',
  'rate hike',
  'crackdown',
];

function getLanguageLabelMap<T>(language: LanguageCode, labels: Record<LanguageCode, T>) {
  return labels[language] ?? labels.en;
}

export function getNewsProviderLabel(
  provider: OrbitNewsProvider,
  language: LanguageCode = 'en',
) {
  if (provider === 'coinmarketcap') return 'CoinMarketCap';
  if (provider === 'newsapi') return 'NewsAPI';
  if (provider === 'cointelegraph') return 'Cointelegraph';
  if (provider === 'decrypt') return 'Decrypt';
  if (provider === 'reuters') return 'Reuters';
  if (provider === 'bbc-news') return 'BBC News';
  if (provider === 'financial-times') return 'Financial Times';
  if (provider === 'the-guardian') return 'The Guardian';
  if (provider === 'new-york-times') return 'The New York Times';
  if (provider === 'yahoo-finance') return 'Yahoo Finance';
  if (provider === 'techcrunch') return 'TechCrunch';
  if (provider === 'the-verge') return 'The Verge';
  if (provider === 'google-news') return 'Google News';
  return getLanguageLabelMap(language, UNAVAILABLE_PROVIDER_LABELS);
}

export function getExternalSourceLabel(language: LanguageCode = 'en') {
  return getLanguageLabelMap(language, EXTERNAL_SOURCE_LABELS);
}

export function getNewsCategoryLabel(
  category: OrbitNewsCategory,
  language: LanguageCode = 'en',
) {
  return getLanguageLabelMap(language, CATEGORY_LABELS)[category];
}

export function getNewsSentimentLabel(
  sentiment: OrbitNewsSentiment,
  language: LanguageCode = 'en',
) {
  return getLanguageLabelMap(language, SENTIMENT_LABELS)[sentiment];
}

export function inferNewsSentiment(input: string): OrbitNewsSentiment {
  const normalized = input.toLowerCase();

  const bullishScore = bullishTerms.reduce(
    (score, term) => score + (normalized.includes(term) ? 1 : 0),
    0,
  );
  const bearishScore = bearishTerms.reduce(
    (score, term) => score + (normalized.includes(term) ? 1 : 0),
    0,
  );

  if (bullishScore > bearishScore) {
    return 'bullish';
  }

  if (bearishScore > bullishScore) {
    return 'bearish';
  }

  return 'neutral';
}

export function inferRelatedSymbol(input: string) {
  const normalized = input.toLowerCase();
  const match = KEYWORD_MAP.find((item) => item.terms.some((term) => normalized.includes(term)));

  return match?.symbol;
}

export function normalizeNewsItem(
  item: Partial<OrbitNewsItem>,
  provider: OrbitNewsProvider,
  category: OrbitNewsCategory,
) {
  if (!item.title || !item.url) {
    return null;
  }

  const title = item.title.trim();

  return {
    id: item.id ?? `${provider}-${title.slice(0, 24).replace(/\s+/g, '-').toLowerCase()}`,
    title,
    source: item.source?.trim() || '',
    provider,
    publishedAt: item.publishedAt || new Date().toISOString(),
    category,
    sentiment: item.sentiment ?? inferNewsSentiment(`${title} ${item.relatedSymbol ?? ''}`),
    relatedSymbol: item.relatedSymbol || inferRelatedSymbol(title),
    excerpt: item.excerpt?.trim() || '',
    image: item.image || '',
    url: item.url,
  } satisfies OrbitNewsItem;
}
