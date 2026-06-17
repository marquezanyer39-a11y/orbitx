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
import type { ITradingAdapter } from './tradingAdapter';

const providerId = 'mock' as const;
const now = () => new Date().toISOString();

// MOCK - solo para demo/QA. No ejecuta ordenes ni modifica saldos reales.
export class MockTradingAdapter implements ITradingAdapter {
  async getProviderStatus(): Promise<TradingProviderStatus> {
    return 'connected';
  }

  async getCapabilities(): Promise<TradingProviderCapabilities> {
    return TRADING_PROVIDER_DEFINITIONS.mock;
  }

  async getAccountStatus(): Promise<TradingAccount> {
    return {
      id: 'mock-account-spot',
      providerId,
      type: 'spot',
      status: 'connected',
      displayName: 'Cuenta demo QVEX',
      isDemo: true,
      isRealTradingEnabled: false,
      updatedAt: now(),
    };
  }

  async getInstruments(): Promise<TradingInstrument[]> {
    return [
      {
        id: 'mock-BTC-USDT',
        providerId,
        symbol: 'BTC-USDT',
        baseAsset: 'BTC',
        quoteAsset: 'USDT',
        marketType: 'spot',
        isActive: true,
        minOrderSize: 0.0001,
        tickSize: 0.01,
        lotSize: 0.0001,
        updatedAt: now(),
      },
      {
        id: 'mock-ETH-USDT',
        providerId,
        symbol: 'ETH-USDT',
        baseAsset: 'ETH',
        quoteAsset: 'USDT',
        marketType: 'spot',
        isActive: true,
        minOrderSize: 0.001,
        tickSize: 0.01,
        lotSize: 0.001,
        updatedAt: now(),
      },
    ];
  }

  async getTicker(symbol: string): Promise<TradingTicker> {
    return {
      providerId,
      symbol,
      price: symbol.toUpperCase().startsWith('ETH') ? 3200 : 65000,
      change24h: 0,
      source: 'mock',
      updatedAt: now(),
    };
  }

  async getOrderBook(symbol: string): Promise<TradingOrderBook> {
    const mid = symbol.toUpperCase().startsWith('ETH') ? 3200 : 65000;
    return {
      providerId,
      symbol,
      bids: [
        { price: mid - 1, quantity: 0.12, total: (mid - 1) * 0.12 },
        { price: mid - 2, quantity: 0.18, total: (mid - 2) * 0.18 },
      ],
      asks: [
        { price: mid + 1, quantity: 0.1, total: (mid + 1) * 0.1 },
        { price: mid + 2, quantity: 0.2, total: (mid + 2) * 0.2 },
      ],
      source: 'mock',
      updatedAt: now(),
    };
  }

  async getBalances(): Promise<TradingBalance[]> {
    return [
      {
        id: 'mock-balance-usdt',
        providerId,
        accountId: 'mock-account-spot',
        asset: 'USDT',
        type: 'available',
        amount: 0,
        usdValue: 0,
        isDemo: true,
        updatedAt: now(),
      },
    ];
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
    return [
      {
        id: 'mock-fee-spot',
        providerId,
        marketType: 'spot',
        makerFeeRate: 0.001,
        takerFeeRate: 0.001,
        updatedAt: now(),
      },
    ];
  }

  async placeOrder(params: PlaceOrderParams): Promise<TradingExecutionResult> {
    return {
      status: 'simulated',
      isSimulated: true,
      warningMessage: 'Esta es una orden simulada. No se ejecuto ninguna operacion real.',
      orderId: `mock_${Date.now()}`,
      symbol: params.symbol,
      side: params.side,
      type: params.type,
      price: params.price,
      quantity: params.quantity,
      executedQuantity: 0,
      createdAt: now(),
    };
  }

  async cancelOrder(_orderId: string): Promise<boolean> {
    return true;
  }

  async transferInternal(params: TransferParams): Promise<TradingTransfer> {
    return {
      id: `mock_transfer_${Date.now()}`,
      providerId,
      type: params.type,
      asset: params.asset,
      amount: params.amount,
      fromAccountId: params.fromAccountId,
      toAccountId: params.toAccountId,
      status: 'simulated',
      isSimulated: true,
      createdAt: now(),
      updatedAt: now(),
      metadata: {
        warning: 'Transferencia simulada. No mueve fondos reales.',
      },
    };
  }

  async getProviderHealth(): Promise<{ healthy: boolean; latencyMs?: number }> {
    return { healthy: true, latencyMs: 0 };
  }
}

export const mockTradingAdapter = new MockTradingAdapter();
