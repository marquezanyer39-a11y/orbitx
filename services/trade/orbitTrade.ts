import { ORBIT_TRADE_ROUTES, selectBestTradeRouteForToken } from '../../constants/trading';
import type { OrbitTradeRoute } from '../../constants/trading';
import type { MarketToken, TradeSide, WalletAsset } from '../../types';
import { fetchJupiterQuote, executeJupiterSwap } from './jupiter';
import { fetchOneInchQuote, executeOneInchSwap } from './oneInch';
import type {
  NormalizedTradeQuote,
  TradeExecutionResult,
  TradeQuoteRequest,
} from './types';

const ONEINCH_READY = Boolean(process.env.EXPO_PUBLIC_ONEINCH_API_KEY);

type TradeExecutionStage = 'signing' | 'executing';

export interface RealTradeSupport {
  ready: boolean;
  route: ReturnType<typeof selectBestTradeRouteForToken>;
  reason?: string;
}

function getNativeGasTokenId(network: 'ethereum' | 'base' | 'bnb') {
  if (network === 'bnb') {
    return 'bnb';
  }

  return 'eth';
}

function isEvmTradeNetwork(
  network: OrbitTradeRoute['network'],
): network is 'ethereum' | 'base' | 'bnb' {
  return network === 'ethereum' || network === 'base' || network === 'bnb';
}

export function getRealTradeSupport(
  token: MarketToken,
  assets: WalletAsset[],
  side: TradeSide,
): RealTradeSupport {
  const route = selectBestTradeRouteForToken(token, assets, side);

  if (!route) {
    return {
      ready: false,
      route: null,
      reason: 'Este token todavia no tiene una ruta real de trading dentro de OrbitX.',
    };
  }

  if (route.provider === '1inch' && !ONEINCH_READY) {
    return {
      ready: false,
      route,
      reason: 'La liquidez EVM queda preparada, pero falta activar la clave de 1inch.',
    };
  }

  return {
    ready: true,
    route,
  };
}

export async function fetchRealTradeQuote(
  request: TradeQuoteRequest,
  assets: WalletAsset[],
  getTokenPriceUsd: (tokenId: string) => number,
  token: MarketToken,
): Promise<NormalizedTradeQuote> {
  const support = getRealTradeSupport(token, assets, request.side);

  if (!support.ready || !support.route) {
    throw new Error(support.reason || 'No hay una ruta activa para este swap.');
  }

  if (support.route.provider === 'jupiter') {
    return fetchJupiterQuote(request);
  }

  if (!isEvmTradeNetwork(support.route.network)) {
    throw new Error('La ruta seleccionada no es compatible con swaps EVM.');
  }

  const nativeGasTokenId = getNativeGasTokenId(support.route.network);
  const nativeGasTokenPriceUsd = getTokenPriceUsd(nativeGasTokenId);

  return fetchOneInchQuote(
    support.route.network,
    request,
    nativeGasTokenPriceUsd,
    support.route,
  );
}

export async function executeRealTrade(
  quote: NormalizedTradeQuote,
  onStageChange?: (stage: TradeExecutionStage) => void,
): Promise<TradeExecutionResult> {
  if (quote.provider === 'jupiter') {
    return executeJupiterSwap(quote, onStageChange);
  }

  return executeOneInchSwap(quote, onStageChange);
}

export function getTradeRouteById(routeId: string) {
  return ORBIT_TRADE_ROUTES.find((route) => route.id === routeId) ?? null;
}
