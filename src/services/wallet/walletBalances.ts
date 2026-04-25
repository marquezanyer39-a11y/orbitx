import type { WalletAsset } from '../../types';
import { fetchOnchainPortfolio } from '../../../utils/onchainPortfolio';
import { getHomeMarketData, getMarketsList } from '../api/market';

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

export async function getWalletBalances(): Promise<WalletAsset[]> {
  return getWalletBalancesForAddresses();
}

export async function getWalletBalancesForAddresses(
  receiveAddresses?: Record<'ethereum' | 'base' | 'bnb' | 'solana', string>,
): Promise<WalletAsset[]> {
  const [snapshot, markets] = await Promise.all([
    fetchOnchainPortfolio(receiveAddresses),
    getMarketsList(),
  ]);
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
    };
  });
}

export async function getNativeNetworkBalances() {
  const assets = await getWalletBalancesForAddresses();
  return assets.filter((asset) =>
    ['ETH', 'BNB', 'SOL'].includes(asset.symbol.toUpperCase()),
  );
}
