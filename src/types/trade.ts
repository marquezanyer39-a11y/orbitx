export type TradeSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit' | 'stop';
export type MarketMode = 'conversion' | 'spot' | 'futures' | 'launchpad';

export interface TradeFormValues {
  side: TradeSide;
  orderType: OrderType;
  price: string;
  quantity: string;
  total: string;
  stopPrice: string;
  takeProfit: string;
  stopLoss: string;
  quickPercent: number | null;
}

export interface OrderBookRow {
  id: string;
  side: TradeSide;
  price: number;
  quantity: number;
  total: number;
}

export interface RecentTradeRow {
  id: string;
  side: TradeSide;
  price: number;
  quantity: number;
  time: string;
}

export interface OpenOrder {
  id: string;
  side: TradeSide;
  type: OrderType;
  pairId: string;
  price: number;
  quantity: number;
  total: number;
  createdAt: string;
}

export interface OrderSimulationResult {
  ok: boolean;
  message: string;
  fee: number;
  total: number;
  executedPrice: number;
}

export type TradePriceAlertDirection = 'above_or_equal' | 'below_or_equal';

export interface TradePriceAlert {
  id: string;
  pairId: string;
  direction: TradePriceAlertDirection;
  targetPrice: number;
  createdAt: string;
  triggeredAt: string | null;
  lastTriggeredPrice: number | null;
}
