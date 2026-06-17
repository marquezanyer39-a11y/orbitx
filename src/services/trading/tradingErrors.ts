import type {
  TradingError as TradingErrorShape,
  TradingErrorCode,
  TradingProviderId,
} from '../../types/trading';

export class TradingError extends Error implements TradingErrorShape {
  code: TradingErrorCode;
  providerId?: TradingProviderId;
  isRetryable: boolean;
  cause?: unknown;
  metadata?: Record<string, unknown>;

  constructor(input: {
    code: TradingErrorCode;
    message: string;
    providerId?: TradingProviderId;
    isRetryable?: boolean;
    cause?: unknown;
    metadata?: Record<string, unknown>;
  }) {
    super(input.message);
    this.name = 'TradingError';
    this.code = input.code;
    this.providerId = input.providerId;
    this.isRetryable = input.isRetryable ?? false;
    this.cause = input.cause;
    this.metadata = input.metadata;
  }
}

export function createProviderNotConfiguredError(providerId: TradingProviderId) {
  return new TradingError({
    code: 'PROVIDER_NOT_CONFIGURED',
    providerId,
    message:
      providerId === 'okx'
        ? 'OKX Broker aún no está conectado en backend. Contacta al equipo de infraestructura.'
        : 'Este proveedor de trading aún no está configurado.',
  });
}

export function createRealTradingDisabledError() {
  return new TradingError({
    code: 'REAL_TRADING_DISABLED',
    message:
      'Trading real está deshabilitado. La app solo puede registrar simulaciones controladas.',
  });
}

export function normalizeTradingError(error: unknown): TradingError {
  if (error instanceof TradingError) {
    return error;
  }

  if (error instanceof Error) {
    return new TradingError({
      code: 'UNKNOWN',
      message: error.message || 'No se pudo completar la operación de trading.',
      cause: error,
      isRetryable: true,
    });
  }

  return new TradingError({
    code: 'UNKNOWN',
    message: 'No se pudo completar la operación de trading.',
    cause: error,
    isRetryable: true,
  });
}
