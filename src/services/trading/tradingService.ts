import { FEATURE_STATUS } from '../../constants/featureStatus';
import { QVEX_STABLE_APK_MODE } from '../../config/runtimeMode';
import type {
  OrderHistoryParams,
  PlaceOrderParams,
  TradeHistoryParams,
  TradingAccount,
  TradingBalance,
  TradingExecutionResult,
  TradingFee,
  TradingInstrument,
  TradingOrder,
  TradingOrderBook,
  TradingPosition,
  TradingProviderCapabilities,
  TradingProviderId,
  TradingProviderStatus,
  TradingTicker,
  TradingTrade,
  TradingTransfer,
  TransferParams,
} from '../../types/trading';
import type { ITradingAdapter } from './adapters';
import {
  binanceTradingAdapter,
  bybitTradingAdapter,
  mexcTradingAdapter,
  mockTradingAdapter,
  okxTradingAdapter,
  orbitxEngineAdapter,
} from './adapters';

let currentProviderId: TradingProviderId = FEATURE_STATUS.trade.provider;

const adapters: Record<TradingProviderId, ITradingAdapter> = {
  mock: mockTradingAdapter,
  okx: okxTradingAdapter,
  binance: binanceTradingAdapter,
  mexc: mexcTradingAdapter,
  bybit: bybitTradingAdapter,
  orbitx: orbitxEngineAdapter,
};

function getActiveAdapter() {
  return adapters[currentProviderId] ?? mockTradingAdapter;
}

function getExecutionAdapter() {
  if (!FEATURE_STATUS.trade.isRealTradingEnabled) {
    return mockTradingAdapter;
  }

  return getActiveAdapter();
}

export function getCurrentTradingProvider(): TradingProviderId {
  return currentProviderId;
}

export function setTradingProvider(providerId: TradingProviderId): void {
  currentProviderId = providerId;
}

export async function getTradingCapabilities(): Promise<TradingProviderCapabilities> {
  return getActiveAdapter().getCapabilities();
}

export async function getProviderStatus(): Promise<TradingProviderStatus> {
  return getActiveAdapter().getProviderStatus();
}

export async function getAccountStatus(): Promise<TradingAccount> {
  return getActiveAdapter().getAccountStatus();
}

export async function getInstruments(): Promise<TradingInstrument[]> {
  return getActiveAdapter().getInstruments();
}

export async function getTicker(symbol: string): Promise<TradingTicker> {
  return getActiveAdapter().getTicker(symbol);
}

export async function getOrderBook(symbol: string): Promise<TradingOrderBook> {
  return getActiveAdapter().getOrderBook(symbol);
}

export async function getBalances(): Promise<TradingBalance[]> {
  return getActiveAdapter().getBalances();
}

export async function getOpenOrders(): Promise<TradingOrder[]> {
  return getActiveAdapter().getOpenOrders();
}

export async function getOrderHistory(params: OrderHistoryParams): Promise<TradingOrder[]> {
  return getActiveAdapter().getOrderHistory(params);
}

export async function getTradeHistory(params: TradeHistoryParams): Promise<TradingTrade[]> {
  return getActiveAdapter().getTradeHistory(params);
}

export async function getPositions(): Promise<TradingPosition[]> {
  return getActiveAdapter().getPositions();
}

export async function getFees(): Promise<TradingFee[]> {
  return getActiveAdapter().getFees();
}

export async function placeOrder(params: PlaceOrderParams): Promise<TradingExecutionResult> {
  if (QVEX_STABLE_APK_MODE) {
    return mockTradingAdapter.placeOrder(params);
  }

  return getExecutionAdapter().placeOrder(params);
}

export async function cancelOrder(orderId: string): Promise<boolean> {
  if (!FEATURE_STATUS.trade.isRealTradingEnabled) {
    return mockTradingAdapter.cancelOrder(orderId);
  }

  return getActiveAdapter().cancelOrder(orderId);
}

export async function transferInternal(params: TransferParams): Promise<TradingTransfer> {
  if (QVEX_STABLE_APK_MODE) {
    return mockTradingAdapter.transferInternal(params);
  }

  if (!FEATURE_STATUS.trade.allowInternalTransfers) {
    return mockTradingAdapter.transferInternal(params);
  }

  return getActiveAdapter().transferInternal(params);
}
