import * as SecureStore from 'expo-secure-store';

import type { WalletNetwork } from '../types';

const WALLET_MNEMONIC_KEY = 'orbitx-wallet-mnemonic-v2';
const WALLET_CREATED_AT_KEY = 'orbitx-wallet-created-at-v2';
const WALLET_SEED_REVEALED_AT_KEY = 'orbitx-wallet-seed-revealed-at-v2';
const WALLET_SEED_CONFIRMED_AT_KEY = 'orbitx-wallet-seed-confirmed-at-v2';
const SOLANA_SECRET_KEY_LEGACY = 'orbitx-wallet-beta-solana-secret-v1';
const SOLANA_DERIVATION_MODE_KEY = 'orbitx-wallet-solana-derivation-v2';
const SOLANA_DERIVATION_PATH = "m/44'/501'/0'/0'";
const WALLET_ENTROPY_BYTES = 16;

const SECURE_STORE_OPTIONS = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
} as const;

type SolanaDerivationMode = 'legacy' | 'mnemonic';

export interface WalletSecurityState {
  createdAt?: string;
  revealedAt?: string;
  confirmedAt?: string;
}

export interface WalletBundle {
  mnemonic: string;
  receiveAddresses: Record<WalletNetwork, string>;
  security: WalletSecurityState;
}

type Bs58Runtime = {
  encode: (value: Uint8Array) => string;
  decode: (value: string) => Uint8Array;
};

type Bip39Seed = {
  toString?: (encoding?: string) => string;
  length?: number;
  [index: number]: number;
};

type Bip39Runtime = {
  validateMnemonic: (value: string) => boolean;
  mnemonicToSeedSync: (value: string) => Bip39Seed | Uint8Array;
  entropyToMnemonic: (value: string) => string;
};

type HdKeyRuntime = {
  derivePath: (path: string, seedHex: string) => { key?: Uint8Array | ArrayLike<number> | null };
};

type ExpoCryptoRuntime = {
  getRandomValues?: <T extends ArrayBufferView>(typedArray: T) => T;
  getRandomBytes?: (byteCount: number) => Uint8Array;
  getRandomBytesAsync?: (byteCount: number) => Promise<Uint8Array>;
};

type NodeProcessLike = {
  version?: string;
  browser?: boolean;
  env?: Record<string, string | undefined>;
  nextTick?: (callback: (...args: unknown[]) => void, ...args: unknown[]) => void;
};

let cryptoRuntimePromise: Promise<{
  ethers: typeof import('ethers').ethers;
  bs58: Bs58Runtime;
  nacl: typeof import('tweetnacl');
  bip39: Bip39Runtime;
  hdKey: HdKeyRuntime;
}> | null = null;

let expoCryptoRuntimePromise: Promise<ExpoCryptoRuntime | null> | null = null;

function normalizeMnemonic(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function bytesToHex(value: ArrayLike<number> | Uint8Array) {
  return Array.from(Uint8Array.from(value))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function hasSecureRandomSource() {
  return (
    typeof globalThis.crypto !== 'undefined' &&
    typeof globalThis.crypto.getRandomValues === 'function'
  );
}

function ensureNodeLikeGlobals() {
  const globalTarget = globalThis as typeof globalThis & {
    Buffer?: typeof import('buffer').Buffer;
    process?: NodeProcessLike;
  };

  if (typeof globalTarget.Buffer === 'undefined') {
    const { Buffer } = require('buffer') as typeof import('buffer');
    Object.defineProperty(globalTarget, 'Buffer', {
      value: Buffer,
      configurable: true,
    });
  }

  const processTarget: NodeProcessLike =
    typeof globalTarget.process === 'object' && globalTarget.process
      ? globalTarget.process
      : {};

  if (typeof processTarget.version !== 'string') {
    processTarget.version = 'v18.0.0';
  }

  if (typeof processTarget.browser !== 'boolean') {
    processTarget.browser = false;
  }

  if (typeof processTarget.env !== 'object' || !processTarget.env) {
    processTarget.env = {};
  }

  if (typeof processTarget.nextTick !== 'function') {
    processTarget.nextTick = (callback, ...args) => {
      setTimeout(() => callback(...args), 0);
    };
  }

  if (typeof globalTarget.process !== 'object' || !globalTarget.process) {
    Object.defineProperty(globalTarget, 'process', {
      value: processTarget,
      configurable: true,
    });
  }
}

async function loadExpoCryptoRuntime() {
  if (!expoCryptoRuntimePromise) {
    expoCryptoRuntimePromise = import('expo-crypto')
      .then((module) => module as ExpoCryptoRuntime)
      .catch(() => null);
  }

  return expoCryptoRuntimePromise;
}

async function ensureSecureRandomSource() {
  if (hasSecureRandomSource()) {
    return true;
  }

  const expoCrypto = await loadExpoCryptoRuntime();
  if (!expoCrypto) {
    return false;
  }

  const cryptoTarget = (
    typeof globalThis.crypto === 'object' && globalThis.crypto ? globalThis.crypto : {}
  ) as {
    getRandomValues?: <T extends ArrayBufferView>(typedArray: T) => T;
  };

  if (typeof cryptoTarget.getRandomValues !== 'function') {
    if (expoCrypto.getRandomValues) {
      cryptoTarget.getRandomValues = <T extends ArrayBufferView>(typedArray: T) =>
        expoCrypto.getRandomValues?.(typedArray) ?? typedArray;
    } else if (expoCrypto.getRandomBytes || expoCrypto.getRandomBytesAsync) {
      cryptoTarget.getRandomValues = <T extends ArrayBufferView>(typedArray: T) => {
        const byteView = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
        const bytes = expoCrypto.getRandomBytes
          ? expoCrypto.getRandomBytes(typedArray.byteLength)
          : new Uint8Array(typedArray.byteLength);
        byteView.set(bytes);
        return typedArray;
      };
    }
  }

  if (typeof globalThis.crypto !== 'object' || !globalThis.crypto) {
    Object.defineProperty(globalThis, 'crypto', {
      value: cryptoTarget,
      configurable: true,
    });
  }

  return hasSecureRandomSource();
}

async function getSecureRandomBytes(length: number) {
  if (length <= 0) {
    return new Uint8Array();
  }

  await ensureSecureRandomSource();

  if (hasSecureRandomSource()) {
    const bytes = new Uint8Array(length);
    globalThis.crypto.getRandomValues(bytes);
    return bytes;
  }

  const expoCrypto = await loadExpoCryptoRuntime();
  if (expoCrypto?.getRandomBytesAsync) {
    return Uint8Array.from(await expoCrypto.getRandomBytesAsync(length));
  }

  if (expoCrypto?.getRandomBytes) {
    return Uint8Array.from(expoCrypto.getRandomBytes(length));
  }

  throw new Error(
    'No encontramos una fuente segura de aleatoriedad para crear tu billetera. Reinicia OrbitX o actualiza la app e intentalo de nuevo.',
  );
}

function seedToHex(seed: Bip39Seed | Uint8Array) {
  if (seed && typeof seed.toString === 'function') {
    try {
      const hexCandidate = seed.toString('hex');
      if (hexCandidate && /^[0-9a-f]+$/i.test(hexCandidate)) {
        return hexCandidate.toLowerCase();
      }
    } catch {
      // Intenta con el camino alterno de bytes abajo.
    }
  }

  if (typeof seed.length === 'number' && seed.length > 0) {
    return bytesToHex(Uint8Array.from(seed as ArrayLike<number>));
  }

  throw new Error('No se pudo derivar la semilla maestra de la billetera.');
}

async function loadCryptoRuntime() {
  if (!cryptoRuntimePromise) {
    cryptoRuntimePromise = (async () => {
      ensureNodeLikeGlobals();
      await ensureSecureRandomSource();
      await import('react-native-get-random-values');
      await import('@ethersproject/shims');

      const [{ ethers }, bs58Module, naclModule, bip39Module, hdKeyModule] = await Promise.all([
        import('ethers'),
        import('bs58'),
        import('tweetnacl'),
        import('bip39'),
        import('ed25519-hd-key'),
      ]);

      return {
        ethers,
        bs58: ('default' in bs58Module ? bs58Module.default : bs58Module) as unknown as Bs58Runtime,
        nacl: ('default' in naclModule ? naclModule.default : naclModule) as typeof import('tweetnacl'),
        bip39: ('default' in bip39Module ? bip39Module.default : bip39Module) as Bip39Runtime,
        hdKey: ('default' in hdKeyModule ? hdKeyModule.default : hdKeyModule) as unknown as HdKeyRuntime,
      };
    })();
  }

  return cryptoRuntimePromise;
}

async function createSecureMnemonic() {
  const { bip39 } = await loadCryptoRuntime();
  const entropy = await getSecureRandomBytes(WALLET_ENTROPY_BYTES);
  const mnemonic = normalizeMnemonic(bip39.entropyToMnemonic(bytesToHex(entropy)));

  if (!mnemonic || !bip39.validateMnemonic(mnemonic)) {
    throw new Error('No se pudo generar una frase semilla valida para tu billetera.');
  }

  return mnemonic;
}

async function deriveEvmAddress(mnemonic: string) {
  const { ethers } = await loadCryptoRuntime();
  try {
    return ethers.Wallet.fromMnemonic(mnemonic).address;
  } catch (error) {
    throw new Error(
      error instanceof Error && /getRandomValues/i.test(error.message)
        ? 'OrbitX no pudo inicializar el motor seguro de billetera. Cierra y vuelve a abrir la app.'
        : 'No se pudo derivar la direccion EVM desde la frase semilla.',
    );
  }
}

async function deriveSolanaAddressFromMnemonic(mnemonic: string) {
  const { bip39, bs58, hdKey, nacl } = await loadCryptoRuntime();
  const seedHex = seedToHex(bip39.mnemonicToSeedSync(mnemonic));
  const derivedPath = hdKey.derivePath(SOLANA_DERIVATION_PATH, seedHex);
  const derivedKey = derivedPath?.key ? Uint8Array.from(derivedPath.key) : null;

  if (!derivedKey || derivedKey.length < 32) {
    throw new Error('No se pudo derivar la direccion de Solana desde la frase semilla.');
  }

  const keyPair = nacl.sign.keyPair.fromSeed(derivedKey.slice(0, 32));
  return bs58.encode(Uint8Array.from(keyPair.publicKey));
}

async function getLegacySolanaAddress() {
  const storedSecret = await SecureStore.getItemAsync(SOLANA_SECRET_KEY_LEGACY);
  if (!storedSecret) {
    return '';
  }

  const { bs58, nacl } = await loadCryptoRuntime();
  const secretKey = bs58.decode(storedSecret);
  if (!secretKey.length) {
    return '';
  }

  const keyPair = nacl.sign.keyPair.fromSecretKey(Uint8Array.from(secretKey));
  return bs58.encode(Uint8Array.from(keyPair.publicKey));
}

async function deriveSolanaAddress(mnemonic: string) {
  const derivationMode = (await SecureStore.getItemAsync(
    SOLANA_DERIVATION_MODE_KEY,
  )) as SolanaDerivationMode | null;
  const hasLegacySecret = Boolean(await SecureStore.getItemAsync(SOLANA_SECRET_KEY_LEGACY));

  if (derivationMode === 'legacy' || (!derivationMode && hasLegacySecret)) {
    const legacyAddress = await getLegacySolanaAddress();
    if (legacyAddress) {
      return legacyAddress;
    }
  }

  return deriveSolanaAddressFromMnemonic(mnemonic);
}

async function deriveReceiveAddresses(mnemonic: string): Promise<Record<WalletNetwork, string>> {
  const [evmAddress, solanaAddress] = await Promise.all([
    deriveEvmAddress(mnemonic),
    deriveSolanaAddress(mnemonic),
  ]);

  return {
    ethereum: evmAddress,
    base: evmAddress,
    bnb: evmAddress,
    solana: solanaAddress,
  };
}

async function buildWalletBundle(
  mnemonic: string,
  security: WalletSecurityState = {},
): Promise<WalletBundle> {
  const normalizedMnemonic = normalizeMnemonic(mnemonic);

  if (!normalizedMnemonic) {
    throw new Error('La frase semilla esta vacia.');
  }

  const valid = await validateWalletMnemonic(normalizedMnemonic);
  if (!valid) {
    throw new Error('La frase semilla no es valida.');
  }

  return {
    mnemonic: normalizedMnemonic,
    receiveAddresses: await deriveReceiveAddresses(normalizedMnemonic),
    security: Object.keys(security).length ? security : await getWalletSecurityState(),
  };
}

async function persistMnemonic(mnemonic: string) {
  const normalizedMnemonic = normalizeMnemonic(mnemonic);
  const createdAt = (await SecureStore.getItemAsync(WALLET_CREATED_AT_KEY)) ?? new Date().toISOString();

  await Promise.all([
    SecureStore.setItemAsync(WALLET_MNEMONIC_KEY, normalizedMnemonic, SECURE_STORE_OPTIONS),
    SecureStore.setItemAsync(WALLET_CREATED_AT_KEY, createdAt, SECURE_STORE_OPTIONS),
    SecureStore.setItemAsync(SOLANA_DERIVATION_MODE_KEY, 'mnemonic', SECURE_STORE_OPTIONS),
    SecureStore.deleteItemAsync(SOLANA_SECRET_KEY_LEGACY),
  ]);

  return normalizedMnemonic;
}

export async function validateWalletMnemonic(value: string) {
  const normalizedMnemonic = normalizeMnemonic(value);
  if (!normalizedMnemonic) {
    return false;
  }

  const { bip39 } = await loadCryptoRuntime();
  return bip39.validateMnemonic(normalizedMnemonic);
}

export async function getWalletSecurityState(): Promise<WalletSecurityState> {
  const [createdAt, revealedAt, confirmedAt] = await Promise.all([
    SecureStore.getItemAsync(WALLET_CREATED_AT_KEY),
    SecureStore.getItemAsync(WALLET_SEED_REVEALED_AT_KEY),
    SecureStore.getItemAsync(WALLET_SEED_CONFIRMED_AT_KEY),
  ]);

  return {
    createdAt: createdAt ?? undefined,
    revealedAt: revealedAt ?? undefined,
    confirmedAt: confirmedAt ?? undefined,
  };
}

export async function markWalletSeedRevealed() {
  const timestamp = new Date().toISOString();
  await SecureStore.setItemAsync(WALLET_SEED_REVEALED_AT_KEY, timestamp, SECURE_STORE_OPTIONS);
  return timestamp;
}

export async function markWalletSeedConfirmed() {
  const timestamp = new Date().toISOString();
  await SecureStore.setItemAsync(WALLET_SEED_CONFIRMED_AT_KEY, timestamp, SECURE_STORE_OPTIONS);
  return timestamp;
}

export async function getStoredWalletBundle(): Promise<WalletBundle | null> {
  const mnemonic = await SecureStore.getItemAsync(WALLET_MNEMONIC_KEY);
  if (!mnemonic) {
    return null;
  }

  return buildWalletBundle(mnemonic);
}

export async function readStoredWalletMnemonic() {
  const mnemonic = await SecureStore.getItemAsync(WALLET_MNEMONIC_KEY);
  return mnemonic ? normalizeMnemonic(mnemonic) : null;
}

export async function createWalletBundle(): Promise<WalletBundle> {
  const existingBundle = await getStoredWalletBundle();
  if (existingBundle) {
    return existingBundle;
  }

  const mnemonic = await createSecureMnemonic();
  const receiveAddresses = await deriveReceiveAddresses(mnemonic);
  const persistedMnemonic = await persistMnemonic(mnemonic);
  const security = await getWalletSecurityState();

  return {
    mnemonic: persistedMnemonic,
    receiveAddresses,
    security,
  };
}

export async function importWalletBundle(mnemonic: string): Promise<WalletBundle> {
  const normalizedMnemonic = normalizeMnemonic(mnemonic);
  const valid = await validateWalletMnemonic(normalizedMnemonic);

  if (!valid) {
    throw new Error('La frase semilla no es valida.');
  }

  const previewBundle = await buildWalletBundle(normalizedMnemonic);
  const persistedMnemonic = await persistMnemonic(normalizedMnemonic);
  const confirmedAt = await markWalletSeedConfirmed();

  return {
    ...previewBundle,
    mnemonic: persistedMnemonic,
    security: {
      ...previewBundle.security,
      confirmedAt,
    },
  };
}

export async function getOrCreateWalletBundle(): Promise<WalletBundle> {
  return (await getStoredWalletBundle()) ?? createWalletBundle();
}

export async function clearStoredWalletBundle() {
  await Promise.all([
    SecureStore.deleteItemAsync(WALLET_MNEMONIC_KEY),
    SecureStore.deleteItemAsync(WALLET_CREATED_AT_KEY),
    SecureStore.deleteItemAsync(WALLET_SEED_REVEALED_AT_KEY),
    SecureStore.deleteItemAsync(WALLET_SEED_CONFIRMED_AT_KEY),
    SecureStore.deleteItemAsync(SOLANA_SECRET_KEY_LEGACY),
    SecureStore.deleteItemAsync(SOLANA_DERIVATION_MODE_KEY),
  ]);
}

export function maskAddress(address?: string | null) {
  const normalized = typeof address === 'string' ? address.trim() : '';

  if (!normalized) {
    return '';
  }

  if (normalized.length < 12) {
    return normalized;
  }

  return `${normalized.slice(0, 6)}...${normalized.slice(-6)}`;
}
