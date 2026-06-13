export const AUTH_ERROR_CODES = Object.freeze({
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_NOT_IMPLEMENTED: 'AUTH_NOT_IMPLEMENTED',
  RBAC_DISABLED: 'RBAC_DISABLED',
  ROLE_REQUIRED: 'ROLE_REQUIRED',
  INVALID_ACTOR: 'INVALID_ACTOR',
  DISABLED: 'DISABLED',
});

const SENSITIVE_KEY_PATTERN = /token|secret|password|authorization|cookie|key/i;

function sanitizeAuthMetadata(value) {
  if (!value || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeAuthMetadata(item));
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entryValue]) => [
      key,
      SENSITIVE_KEY_PATTERN.test(key) ? '[redacted]' : sanitizeAuthMetadata(entryValue),
    ]),
  );
}

export class AuthBackendError extends Error {
  constructor({ code, message, status = 401, metadata = {} }) {
    super(message);
    this.name = 'AuthBackendError';
    this.code = code;
    this.status = status;
    this.metadata = sanitizeAuthMetadata(metadata);
  }
}

export function createAuthError(code, message, metadata = {}) {
  const statusByCode = {
    [AUTH_ERROR_CODES.AUTH_REQUIRED]: 401,
    [AUTH_ERROR_CODES.AUTH_NOT_IMPLEMENTED]: 503,
    [AUTH_ERROR_CODES.RBAC_DISABLED]: 503,
    [AUTH_ERROR_CODES.ROLE_REQUIRED]: 403,
    [AUTH_ERROR_CODES.INVALID_ACTOR]: 401,
    [AUTH_ERROR_CODES.DISABLED]: 503,
  };

  return new AuthBackendError({
    code,
    message,
    status: statusByCode[code] ?? 401,
    metadata,
  });
}

export function toAuthErrorResponse(error) {
  if (error instanceof AuthBackendError) {
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
      code: 'AUTH_UNKNOWN_ERROR',
      message: 'No se pudo validar la autenticacion backend.',
    },
  };
}
