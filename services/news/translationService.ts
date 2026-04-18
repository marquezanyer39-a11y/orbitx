import AsyncStorage from '@react-native-async-storage/async-storage';

import type { LanguageCode } from '../../types';
import type { OrbitNewsItem } from './types';

const TRANSLATION_CACHE_PREFIX = 'orbitx:news-translation:v2:';
const GOOGLE_TRANSLATE_URL =
  'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&dt=t';

const memoryCache = new Map<string, string>();
const inflightCache = new Map<string, Promise<string>>();

const PROTECTED_TERMS = [
  'OrbitX',
  'Bitcoin',
  'Ethereum',
  'Solana',
  'Dogecoin',
  'Ripple',
  'Binance',
  'Coinbase',
  'CoinMarketCap',
  'Cointelegraph',
  'NewsAPI',
  'Decrypt',
  'Financial Times',
  'Reuters',
  'BBC',
  'BBC News',
  'TechCrunch',
  'The Verge',
  'Yahoo Finance',
  'Federal Reserve',
  'NVIDIA',
  'OpenAI',
  'Microsoft',
  'Google',
  'Apple',
  'Amazon',
  'Meta',
  'TSMC',
  'AI',
  'GPU',
  'PEPE',
  'BONK',
  'DOGE',
  'XRP',
  'BNB',
  'SOL',
  'BTC',
  'ETH',
  'ETF',
  'SEC',
  'CPI',
  'GDP',
  'ECB',
];

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function hashText(value: string) {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return Math.abs(hash >>> 0).toString(16);
}

function buildCacheKey(targetLanguage: LanguageCode, value: string) {
  return `${TRANSLATION_CACHE_PREFIX}${targetLanguage}:${hashText(value)}`;
}

function getTranslationTargetCode(targetLanguage: LanguageCode) {
  if (targetLanguage === 'zh-Hans') {
    return 'zh-CN';
  }

  return targetLanguage;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function shouldTranslate(value: string, targetLanguage: LanguageCode) {
  const normalized = normalizeWhitespace(value);

  if (!normalized || targetLanguage === 'en') {
    return false;
  }

  return true;
}

function protectTerms(value: string) {
  const replacements: Array<{ placeholder: string; original: string }> = [];
  let nextValue = value;
  let placeholderIndex = 0;

  const register = (original: string) => {
    const placeholder = `__ORBITX_KEEP_${placeholderIndex}__`;
    placeholderIndex += 1;
    replacements.push({ placeholder, original });
    return placeholder;
  };

  const protectedRegexes = [
    /\$[A-Z]{2,10}\b/g,
    /#[A-Z]{2,10}\b/g,
    /\b[A-Z]{2,10}\b/g,
  ];

  for (const regex of protectedRegexes) {
    nextValue = nextValue.replace(regex, (match) => register(match));
  }

  for (const term of PROTECTED_TERMS) {
    const regex = new RegExp(`\\b${escapeRegExp(term)}\\b`, 'g');
    nextValue = nextValue.replace(regex, (match) => register(match));
  }

  return {
    value: nextValue,
    restore: (translatedValue: string) =>
      replacements.reduce(
        (restored, item) => restored.replace(new RegExp(item.placeholder, 'g'), item.original),
        translatedValue,
      ),
  };
}

async function readTranslationCache(cacheKey: string) {
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey) ?? null;
  }

  try {
    const stored = await AsyncStorage.getItem(cacheKey);
    if (!stored) {
      return null;
    }

    memoryCache.set(cacheKey, stored);
    return stored;
  } catch {
    return null;
  }
}

async function writeTranslationCache(cacheKey: string, value: string) {
  memoryCache.set(cacheKey, value);

  try {
    await AsyncStorage.setItem(cacheKey, value);
  } catch {
    // Ignore cache write failures to keep translation resilient.
  }
}

async function requestTranslation(text: string, targetLanguage: LanguageCode) {
  const response = await fetch(
    `${GOOGLE_TRANSLATE_URL}&tl=${encodeURIComponent(getTranslationTargetCode(targetLanguage))}&q=${encodeURIComponent(text)}`,
    {
      headers: {
        Accept: 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Translation service failed with ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  const segments = Array.isArray(payload) && Array.isArray(payload[0]) ? payload[0] : null;

  if (!segments) {
    throw new Error('Translation service returned an unexpected response.');
  }

  const translated = segments
    .map((segment) => (Array.isArray(segment) ? String(segment[0] ?? '') : ''))
    .join('');

  const normalized = normalizeWhitespace(translated);
  if (!normalized) {
    throw new Error('Translation service returned empty text.');
  }

  return normalized;
}

async function translateDynamicText(value: string, targetLanguage: LanguageCode) {
  const normalized = normalizeWhitespace(value);
  if (!shouldTranslate(normalized, targetLanguage)) {
    return normalized;
  }

  const cacheKey = buildCacheKey(targetLanguage, normalized);
  const cached = await readTranslationCache(cacheKey);
  if (cached) {
    return cached;
  }

  const inflight = inflightCache.get(cacheKey);
  if (inflight) {
    return inflight;
  }

  const translationPromise = (async () => {
    const protectedValue = protectTerms(normalized);
    const translated = await requestTranslation(protectedValue.value, targetLanguage);
    const restored = normalizeWhitespace(protectedValue.restore(translated));

    await writeTranslationCache(cacheKey, restored);
    return restored;
  })();

  inflightCache.set(cacheKey, translationPromise);

  try {
    return await translationPromise;
  } finally {
    inflightCache.delete(cacheKey);
  }
}

export async function translateOrbitNewsItems(
  items: OrbitNewsItem[],
  targetLanguage: LanguageCode,
) {
  if (targetLanguage === 'en' || !items.length) {
    return items;
  }

  try {
    return await Promise.all(
      items.map(async (item) => ({
        ...item,
        title: await translateDynamicText(item.title, targetLanguage),
        excerpt: item.excerpt
          ? await translateDynamicText(item.excerpt, targetLanguage)
          : item.excerpt,
      })),
    );
  } catch {
    return items;
  }
}
