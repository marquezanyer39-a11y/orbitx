import type { TradeSide, WalletNetwork } from '../../types';

export interface TradeQuoteRequest {
  tokenId: string;
  amount: number;
  side: TradeSide;
  slippagePct: number;
}

export interface TradeExecutionPayload {
  provider: '1inch' | 'jupiter';
  network: WalletNetwork;
  routeId: string;
  chainId?: number;
  tokenId: string;
  quoteTokenId: string;
  side: TradeSide;
  amountInRaw: string;
  amountOutRaw: string;
  sourceAddress?: string;
  quoteResponse?: unknown;
  swapResponse?: unknown;
  approvalRequired?: boolean;
}

export interface NormalizedTradeQuote {
  routeId: string;
  network: WalletNetwork;
  provider: '1inch' | 'jupiter';
  tokenId: string;
  quoteTokenId: string;
  payAmount: number;
  receiveAmount: number;
  feeAmountUsd: number;
  slippagePct: number;
  priceImpactPct?: number;
  execution: TradeExecutionPayload;
}

export interface TradeExecutionResult {
  network: WalletNetwork;
  hash: string;
  provider: '1inch' | 'jupiter';
}
