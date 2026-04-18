import type { RampProviderCallback, RampProviderId } from '../../types/ramp';

interface RampBridgeMessage {
  provider?: RampProviderId;
  eventName?: string;
  status?: string;
  payload?: Record<string, unknown>;
}

function parseStatus(raw?: string) {
  const normalized = (raw ?? '').toLowerCase();

  if (normalized.includes('success') || normalized.includes('complete')) {
    return 'completed' as const;
  }

  if (normalized.includes('close') || normalized.includes('cancel')) {
    return 'cancelled' as const;
  }

  if (normalized.includes('kyc')) {
    return 'kyc' as const;
  }

  if (normalized.includes('process') || normalized.includes('order')) {
    return 'processing' as const;
  }

  if (normalized.includes('fail') || normalized.includes('error')) {
    return 'failed' as const;
  }

  return null;
}

export function buildRampBridgeScript(providerId: RampProviderId) {
  return `
    (function() {
      var provider = ${JSON.stringify(providerId)};
      function emit(payload) {
        try {
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        } catch (error) {}
      }

      emit({ provider: provider, eventName: 'widget_loaded' });

      window.addEventListener('message', function(event) {
        emit({ provider: provider, eventName: 'message', payload: event && event.data ? event.data : null });
      });

      document.addEventListener('message', function(event) {
        emit({ provider: provider, eventName: 'document_message', payload: event && event.data ? event.data : null });
      });

      window.addEventListener('TransakEvent', function(event) {
        emit({ provider: provider, eventName: 'transak_event', payload: event && event.detail ? event.detail : null });
      });

      true;
    })();
  `;
}

export function parseRampBridgeMessage(raw: string): RampProviderCallback | null {
  try {
    const data = JSON.parse(raw) as RampBridgeMessage;
    const payload =
      data.payload && typeof data.payload === 'object' && !Array.isArray(data.payload)
        ? data.payload
        : {};
    const status =
      parseStatus(data.status) ??
      parseStatus(data.eventName) ??
      parseStatus(String((payload as { status?: string }).status ?? '')) ??
      parseStatus(String((payload as { eventName?: string }).eventName ?? ''));

    if (!status) {
      return null;
    }

    return {
      status,
      message:
        String((payload as { message?: string }).message ?? '') ||
        String((payload as { reason?: string }).reason ?? '') ||
        undefined,
      externalTransactionId:
        String((payload as { transactionId?: string }).transactionId ?? '') ||
        String((payload as { orderId?: string }).orderId ?? '') ||
        undefined,
      providerOrderId: String((payload as { orderId?: string }).orderId ?? '') || undefined,
      paymentMethod: String((payload as { paymentMethod?: string }).paymentMethod ?? '') || undefined,
      countryCode: String((payload as { countryCode?: string }).countryCode ?? '') || undefined,
      raw: payload,
    };
  } catch {
    return null;
  }
}
