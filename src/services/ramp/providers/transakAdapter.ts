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
  return 'webview';
}

function parseStatus(raw: string | null) {
  const normalized = (raw ?? '').toLowerCase();

  if (normalized.includes('success') || normalized.includes('complete')) {
    return 'completed' as const;
  }

  if (normalized.includes('cancel') || normalized.includes('close')) {
    return 'cancelled' as const;
  }

  if (normalized.includes('kyc')) {
    return 'kyc' as const;
  }

  if (normalized.includes('process') || normalized.includes('pending')) {
    return 'processing' as const;
  }

  if (normalized.includes('fail') || normalized.includes('error')) {
    return 'failed' as const;
  }

  return null;
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

function ensureModeSupported(request: RampFlowRequest) {
  if (request.mode === 'pay') {
    throw new Error('Pay is not enabled with Transak in this OrbitX configuration.');
  }
}

function ensureCountryEnabled(request: RampFlowRequest, config: RampConfig) {
  if (!config.enabledCountries.length) {
    return;
  }

  if (!request.countryCode || !config.enabledCountries.includes(request.countryCode.toUpperCase())) {
    throw new Error('Country is not enabled in the current OrbitX ramp configuration.');
  }
}

function ensureFiatEnabled(request: RampFlowRequest, config: RampConfig) {
  if (!config.enabledFiatCurrencies.length) {
    return;
  }

  if (!config.enabledFiatCurrencies.includes(request.fiatCurrency.toUpperCase())) {
    throw new Error('Fiat currency is not enabled in the current OrbitX ramp configuration.');
  }
}

export const transakAdapter: RampProviderAdapter = {
  id: 'transak',
  displayName: 'Transak',

  async getAvailability(request, config): Promise<RampProviderAvailability> {
    if (!config.enabledModes.includes(request.mode)) {
      return {
        available: false,
        reasonCode: 'mode_disabled',
        reasonLabel: 'This mode is disabled in the current OrbitX configuration.',
        presentationMode: getPresentationMode(),
      };
    }

    if (request.mode === 'pay') {
      return {
        available: false,
        reasonCode: 'mode_unavailable',
        reasonLabel: 'Transak pay flow is not enabled yet in OrbitX.',
        presentationMode: getPresentationMode(),
      };
    }

    if (config.enabledCountries.length && request.countryCode && !config.enabledCountries.includes(request.countryCode.toUpperCase())) {
      return {
        available: false,
        reasonCode: 'country_disabled',
        reasonLabel: 'Country is disabled in the current OrbitX configuration.',
        presentationMode: getPresentationMode(),
      };
    }

    if (config.enabledFiatCurrencies.length && !config.enabledFiatCurrencies.includes(request.fiatCurrency.toUpperCase())) {
      return {
        available: false,
        reasonCode: 'fiat_disabled',
        reasonLabel: 'Fiat currency is disabled in the current OrbitX configuration.',
        presentationMode: getPresentationMode(),
      };
    }

    return {
      available: true,
      presentationMode: getPresentationMode(),
    };
  },

  async getQuote(request, config): Promise<RampQuote | null> {
    ensureModeSupported(request);
    ensureCountryEnabled(request, config);
    ensureFiatEnabled(request, config);

    const partnerFeeAmount = Number(((request.fiatAmount * config.partnerFeePct) / 100).toFixed(2));

    if (!config.transak.quoteEndpoint) {
      return {
        providerId: 'transak',
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
    >(config.transak.quoteEndpoint, {
      provider: 'transak',
      mode: request.mode,
      apiKey: config.transak.apiKey,
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
      providerId: 'transak',
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
    ensureModeSupported(request);
    ensureCountryEnabled(request, config);
    ensureFiatEnabled(request, config);

    if (!config.transak.sessionEndpoint) {
      throw new Error('Transak widget session endpoint is not configured yet.');
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
    >(config.transak.sessionEndpoint, {
      provider: 'transak',
      environment: config.environment,
      apiKey: config.transak.apiKey,
      referrerDomain: config.transak.referrerDomain,
      redirectUrl: buildRampRedirectUrl('transak'),
      request,
      partnerFeePct: config.partnerFeePct,
      revenueSharePct: config.revenueSharePct,
    });

    if (!data.widgetUrl) {
      throw new Error('Transak did not return a widget URL.');
    }

    return {
      providerId: 'transak',
      widgetUrl: data.widgetUrl,
      redirectUrl: data.redirectUrl ?? buildRampRedirectUrl('transak'),
      presentationMode: getPresentationMode(),
      externalReference: data.externalReference,
      expiresAt: data.expiresAt,
      raw: data.raw ?? null,
    };
  },

  parseCallback(url: string): RampProviderCallback | null {
    try {
      const parsedUrl = new URL(url);
      const status =
        parseStatus(parsedUrl.searchParams.get('status')) ??
        parseStatus(parsedUrl.searchParams.get('event')) ??
        parseStatus(parsedUrl.pathname);

      if (!status) {
        return null;
      }

      return {
        status,
        message:
          parsedUrl.searchParams.get('message') ??
          parsedUrl.searchParams.get('reason') ??
          undefined,
        externalTransactionId:
          parsedUrl.searchParams.get('transactionId') ??
          parsedUrl.searchParams.get('orderId') ??
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
