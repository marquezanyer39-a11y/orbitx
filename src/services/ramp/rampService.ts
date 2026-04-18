import { detectDeviceCountryCode, getRampConfig } from './rampConfig';
import { getRampProviderLabel } from './rampCopy';
import { moonpayAdapter } from './providers/moonpayAdapter';
import { transakAdapter } from './providers/transakAdapter';
import type {
  RampAssetOption,
  RampFlowRequest,
  RampMetricsSummary,
  RampMode,
  RampProviderAdapter,
  RampProviderCallback,
  RampProviderId,
  RampQuote,
  RampWidgetSession,
} from '../../types/ramp';

const ASSETS: RampAssetOption[] = [
  { symbol: 'BTC', name: 'Bitcoin', network: 'bitcoin', defaultFiatCurrency: 'USD' },
  { symbol: 'ETH', name: 'Ethereum', network: 'ethereum', defaultFiatCurrency: 'USD' },
  { symbol: 'SOL', name: 'Solana', network: 'solana', defaultFiatCurrency: 'USD' },
  { symbol: 'USDC', name: 'USD Coin', network: 'ethereum', defaultFiatCurrency: 'USD' },
];

const ADAPTERS: Record<RampProviderId, RampProviderAdapter> = {
  transak: transakAdapter,
  moonpay: moonpayAdapter,
};

export function getRampAssets() {
  return ASSETS;
}

export function getRampPrimaryProvider() {
  return getRampConfig().primaryProvider;
}

export function getRampAdapter(providerId: RampProviderId) {
  return ADAPTERS[providerId];
}

export function getRampDefaultRequest(
  mode: RampMode,
  language: RampFlowRequest['language'],
  walletAddress?: string,
) {
  const defaultAsset =
    mode === 'sell' || mode === 'convert'
      ? ASSETS.find((asset) => asset.symbol === 'ETH') ?? ASSETS[0]
      : ASSETS[0];
  const providerId = getRampPrimaryProvider();

  return {
    mode,
    providerId,
    fiatCurrency: defaultAsset.defaultFiatCurrency,
    cryptoCurrency: defaultAsset.symbol,
    network: defaultAsset.network,
    fiatAmount: mode === 'buy' ? 100 : 250,
    walletAddress,
    countryCode: detectDeviceCountryCode(),
    paymentMethod: mode === 'buy' ? 'card' : 'bank_transfer',
    language,
  } satisfies RampFlowRequest;
}

export async function getRampAvailability(request: RampFlowRequest) {
  const config = getRampConfig();
  const adapter = getRampAdapter(request.providerId);
  return adapter.getAvailability(request, config);
}

export async function getRampQuote(request: RampFlowRequest): Promise<RampQuote | null> {
  const config = getRampConfig();
  const adapter = getRampAdapter(request.providerId);
  return adapter.getQuote(request, config);
}

export async function createRampWidgetSession(request: RampFlowRequest): Promise<RampWidgetSession> {
  const config = getRampConfig();
  const adapter = getRampAdapter(request.providerId);
  return adapter.createWidgetSession(request, config);
}

export function parseRampProviderCallback(providerId: RampProviderId, url: string): RampProviderCallback | null {
  return getRampAdapter(providerId).parseCallback(url);
}

export function estimateRevenueShare(partnerFeeAmount: number) {
  const config = getRampConfig();
  if (!config.revenueSharePct) {
    return 0;
  }

  return Number(((partnerFeeAmount * config.revenueSharePct) / 100).toFixed(2));
}

export function getRampProviderSummary(providerId: RampProviderId) {
  const config = getRampConfig();
  const label = getRampProviderLabel(providerId);

  return {
    id: providerId,
    label,
    environment: config.environment,
    partnerFeePct: config.partnerFeePct,
    revenueSharePct: config.revenueSharePct,
  };
}

export function buildRampMetricsSummary(events: Array<{
  status: 'started' | 'completed' | 'cancelled' | 'failed';
  fiatAmount: number;
  partnerFeeAmount: number;
  estimatedRevenueShareAmount?: number;
}>): RampMetricsSummary {
  return events.reduce<RampMetricsSummary>(
    (summary, event) => {
      summary[event.status] += 1;
      if (event.status === 'completed') {
        summary.volumeFiat += event.fiatAmount;
        summary.partnerFeesCollected += event.partnerFeeAmount;
        summary.estimatedRevenueShare += event.estimatedRevenueShareAmount ?? 0;
      }
      return summary;
    },
    {
      started: 0,
      completed: 0,
      cancelled: 0,
      failed: 0,
      volumeFiat: 0,
      partnerFeesCollected: 0,
      estimatedRevenueShare: 0,
    },
  );
}
