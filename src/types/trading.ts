export type TradingProviderId = 'mock' | 'okx' | 'binance' | 'mexc' | 'bybit' | 'orbitx';
export type TradingProviderMode = 'demo' | 'broker' | 'native';
export type TradingProviderStatus =
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'not_configured'
  | 'coming_soon';

export type TradingAccountType = 'spot' | 'futures' | 'margin' | 'sub_account';
export type TradingBalanceType = 'available' | 'frozen' | 'total';
export type TradingMarketType = 'spot' | 'futures' | 'options';
export type TradingOrderSide = 'buy' | 'sell';
export type TradingOrderType = 'market' | 'limit' | 'stop';
export type TradingOrderStatus =
  | 'pending'
  | 'open'
  | 'filled'
  | 'cancelled'
  | 'rejected'
  | 'simulated';
export type TradingPositionSide = 'long' | 'short' | 'net';
export type TradingTransferType = 'deposit' | 'withdrawal' | 'internal';

export type TradingErrorCode =
  | 'PROVIDER_NOT_CONFIGURED'
  | 'BACKEND_NOT_AVAILABLE'
  | 'ORDER_REJECTED'
  | 'INSUFFICIENT_BALANCE'
  | 'COMING_SOON'
  | 'REAL_TRADING_DISABLED'
  | 'UNKNOWN';

export interface TradingAccount {
  id: string;
  providerId: TradingProviderId;
  type: TradingAccountType;
  status: TradingProviderStatus;
  displayName: string;
  isDemo: boolean;
  isRealTradingEnabled: boolean;
  createdAt?: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface TradingBalance {
  id: string;
  providerId: TradingProviderId;
  accountId: string;
  asset: string;
  type: TradingBalanceType;
  amount: number;
  usdValue?: number;
  isDemo: boolean;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface TradingInstrument {
  id: string;
  providerId: TradingProviderId;
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  marketType: TradingMarketType;
  isActive: boolean;
  minOrderSize?: number;
  maxOrderSize?: number;
  tickSize?: number;
  lotSize?: number;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface TradingTicker {
  symbol: string;
  providerId: TradingProviderId;
  price: number;
  change24h: number;
  high24h?: number;
  low24h?: number;
  volume24h?: number;
  source: 'live' | 'cached' | 'mock';
  updatedAt: string;
}

export interface TradingOrderBookLevel {
  price: number;
  quantity: number;
  total: number;
}

export interface TradingOrderBook {
  symbol: string;
  providerId: TradingProviderId;
  bids: TradingOrderBookLevel[];
  asks: TradingOrderBookLevel[];
  source: 'live' | 'cached' | 'mock';
  updatedAt: string;
}

export interface TradingCandle {
  symbol: string;
  providerId: TradingProviderId;
  interval: string;
  openTime: string;
  closeTime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TradingOrder {
  id: string;
  providerId: TradingProviderId;
  accountId: string;
  symbol: string;
  side: TradingOrderSide;
  type: TradingOrderType;
  status: TradingOrderStatus;
  price?: number;
  quantity: number;
  filledQuantity: number;
  averagePrice?: number;
  fee?: number;
  feeAsset?: string;
  isSimulated: boolean;
  createdAt: string;
  updatedAt: string;
  providerOrderId?: string;
  warningMessage?: string;
  metadata?: Record<string, unknown>;
}

export interface TradingTrade {
  id: string;
  providerId: TradingProviderId;
  accountId: string;
  orderId?: string;
  symbol: string;
  side: TradingOrderSide;
  price: number;
  quantity: number;
  fee?: number;
  feeAsset?: string;
  isSimulated: boolean;
  executedAt: string;
  metadata?: Record<string, unknown>;
}

export interface TradingPosition {
  id: string;
  providerId: TradingProviderId;
  accountId: string;
  symbol: string;
  side: TradingPositionSide;
  quantity: number;
  entryPrice: number;
  markPrice?: number;
  unrealizedPnl?: number;
  leverage?: number;
  liquidationPrice?: number;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface TradingFee {
  id: string;
  providerId: TradingProviderId;
  symbol?: string;
  marketType: TradingMarketType;
  makerFeeRate: number;
  takerFeeRate: number;
  asset?: string;
  updatedAt: string;
}

export interface TradingTransfer {
  id: string;
  providerId: TradingProviderId;
  type: TradingTransferType;
  asset: string;
  amount: number;
  fromAccountId: string;
  toAccountId: string;
  status: 'pending' | 'completed' | 'failed' | 'simulated';
  isSimulated: boolean;
  providerTransferId?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface TradingProviderCapabilities {
  supportsSpot: boolean;
  supportsFutures: boolean;
  supportsOrderBook: boolean;
  supportsPositions: boolean;
  supportsSubAccounts: boolean;
  supportsInternalTransfers: boolean;
  supportsWithdrawals: boolean;
  supportsDeposits: boolean;
  supportsOAuth: boolean;
  supportsApiKeys: boolean;
  supportsRealOrders: boolean;
  requiresBackendSigning: boolean;
}

export interface TradingProviderConfig {
  id: TradingProviderId;
  mode: TradingProviderMode;
  status: TradingProviderStatus;
  backendBaseUrl?: string;
  isEnabled: boolean;
  isProductionReady: boolean;
  capabilities: TradingProviderCapabilities;
}

export interface TradingProviderDefinition extends TradingProviderCapabilities {
  id: TradingProviderId;
  name: string;
  displayName: string;
  mode: TradingProviderMode;
  isEnabled: boolean;
  isProductionReady: boolean;
  requiresKyc: boolean;
  requiresLegalApproval: boolean;
  notes: string;
}

export interface TradingQuote {
  symbol: string;
  providerId: TradingProviderId;
  side: TradingOrderSide;
  price: number;
  quantity: number;
  estimatedTotal: number;
  estimatedFee: number;
  feeAsset: string;
  expiresAt: string;
  isSimulated: boolean;
}

export interface TradingExecutionResult {
  status: 'executed' | 'simulated' | 'rejected';
  isSimulated: boolean;
  warningMessage?: string;
  orderId?: string;
  providerOrderId?: string;
  symbol: string;
  side: TradingOrderSide;
  type: TradingOrderType;
  price?: number;
  quantity: number;
  executedQuantity?: number;
  executedPrice?: number;
  fee?: number;
  feeAsset?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface TradingError {
  code: TradingErrorCode;
  message: string;
  providerId?: TradingProviderId;
  isRetryable: boolean;
  cause?: unknown;
  metadata?: Record<string, unknown>;
}

export interface OrderHistoryParams {
  symbol?: string;
  status?: TradingOrderStatus;
  from?: string;
  to?: string;
  limit?: number;
}

export interface TradeHistoryParams {
  symbol?: string;
  from?: string;
  to?: string;
  limit?: number;
}

export interface PlaceOrderParams {
  symbol: string;
  side: TradingOrderSide;
  type: TradingOrderType;
  quantity: number;
  price?: number;
  stopPrice?: number;
  clientOrderId?: string;
  metadata?: Record<string, unknown>;
}

export interface TransferParams {
  asset: string;
  amount: number;
  fromAccountId: string;
  toAccountId: string;
  type: TradingTransferType;
  metadata?: Record<string, unknown>;
}
