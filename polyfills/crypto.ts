const { Buffer } = require('buffer') as typeof import('buffer');
const ExpoCrypto = require('expo-crypto') as typeof import('expo-crypto');

type ProcessLike = {
  version?: string;
  browser?: boolean;
  env?: Record<string, string | undefined>;
  nextTick?: (callback: (...args: unknown[]) => void, ...args: unknown[]) => void;
};

type CryptoLike = {
  getRandomValues?: <T extends ArrayBufferView>(array: T) => T;
  randomUUID?: () => string;
};

const globalTarget = globalThis as typeof globalThis & {
  Buffer?: typeof import('buffer').Buffer;
  process?: ProcessLike;
};

const processTarget: ProcessLike =
  typeof globalTarget.process === 'object' && globalTarget.process
    ? (globalTarget.process as ProcessLike)
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

if (typeof globalTarget.Buffer === 'undefined') {
  Object.defineProperty(globalTarget, 'Buffer', {
    value: Buffer,
    configurable: true,
  });
}

require('react-native-get-random-values');
require('react-native-url-polyfill/auto');
require('@ethersproject/shims');

const cryptoTarget: CryptoLike =
  typeof globalTarget.crypto === 'object' && globalTarget.crypto
    ? (globalTarget.crypto as CryptoLike)
    : {};

if (typeof cryptoTarget.getRandomValues !== 'function') {
  cryptoTarget.getRandomValues = <T extends ArrayBufferView>(array: T) => {
    ExpoCrypto.getRandomValues(array as never);
    return array;
  };
}

if (typeof cryptoTarget.randomUUID !== 'function') {
  cryptoTarget.randomUUID = () =>
    `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;
}

if (typeof globalTarget.crypto !== 'object' || !globalTarget.crypto) {
  Object.defineProperty(globalTarget, 'crypto', {
    value: cryptoTarget,
    configurable: true,
  });
}

export {};
