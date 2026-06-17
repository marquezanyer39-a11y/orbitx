import { getLocaleTag } from '../../../constants/i18n';
import type { AstraResponse, AstraSupportContext } from '../../types/astra';
import type {
  AstraVoiceContextPayload,
  AstraVoiceFeatureFlags,
  AstraVoiceSession,
} from '../../types/astraVoice';
import type { AstraTTSContext } from '../../services/astraTTS';

export interface AstraVoiceCapabilitiesSnapshot {
  hasWalletModule: boolean;
  hasWalletCreate: boolean;
  hasWalletImport: boolean;
  hasExternalWalletConnect: boolean;
  hasTradeModule: boolean;
  hasRampConvert: boolean;
  hasRampBuy: boolean;
  hasRampSell: boolean;
  hasRampPay: boolean;
  hasSocial: boolean;
  hasMonthlyRewardsPool: boolean;
  hasP2P: boolean;
  hasSecurityCenter: boolean;
}

export type AstraVoiceCapabilitiesResolver = (
  context: AstraSupportContext,
) => AstraVoiceCapabilitiesSnapshot;

export const PREFERRED_ANDROID_RECOGNITION_SERVICES = [
  'com.google.android.as',
  'com.google.android.googlequicksearchbox',
  'com.samsung.android.bixby.agent',
  'com.google.android.tts',
] as const;

export function chooseRecognitionService(
  installedServices: string[],
  defaultServicePackage: string | null,
) {
  if (defaultServicePackage && installedServices.includes(defaultServicePackage)) {
    return defaultServicePackage;
  }

  const preferredService = PREFERRED_ANDROID_RECOGNITION_SERVICES.find((servicePackage) =>
    installedServices.includes(servicePackage),
  );

  return preferredService ?? installedServices[0] ?? null;
}

export function buildFeatureFlags(
  context: AstraSupportContext | null,
  resolveCapabilities?: AstraVoiceCapabilitiesResolver,
): AstraVoiceFeatureFlags {
  if (!context) {
    return {
      wallet: false,
      createWallet: false,
      importWallet: false,
      externalWallet: false,
      trade: false,
      markets: true,
      convert: false,
      buy: false,
      sell: false,
      pay: false,
      social: false,
      pool: false,
      p2p: false,
      security: false,
    };
  }

  const capabilities = resolveCapabilities?.(context);
  if (!capabilities) {
    return {
      wallet: false,
      createWallet: false,
      importWallet: false,
      externalWallet: false,
      trade: false,
      markets: true,
      convert: false,
      buy: false,
      sell: false,
      pay: false,
      social: false,
      pool: false,
      p2p: false,
      security: false,
    };
  }

  return {
    wallet: capabilities.hasWalletModule,
    createWallet: capabilities.hasWalletCreate,
    importWallet: capabilities.hasWalletImport,
    externalWallet: capabilities.hasExternalWalletConnect,
    trade: capabilities.hasTradeModule,
    markets: true,
    convert: capabilities.hasRampConvert,
    buy: capabilities.hasRampBuy,
    sell: capabilities.hasRampSell,
    pay: capabilities.hasRampPay,
    social: capabilities.hasSocial,
    pool: capabilities.hasMonthlyRewardsPool,
    p2p: capabilities.hasP2P,
    security: capabilities.hasSecurityCenter,
  };
}

export function mapSurfaceToVoiceScreen(
  surface?: AstraSupportContext['surface'],
): AstraVoiceContextPayload['screen'] {
  switch (surface) {
    case 'create_token':
      return 'create_token';
    case 'wallet':
      return 'wallet';
    case 'trade':
      return 'trade';
    case 'market':
      return 'market';
    case 'social':
      return 'social';
    case 'bot_futures':
      return 'bot_futures';
    case 'security':
      return 'security';
    case 'settings':
      return 'settings';
    case 'profile':
      return 'profile';
    case 'pool':
      return 'pool';
    case 'ramp':
      return 'ramp';
    case 'home':
      return 'home';
    default:
      return 'general';
  }
}

export function findSpeechLocale(language: AstraSupportContext['language']) {
  return getLocaleTag(language);
}

export function inferTtsContext(text: string): AstraTTSContext {
  const normalized = text.toLowerCase();

  if (/alerta|riesgo|confirma|revisa|cuidado|warning|atencion/.test(normalized)) {
    return 'alert';
  }

  if (/listo|confirm|complet|hecho|correctamente/.test(normalized)) {
    return 'confirm';
  }

  if (/hola|bienvenido|soy astra/.test(normalized)) {
    return 'welcome';
  }

  return 'explain';
}

export function isExpoGoLikeEnvironment(executionEnvironment: unknown) {
  return executionEnvironment === 'storeClient';
}

export function isExpired(session: AstraVoiceSession | null, now = Date.now()) {
  if (!session) {
    return true;
  }

  return new Date(session.expiresAt).getTime() <= now + 30_000;
}

export interface BuildFallbackSessionInput {
  hasBrainBackend: boolean;
  outputMode: AstraVoiceSession['voiceOutput'];
  now?: number;
}

export function buildFallbackSession({
  hasBrainBackend,
  outputMode,
  now = Date.now(),
}: BuildFallbackSessionInput): AstraVoiceSession {
  return {
    sessionId: `astra-local-${now}`,
    expiresAt: new Date(now + 15 * 60 * 1000).toISOString(),
    state: 'ready',
    transport: 'turn_based_voice',
    voiceOutput: outputMode,
    speechInput: 'native_stt',
    model: hasBrainBackend ? 'orbitx-astra-brain' : 'local-astra-fallback',
  };
}

export function buildFallbackSuggestions(response: AstraResponse) {
  const suggestions = [
    ...response.actions.map((action) => action.label),
    ...(response.steps ?? []),
  ];

  return Array.from(new Set(suggestions.filter(Boolean))).slice(0, 4);
}
