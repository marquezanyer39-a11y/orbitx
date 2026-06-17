import type {
  TradingAccount,
  TradingBalance,
  TradingFee,
  TradingInstrument,
  TradingOrder,
  TradingOrderBook,
  TradingPosition,
  TradingTicker,
  TradingTrade,
  TradingTransfer,
} from '../../types/trading';

export function asTradingAccount(payload: unknown): TradingAccount {
  return payload as TradingAccount;
}

export function asTradingInstruments(payload: unknown): TradingInstrument[] {
  return Array.isArray(payload) ? (payload as TradingInstrument[]) : [];
}

export function asTradingTicker(payload: unknown): TradingTicker {
  return payload as TradingTicker;
}

export function asTradingOrderBook(payload: unknown): TradingOrderBook {
  return payload as TradingOrderBook;
}

export function asTradingBalances(payload: unknown): TradingBalance[] {
  return Array.isArray(payload) ? (payload as TradingBalance[]) : [];
}

export function asTradingOrders(payload: unknown): TradingOrder[] {
  return Array.isArray(payload) ? (payload as TradingOrder[]) : [];
}

export function asTradingTrades(payload: unknown): TradingTrade[] {
  return Array.isArray(payload) ? (payload as TradingTrade[]) : [];
}

export function asTradingPositions(payload: unknown): TradingPosition[] {
  return Array.isArray(payload) ? (payload as TradingPosition[]) : [];
}

export function asTradingFees(payload: unknown): TradingFee[] {
  return Array.isArray(payload) ? (payload as TradingFee[]) : [];
}

export function asTradingTransfer(payload: unknown): TradingTransfer {
  return payload as TradingTransfer;
}
