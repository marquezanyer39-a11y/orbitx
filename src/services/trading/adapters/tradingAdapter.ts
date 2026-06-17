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

export interface ITradingAdapter {
  getProviderStatus(): Promise<TradingProviderStatus>;
  getCapabilities(): Promise<TradingProviderCapabilities>;
  getAccountStatus(): Promise<TradingAccount>;
  getInstruments(): Promise<TradingInstrument[]>;
  getTicker(symbol: string): Promise<TradingTicker>;
  getOrderBook(symbol: string): Promise<TradingOrderBook>;
  getBalances(): Promise<TradingBalance[]>;
  getOpenOrders(): Promise<TradingOrder[]>;
  getOrderHistory(params: OrderHistoryParams): Promise<TradingOrder[]>;
  getTradeHistory(params: TradeHistoryParams): Promise<TradingTrade[]>;
  getPositions(): Promise<TradingPosition[]>;
  getFees(): Promise<TradingFee[]>;
  placeOrder(params: PlaceOrderParams): Promise<TradingExecutionResult>;
  cancelOrder(orderId: string): Promise<boolean>;
  transferInternal(params: TransferParams): Promise<TradingTransfer>;
  getProviderHealth(): Promise<{ healthy: boolean; latencyMs?: number }>;
}
