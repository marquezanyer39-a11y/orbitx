import { getMarketsList } from '../api/market';
import { discoverTokensByAddress, isTokenDiscoveryConfigured } from './tokenDiscovery';
import {
  EXTERNAL_EVM_NETWORKS,
  EXTERNAL_EVM_NETWORK_ORDER,
  EXTERNAL_EVM_SUPPORTED_NETWORKS,
  getEnabledTokenSpecs,
  type ExternalEvmNetworkSpec,
  type ExternalTokenSpec,
} from './tokenRegistry';

export type ExternalWalletBalanceStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'partial'
  | 'error'
  | 'unsupported';

export interface ExternalWalletBalanceAsset {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  decimals: number;
  usdPrice?: number;
  usdValue: number;
  priceAvailable: boolean;
  chainId: number;
  chainLabel: string;
  type: 'native' | 'erc20';
  contractAddress?: string;
  image?: string;
}

export interface ExternalWalletBalanceSnapshot {
  address: string;
  chainId: number;
  chainLabel: string;
  fetchedAt: string;
  nativeAsset?: ExternalWalletBalanceAsset;
  tokenAssets: ExternalWalletBalanceAsset[];
  assets: ExternalWalletBalanceAsset[];
  failedTokenCount: number;
  status: Exclude<ExternalWalletBalanceStatus, 'idle' | 'loading'>;
  message?: string;
  discoveryEnabled: boolean;
  hasUnpricedAssets: boolean;
}

export interface ExternalWalletNetworkBalanceState {
  chainId: number;
  chainLabel: string;
  status: Exclude<ExternalWalletBalanceStatus, 'idle' | 'loading'>;
  assetCount: number;
  visibleAssetCount: number;
  failedTokenCount: number;
  updatedAt?: string;
  message?: string;
}

export interface ExternalWalletMultiChainBalanceSnapshot {
  address: string;
  fetchedAt: string;
  assets: ExternalWalletBalanceAsset[];
  visibleAssets: ExternalWalletBalanceAsset[];
  totalUsdEstimate: number;
  networkStates: ExternalWalletNetworkBalanceState[];
  failedNetworkCount: number;
  status: Exclude<ExternalWalletBalanceStatus, 'idle' | 'loading'>;
  message?: string;
  discoveryEnabled: boolean;
  hasUnpricedAssets: boolean;
}

const ERC20_ABI = ['function balanceOf(address owner) view returns (uint256)'];
const BALANCE_TIMEOUT_MS = 8_000;

let ethersRuntimePromise: Promise<typeof import('ethers').ethers> | null = null;
const providerCache = new Map<number, unknown>();
let marketCache:
  | {
      fetchedAt: number;
      markets: Awaited<ReturnType<typeof getMarketsList>>;
    }
  | null = null;

const MARKET_CACHE_TTL_MS = 60_000;

async function getEthersRuntime() {
  if (!ethersRuntimePromise) {
    ethersRuntimePromise = (async () => {
      await import('react-native-get-random-values');
      await import('@ethersproject/shims');
      const module = await import('ethers');
      return module.ethers;
    })();
  }

  return ethersRuntimePromise;
}

async function getMarketsListCached() {
  if (marketCache && Date.now() - marketCache.fetchedAt < MARKET_CACHE_TTL_MS) {
    return marketCache.markets;
  }

  const markets = await getMarketsList();
  marketCache = {
    fetchedAt: Date.now(),
    markets,
  };
  return markets;
}

async function getProvider(network: ExternalEvmNetworkSpec) {
  const cached = providerCache.get(network.chainId);
  if (cached) {
    return cached as import('ethers').ethers.providers.StaticJsonRpcProvider;
  }

  const ethers = await getEthersRuntime();
  const provider = new ethers.providers.StaticJsonRpcProvider(network.rpcUrl, network.chainId);
  providerCache.set(network.chainId, provider);
  return provider;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

function getSupportedNetwork(chainId?: number | null) {
  if (!chainId) {
    return null;
  }

  return EXTERNAL_EVM_NETWORKS[chainId] ?? null;
}

function getPriceForSymbol(
  symbol: string,
  markets: Awaited<ReturnType<typeof getMarketsList>>,
) {
  const normalized = symbol.toUpperCase();

  if (normalized === 'USDT' || normalized === 'USDC' || normalized === 'DAI' || normalized === 'BUSD') {
    return 1;
  }

  const market = markets.find((item) => item.baseSymbol.toUpperCase() === normalized);
  return market?.price ?? null;
}

function getImageForSymbol(
  symbol: string,
  markets: Awaited<ReturnType<typeof getMarketsList>>,
) {
  return markets.find((item) => item.baseSymbol.toUpperCase() === symbol.toUpperCase())?.image;
}

function buildAsset(params: {
  amount: number;
  chain: ExternalEvmNetworkSpec;
  decimals: number;
  name: string;
  priceSymbol?: string;
  symbol: string;
  type: 'native' | 'erc20';
  contractAddress?: string;
  markets: Awaited<ReturnType<typeof getMarketsList>>;
}): ExternalWalletBalanceAsset {
  const priceSymbol = params.priceSymbol ?? params.symbol;
  const usdPrice = getPriceForSymbol(priceSymbol, params.markets);
  const priceAvailable = usdPrice !== null;
  const usdValue = priceAvailable ? params.amount * usdPrice : 0;

  return {
    id:
      params.type === 'native'
        ? `${params.chain.chainId}-native-${params.symbol}`
        : `${params.chain.chainId}-${params.contractAddress?.toLowerCase() ?? params.symbol}`,
    symbol: params.symbol,
    name: params.name,
    amount: params.amount,
    decimals: params.decimals,
    usdPrice: usdPrice ?? undefined,
    usdValue,
    priceAvailable,
    chainId: params.chain.chainId,
    chainLabel: params.chain.chainLabel,
    type: params.type,
    contractAddress: params.contractAddress,
    image: getImageForSymbol(priceSymbol, params.markets),
  };
}

function normalizeAddress(address: string) {
  const normalized = address.trim();

  if (!normalized) {
    throw new Error('No hay una direccion externa conectada.');
  }

  return normalized;
}

export function isExternalWalletBalanceChainSupported(chainId?: number | null) {
  return Boolean(getSupportedNetwork(chainId));
}

export function getExternalWalletBalanceNetworkLabel(chainId?: number | null) {
  return getSupportedNetwork(chainId)?.chainLabel ?? (chainId ? `Chain ${chainId}` : 'Sin red');
}

export async function getNativeBalance(
  address: string,
  chainId?: number | null,
): Promise<ExternalWalletBalanceAsset> {
  const chain = getSupportedNetwork(chainId);
  if (!chain) {
    throw new Error('Red no soportada para balances externos.');
  }

  const normalizedAddress = normalizeAddress(address);
  const [ethers, provider, markets] = await Promise.all([
    getEthersRuntime(),
    getProvider(chain),
    getMarketsListCached(),
  ]);
  const rawBalance = await withTimeout(
    provider.getBalance(normalizedAddress),
    BALANCE_TIMEOUT_MS,
    'La red tardo demasiado en responder.',
  );
  const amount = Number(ethers.utils.formatUnits(rawBalance, chain.nativeDecimals));

  return buildAsset({
    amount,
    decimals: chain.nativeDecimals,
    chain,
    markets,
    name: chain.nativeName,
    priceSymbol: chain.priceSymbol,
    symbol: chain.nativeSymbol,
    type: 'native',
  });
}

export async function getTokenBalances(
  address: string,
  chainId?: number | null,
): Promise<{
  assets: ExternalWalletBalanceAsset[];
  failedTokenCount: number;
}> {
  const chain = getSupportedNetwork(chainId);
  if (!chain) {
    throw new Error('Red no soportada para balances externos.');
  }

  const normalizedAddress = normalizeAddress(address);
  const [ethers, provider, markets] = await Promise.all([
    getEthersRuntime(),
    getProvider(chain),
    getMarketsListCached(),
  ]);

  const discoveredTokens = await discoverTokensByAddress(normalizedAddress, chain.chainId);
  const tokenMap = new Map<string, ExternalTokenSpec>();
  [...getEnabledTokenSpecs(chain), ...discoveredTokens].forEach((token) => {
    const key = token.contractAddress.trim().toLowerCase();
    if (!key || tokenMap.has(key)) {
      return;
    }

    tokenMap.set(key, token);
  });
  const tokens = [...tokenMap.values()];

  const settled = await Promise.allSettled(
    tokens.map(async (token) => {
      const contract = new ethers.Contract(token.contractAddress, ERC20_ABI, provider);
      const rawBalance = await withTimeout(
        contract.balanceOf(normalizedAddress),
        BALANCE_TIMEOUT_MS,
        'La red tardo demasiado en responder.',
      );
      const amount = Number(
        ethers.utils.formatUnits(
          rawBalance as Parameters<typeof ethers.utils.formatUnits>[0],
          token.decimals,
        ),
      );

      return buildAsset({
        amount,
        chain,
        contractAddress: token.contractAddress,
        decimals: token.decimals,
        markets,
        name: token.name,
        priceSymbol: token.priceSymbol,
        symbol: token.symbol,
        type: 'erc20',
      });
    }),
  );

  return {
    assets: settled.flatMap((entry) => (entry.status === 'fulfilled' ? [entry.value] : [])),
    failedTokenCount: settled.filter((entry) => entry.status === 'rejected').length,
  };
}

function sortExternalAssets(assets: ExternalWalletBalanceAsset[]) {
  return [...assets].sort((left, right) => {
    if (right.usdValue !== left.usdValue) {
      return right.usdValue - left.usdValue;
    }

    if (right.amount !== left.amount) {
      return right.amount - left.amount;
    }

    return left.symbol.localeCompare(right.symbol);
  });
}

function getVisibleExternalAssets(assets: ExternalWalletBalanceAsset[]) {
  return sortExternalAssets(assets.filter((asset) => asset.amount > 0));
}

async function fetchNetworkBalanceSnapshot(
  address: string,
  chain: ExternalEvmNetworkSpec,
): Promise<{
  snapshot: ExternalWalletBalanceSnapshot;
  networkState: ExternalWalletNetworkBalanceState;
}> {
  const snapshot = await getExternalWalletBalanceSnapshot(address, chain.chainId);
  const visibleAssets = getVisibleExternalAssets(snapshot.assets);

  return {
    snapshot,
    networkState: {
      chainId: chain.chainId,
      chainLabel: chain.chainLabel,
      status: snapshot.status,
      assetCount: snapshot.assets.length,
      visibleAssetCount: visibleAssets.length,
      failedTokenCount: snapshot.failedTokenCount,
      updatedAt: snapshot.fetchedAt,
      message: snapshot.message,
    },
  };
}

export async function getExternalWalletMultiChainBalanceSnapshot(
  address: string,
): Promise<ExternalWalletMultiChainBalanceSnapshot> {
  const normalizedAddress = normalizeAddress(address);
  const fetchedAt = new Date().toISOString();
  const settled = await Promise.allSettled(
    EXTERNAL_EVM_SUPPORTED_NETWORKS.map((chain) =>
      fetchNetworkBalanceSnapshot(normalizedAddress, chain),
    ),
  );

  const successfulSnapshots = settled.flatMap((entry) =>
    entry.status === 'fulfilled' ? [entry.value.snapshot] : [],
  );
  const failedNetworkStates = settled.flatMap((entry, index) => {
    if (entry.status === 'fulfilled') {
      return [];
    }

    const chain = EXTERNAL_EVM_SUPPORTED_NETWORKS[index];
    return [
      {
        chainId: chain.chainId,
        chainLabel: chain.chainLabel,
        status: 'error' as const,
        assetCount: 0,
        visibleAssetCount: 0,
        failedTokenCount: chain.tokens.length,
        updatedAt: fetchedAt,
        message: 'No se pudo actualizar esta red',
      },
    ];
  });
  const networkStates = [
    ...settled.flatMap((entry) =>
      entry.status === 'fulfilled' ? [entry.value.networkState] : [],
    ),
    ...failedNetworkStates,
  ].sort(
    (left, right) =>
      EXTERNAL_EVM_NETWORK_ORDER.indexOf(left.chainId as (typeof EXTERNAL_EVM_NETWORK_ORDER)[number]) -
      EXTERNAL_EVM_NETWORK_ORDER.indexOf(right.chainId as (typeof EXTERNAL_EVM_NETWORK_ORDER)[number]),
  );
  const assets = sortExternalAssets(successfulSnapshots.flatMap((snapshot) => snapshot.assets));
  const visibleAssets = getVisibleExternalAssets(assets);
  const totalUsdEstimate = visibleAssets.reduce((sum, asset) => sum + asset.usdValue, 0);
  const hasUnpricedAssets = visibleAssets.some((asset) => !asset.priceAvailable);
  const failedNetworkCount = networkStates.filter((state) => state.status === 'error').length;
  const partialNetworkCount = networkStates.filter((state) => state.status === 'partial').length;
  const status =
    failedNetworkCount === networkStates.length
      ? 'error'
      : failedNetworkCount > 0 || partialNetworkCount > 0
        ? 'partial'
        : 'success';

  return {
    address: normalizedAddress,
    fetchedAt,
    assets,
    visibleAssets,
    totalUsdEstimate,
    networkStates,
    failedNetworkCount,
    status,
    discoveryEnabled: isTokenDiscoveryConfigured(),
    hasUnpricedAssets,
    message:
      status === 'error'
        ? 'No se pudieron actualizar las redes soportadas'
        : status === 'partial'
          ? 'Algunas redes no pudieron actualizarse'
          : undefined,
  };
}

export async function getExternalWalletBalanceSnapshot(
  address: string,
  chainId?: number | null,
): Promise<ExternalWalletBalanceSnapshot> {
  const chain = getSupportedNetwork(chainId);
  if (!chain) {
    return {
      address: address.trim(),
      chainId: chainId ?? 0,
      chainLabel: getExternalWalletBalanceNetworkLabel(chainId),
      fetchedAt: new Date().toISOString(),
      tokenAssets: [],
      assets: [],
      failedTokenCount: 0,
      status: 'unsupported',
      message: 'Esta red aun no esta soportada para lectura de balances en OrbitX.',
      discoveryEnabled: isTokenDiscoveryConfigured(),
      hasUnpricedAssets: false,
    };
  }

  const normalizedAddress = normalizeAddress(address);
  const nativeAsset = await getNativeBalance(normalizedAddress, chain.chainId);
  const tokenResult = await getTokenBalances(normalizedAddress, chain.chainId);
  const assets = [nativeAsset, ...tokenResult.assets];
  const status = tokenResult.failedTokenCount > 0 ? 'partial' : 'success';

  return {
    address: normalizedAddress,
    chainId: chain.chainId,
    chainLabel: chain.chainLabel,
    fetchedAt: new Date().toISOString(),
    nativeAsset,
    tokenAssets: tokenResult.assets,
    assets,
    failedTokenCount: tokenResult.failedTokenCount,
    status,
    discoveryEnabled: isTokenDiscoveryConfigured(),
    hasUnpricedAssets: assets.some((asset) => asset.amount > 0 && !asset.priceAvailable),
    message:
      status === 'partial'
        ? 'No se pudieron cargar todos los tokens'
        : undefined,
  };
}
