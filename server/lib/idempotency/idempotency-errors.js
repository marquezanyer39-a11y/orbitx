export const IDEMPOTENCY_ERROR_CODES = Object.freeze({
  IDEMPOTENCY_REQUIRED: 'IDEMPOTENCY_REQUIRED',
  IDEMPOTENCY_INVALID: 'IDEMPOTENCY_INVALID',
  IDEMPOTENCY_CONFLICT: 'IDEMPOTENCY_CONFLICT',
  IDEMPOTENCY_NOT_IMPLEMENTED: 'IDEMPOTENCY_NOT_IMPLEMENTED',
  IDEMPOTENCY_DISABLED: 'IDEMPOTENCY_DISABLED',
});

const SENSITIVE_KEY_PATTERN = /token|secret|password|authorization|cookie|key/i;

function sanitizeIdempotencyMetadata(value) {
  if (!value || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeIdempotencyMetadata(item));
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entryValue]) => [
      key,
      SENSITIVE_KEY_PATTERN.test(key) ? '[redacted]' : sanitizeIdempotencyMetadata(entryValue),
    ]),
  );
}

export class IdempotencyBackendError extends Error {
  constructor({ code, message, status = 422, metadata = {} }) {
    super(message);
    this.name = 'IdempotencyBackendError';
    this.code = code;
    this.status = status;
    this.metadata = sanitizeIdempotencyMetadata(metadata);
  }
}

export function createIdempotencyError(code, message, metadata = {}) {
  const statusByCode = {
    [IDEMPOTENCY_ERROR_CODES.IDEMPOTENCY_REQUIRED]: 422,
    [IDEMPOTENCY_ERROR_CODES.IDEMPOTENCY_INVALID]: 422,
    [IDEMPOTENCY_ERROR_CODES.IDEMPOTENCY_CONFLICT]: 409,
    [IDEMPOTENCY_ERROR_CODES.IDEMPOTENCY_NOT_IMPLEMENTED]: 501,
    [IDEMPOTENCY_ERROR_CODES.IDEMPOTENCY_DISABLED]: 503,
  };

  return new IdempotencyBackendError({
    code,
    message,
    status: statusByCode[code] ?? 422,
    metadata,
  });
}

export function toIdempotencyErrorResponse(error) {
  if (error instanceof IdempotencyBackendError) {
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
      code: 'IDEMPOTENCY_UNKNOWN_ERROR',
      message: 'No se pudo validar la idempotencia.',
    },
  };
}
