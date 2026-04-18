import type { LanguageCode } from '../../types';
import type { RampProviderId } from './ramp';

export type ConvertAssetKind = 'crypto' | 'fiat';
export type ConvertExecutionKind = 'internal' | 'provider';
export type ConvertQuoteStatus = 'idle' | 'loading' | 'ready' | 'unavailable' | 'error';

export interface ConvertAssetOption {
  id: string;
  symbol: string;
  name: string;
  kind: ConvertAssetKind;
  image?: string;
  networkLabel?: string;
  providerLabel?: string;
  priceUsd?: number | null;
  balance: number;
  favorite?: boolean;
  frequent?: boolean;
  availabilityLabel?: string;
  availableAsSource: boolean;
  availableAsDestination: boolean;
}

export interface ConvertQuote {
  status: ConvertQuoteStatus;
  executionKind: ConvertExecutionKind;
  fromAsset: ConvertAssetOption;
  toAsset: ConvertAssetOption;
  fromAmount: number;
  estimatedToAmount?: number;
  estimatedRate?: number;
  feePct: number;
  spreadPct: number;
  feeAmountUsd: number;
  spreadAmountUsd: number;
  minimumSourceAmount?: number;
  providerId?: RampProviderId;
  providerLabel: string;
  estimatedSeconds: number;
  regionAllowed: boolean;
  regionLabel?: string;
  warningLabel?: string;
  message?: string;
  disclaimer?: string;
  canProceed: boolean;
  routeMode?: 'convert' | 'sell';
}

export interface ConvertExecutionSummary {
  id: string;
  fromSymbol: string;
  toSymbol: string;
  fromAmount: number;
  toAmount?: number;
  fiatValueUsd: number;
  providerLabel: string;
  executionKind: ConvertExecutionKind;
  status: 'completed' | 'redirected';
  createdAt: string;
}

export interface ConvertCopy {
  language: LanguageCode;
  headerTitle: string;
  headerBody: string;
  fromLabel: string;
  toLabel: string;
  sourceBalance: string;
  estimatedBalance: string;
  maxLabel: string;
  amountPlaceholder: string;
  destinationPlaceholder: string;
  quoteTitle: string;
  rateLabel: string;
  estimatedPriceLabel: string;
  feeLabel: string;
  spreadLabel: string;
  providerLabel: string;
  etaLabel: string;
  regionLabel: string;
  minimumLabel: string;
  emptyStateTitle: string;
  emptyStateBody: string;
  loadingQuote: string;
  noPairTitle: string;
  noPairBody: string;
  unavailableRegion: string;
  unavailableGeneric: string;
  askAstra: string;
  previewLabel: string;
  convertNow: string;
  continueWithProvider: string;
  recentTitle: string;
  favoritesTitle: string;
  frequentTitle: string;
  successTitle: string;
  successBody: string;
  walletCta: string;
  historyCta: string;
  confirmTitle: string;
  confirmBody: string;
  confirmAction: string;
  cancelAction: string;
  selectorTitleSource: string;
  selectorTitleTarget: string;
  searchPlaceholder: string;
  unavailableTag: string;
  availableByRegionTag: string;
  providerManagedTag: string;
  providerManagedBody: string;
  instantBody: string;
  notEnoughBalance: string;
  sameAsset: string;
  sourceRequired: string;
  amountRequired: string;
  unsupportedSourceFiat: string;
  swapOnlyCrypto: string;
  retakeGuide: string;
}
