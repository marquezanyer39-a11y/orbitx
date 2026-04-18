import { DEFAULT_ASTRA_VOICE_PRESET_ID } from './astraVoiceProfiles';

export type AstraVoiceProvider = 'elevenlabs' | 'device';
export type AstraVoiceOutputMode = 'server_tts' | 'device_tts';
export const ORBITX_BACKEND_URL_ENV_NAME = 'EXPO_PUBLIC_ORBITX_BACKEND_URL';
export const LEGACY_ASTRA_BACKEND_URL_ENV_NAME = 'EXPO_PUBLIC_ASTRA_VOICE_API_URL';

function normalizeBoolean(value: string | null | undefined, fallback: boolean) {
  const normalized = `${value ?? ''}`.trim().toLowerCase();
  if (!normalized) {
    return fallback;
  }

  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return fallback;
}

function normalizeBaseUrl(value?: string | null) {
  const normalized = `${value ?? ''}`.trim().replace(/\/$/, '');
  if (!normalized) {
    return '';
  }

  if (
    normalized.includes('your-backend.example.com') ||
    normalized.includes('example.invalid')
  ) {
    return '';
  }

  return normalized;
}

export function getAstraBackendBaseUrl() {
  return normalizeBaseUrl(
    process.env[ORBITX_BACKEND_URL_ENV_NAME] ??
      process.env[LEGACY_ASTRA_BACKEND_URL_ENV_NAME] ??
      '',
  );
}

export interface AstraVoiceRuntimeConfig {
  backendBaseUrl: string;
  premiumBackendConfigured: boolean;
  provider: AstraVoiceProvider;
  outputMode: AstraVoiceOutputMode;
  selectedPresetId: string;
  allowDeviceFallback: boolean;
}

export function getAstraVoiceRuntimeConfig(): AstraVoiceRuntimeConfig {
  const backendBaseUrl = getAstraBackendBaseUrl();
  const premiumBackendConfigured = Boolean(backendBaseUrl);

  return {
    backendBaseUrl,
    premiumBackendConfigured,
    provider: premiumBackendConfigured ? 'elevenlabs' : 'device',
    outputMode: premiumBackendConfigured ? 'server_tts' : 'device_tts',
    selectedPresetId:
      `${process.env.EXPO_PUBLIC_ASTRA_VOICE_PRESET_ID ?? ''}`.trim() ||
      DEFAULT_ASTRA_VOICE_PRESET_ID,
    allowDeviceFallback: normalizeBoolean(
      process.env.EXPO_PUBLIC_ASTRA_ALLOW_DEVICE_FALLBACK,
      true,
    ),
  };
}

export function hasAstraBackend() {
  return Boolean(getAstraBackendBaseUrl());
}

export function hasPremiumAstraVoiceBackend() {
  return getAstraVoiceRuntimeConfig().premiumBackendConfigured;
}
