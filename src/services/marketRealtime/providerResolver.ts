import type { MarketPair } from '../../types';
import { fetchCoinDetail } from '../api/coingecko';
import {
  fetchGeckoTerminalTopPool,
  mapOrbitNetworkToGeckoNetwork,
  type GeckoTerminalPoolReference,
} from './geckoTerminal';
import { resolveRealtimeSymbol } from '../api/realtimeMarket';

type ResolvedMarketProvider =
  | {
      kind: 'binance';
      symbol: string;
    }
  | {
      kind: 'geckoterminal';
      reference: GeckoTerminalPoolReference;
    }
  | {
      kind: 'coingecko';
      coinId: string;
    }
  | {
      kind: 'sparkline';
    };

const providerCache = new Map<string, Promise<ResolvedMarketProvider>>();

function cleanAddress(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function parseGeckoTerminalTokenUrl(url?: string) {
  if (!url) {
    return null;
  }

  const match = url.match(/geckoterminal\.com\/([^/]+)\/tokens\/([^/?#]+)/i);
  if (!match) {
    return null;
  }

  const networkId = mapOrbitNetworkToGeckoNetwork(match[1]);
  if (!networkId) {
    return null;
  }

  return {
    networkId,
    tokenAddress: decodeURIComponent(match[2]),
  };
}

function getPairCacheKey(pair: Pick<MarketPair, 'id' | 'baseId' | 'contractAddress' | 'poolAddress' | 'networkKey' | 'dexNetwork' | 'geckoTerminalUrl'>) {
  return [
    pair.id,
    pair.baseId,
    pair.contractAddress ?? '',
    pair.poolAddress ?? '',
    pair.networkKey ?? '',
    pair.dexNetwork ?? '',
    pair.geckoTerminalUrl ?? '',
  ].join(':');
}

async function resolveGeckoTerminalReference(
  pair: Pick<
    MarketPair,
    'id' | 'baseId' | 'contractAddress' | 'poolAddress' | 'networkKey' | 'dexNetwork' | 'geckoTerminalUrl'
  >,
) {
  const networkId =
    mapOrbitNetworkToGeckoNetwork(pair.dexNetwork) ??
    mapOrbitNetworkToGeckoNetwork(pair.networkKey);

  const directPoolAddress = cleanAddress(pair.poolAddress);
  if (networkId && directPoolAddress) {
    return {
      networkId,
      poolAddress: directPoolAddress,
      tokenAddress: cleanAddress(pair.contractAddress),
      pairId: pair.id,
    } satisfies GeckoTerminalPoolReference;
  }

  const directTokenAddress = cleanAddress(pair.contractAddress);
  if (networkId && directTokenAddress) {
    const topPool = await fetchGeckoTerminalTopPool(networkId, directTokenAddress);
    if (topPool) {
      return { ...topPool, pairId: pair.id } satisfies GeckoTerminalPoolReference;
    }
  }

  if (!pair.baseId) {
    return null;
  }

  const detail = await fetchCoinDetail(pair.baseId);
  const detailPlatforms = detail.detail_platforms ?? {};
  const preferredRefs = Object.values(detailPlatforms)
    .map((platform) => {
      const fromUrl = parseGeckoTerminalTokenUrl(platform.geckoterminal_url);
      if (fromUrl?.tokenAddress) {
        return fromUrl;
      }

      const contractAddress = cleanAddress(platform.contract_address);
      if (!contractAddress) {
        return null;
      }

      const platformKey = Object.entries(detailPlatforms).find(
        ([, candidate]) => candidate === platform,
      )?.[0];
      const mappedNetworkId = mapOrbitNetworkToGeckoNetwork(platformKey);
      if (!mappedNetworkId) {
        return null;
      }

      return {
        networkId: mappedNetworkId,
        tokenAddress: contractAddress,
      };
    })
    .filter(
      (item): item is { networkId: NonNullable<ReturnType<typeof mapOrbitNetworkToGeckoNetwork>>; tokenAddress: string } =>
        Boolean(item?.networkId && item?.tokenAddress),
    );

  const rankedRefs = preferredRefs.sort((left, right) => {
    const preferredNetwork = networkId;
    if (preferredNetwork && left.networkId === preferredNetwork && right.networkId !== preferredNetwork) {
      return -1;
    }
    if (preferredNetwork && right.networkId === preferredNetwork && left.networkId !== preferredNetwork) {
      return 1;
    }
    return 0;
  });

  for (const candidate of rankedRefs) {
    const topPool = await fetchGeckoTerminalTopPool(candidate.networkId, candidate.tokenAddress);
    if (topPool) {
      return { ...topPool, pairId: pair.id } satisfies GeckoTerminalPoolReference;
    }
  }

  return null;
}

export async function resolveMarketProvider(
  pair: Pick<
    MarketPair,
    'id' | 'baseId' | 'baseSymbol' | 'quoteSymbol' | 'contractAddress' | 'poolAddress' | 'networkKey' | 'dexNetwork' | 'geckoTerminalUrl'
  > | null,
) {
  if (!pair) {
    return { kind: 'sparkline' } satisfies ResolvedMarketProvider;
  }

  const cacheKey = getPairCacheKey(pair);
  const cached = providerCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const resolution = (async () => {
    const binanceSymbol = resolveRealtimeSymbol(pair);
    if (binanceSymbol) {
      return {
        kind: 'binance',
        symbol: binanceSymbol,
      } satisfies ResolvedMarketProvider;
    }

    const geckoReference = await resolveGeckoTerminalReference(pair);
    if (geckoReference) {
      return {
        kind: 'geckoterminal',
        reference: geckoReference,
      } satisfies ResolvedMarketProvider;
    }

    if (pair.baseId) {
      return {
        kind: 'coingecko',
        coinId: pair.baseId,
      } satisfies ResolvedMarketProvider;
    }

    return {
      kind: 'sparkline',
    } satisfies ResolvedMarketProvider;
  })().catch((error) => {
    providerCache.delete(cacheKey);
    throw error;
  });

  providerCache.set(cacheKey, resolution);
  return resolution;
}
