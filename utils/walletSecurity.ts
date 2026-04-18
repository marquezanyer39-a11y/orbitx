import * as SecureStore from 'expo-secure-store';

const WALLET_PIN_HASH_KEY = 'orbitx-wallet-pin-hash-v1';
const WALLET_PIN_UPDATED_AT_KEY = 'orbitx-wallet-pin-updated-at-v1';

const SECURE_STORE_OPTIONS = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
} as const;

export interface WalletPinState {
  enabled: boolean;
  updatedAt?: string;
}

function normalizePin(pin: string) {
  return pin.trim();
}

async function hashWalletPin(pin: string) {
  const normalizedPin = normalizePin(pin);
  const { ethers } = await import('ethers');
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(normalizedPin));
}

export function isValidWalletPin(pin: string) {
  return /^\d{4,6}$/.test(normalizePin(pin));
}

export async function getWalletPinState(): Promise<WalletPinState> {
  const [hash, updatedAt] = await Promise.all([
    SecureStore.getItemAsync(WALLET_PIN_HASH_KEY),
    SecureStore.getItemAsync(WALLET_PIN_UPDATED_AT_KEY),
  ]);

  return {
    enabled: Boolean(hash),
    updatedAt: updatedAt ?? undefined,
  };
}

export async function setWalletPin(pin: string) {
  if (!isValidWalletPin(pin)) {
    throw new Error('El PIN debe tener entre 4 y 6 digitos.');
  }

  const timestamp = new Date().toISOString();
  const hash = await hashWalletPin(pin);

  await Promise.all([
    SecureStore.setItemAsync(WALLET_PIN_HASH_KEY, hash, SECURE_STORE_OPTIONS),
    SecureStore.setItemAsync(WALLET_PIN_UPDATED_AT_KEY, timestamp, SECURE_STORE_OPTIONS),
  ]);

  return {
    enabled: true,
    updatedAt: timestamp,
  } satisfies WalletPinState;
}

export async function verifyWalletPin(pin: string) {
  const [storedHash, providedHash] = await Promise.all([
    SecureStore.getItemAsync(WALLET_PIN_HASH_KEY),
    hashWalletPin(pin),
  ]);

  if (!storedHash) {
    return false;
  }

  return storedHash === providedHash;
}
