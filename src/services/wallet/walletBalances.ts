import type { WalletAsset } from '../../types';
import {
  fetchOnchainPortfolio,
  fetchOnchainPortfolioDetailed,
  type OnchainPortfolioDetailedSnapshot,
} from '../../../utils/onchainPortfolio';
import { getMarketsList } from '../api/market';

const SYMBOL_MAP: Record<string, string> = {
  btc: 'BTC',
  eth: 'ETH',
  sol: 'SOL',
  bnb: 'BNB',
  usdt: 'USDT',
  usd: 'USDC',
  link: 'LINK',
  pepe: 'PEPE',
};

let marketCache:
  | {
      fetchedAt: number;
      markets: Awaited<ReturnType<typeof getMarketsList>>;
    }
  | null = null;

const MARKET_CACHE_TTL_MS = 60_000;

async function getMarketsListCached() {
  if (marketCache && Date.now() - marketCache.fetchedAt < MARKET_CACHE_TTL_MS) {
    return marketCache.markets;
  }

  const markets = await getMarketsList();
  marketCache = {
    markets,
    fetchedAt: Date.now(),
  };

  return markets;
}

function mapSnapshotToWalletAssets(
  snapshot: Pick<OnchainPortfolioDetailedSnapshot, 'assets'>,
  markets: Awaited<ReturnType<typeof getMarketsList>>,
) {
  const marketMap = new Map(markets.map((market) => [market.baseSymbol.toLowerCase(), market]));

  return snapshot.assets.map((asset) => {
    const market = marketMap.get(asset.tokenId.toLowerCase());
    const symbol = SYMBOL_MAP[asset.tokenId.toLowerCase()] || asset.tokenId.toUpperCase();
    const amount = asset.amount;
    const usdValue = amount * (market?.price ?? (symbol === 'USDC' || symbol === 'USDT' ? 1 : 0));

    return {
      id: `${asset.tokenId}-${asset.network}`,
      symbol,
      name: market?.coin.name || symbol,
      amount,
      usdValue,
      network: asset.network ?? 'base',
      environment: 'web3',
      image: market?.image,
      coingeckoId: market?.coin.coingeckoId,
    } satisfies WalletAsset;
  });
}

export async function getWalletBalances(): Promise<WalletAsset[]> {
  return getWalletBalancesForAddresses();
}

export async function getWalletBalancesForAddresses(
  receiveAddresses?: Record<'ethereum' | 'base' | 'bnb' | 'solana', string>,
): Promise<WalletAsset[]> {
  const [snapshot, markets] = await Promise.all([
    fetchOnchainPortfolio(receiveAddresses),
    getMarketsListCached(),
  ]);

  return mapSnapshotToWalletAssets(snapshot, markets);
}

export async function getWalletBalanceSnapshot(
  receiveAddresses?: Record<'ethereum' | 'base' | 'bnb' | 'solana', string>,
) {
  const [snapshot, markets] = await Promise.all([
    fetchOnchainPortfolioDetailed(receiveAddresses),
    getMarketsListCached(),
  ]);

  return {
    assets: mapSnapshotToWalletAssets(snapshot, markets),
    fetchedAt: snapshot.fetchedAt,
    networkStates: snapshot.networkStates,
    failedNetworks: snapshot.failedNetworks,
  };
}

export async function getNativeNetworkBalances() {
  const assets = await getWalletBalancesForAddresses();
  return assets.filter((asset) =>
    ['ETH', 'BNB', 'SOL'].includes(asset.symbol.toUpperCase()),
  );
}
