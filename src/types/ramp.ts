import type { LanguageCode } from '../../types';

export type RampMode = 'buy' | 'sell' | 'convert' | 'pay';
export type RampProviderId = 'transak' | 'moonpay';
export type RampEnvironment = 'sandbox' | 'production';
export type RampPresentationMode = 'webview' | 'external_browser';
export type RampFlowStatus =
  | 'idle'
  | 'initiating'
  | 'redirecting'
  | 'kyc'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface RampAssetOption {
  symbol: string;
  name: string;
  network: string;
  defaultFiatCurrency: string;
}

export interface RampProviderAvailability {
  available: boolean;
  reasonCode?: string;
  reasonLabel?: string;
  presentationMode: RampPresentationMode;
}

export interface RampQuote {
  providerId: RampProviderId;
  mode: RampMode;
  fiatCurrency: string;
  cryptoCurrency: string;
  network: string;
  fiatAmount: number;
  cryptoAmount?: number;
  providerFeeAmount?: number;
  networkFeeAmount?: number;
  partnerFeeAmount: number;
  totalFeeAmount: number;
  totalPayableAmount?: number;
  paymentMethod?: string;
  countryCode?: string;
  quoteId?: string;
  expiresAt?: string;
  raw?: Record<string, unknown> | null;
}

export interface RampFlowRequest {
  mode: RampMode;
  providerId: RampProviderId;
  fiatCurrency: string;
  cryptoCurrency: string;
  network: string;
  fiatAmount: number;
  walletAddress?: string;
  countryCode?: string;
  paymentMethod?: string;
  language: LanguageCode;
}

export interface RampWidgetSession {
  providerId: RampProviderId;
  widgetUrl: string;
  redirectUrl: string;
  presentationMode: RampPresentationMode;
  externalReference?: string;
  expiresAt?: string;
  raw?: Record<string, unknown> | null;
}

export interface RampProviderCallback {
  status: Extract<RampFlowStatus, 'completed' | 'failed' | 'cancelled' | 'processing' | 'kyc'>;
  message?: string;
  externalTransactionId?: string;
  providerOrderId?: string;
  paymentMethod?: string;
  countryCode?: string;
  cryptoCurrency?: string;
  fiatCurrency?: string;
  fiatAmount?: number;
  cryptoAmount?: number;
  raw?: Record<string, unknown> | null;
}

export interface RampMetricsEvent {
  id: string;
  createdAt: string;
  mode: RampMode;
  providerId: RampProviderId;
  status: 'started' | 'completed' | 'cancelled' | 'failed';
  partnerFeePct: number;
  partnerFeeAmount: number;
  estimatedRevenueShareAmount?: number;
  fiatAmount: number;
  fiatCurrency: string;
  cryptoCurrency: string;
  network: string;
  paymentMethod?: string;
  countryCode?: string;
  externalTransactionId?: string;
  providerOrderId?: string;
  reason?: string;
}

export interface RampMetricsSummary {
  started: number;
  completed: number;
  cancelled: number;
  failed: number;
  volumeFiat: number;
  partnerFeesCollected: number;
  estimatedRevenueShare: number;
}

export interface RampConfig {
  primaryProvider: RampProviderId;
  partnerFeePct: number;
  revenueSharePct: number | null;
  environment: RampEnvironment;
  enabledCountries: string[];
  enabledFiatCurrencies: string[];
  enabledModes: RampMode[];
  transak: {
    apiKey: string;
    quoteEndpoint: string;
    sessionEndpoint: string;
    referrerDomain: string;
  };
  moonpay: {
    apiKey: string;
    quoteEndpoint: string;
    sessionEndpoint: string;
  };
}

export interface RampProviderAdapter {
  id: RampProviderId;
  displayName: string;
  getAvailability: (request: RampFlowRequest, config: RampConfig) => Promise<RampProviderAvailability>;
  getQuote: (request: RampFlowRequest, config: RampConfig) => Promise<RampQuote | null>;
  createWidgetSession: (request: RampFlowRequest, config: RampConfig) => Promise<RampWidgetSession>;
  parseCallback: (url: string) => RampProviderCallback | null;
}
