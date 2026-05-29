import type { TokenDefinition } from '../../wallet/tokenRegistry';

export type SwapProviderId = 'disabled' | 'zero_x' | 'one_inch' | 'orbitx';
export type SwapStatus = 'disabled' | 'quote_ready' | 'requires_approval' | 'pending_signature' | 'submitted' | 'failed';

export interface SwapAmount {
  amount: string;
  amountRaw?: string;
  token: TokenDefinition;
}

export interface SwapQuoteRequest {
  chainId: number;
  fromAddress: string;
  sellToken: TokenDefinition;
  buyToken: TokenDefinition;
  sellAmount: string;
  slippageBps: number;
}

export interface SwapQuote {
  providerId: SwapProviderId;
  chainId: number;
  sell: SwapAmount;
  buy: SwapAmount;
  estimatedGasNative?: string;
  priceImpactPct?: string;
  slippageBps: number;
  expiresAt: number;
  warningMessage?: string;
}

export interface SwapExecutionRequest {
  quote: SwapQuote;
  provider: unknown;
  userConfirmed: boolean;
}

export interface SwapExecutionResult {
  status: SwapStatus;
  txHash: string | null;
  explorerUrl: string | null;
  errorCode?: string;
  errorMessage?: string;
}
