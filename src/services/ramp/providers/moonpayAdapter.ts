import { buildRampRedirectUrl } from '../rampConfig';
import type {
  RampConfig,
  RampFlowRequest,
  RampPresentationMode,
  RampProviderAdapter,
  RampProviderAvailability,
  RampProviderCallback,
  RampQuote,
  RampWidgetSession,
} from '../../../types/ramp';

function getPresentationMode(): RampPresentationMode {
  return 'external_browser';
}

async function postJson<TRequest, TResponse>(url: string, payload: TRequest): Promise<TResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as TResponse) : ({} as TResponse);

  if (!response.ok) {
    throw new Error(
      typeof data === 'object' && data && 'message' in data
        ? String((data as { message?: string }).message)
        : 'Provider session request failed.',
    );
  }

  return data;
}

export const moonpayAdapter: RampProviderAdapter = {
  id: 'moonpay',
  displayName: 'MoonPay',

  async getAvailability(request, config): Promise<RampProviderAvailability> {
    if (!config.enabledModes.includes(request.mode)) {
      return {
        available: false,
        reasonCode: 'mode_disabled',
        reasonLabel: 'This mode is disabled in the current OrbitX configuration.',
        presentationMode: getPresentationMode(),
      };
    }

    if (!config.moonpay.sessionEndpoint) {
      return {
        available: false,
        reasonCode: 'provider_setup_pending',
        reasonLabel: 'MoonPay still needs a backend widget-session endpoint in OrbitX.',
        presentationMode: getPresentationMode(),
      };
    }

    return {
      available: true,
      presentationMode: getPresentationMode(),
    };
  },

  async getQuote(request, config): Promise<RampQuote | null> {
    const partnerFeeAmount = Number(((request.fiatAmount * config.partnerFeePct) / 100).toFixed(2));

    if (!config.moonpay.quoteEndpoint) {
      return {
        providerId: 'moonpay',
        mode: request.mode,
        fiatCurrency: request.fiatCurrency,
        cryptoCurrency: request.cryptoCurrency,
        network: request.network,
        fiatAmount: request.fiatAmount,
        partnerFeeAmount,
        totalFeeAmount: partnerFeeAmount,
        totalPayableAmount: request.fiatAmount + partnerFeeAmount,
        paymentMethod: request.paymentMethod,
        countryCode: request.countryCode,
        raw: null,
      };
    }

    const data = await postJson<
      Record<string, unknown>,
      {
        quoteId?: string;
        providerFeeAmount?: number;
        networkFeeAmount?: number;
        totalPayableAmount?: number;
        cryptoAmount?: number;
        expiresAt?: string;
        paymentMethod?: string;
        raw?: Record<string, unknown> | null;
      }
    >(config.moonpay.quoteEndpoint, {
      provider: 'moonpay',
      mode: request.mode,
      apiKey: config.moonpay.apiKey,
      fiatCurrency: request.fiatCurrency,
      cryptoCurrency: request.cryptoCurrency,
      network: request.network,
      fiatAmount: request.fiatAmount,
      partnerFeePct: config.partnerFeePct,
      countryCode: request.countryCode,
      paymentMethod: request.paymentMethod,
      environment: config.environment,
    });

    const providerFeeAmount = Number(data.providerFeeAmount ?? 0);
    const networkFeeAmount = Number(data.networkFeeAmount ?? 0);

    return {
      providerId: 'moonpay',
      mode: request.mode,
      fiatCurrency: request.fiatCurrency,
      cryptoCurrency: request.cryptoCurrency,
      network: request.network,
      fiatAmount: request.fiatAmount,
      cryptoAmount: data.cryptoAmount,
      providerFeeAmount,
      networkFeeAmount,
      partnerFeeAmount,
      totalFeeAmount: Number((providerFeeAmount + networkFeeAmount + partnerFeeAmount).toFixed(2)),
      totalPayableAmount:
        data.totalPayableAmount ??
        Number((request.fiatAmount + providerFeeAmount + networkFeeAmount + partnerFeeAmount).toFixed(2)),
      paymentMethod: data.paymentMethod ?? request.paymentMethod,
      countryCode: request.countryCode,
      quoteId: data.quoteId,
      expiresAt: data.expiresAt,
      raw: data.raw ?? null,
    };
  },

  async createWidgetSession(request, config): Promise<RampWidgetSession> {
    if (!config.moonpay.sessionEndpoint) {
      throw new Error('MoonPay widget session endpoint is not configured yet.');
    }

    const data = await postJson<
      Record<string, unknown>,
      {
        widgetUrl?: string;
        redirectUrl?: string;
        externalReference?: string;
        expiresAt?: string;
        raw?: Record<string, unknown> | null;
      }
    >(config.moonpay.sessionEndpoint, {
      provider: 'moonpay',
      environment: config.environment,
      apiKey: config.moonpay.apiKey,
      redirectUrl: buildRampRedirectUrl('moonpay'),
      request,
      partnerFeePct: config.partnerFeePct,
      revenueSharePct: config.revenueSharePct,
    });

    if (!data.widgetUrl) {
      throw new Error('MoonPay did not return a widget URL.');
    }

    return {
      providerId: 'moonpay',
      widgetUrl: data.widgetUrl,
      redirectUrl: data.redirectUrl ?? buildRampRedirectUrl('moonpay'),
      presentationMode: getPresentationMode(),
      externalReference: data.externalReference,
      expiresAt: data.expiresAt,
      raw: data.raw ?? null,
    };
  },

  parseCallback(url: string): RampProviderCallback | null {
    try {
      const parsedUrl = new URL(url);
      const statusRaw =
        parsedUrl.searchParams.get('status') ?? parsedUrl.searchParams.get('transactionStatus') ?? '';
      const normalized = statusRaw.toLowerCase();

      const status =
        normalized.includes('complete') || normalized.includes('success')
          ? 'completed'
          : normalized.includes('cancel')
            ? 'cancelled'
            : normalized.includes('pending') || normalized.includes('processing')
              ? 'processing'
              : normalized.includes('fail') || normalized.includes('error')
                ? 'failed'
                : null;

      if (!status) {
        return null;
      }

      return {
        status,
        message: parsedUrl.searchParams.get('message') ?? undefined,
        externalTransactionId:
          parsedUrl.searchParams.get('transactionId') ??
          parsedUrl.searchParams.get('transaction_id') ??
          undefined,
        providerOrderId: parsedUrl.searchParams.get('orderId') ?? undefined,
        paymentMethod: parsedUrl.searchParams.get('paymentMethod') ?? undefined,
        countryCode: parsedUrl.searchParams.get('countryCode') ?? undefined,
        cryptoCurrency: parsedUrl.searchParams.get('cryptoCurrency') ?? undefined,
        fiatCurrency: parsedUrl.searchParams.get('fiatCurrency') ?? undefined,
        fiatAmount: parsedUrl.searchParams.get('fiatAmount')
          ? Number(parsedUrl.searchParams.get('fiatAmount'))
          : undefined,
        cryptoAmount: parsedUrl.searchParams.get('cryptoAmount')
          ? Number(parsedUrl.searchParams.get('cryptoAmount'))
          : undefined,
        raw: Object.fromEntries(parsedUrl.searchParams.entries()),
      };
    } catch {
      return null;
    }
  },
};
