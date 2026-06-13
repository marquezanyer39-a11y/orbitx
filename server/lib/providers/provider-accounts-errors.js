export const PROVIDER_ACCOUNT_ERROR_CODES = Object.freeze({
  PROVIDER_ACCOUNTS_DISABLED: 'PROVIDER_ACCOUNTS_DISABLED',
  PROVIDER_ACCOUNTS_NOT_IMPLEMENTED: 'PROVIDER_ACCOUNTS_NOT_IMPLEMENTED',
  PROVIDER_ACCOUNT_NOT_FOUND: 'PROVIDER_ACCOUNT_NOT_FOUND',
  PROVIDER_ACCOUNT_INPUT_INVALID: 'PROVIDER_ACCOUNT_INPUT_INVALID',
  PROVIDER_ACCOUNT_STATUS_INVALID: 'PROVIDER_ACCOUNT_STATUS_INVALID',
});

const SENSITIVE_KEY_PATTERN = /token|secret|password|authorization|cookie|key/i;

function sanitizeProviderAccountMetadata(value) {
  if (!value || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeProviderAccountMetadata(item));
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entryValue]) => [
      key,
      SENSITIVE_KEY_PATTERN.test(key) ? '[redacted]' : sanitizeProviderAccountMetadata(entryValue),
    ]),
  );
}

export class ProviderAccountsError extends Error {
  constructor({ code, message, status = 501, metadata = {} }) {
    super(message);
    this.name = 'ProviderAccountsError';
    this.code = code;
    this.status = status;
    this.metadata = sanitizeProviderAccountMetadata(metadata);
  }
}

export function createProviderAccountsError(code, message, metadata = {}) {
  const statusByCode = {
    [PROVIDER_ACCOUNT_ERROR_CODES.PROVIDER_ACCOUNTS_DISABLED]: 503,
    [PROVIDER_ACCOUNT_ERROR_CODES.PROVIDER_ACCOUNTS_NOT_IMPLEMENTED]: 501,
    [PROVIDER_ACCOUNT_ERROR_CODES.PROVIDER_ACCOUNT_NOT_FOUND]: 404,
    [PROVIDER_ACCOUNT_ERROR_CODES.PROVIDER_ACCOUNT_INPUT_INVALID]: 422,
    [PROVIDER_ACCOUNT_ERROR_CODES.PROVIDER_ACCOUNT_STATUS_INVALID]: 422,
  };

  return new ProviderAccountsError({
    code,
    message,
    status: statusByCode[code] ?? 501,
    metadata,
  });
}

export function toProviderAccountsErrorResponse(error) {
  if (error instanceof ProviderAccountsError) {
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
      code: 'PROVIDER_ACCOUNTS_UNKNOWN_ERROR',
      message: 'No se pudo procesar la cuenta de proveedor.',
    },
  };
}
