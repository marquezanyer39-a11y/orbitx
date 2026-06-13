export const OKX_ERROR_CODES = Object.freeze({
  PROVIDER_NOT_CONFIGURED: 'PROVIDER_NOT_CONFIGURED',
  REAL_TRADING_DISABLED: 'REAL_TRADING_DISABLED',
  OKX_AUTH_REQUIRED: 'OKX_AUTH_REQUIRED',
  OKX_TOKEN_EXPIRED: 'OKX_TOKEN_EXPIRED',
  OKX_REQUEST_FAILED: 'OKX_REQUEST_FAILED',
  OKX_RATE_LIMITED: 'OKX_RATE_LIMITED',
  OKX_PERMISSION_DENIED: 'OKX_PERMISSION_DENIED',
  OKX_ACCOUNT_NOT_LINKED: 'OKX_ACCOUNT_NOT_LINKED',
  OKX_ORDER_REJECTED: 'OKX_ORDER_REJECTED',
  OKX_TRANSFER_REJECTED: 'OKX_TRANSFER_REJECTED',
  OKX_RECONCILIATION_MISMATCH: 'OKX_RECONCILIATION_MISMATCH',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
  UNKNOWN_PROVIDER_ERROR: 'UNKNOWN_PROVIDER_ERROR',
});

const SENSITIVE_KEY_PATTERN = /secret|token|authorization|api[-_]?key|passphrase|client[-_]?secret|signature/i;

export class OkxProviderError extends Error {
  constructor({ code, message, status = 400, metadata = undefined }) {
    super(message);
    this.name = 'OkxProviderError';
    this.code = code;
    this.status = status;
    this.metadata = sanitizeOkxMetadata(metadata);
  }
}

export function sanitizeOkxMetadata(value) {
  if (!value || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeOkxMetadata(item));
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      SENSITIVE_KEY_PATTERN.test(key) ? '[redacted]' : sanitizeOkxMetadata(item),
    ]),
  );
}

export function createOkxError(code, message, metadata, status = 400) {
  return new OkxProviderError({
    code,
    message,
    metadata,
    status,
  });
}

export function createProviderNotConfiguredError(message = 'OKX Broker no esta configurado en backend.') {
  return createOkxError(OKX_ERROR_CODES.PROVIDER_NOT_CONFIGURED, message, undefined, 503);
}

export function createRealTradingDisabledError(
  message = 'Trading real con OKX esta deshabilitado en esta fase.',
) {
  return createOkxError(OKX_ERROR_CODES.REAL_TRADING_DISABLED, message, undefined, 403);
}

export function createNotImplementedError(message = 'Flujo OKX preparado como contrato, no productivo en esta fase.') {
  return createOkxError(OKX_ERROR_CODES.NOT_IMPLEMENTED, message, undefined, 501);
}

export function toOkxErrorResponse(error) {
  if (error instanceof OkxProviderError) {
    return {
      status: error.status,
      body: {
        code: error.code,
        message: error.message,
        metadata: error.metadata,
      },
    };
  }

  return {
    status: 500,
    body: {
      code: OKX_ERROR_CODES.UNKNOWN_PROVIDER_ERROR,
      message: 'La operacion OKX no pudo completarse de forma segura.',
    },
  };
}
