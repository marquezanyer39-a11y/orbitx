import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type { SupportedNetwork } from '../types/wallet';
import type { ExternalWalletProvider } from '../../types';

declare const require: (moduleName: string) => any;

type WalletConnectNetwork = {
  id: number;
  name: string;
  chainNamespace: 'eip155';
  caipNetworkId: `eip155:${number}`;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: {
    default: {
      http: string[];
    };
    public: {
      http: string[];
    };
  };
  blockExplorers?: {
    default: {
      name: string;
      url: string;
    };
  };
};

type WalletConnectRuntimeModules = {
  AppKit: any;
  AppKitProvider: any;
  ConnectionsController: any;
  EthersAdapter: new () => unknown;
  createAppKit: (config: Record<string, unknown>) => unknown;
  useAccount: () => {
    address?: string;
    chainId?: string | number | null;
    isConnected?: boolean;
  };
  useAppKit: () => {
    open: () => void;
    disconnect: (namespace?: string) => Promise<void>;
    switchNetwork: (caipNetworkId: string) => Promise<void>;
  };
  useAppKitEventSubscription: (event: string, listener: (event: unknown) => void) => void;
  useProvider: () => {
    provider?: WalletConnectRequestProvider;
    providerType?: 'eip155' | string;
  };
  useWalletInfo: () => {
    walletInfo?: {
      name?: string;
    };
  };
};

export type WalletConnectRequestProvider = {
  request: <T = unknown>(
    args: {
      method: string;
      params?: unknown[] | Record<string, unknown> | object;
    },
    chain?: string,
    expiry?: number,
  ) => Promise<T>;
  on?: (event: string, listener: (args?: unknown) => void) => unknown;
  off?: (event: string, listener: (args?: unknown) => void) => unknown;
};

const metadata = {
  name: 'QVEX',
  description: 'QVEX wallet and trading hub',
  url: 'https://qvex.app',
  icons: ['https://qvex.app/icon.png'],
  redirect: {
    native: 'qvex://',
    universal: 'https://qvex.app/walletconnect',
  },
};

function createEvmNetwork(options: {
  id: number;
  name: string;
  nativeCurrency: WalletConnectNetwork['nativeCurrency'];
  rpcUrl: string;
  explorerName: string;
  explorerUrl: string;
}): WalletConnectNetwork {
  return {
    id: options.id,
    name: options.name,
    chainNamespace: 'eip155',
    caipNetworkId: `eip155:${options.id}`,
    nativeCurrency: options.nativeCurrency,
    rpcUrls: {
      default: {
        http: [options.rpcUrl],
      },
      public: {
        http: [options.rpcUrl],
      },
    },
    blockExplorers: {
      default: {
        name: options.explorerName,
        url: options.explorerUrl,
      },
    },
  };
}

const BASE_NETWORK = createEvmNetwork({
  id: 8453,
  name: 'Base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrl: 'https://mainnet.base.org',
  explorerName: 'Basescan',
  explorerUrl: 'https://basescan.org',
});
const ETHEREUM_NETWORK = createEvmNetwork({
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrl: 'https://ethereum-rpc.publicnode.com',
  explorerName: 'Etherscan',
  explorerUrl: 'https://etherscan.io',
});
const BNB_NETWORK = createEvmNetwork({
  id: 56,
  name: 'BNB Chain',
  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  rpcUrl: 'https://bsc-dataseed.binance.org',
  explorerName: 'BscScan',
  explorerUrl: 'https://bscscan.com',
});
const POLYGON_NETWORK = createEvmNetwork({
  id: 137,
  name: 'Polygon',
  nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
  rpcUrl: 'https://polygon-rpc.com',
  explorerName: 'PolygonScan',
  explorerUrl: 'https://polygonscan.com',
});
const NETWORKS: WalletConnectNetwork[] = [
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

const asyncStorageAdapter = {
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

let runtimeModules: WalletConnectRuntimeModules | null = null;
let runtimeLoadFailed = false;
let appKitInstance: unknown | null = null;

export const walletConnectProjectId = PROJECT_ID;
export const walletConnectConfigured = Boolean(walletConnectProjectId);
export const walletConnectRuntimeSupported =
  Platform.OS !== 'web' && Constants.executionEnvironment !== 'storeClient';

export function getWalletConnectRuntimeModules() {
  if (!walletConnectRuntimeSupported || runtimeLoadFailed) {
    return null;
  }

  if (runtimeModules) {
    return runtimeModules;
  }

  try {
    require('@walletconnect/react-native-compat');
    const appKitModule = require('@reown/appkit-react-native');
    const coreModule = require('@reown/appkit-core-react-native');
    const ethersModule = require('@reown/appkit-ethers-react-native');

    runtimeModules = {
      AppKit: appKitModule.AppKit,
      AppKitProvider: appKitModule.AppKitProvider,
      ConnectionsController: coreModule.ConnectionsController,
      EthersAdapter: ethersModule.EthersAdapter,
      createAppKit: appKitModule.createAppKit,
      useAccount: appKitModule.useAccount,
      useAppKit: appKitModule.useAppKit,
      useAppKitEventSubscription: appKitModule.useAppKitEventSubscription,
      useProvider: appKitModule.useProvider,
      useWalletInfo: appKitModule.useWalletInfo,
    };

    return runtimeModules;
  } catch {
    runtimeLoadFailed = true;
    if (__DEV__) {
      console.warn('[QVEX] WalletConnect runtime unavailable in this client.');
    }
    return null;
  }
}

function createWalletConnectAppKit() {
  if (!PROJECT_ID || !walletConnectRuntimeSupported) {
    return null;
  }

  if (appKitInstance) {
    return appKitInstance;
  }

  const runtime = getWalletConnectRuntimeModules();
  if (!runtime) {
    return null;
  }

  appKitInstance = runtime.createAppKit({
    projectId: PROJECT_ID,
    adapters: [new runtime.EthersAdapter()],
    networks: NETWORKS,
    defaultNetwork: BASE_NETWORK,
    metadata,
    storage: asyncStorageAdapter,
    enableAnalytics: false,
    debug: false,
    themeMode: 'dark',
    themeVariables: {
      accent: '#7B3FE4',
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

export const walletConnectAppKit = createWalletConnectAppKit();
export const walletConnectNetworks = {
  base: BASE_NETWORK,
  ethereum: ETHEREUM_NETWORK,
  bnb: BNB_NETWORK,
  polygon: POLYGON_NETWORK,
} as const;
export const WALLETCONNECT_TEST_MESSAGE = 'Conectar wallet externa a QVEX';

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

export function getWalletConnectTargetNetwork(network: SupportedNetwork): WalletConnectNetwork {
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
