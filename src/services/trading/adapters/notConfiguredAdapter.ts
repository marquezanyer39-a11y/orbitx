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
  TradingProviderId,
  TradingProviderStatus,
  TradingTicker,
  TradingTrade,
  TradingTransfer,
  TransferParams,
} from '../../../types/trading';
import { createProviderNotConfiguredError } from '../tradingErrors';
import type { ITradingAdapter } from './tradingAdapter';

const now = () => new Date().toISOString();

export class NotConfiguredTradingAdapter implements ITradingAdapter {
  constructor(
    private readonly providerId: Exclude<TradingProviderId, 'mock' | 'okx'>,
    private readonly status: TradingProviderStatus = 'not_configured',
  ) {}

  async getProviderStatus(): Promise<TradingProviderStatus> {
    return this.status;
  }

  async getCapabilities(): Promise<TradingProviderCapabilities> {
    return TRADING_PROVIDER_DEFINITIONS[this.providerId];
  }

  async getAccountStatus(): Promise<TradingAccount> {
    return {
      id: `${this.providerId}-account-placeholder`,
      providerId: this.providerId,
      type: 'spot',
      status: this.status,
      displayName: TRADING_PROVIDER_DEFINITIONS[this.providerId].displayName,
      isDemo: false,
      isRealTradingEnabled: false,
      updatedAt: now(),
    };
  }

  async getInstruments(): Promise<TradingInstrument[]> {
    return [];
  }

  async getTicker(_symbol: string): Promise<TradingTicker> {
    throw createProviderNotConfiguredError(this.providerId);
  }

  async getOrderBook(_symbol: string): Promise<TradingOrderBook> {
    throw createProviderNotConfiguredError(this.providerId);
  }

  async getBalances(): Promise<TradingBalance[]> {
    return [];
  }

  async getOpenOrders(): Promise<TradingOrder[]> {
    return [];
  }

  async getOrderHistory(_params: OrderHistoryParams): Promise<TradingOrder[]> {
    return [];
  }

  async getTradeHistory(_params: TradeHistoryParams): Promise<TradingTrade[]> {
    return [];
  }

  async getPositions(): Promise<TradingPosition[]> {
    return [];
  }

  async getFees(): Promise<TradingFee[]> {
    return [];
  }

  async placeOrder(_params: PlaceOrderParams): Promise<TradingExecutionResult> {
    throw createProviderNotConfiguredError(this.providerId);
  }

  async cancelOrder(_orderId: string): Promise<boolean> {
    throw createProviderNotConfiguredError(this.providerId);
  }

  async transferInternal(_params: TransferParams): Promise<TradingTransfer> {
    throw createProviderNotConfiguredError(this.providerId);
  }

  async getProviderHealth(): Promise<{ healthy: boolean; latencyMs?: number }> {
    return { healthy: false, latencyMs: 0 };
  }
}
