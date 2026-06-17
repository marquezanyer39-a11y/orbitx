import {
  getNativeToken,
  getTokensByChain,
  type TokenDefinition,
} from '../wallet/tokenRegistry';
import { ERC20_ABI_MINIMAL } from './erc20Abi';
import { normalizeWeb3Error } from './web3Errors';
import { getNetworkConfig } from './web3NetworkConfig';

export type BalanceStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'unavailable'
  | 'rpc_error'
  | 'rpc_timeout'
  | 'wallet_not_connected';

export interface NativeBalanceResult {
  status: BalanceStatus;
  balance: string | null;
  balanceRaw: string | null;
  symbol: string;
  decimals: number;
  chainId: number;
  address: string;
  fetchedAt: number;
  error?: string;
}

export interface TokenBalanceResult {
  status: BalanceStatus;
  token: TokenDefinition;
  balance: string | null;
  balanceRaw: string | null;
  fetchedAt: number;
  error?: string;
}

export interface WalletBalancesResult {
  address: string;
  chainId: number;
  native: NativeBalanceResult;
  tokens: TokenBalanceResult[];
  fetchedAt: number;
  hasErrors: boolean;
  errorCount: number;
}

const TIMEOUT_MS = 10_000;

let ethersRuntimePromise: Promise<typeof import('ethers').ethers> | null = null;
const providerCache = new Map<number, import('ethers').ethers.providers.StaticJsonRpcProvider>();

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

async function getReadOnlyProvider(chainId: number) {
  const cached = providerCache.get(chainId);
  if (cached) {
    return cached;
  }

  const networkConfig = getNetworkConfig(chainId);
  if (!networkConfig) {
    throw new Error('UNSUPPORTED_CHAIN');
  }

  const ethers = await getEthersRuntime();
  const provider = new ethers.providers.StaticJsonRpcProvider(networkConfig.rpcUrl, chainId);
  providerCache.set(chainId, provider);
  return provider;
}

async function withRpcTimeout<T>(promise: Promise<T>, chainId: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`RPC_TIMEOUT:${chainId}`)), TIMEOUT_MS),
  );

  return Promise.race([promise, timeout]);
}

function buildNativeFallback(params: {
  address: string;
  chainId: number;
  error?: string;
  status: BalanceStatus;
}): NativeBalanceResult {
  const nativeToken = getNativeToken(params.chainId);

  return {
    status: params.status,
    balance: null,
    balanceRaw: null,
    symbol: nativeToken?.symbol ?? 'NATIVE',
    decimals: nativeToken?.decimals ?? 18,
    chainId: params.chainId,
    address: params.address,
    fetchedAt: Date.now(),
    error: params.error,
  };
}

function getBalanceErrorStatus(error: unknown): BalanceStatus {
  const normalized = normalizeWeb3Error(error);

  if (normalized.code === 'RPC_TIMEOUT') {
    return 'rpc_timeout';
  }

  if (normalized.code === 'WALLET_NOT_CONNECTED') {
    return 'wallet_not_connected';
  }

  if (normalized.code === 'UNSUPPORTED_CHAIN') {
    return 'unavailable';
  }

  return 'rpc_error';
}

export async function getNativeBalance(
  address: string,
  chainId: number,
): Promise<NativeBalanceResult> {
  const normalizedAddress = address.trim();
  const nativeToken = getNativeToken(chainId);

  if (!normalizedAddress) {
    return buildNativeFallback({
      address: normalizedAddress,
      chainId,
      status: 'wallet_not_connected',
      error: 'Wallet externa no conectada.',
    });
  }

  if (!nativeToken || !getNetworkConfig(chainId)) {
    return buildNativeFallback({
      address: normalizedAddress,
      chainId,
      status: 'unavailable',
      error: 'Red no compatible con QVEX.',
    });
  }

  try {
    const [ethers, provider] = await Promise.all([
      getEthersRuntime(),
      getReadOnlyProvider(chainId),
    ]);
    const rawBalance = await withRpcTimeout(provider.getBalance(normalizedAddress), chainId);

    return {
      status: 'success',
      balance: ethers.utils.formatUnits(rawBalance, nativeToken.decimals),
      balanceRaw: rawBalance.toString(),
      symbol: nativeToken.symbol,
      decimals: nativeToken.decimals,
      chainId,
      address: normalizedAddress,
      fetchedAt: Date.now(),
    };
  } catch (error) {
    const normalized = normalizeWeb3Error(error);

    return buildNativeFallback({
      address: normalizedAddress,
      chainId,
      status: getBalanceErrorStatus(error),
      error: normalized.userMessage,
    });
  }
}

export async function getErc20Balance(
  address: string,
  token: TokenDefinition,
): Promise<TokenBalanceResult> {
  const normalizedAddress = address.trim();

  if (!normalizedAddress) {
    return {
      status: 'wallet_not_connected',
      token,
      balance: null,
      balanceRaw: null,
      fetchedAt: Date.now(),
      error: 'Wallet externa no conectada.',
    };
  }

  if (!token.isEnabled || token.isNative || !token.contractAddress) {
    return {
      status: 'unavailable',
      token,
      balance: null,
      balanceRaw: null,
      fetchedAt: Date.now(),
      error: 'Token no soportado en esta red.',
    };
  }

  try {
    const [ethers, provider] = await Promise.all([
      getEthersRuntime(),
      getReadOnlyProvider(token.chainId),
    ]);
    const contract = new ethers.Contract(token.contractAddress, ERC20_ABI_MINIMAL, provider);
    const rawBalance = await withRpcTimeout(contract.balanceOf(normalizedAddress), token.chainId);
    const typedRawBalance = rawBalance as Parameters<typeof ethers.utils.formatUnits>[0];

    return {
      status: 'success',
      token,
      balance: ethers.utils.formatUnits(typedRawBalance, token.decimals),
      balanceRaw: typedRawBalance.toString(),
      fetchedAt: Date.now(),
    };
  } catch (error) {
    const normalized = normalizeWeb3Error(error);

    return {
      status: getBalanceErrorStatus(error),
      token,
      balance: null,
      balanceRaw: null,
      fetchedAt: Date.now(),
      error: normalized.userMessage,
    };
  }
}

export async function getWalletTokenBalances(
  address: string,
  chainId: number,
): Promise<WalletBalancesResult> {
  const fetchedAt = Date.now();
  const native = await getNativeBalance(address, chainId);
  const erc20Tokens = getTokensByChain(chainId).filter(
    (tokenDefinition) => !tokenDefinition.isNative,
  );
  const settled = await Promise.allSettled(
    erc20Tokens.map((tokenDefinition) => getErc20Balance(address, tokenDefinition)),
  );
  const tokens = settled.map((entry, index) => {
    if (entry.status === 'fulfilled') {
      return entry.value;
    }

    const token = erc20Tokens[index];
    const normalized = normalizeWeb3Error(entry.reason);
    return {
      status: getBalanceErrorStatus(entry.reason),
      token,
      balance: null,
      balanceRaw: null,
      fetchedAt: Date.now(),
      error: normalized.userMessage,
    };
  });
  const errorCount =
    (native.status === 'success' ? 0 : 1) +
    tokens.filter((tokenBalance) => tokenBalance.status !== 'success').length;

  return {
    address: address.trim(),
    chainId,
    native,
    tokens,
    fetchedAt,
    hasErrors: errorCount > 0,
    errorCount,
  };
}

export async function refreshExternalWalletBalances(
  address: string,
  chainId: number,
): Promise<WalletBalancesResult> {
  return getWalletTokenBalances(address, chainId);
}
