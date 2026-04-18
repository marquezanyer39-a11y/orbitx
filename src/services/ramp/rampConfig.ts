import Constants from 'expo-constants';

import type { RampConfig, RampMode, RampProviderId } from '../../types/ramp';

const DEFAULT_ENABLED_MODES: RampMode[] = ['buy', 'sell', 'convert'];
const DEFAULT_PARTNER_FEE_PCT = 0.5;
const DEFAULT_REVENUE_SHARE_PCT = 0;

function parseCsv(value?: string) {
  return (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseNumber(value: string | undefined, fallback: number) {
  const parsed = Number.parseFloat(value ?? '');
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function parseModes(value?: string) {
  const candidates = parseCsv(value)
    .map((entry) => entry.toLowerCase())
    .filter((entry): entry is RampMode => {
      return entry === 'buy' || entry === 'sell' || entry === 'convert' || entry === 'pay';
    });

  return candidates.length ? candidates : DEFAULT_ENABLED_MODES;
}

function readEnv(key: string) {
  return process.env[key] ?? '';
}

function detectRuntimeEnvironment() {
  const raw = readEnv('EXPO_PUBLIC_RAMP_ENVIRONMENT').toLowerCase();
  return raw === 'production' ? 'production' : 'sandbox';
}

function detectPrimaryProvider(): RampProviderId {
  const raw = readEnv('EXPO_PUBLIC_RAMP_PRIMARY_PROVIDER').toLowerCase();
  return raw === 'moonpay' ? 'moonpay' : 'transak';
}

function normalizePartnerFeePct(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return DEFAULT_PARTNER_FEE_PCT;
  }

  return clamp(value, 0.3, 1);
}

function normalizeRevenueSharePct(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return clamp(value, 0, 100);
}

export function detectDeviceCountryCode() {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;
  const parts = locale.replace('_', '-').split('-');
  const region = parts.find((part) => /^[A-Z]{2}$/.test(part.toUpperCase()));
  return (region ?? 'US').toUpperCase();
}

export function buildRampRedirectUrl(providerId: RampProviderId) {
  const scheme = Constants.expoConfig?.scheme ?? 'orbitx';
  return `${scheme}://ramp/result?provider=${providerId}`;
}

let cachedConfig: RampConfig | null = null;

export function getRampConfig(): RampConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  cachedConfig = {
    primaryProvider: detectPrimaryProvider(),
    partnerFeePct: normalizePartnerFeePct(
      parseNumber(readEnv('EXPO_PUBLIC_RAMP_PARTNER_FEE_PCT'), DEFAULT_PARTNER_FEE_PCT),
    ),
    revenueSharePct: normalizeRevenueSharePct(
      parseNumber(readEnv('EXPO_PUBLIC_RAMP_REVENUE_SHARE_PCT'), DEFAULT_REVENUE_SHARE_PCT),
    ),
    environment: detectRuntimeEnvironment(),
    enabledCountries: parseCsv(readEnv('EXPO_PUBLIC_RAMP_ENABLED_COUNTRIES')).map((entry) =>
      entry.toUpperCase(),
    ),
    enabledFiatCurrencies: parseCsv(readEnv('EXPO_PUBLIC_RAMP_ENABLED_FIAT')).map((entry) =>
      entry.toUpperCase(),
    ),
    enabledModes: parseModes(readEnv('EXPO_PUBLIC_RAMP_ENABLED_MODES')),
    transak: {
      apiKey: readEnv('EXPO_PUBLIC_TRANSAK_API_KEY'),
      quoteEndpoint: readEnv('EXPO_PUBLIC_TRANSAK_QUOTE_ENDPOINT'),
      sessionEndpoint: readEnv('EXPO_PUBLIC_TRANSAK_WIDGET_SESSION_URL'),
      referrerDomain:
        readEnv('EXPO_PUBLIC_TRANSAK_REFERRER_DOMAIN') ||
        Constants.expoConfig?.slug ||
        'orbitx.app',
    },
    moonpay: {
      apiKey: readEnv('EXPO_PUBLIC_MOONPAY_API_KEY'),
      quoteEndpoint: readEnv('EXPO_PUBLIC_MOONPAY_QUOTE_ENDPOINT'),
      sessionEndpoint: readEnv('EXPO_PUBLIC_MOONPAY_WIDGET_SESSION_URL'),
    },
  };

  return cachedConfig;
}

export function isRampModeEnabled(mode: RampMode) {
  return getRampConfig().enabledModes.includes(mode);
}
