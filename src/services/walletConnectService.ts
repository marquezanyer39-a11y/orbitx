import '@walletconnect/react-native-compat';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import {
  type Storage,
  createAppKit,
} from '@reown/appkit-react-native';
import type { AppKitNetwork, Metadata } from '@reown/appkit-common-react-native';
import { EthersAdapter } from '@reown/appkit-ethers-react-native';
import { base, bsc, mainnet, polygon } from 'viem/chains';

import type { SupportedNetwork } from '../types/wallet';
import type { ExternalWalletProvider } from '../../types';

const metadata: Metadata = {
  name: 'OrbitX',
  description: 'OrbitX wallet and trading hub',
  url: 'https://orbitx.app',
  icons: ['https://orbitx.app/icon.png'],
  redirect: {
    native: 'orbitx://',
    universal: 'https://orbitx.app/walletconnect',
  },
};

function toAppKitNetwork(
  network: typeof base | typeof mainnet | typeof bsc | typeof polygon,
): AppKitNetwork {
  return {
    ...network,
    chainNamespace: 'eip155',
    caipNetworkId: `eip155:${network.id}`,
  };
}

const BASE_NETWORK = toAppKitNetwork(base);
const ETHEREUM_NETWORK = toAppKitNetwork(mainnet);
const BNB_NETWORK = toAppKitNetwork(bsc);
const POLYGON_NETWORK = toAppKitNetwork(polygon);
const NETWORKS: AppKitNetwork[] = [
  BASE_NETWORK,
  ETHEREUM_NETWORK,
  BNB_NETWORK,
  POLYGON_NETWORK,
];

function readWalletConnectProjectId() {
  const envProjectId = process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID;
  const extraProjectId =
    typeof Constants.expoConfig?.extra?.walletConnectProjectId === 'string'
      ? Constants.expoConfig.extra.walletConnectProjectId
      : '';

  return (envProjectId ?? extraProjectId ?? '').trim();
}

const PROJECT_ID = readWalletConnectProjectId();

const asyncStorageAdapter: Storage = {
  async getKeys() {
    const keys = await AsyncStorage.getAllKeys();
    return [...keys];
  },
  async getEntries<T = unknown>() {
    const keys = await AsyncStorage.getAllKeys();
    if (!keys.length) {
      return [];
    }

    const pairs = await AsyncStorage.multiGet(keys);
    return pairs
      .map(([key, rawValue]) => {
        if (!rawValue) {
          return null;
        }

        try {
          return [key, JSON.parse(rawValue) as T] as [string, T];
        } catch {
          return [key, rawValue as T] as [string, T];
        }
      })
      .filter((entry): entry is [string, T] => Boolean(entry));
  },
  async getItem<T = unknown>(key: string) {
    const rawValue = await AsyncStorage.getItem(key);
    if (rawValue == null) {
      return undefined;
    }

    try {
      return JSON.parse(rawValue) as T;
    } catch {
      return rawValue as T;
    }
  },
  async setItem<T = unknown>(key: string, value: T) {
    if (typeof value === 'string') {
      await AsyncStorage.setItem(key, value);
      return;
    }

    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
  },
};

let appKitInstance: ReturnType<typeof createAppKit> | null = null;

function createWalletConnectAppKit() {
  if (!PROJECT_ID) {
    return null;
  }

  if (appKitInstance) {
    return appKitInstance;
  }

  appKitInstance = createAppKit({
    projectId: PROJECT_ID,
    adapters: [new EthersAdapter()],
    networks: NETWORKS,
    defaultNetwork: BASE_NETWORK,
    metadata,
    storage: asyncStorageAdapter,
    enableAnalytics: false,
    debug: __DEV__,
    themeMode: 'dark',
    themeVariables: {
      accent: '#00FFA3',
    },
    features: {
      onramp: false,
      swaps: false,
      socials: false,
      showWallets: true,
    },
  });

  return appKitInstance;
}

export const walletConnectProjectId = PROJECT_ID;
export const walletConnectConfigured = Boolean(walletConnectProjectId);
export const walletConnectRuntimeSupported = Constants.executionEnvironment !== 'storeClient';
export const walletConnectAppKit = createWalletConnectAppKit();
export const walletConnectNetworks = {
  base: BASE_NETWORK,
  ethereum: ETHEREUM_NETWORK,
  bnb: BNB_NETWORK,
  polygon: POLYGON_NETWORK,
} as const;
export const WALLETCONNECT_TEST_MESSAGE = 'Conectar wallet externa a OrbitX';

export function resolveExternalWalletProvider(walletName?: string | null): ExternalWalletProvider {
  const normalized = walletName?.trim().toLowerCase() ?? '';

  if (normalized.includes('metamask')) {
    return 'metamask';
  }

  if (normalized.includes('trust')) {
    return 'trust';
  }

  if (normalized.includes('coinbase')) {
    return 'coinbase';
  }

  if (!normalized) {
    return 'walletconnect';
  }

  return 'other';
}

export function resolveWalletConnectChainId(value?: string | number | null) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

export function getWalletConnectNetworkLabel(chainId?: number | string) {
  const resolvedChainId =
    typeof chainId === 'string' ? Number(chainId) || chainId : chainId;

  switch (resolvedChainId) {
    case 1:
      return 'Ethereum';
    case 8453:
      return 'Base';
    case 56:
      return 'BNB Chain';
    case 137:
      return 'Polygon';
    default:
      return resolvedChainId ? `Chain ${resolvedChainId}` : 'Sin red';
  }
}

export function getWalletConnectTargetNetwork(network: SupportedNetwork): AppKitNetwork {
  if (network === 'ethereum') {
    return walletConnectNetworks.ethereum;
  }

  if (network === 'bnb') {
    return walletConnectNetworks.bnb;
  }

  return walletConnectNetworks.base;
}

export function isSupportedWalletConnectChain(chainId?: number) {
  return chainId === 1 || chainId === 8453 || chainId === 56 || chainId === 137;
}

export function mapWalletConnectChainToOrbitNetwork(chainId?: number): SupportedNetwork | null {
  if (chainId === 1) {
    return 'ethereum';
  }

  if (chainId === 8453) {
    return 'base';
  }

  if (chainId === 56) {
    return 'bnb';
  }

  return null;
}
