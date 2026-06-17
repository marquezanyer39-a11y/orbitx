import { TRADING_PROVIDER_DEFINITIONS } from '../../../constants/tradingProviders';
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
  TradingProviderStatus,
  TradingTicker,
  TradingTrade,
  TradingTransfer,
  TransferParams,
} from '../../../types/trading';
import { getTradingBackendBaseUrl } from '../tradingProviderConfig';
import {
  asTradingAccount,
  asTradingBalances,
  asTradingFees,
  asTradingInstruments,
  asTradingOrderBook,
  asTradingOrders,
  asTradingPositions,
  asTradingTicker,
  asTradingTrades,
  asTradingTransfer,
} from '../tradingMappers';
import { TradingError } from '../tradingErrors';
import type { ITradingAdapter } from './tradingAdapter';

type HttpMethod = 'GET' | 'POST' | 'DELETE';

function buildUrl(path: string, params?: Record<string, unknown>) {
  const baseUrl = getTradingBackendBaseUrl();
  if (!baseUrl) {
    throw new TradingError({
      code: 'PROVIDER_NOT_CONFIGURED',
      providerId: 'okx',
      message: 'OKX Broker aun no esta conectado en backend. Contacta al equipo de infraestructura.',
    });
  }

  const url = new URL(`${baseUrl}${path}`);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
    ) {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

async function requestBackend<T>(
  method: HttpMethod,
  path: string,
  options?: {
    query?: Record<string, unknown>;
    body?: unknown;
  },
) {
  const response = await fetch(buildUrl(path, options?.query), {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: options?.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    throw new TradingError({
      code: response.status === 404 ? 'PROVIDER_NOT_CONFIGURED' : 'BACKEND_NOT_AVAILABLE',
      providerId: 'okx',
      message:
        response.status === 404
          ? 'OKX Broker aun no esta conectado en backend. Contacta al equipo de infraestructura.'
          : `Backend QVEX respondio ${response.status} al consultar trading.`,
      isRetryable: response.status >= 500,
    });
  }

  return (await response.json()) as T;
}

export class OkxTradingAdapter implements ITradingAdapter {
  async getProviderStatus(): Promise<TradingProviderStatus> {
    return requestBackend<TradingProviderStatus>('GET', '/trading/provider/status');
  }

  async getCapabilities(): Promise<TradingProviderCapabilities> {
    return requestBackend<TradingProviderCapabilities>('GET', '/trading/provider/capabilities');
  }

  async getAccountStatus(): Promise<TradingAccount> {
    return asTradingAccount(await requestBackend<unknown>('GET', '/trading/account/status'));
  }

  async getInstruments(): Promise<TradingInstrument[]> {
    return asTradingInstruments(await requestBackend<unknown>('GET', '/trading/instruments'));
  }

  async getTicker(symbol: string): Promise<TradingTicker> {
    return asTradingTicker(
      await requestBackend<unknown>('GET', '/trading/ticker', { query: { symbol } }),
    );
  }

  async getOrderBook(symbol: string): Promise<TradingOrderBook> {
    return asTradingOrderBook(
      await requestBackend<unknown>('GET', '/trading/orderbook', { query: { symbol } }),
    );
  }

  async getBalances(): Promise<TradingBalance[]> {
    return asTradingBalances(await requestBackend<unknown>('GET', '/trading/balances'));
  }

  async getOpenOrders(): Promise<TradingOrder[]> {
    return asTradingOrders(await requestBackend<unknown>('GET', '/trading/orders/open'));
  }

  async getOrderHistory(params: OrderHistoryParams): Promise<TradingOrder[]> {
    return asTradingOrders(
      await requestBackend<unknown>('GET', '/trading/orders/history', { query: { ...params } }),
    );
  }

  async getTradeHistory(params: TradeHistoryParams): Promise<TradingTrade[]> {
    return asTradingTrades(
      await requestBackend<unknown>('GET', '/trading/trades/history', { query: { ...params } }),
    );
  }

  async getPositions(): Promise<TradingPosition[]> {
    return asTradingPositions(await requestBackend<unknown>('GET', '/trading/positions'));
  }

  async getFees(): Promise<TradingFee[]> {
    return asTradingFees(await requestBackend<unknown>('GET', '/trading/fees'));
  }

  async placeOrder(params: PlaceOrderParams): Promise<TradingExecutionResult> {
    return requestBackend<TradingExecutionResult>('POST', '/trading/orders', { body: params });
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    await requestBackend<unknown>('DELETE', `/trading/orders/${encodeURIComponent(orderId)}`);
    return true;
  }

  async transferInternal(params: TransferParams): Promise<TradingTransfer> {
    return asTradingTransfer(
      await requestBackend<unknown>('POST', '/trading/transfers', { body: params }),
    );
  }

  async getProviderHealth(): Promise<{ healthy: boolean; latencyMs?: number }> {
    const startedAt = Date.now();
    const status = await this.getProviderStatus();
    return {
      healthy: status === 'connected',
      latencyMs: Date.now() - startedAt,
    };
  }
}

export const okxTradingAdapter = new OkxTradingAdapter();

export const okxTradingCapabilities = TRADING_PROVIDER_DEFINITIONS.okx;
