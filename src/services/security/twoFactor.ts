import * as SecureStore from 'expo-secure-store';
import { generateSecret, generateURI, verify } from 'otplib';
import QRCode from 'qrcode';

import type { PendingTwoFactorSetup, TwoFactorProvider } from '../../types';

const TWO_FACTOR_SECRET_KEY = 'orbitx-security-2fa-secret-v1';
const SECURE_STORE_OPTIONS = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
} as const;

function normalizeAccountLabel(email?: string) {
  const fallback = 'orbitx-user';
  const sanitized = (email || fallback).trim().toLowerCase();
  return sanitized || fallback;
}

export function getTwoFactorProviderLabel(provider: TwoFactorProvider) {
  return provider === 'authy' ? 'Authy' : 'Google Authenticator';
}

export function formatTwoFactorManualKey(secret: string) {
  return secret
    .replace(/\s+/g, '')
    .match(/.{1,4}/g)
    ?.join(' ')
    .trim() ?? secret;
}

export function normalizeTwoFactorToken(token: string) {
  return token.replace(/\D/g, '').slice(0, 6);
}

export async function createTwoFactorSetup(params: {
  provider: TwoFactorProvider;
  email?: string;
}): Promise<PendingTwoFactorSetup & { secret: string }> {
  const secret = generateSecret();
  const accountLabel = normalizeAccountLabel(params.email);
  const otpauthUrl = generateURI({
    issuer: 'OrbitX',
    label: accountLabel,
    secret,
  });
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl, {
    margin: 1,
    width: 280,
    color: {
      dark: '#7B3FE4',
      light: '#00000000',
    },
  });

  return {
    provider: params.provider,
    manualKey: formatTwoFactorManualKey(secret),
    otpauthUrl,
    qrDataUrl,
    startedAt: new Date().toISOString(),
    secret,
  };
}

export async function verifyTwoFactorCode(secret: string, code: string) {
  const result = await verify({
    secret,
    token: normalizeTwoFactorToken(code),
  });

  return result.valid;
}

export async function storeTwoFactorSecret(secret: string) {
  await SecureStore.setItemAsync(TWO_FACTOR_SECRET_KEY, secret, SECURE_STORE_OPTIONS);
}

export async function readTwoFactorSecret() {
  return SecureStore.getItemAsync(TWO_FACTOR_SECRET_KEY);
}

export async function clearTwoFactorSecret() {
  await SecureStore.deleteItemAsync(TWO_FACTOR_SECRET_KEY);
}
