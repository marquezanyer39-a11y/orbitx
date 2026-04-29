import { getMarketsList } from '../api/market';

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
  usdValue: number;
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
}

interface ExternalTokenSpec {
  symbol: string;
  name: string;
  decimals: number;
  contractAddress: string;
  priceSymbol?: string;
}

interface ExternalEvmNetworkSpec {
  chainId: number;
  chainLabel: string;
  nativeSymbol: string;
  nativeName: string;
  nativeDecimals: number;
  rpcUrl: string;
  priceSymbol?: string;
  tokens: ExternalTokenSpec[];
}

const ERC20_ABI = ['function balanceOf(address owner) view returns (uint256)'];
const BALANCE_TIMEOUT_MS = 8_000;

const EXTERNAL_EVM_NETWORKS: Record<number, ExternalEvmNetworkSpec> = {
  1: {
    chainId: 1,
    chainLabel: 'Ethereum',
    nativeSymbol: 'ETH',
    nativeName: 'Ethereum',
    nativeDecimals: 18,
    rpcUrl: process.env.EXPO_PUBLIC_ETHEREUM_RPC_URL || 'https://ethereum-rpc.publicnode.com',
    priceSymbol: 'ETH',
    tokens: [
      {
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 6,
        contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      },
      {
        symbol: 'WETH',
        name: 'Wrapped Ether',
        decimals: 18,
        contractAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        priceSymbol: 'ETH',
      },
    ],
  },
  56: {
    chainId: 56,
    chainLabel: 'BNB Chain',
    nativeSymbol: 'BNB',
    nativeName: 'BNB',
    nativeDecimals: 18,
    rpcUrl: process.env.EXPO_PUBLIC_BNB_RPC_URL || 'https://bsc-dataseed.bnbchain.org',
    priceSymbol: 'BNB',
    tokens: [
      {
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 18,
        contractAddress: '0x55d398326f99059fF775485246999027B3197955',
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 18,
        contractAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      },
      {
        symbol: 'WBNB',
        name: 'Wrapped BNB',
        decimals: 18,
        contractAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
        priceSymbol: 'BNB',
      },
    ],
  },
  137: {
    chainId: 137,
    chainLabel: 'Polygon',
    nativeSymbol: 'MATIC',
    nativeName: 'Polygon',
    nativeDecimals: 18,
    rpcUrl: process.env.EXPO_PUBLIC_POLYGON_RPC_URL || 'https://polygon-rpc.com',
    priceSymbol: 'MATIC',
    tokens: [
      {
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 6,
        contractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        contractAddress: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
      },
      {
        symbol: 'WETH',
        name: 'Wrapped Ether',
        decimals: 18,
        contractAddress: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
        priceSymbol: 'ETH',
      },
      {
        symbol: 'WMATIC',
        name: 'Wrapped MATIC',
        decimals: 18,
        contractAddress: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
        priceSymbol: 'MATIC',
      },
    ],
  },
  8453: {
    chainId: 8453,
    chainLabel: 'Base',
    nativeSymbol: 'ETH',
    nativeName: 'Ethereum',
    nativeDecimals: 18,
    rpcUrl: process.env.EXPO_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
    priceSymbol: 'ETH',
    tokens: [
      {
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      },
      {
        symbol: 'WETH',
        name: 'Wrapped Ether',
        decimals: 18,
        contractAddress: '0x4200000000000000000000000000000000000006',
        priceSymbol: 'ETH',
      },
    ],
  },
};

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

  if (normalized === 'USDT' || normalized === 'USDC') {
    return 1;
  }

  const market = markets.find((item) => item.baseSymbol.toUpperCase() === normalized);
  return market?.price ?? 0;
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
  name: string;
  priceSymbol?: string;
  symbol: string;
  type: 'native' | 'erc20';
  contractAddress?: string;
  markets: Awaited<ReturnType<typeof getMarketsList>>;
}): ExternalWalletBalanceAsset {
  const priceSymbol = params.priceSymbol ?? params.symbol;
  const usdValue = params.amount * getPriceForSymbol(priceSymbol, params.markets);

  return {
    id:
      params.type === 'native'
        ? `${params.chain.chainId}-native-${params.symbol}`
        : `${params.chain.chainId}-${params.contractAddress?.toLowerCase() ?? params.symbol}`,
    symbol: params.symbol,
    name: params.name,
    amount: params.amount,
    usdValue,
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

  const settled = await Promise.allSettled(
    chain.tokens.map(async (token) => {
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
    message:
      status === 'partial'
        ? 'No se pudieron cargar todos los tokens'
        : undefined,
  };
}
