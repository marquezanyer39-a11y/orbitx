import type { MarketToken, TradeSide, WalletAsset, WalletNetwork } from '../types';

export const EVM_NATIVE_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export interface OrbitTradeRoute {
  id: string;
  network: WalletNetwork;
  provider: '1inch' | 'jupiter';
  tokenId: string;
  quoteTokenId: string;
  chainId?: number;
  tokenAddress: string;
  quoteAddress: string;
  tokenDecimals: number;
  quoteDecimals: number;
  tokenLabel: string;
  quoteLabel: string;
  active: boolean;
}

export const ORBIT_TRADE_ROUTES: OrbitTradeRoute[] = [
  {
    id: 'base-eth-usdc',
    network: 'base',
    provider: '1inch',
    tokenId: 'eth',
    quoteTokenId: 'usd',
    chainId: 8453,
    tokenAddress: EVM_NATIVE_TOKEN_ADDRESS,
    quoteAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    tokenDecimals: 18,
    quoteDecimals: 6,
    tokenLabel: 'ETH',
    quoteLabel: 'USDC',
    active: true,
  },
  {
    id: 'ethereum-eth-usdt',
    network: 'ethereum',
    provider: '1inch',
    tokenId: 'eth',
    quoteTokenId: 'usdt',
    chainId: 1,
    tokenAddress: EVM_NATIVE_TOKEN_ADDRESS,
    quoteAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    tokenDecimals: 18,
    quoteDecimals: 6,
    tokenLabel: 'ETH',
    quoteLabel: 'USDT',
    active: true,
  },
  {
    id: 'ethereum-link-usdt',
    network: 'ethereum',
    provider: '1inch',
    tokenId: 'link',
    quoteTokenId: 'usdt',
    chainId: 1,
    tokenAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    quoteAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    tokenDecimals: 18,
    quoteDecimals: 6,
    tokenLabel: 'LINK',
    quoteLabel: 'USDT',
    active: true,
  },
  {
    id: 'ethereum-pepe-usdt',
    network: 'ethereum',
    provider: '1inch',
    tokenId: 'pepe',
    quoteTokenId: 'usdt',
    chainId: 1,
    tokenAddress: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
    quoteAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    tokenDecimals: 18,
    quoteDecimals: 6,
    tokenLabel: 'PEPE',
    quoteLabel: 'USDT',
    active: true,
  },
  {
    id: 'bnb-bnb-usdt',
    network: 'bnb',
    provider: '1inch',
    tokenId: 'bnb',
    quoteTokenId: 'usdt',
    chainId: 56,
    tokenAddress: EVM_NATIVE_TOKEN_ADDRESS,
    quoteAddress: '0x55d398326f99059fF775485246999027B3197955',
    tokenDecimals: 18,
    quoteDecimals: 18,
    tokenLabel: 'BNB',
    quoteLabel: 'USDT',
    active: true,
  },
  {
    id: 'solana-sol-usdc',
    network: 'solana',
    provider: 'jupiter',
    tokenId: 'sol',
    quoteTokenId: 'usd',
    tokenAddress: 'So11111111111111111111111111111111111111112',
    quoteAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    tokenDecimals: 9,
    quoteDecimals: 6,
    tokenLabel: 'SOL',
    quoteLabel: 'USDC',
    active: true,
  },
];

export function getActiveTradeRoutes(tokenId: string) {
  return ORBIT_TRADE_ROUTES.filter((route) => route.tokenId === tokenId && route.active);
}

export function buildCustomTradeRoute(token: MarketToken): OrbitTradeRoute | null {
  if (
    !token.isUserCreated ||
    !token.isTradeable ||
    !token.contractAddress ||
    !token.quoteTokenId ||
    !token.quoteAddress ||
    !token.chain ||
    (token.chain !== 'ethereum' && token.chain !== 'base' && token.chain !== 'bnb')
  ) {
    return null;
  }

  return {
    id: `${token.chain}-${token.id}-${token.quoteTokenId}`,
    network: token.chain,
    provider: '1inch',
    tokenId: token.id,
    quoteTokenId: token.quoteTokenId,
    chainId: token.chain === 'ethereum' ? 1 : token.chain === 'bnb' ? 56 : 8453,
    tokenAddress: token.contractAddress,
    quoteAddress: token.quoteAddress,
    tokenDecimals: token.tokenDecimals ?? 18,
    quoteDecimals: token.quoteDecimals ?? 18,
    tokenLabel: token.symbol,
    quoteLabel: token.quoteTokenId.toUpperCase(),
    active: true,
  };
}

export function getTradeRoutesForToken(token: MarketToken) {
  const customRoute = buildCustomTradeRoute(token);
  if (customRoute) {
    return [customRoute];
  }

  return getActiveTradeRoutes(token.id);
}

function getNetworkAssetAmount(assets: WalletAsset[], tokenId: string, network: WalletNetwork) {
  return assets.find((asset) => asset.tokenId === tokenId && asset.network === network)?.amount ?? 0;
}

export function selectBestTradeRoute(tokenId: string, assets: WalletAsset[], side: TradeSide) {
  const routes = getActiveTradeRoutes(tokenId);
  if (!routes.length) {
    return null;
  }

  const scored = routes
    .map((route) => {
      const sourceTokenId = side === 'buy' ? route.quoteTokenId : route.tokenId;
      const score = getNetworkAssetAmount(assets, sourceTokenId, route.network);
      const priorityBoost = route.network === 'base' ? 0.000001 : 0;

      return {
        route,
        score: score + priorityBoost,
      };
    })
    .sort((left, right) => right.score - left.score);

  return scored[0]?.route ?? routes[0];
}

export function selectBestTradeRouteForToken(token: MarketToken, assets: WalletAsset[], side: TradeSide) {
  const routes = getTradeRoutesForToken(token);
  if (!routes.length) {
    return null;
  }

  const scored = routes
    .map((route) => {
      const sourceTokenId = side === 'buy' ? route.quoteTokenId : route.tokenId;
      const score = getNetworkAssetAmount(assets, sourceTokenId, route.network);
      const priorityBoost = route.network === 'base' ? 0.000001 : 0;

      return {
        route,
        score: score + priorityBoost,
      };
    })
    .sort((left, right) => right.score - left.score);

  return scored[0]?.route ?? routes[0];
}
