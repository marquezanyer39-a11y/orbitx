import type { LanguageCode } from '../types';
import { GENERATED_TRANSLATIONS } from '../src/i18n/resources.generated';

export interface TranslationTree {
  [key: string]: string | TranslationTree;
}

export type LocaleDirection = 'ltr' | 'rtl';

export interface LanguageOption {
  value: LanguageCode;
  label: string;
  nativeLabel: string;
  localeTag: string;
  direction: LocaleDirection;
}

export type LocalizedTextMap = Partial<Record<LanguageCode, string>>;

const LANGUAGE_META: Record<LanguageCode, LanguageOption> = {
  en: {
    value: 'en',
    label: 'English',
    nativeLabel: 'English',
    localeTag: 'en-US',
    direction: 'ltr',
  },
  es: {
    value: 'es',
    label: 'Spanish',
    nativeLabel: 'Espa\u00f1ol',
    localeTag: 'es-419',
    direction: 'ltr',
  },
  pt: {
    value: 'pt',
    label: 'Portuguese',
    nativeLabel: 'Portugu\u00eas',
    localeTag: 'pt-BR',
    direction: 'ltr',
  },
  'zh-Hans': {
    value: 'zh-Hans',
    label: 'Simplified Chinese',
    nativeLabel: '\u7b80\u4f53\u4e2d\u6587',
    localeTag: 'zh-CN',
    direction: 'ltr',
  },
  hi: {
    value: 'hi',
    label: 'Hindi',
    nativeLabel: '\u0939\u093f\u0928\u094d\u0926\u0940',
    localeTag: 'hi-IN',
    direction: 'ltr',
  },
  ru: {
    value: 'ru',
    label: 'Russian',
    nativeLabel: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439',
    localeTag: 'ru-RU',
    direction: 'ltr',
  },
  ar: {
    value: 'ar',
    label: 'Arabic',
    nativeLabel: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629',
    localeTag: 'ar-SA',
    direction: 'rtl',
  },
  id: {
    value: 'id',
    label: 'Indonesian',
    nativeLabel: 'Bahasa Indonesia',
    localeTag: 'id-ID',
    direction: 'ltr',
  },
};

export const languageOptions: LanguageOption[] = Object.values(LANGUAGE_META);
export const translations = GENERATED_TRANSLATIONS as unknown as Record<
  LanguageCode,
  TranslationTree
>;

function getByPath(tree: TranslationTree, path: string) {
  return path.split('.').reduce<string | TranslationTree | undefined>((current, key) => {
    if (!current || typeof current === 'string') {
      return undefined;
    }

    return current[key];
  }, tree);
}

function formatTemplate(template: string, params?: Record<string, string | number>) {
  if (!params) {
    return template;
  }

  return Object.entries(params).reduce((text, [key, replacement]) => {
    return text.replaceAll(`{{${key}}}`, String(replacement));
  }, template);
}

export function normalizeLanguageCode(value?: string | null): LanguageCode {
  const normalized = (value ?? '').trim().toLowerCase();

  if (normalized.startsWith('es')) return 'es';
  if (normalized.startsWith('pt')) return 'pt';
  if (normalized.startsWith('zh')) return 'zh-Hans';
  if (normalized.startsWith('hi')) return 'hi';
  if (normalized.startsWith('ru')) return 'ru';
  if (normalized.startsWith('ar')) return 'ar';
  if (normalized.startsWith('id')) return 'id';
  if (normalized.startsWith('en')) return 'en';

  return 'en';
}

export function detectDeviceLanguage(): LanguageCode {
  const intlLocale =
    typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().locale : '';
  const navigatorLocale =
    typeof navigator !== 'undefined'
      ? navigator.language || (Array.isArray(navigator.languages) ? navigator.languages[0] : '')
      : '';

  return normalizeLanguageCode(intlLocale || navigatorLocale || 'en');
}

export function getLanguageMetadata(language: LanguageCode) {
  return LANGUAGE_META[language] ?? LANGUAGE_META.en;
}

export function getLocaleTag(language: LanguageCode) {
  return getLanguageMetadata(language).localeTag;
}

export function isRtlLanguage(language: LanguageCode) {
  return getLanguageMetadata(language).direction === 'rtl';
}

export function getLocaleDirection(language: LanguageCode): LocaleDirection {
  return isRtlLanguage(language) ? 'rtl' : 'ltr';
}

export function pickLanguageText(
  language: LanguageCode,
  values: LocalizedTextMap,
  fallbackLanguage: LanguageCode = 'en',
) {
  return (
    values[language] ??
    values[normalizeLanguageCode(language)] ??
    values[fallbackLanguage] ??
    Object.values(values).find((value) => Boolean(value)) ??
    ''
  );
}

export function translate(
  language: LanguageCode,
  path: string,
  params?: Record<string, string | number>,
) {
  const source = translations[language] ?? translations.en;
  const rawValue = getByPath(source, path) ?? getByPath(translations.en, path) ?? path;
  const value = typeof rawValue === 'string' ? rawValue : path;
  return formatTemplate(value, params);
}

export function formatNumberByLanguage(
  language: LanguageCode,
  value: number,
  options?: Intl.NumberFormatOptions,
) {
  try {
    return new Intl.NumberFormat(getLocaleTag(language), options).format(value);
  } catch {
    return new Intl.NumberFormat('en-US', options).format(value);
  }
}

export function formatCurrencyByLanguage(
  language: LanguageCode,
  value: number,
  currency = 'USD',
  options?: Intl.NumberFormatOptions,
) {
  return formatNumberByLanguage(language, value, {
    style: 'currency',
    currency,
    minimumFractionDigits: value >= 100 ? 0 : 2,
    maximumFractionDigits: value >= 100 ? 0 : 2,
    ...options,
  });
}

export function formatDateByLanguage(
  language: LanguageCode,
  value: string | number | Date,
  options?: Intl.DateTimeFormatOptions,
) {
  const date = value instanceof Date ? value : new Date(value);

  try {
    return new Intl.DateTimeFormat(getLocaleTag(language), options).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }
}

export function formatRelativeTimeByLanguage(
  language: LanguageCode,
  value: string | number | Date,
) {
  const target = value instanceof Date ? value : new Date(value);
  const diffMs = target.getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const diffMinutes = Math.round(diffMs / 60_000);
  const diffHours = Math.round(diffMs / 3_600_000);
  const diffDays = Math.round(diffMs / 86_400_000);

  try {
    const formatter = new Intl.RelativeTimeFormat(getLocaleTag(language), {
      numeric: 'auto',
    });

    if (absMs < 60_000) {
      return formatter.format(0, 'minute');
    }

    if (Math.abs(diffMinutes) < 60) {
      return formatter.format(diffMinutes, 'minute');
    }

    if (Math.abs(diffHours) < 24) {
      return formatter.format(diffHours, 'hour');
    }

    return formatter.format(diffDays, 'day');
  } catch {
    const fallbackMinutes = Math.floor(absMs / 60_000);
    if (fallbackMinutes < 1) {
      return translate(language, 'news.notUpdated');
    }
    if (fallbackMinutes < 60) {
      return `${fallbackMinutes}m`;
    }
    const fallbackHours = Math.floor(fallbackMinutes / 60);
    if (fallbackHours < 24) {
      return `${fallbackHours}h`;
    }
    return `${Math.floor(fallbackHours / 24)}d`;
  }
}
