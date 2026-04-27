import { ONCHAIN_ASSET_SPECS, PUBLIC_RPC_URLS, REAL_WALLET_TOKEN_IDS } from '../constants/onchain';
import type { WalletAsset, WalletNetwork } from '../types';
import { getStoredWalletBundle } from './wallet';

interface OnchainPortfolioSnapshot {
  assets: WalletAsset[];
  fetchedAt: string;
  receiveAddresses: Record<WalletNetwork, string>;
  supportedTokenIds: string[];
}

export interface OnchainPortfolioNetworkState {
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
  updatedAt?: string;
  assetCount: number;
}

export interface OnchainPortfolioDetailedSnapshot extends OnchainPortfolioSnapshot {
  networkStates: Record<WalletNetwork, OnchainPortfolioNetworkState>;
  failedNetworks: WalletNetwork[];
}

const WALLET_NETWORKS: WalletNetwork[] = ['ethereum', 'base', 'bnb', 'solana'];
const NETWORK_TIMEOUT_MS = 7_500;

const EVM_NATIVE_CHAIN_IDS = {
  ethereum: 1,
  base: 8453,
  bnb: 56,
} as const;

const ERC20_ABI = ['function balanceOf(address owner) view returns (uint256)'];
let ethersRuntimePromise: Promise<typeof import('ethers').ethers> | null = null;
const providerCache = new Map<'ethereum' | 'base' | 'bnb', unknown>();

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

async function getEvmProvider(network: 'ethereum' | 'base' | 'bnb') {
  const cached = providerCache.get(network);
  if (cached) {
    return cached as import('ethers').ethers.providers.StaticJsonRpcProvider;
  }

  const ethers = await getEthersRuntime();
  const provider = new ethers.providers.StaticJsonRpcProvider(
    PUBLIC_RPC_URLS[network],
    EVM_NATIVE_CHAIN_IDS[network],
  );
  providerCache.set(network, provider);
  return provider;
}

async function fetchEvmNativeBalance(
  network: 'ethereum' | 'base' | 'bnb',
  address: string,
  decimals: number,
) {
  if (!address) {
    return 0;
  }

  const [provider, ethers] = await Promise.all([getEvmProvider(network), getEthersRuntime()]);
  const rawBalance = await provider.getBalance(address);
  return Number(ethers.utils.formatUnits(rawBalance, decimals));
}

async function fetchErc20Balance(
  network: 'ethereum' | 'base' | 'bnb',
  contractAddress: string,
  owner: string,
  decimals: number,
) {
  if (!owner) {
    return 0;
  }

  const [provider, ethers] = await Promise.all([getEvmProvider(network), getEthersRuntime()]);
  const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
  const rawBalance = await contract.balanceOf(owner);
  return Number(ethers.utils.formatUnits(rawBalance, decimals));
}

async function fetchSolanaNativeBalance(address: string, decimals: number) {
  if (!address) {
    return 0;
  }

  const response = await fetch(PUBLIC_RPC_URLS.solana, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getBalance',
      params: [address, { commitment: 'confirmed' }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Solana RPC error ${response.status}`);
  }

  const payload = (await response.json()) as {
    result?: {
      value?: number;
    };
  };

  return (payload.result?.value ?? 0) / 10 ** decimals;
}

async function fetchSolanaSplBalance(owner: string, mintAddress: string, decimals: number) {
  if (!owner) {
    return 0;
  }

  const response = await fetch(PUBLIC_RPC_URLS.solana, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getTokenAccountsByOwner',
      params: [
        owner,
        { mint: mintAddress },
        {
          commitment: 'confirmed',
          encoding: 'jsonParsed',
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Solana RPC error ${response.status}`);
  }

  const payload = (await response.json()) as {
    result?: {
      value?: Array<{
        account?: {
          data?: {
            parsed?: {
              info?: {
                tokenAmount?: {
                  uiAmount?: number | null;
                  amount?: string;
                };
              };
            };
          };
        };
      }>;
    };
  };

  const accounts = payload.result?.value ?? [];

  return accounts.reduce((sum, account) => {
    const tokenAmount = account.account?.data?.parsed?.info?.tokenAmount;
    if (typeof tokenAmount?.uiAmount === 'number') {
      return sum + tokenAmount.uiAmount;
    }

    if (tokenAmount?.amount) {
      return sum + Number(tokenAmount.amount) / 10 ** decimals;
    }

    return sum;
  }, 0);
}

async function fetchAssetAmount(
  spec: (typeof ONCHAIN_ASSET_SPECS)[number],
  receiveAddresses: Record<WalletNetwork, string>,
) {
  if (spec.standard === 'native') {
    if (spec.network === 'solana') {
      return fetchSolanaNativeBalance(receiveAddresses.solana, spec.decimals);
    }

    return fetchEvmNativeBalance(spec.network, receiveAddresses[spec.network], spec.decimals);
  }

  if (spec.standard === 'spl') {
    if (!spec.mintAddress) {
      return 0;
    }

    return fetchSolanaSplBalance(receiveAddresses.solana, spec.mintAddress, spec.decimals);
  }

  if (spec.network === 'solana' || !spec.contractAddress) {
    return 0;
  }

  return fetchErc20Balance(
    spec.network,
    spec.contractAddress,
    receiveAddresses[spec.network],
    spec.decimals,
  );
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string) {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);

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

async function fetchNetworkPortfolio(
  network: WalletNetwork,
  receiveAddresses: Record<WalletNetwork, string>,
) {
  const specs = ONCHAIN_ASSET_SPECS.filter((spec) => spec.network === network);
  const address = receiveAddresses[network];

  if (!address) {
    return {
      assets: [] as WalletAsset[],
      state: {
        status: 'error' as const,
        error: 'No hay una direccion activa para esta red.',
        assetCount: 0,
      },
    };
  }

  try {
    const balances = await withTimeout(
      Promise.allSettled(
        specs.map(async (spec) => ({
          tokenId: spec.tokenId,
          network: spec.network,
          amount: await fetchAssetAmount(spec, receiveAddresses),
        })),
      ),
      NETWORK_TIMEOUT_MS,
      `La red ${network} tardo demasiado en responder.`,
    );

    const assets = balances.flatMap((entry) => {
      if (entry.status !== 'fulfilled') {
        return [];
      }

      return [
        {
          tokenId: entry.value.tokenId,
          amount: entry.value.amount,
          averageCost: 0,
          network: entry.value.network,
        },
      ];
    });

    const failedAssets = balances.filter((entry) => entry.status === 'rejected').length;

    return {
      assets,
      state: {
        status: failedAssets === balances.length ? 'error' : 'success',
        error:
          failedAssets > 0
            ? `No se pudieron actualizar ${failedAssets} activos de ${network}.`
            : undefined,
        updatedAt: new Date().toISOString(),
        assetCount: assets.length,
      } satisfies OnchainPortfolioNetworkState,
    };
  } catch (error) {
    return {
      assets: [] as WalletAsset[],
      state: {
        status: 'error' as const,
        error:
          error instanceof Error
            ? error.message
            : `No se pudo actualizar la red ${network}.`,
        assetCount: 0,
      },
    };
  }
}

export async function fetchOnchainPortfolioDetailed(
  receiveAddressesOverride?: Record<WalletNetwork, string>,
): Promise<OnchainPortfolioDetailedSnapshot> {
  const bundle = receiveAddressesOverride ? null : await getStoredWalletBundle();
  const receiveAddresses = receiveAddressesOverride ?? bundle?.receiveAddresses;

  if (!receiveAddresses) {
    throw new Error('No hay una billetera activa para sincronizar.');
  }

  const settledNetworks = await Promise.all(
    WALLET_NETWORKS.map(async (network) => {
      const result = await fetchNetworkPortfolio(network, receiveAddresses);
      return [network, result] as const;
    }),
  );

  const networkStates = settledNetworks.reduce<Record<WalletNetwork, OnchainPortfolioNetworkState>>(
    (accumulator, [network, result]) => {
      accumulator[network] = result.state;
      return accumulator;
    },
    {
      ethereum: { status: 'idle', assetCount: 0 },
      base: { status: 'idle', assetCount: 0 },
      bnb: { status: 'idle', assetCount: 0 },
      solana: { status: 'idle', assetCount: 0 },
    },
  );

  const assets = settledNetworks.flatMap(([, result]) => result.assets);
  const failedNetworks = settledNetworks
    .filter(([, result]) => result.state.status === 'error')
    .map(([network]) => network);

  return {
    assets,
    fetchedAt: new Date().toISOString(),
    receiveAddresses,
    supportedTokenIds: REAL_WALLET_TOKEN_IDS,
    networkStates,
    failedNetworks,
  };
}

export async function fetchOnchainPortfolio(
  receiveAddressesOverride?: Record<WalletNetwork, string>,
): Promise<OnchainPortfolioSnapshot> {
  const detailedSnapshot = await fetchOnchainPortfolioDetailed(receiveAddressesOverride);

  return {
    assets: detailedSnapshot.assets,
    fetchedAt: detailedSnapshot.fetchedAt,
    receiveAddresses: detailedSnapshot.receiveAddresses,
    supportedTokenIds: detailedSnapshot.supportedTokenIds,
  };
}
