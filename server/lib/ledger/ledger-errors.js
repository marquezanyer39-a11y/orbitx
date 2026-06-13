export const LEDGER_ERROR_CODES = Object.freeze({
  BACKEND_NOT_CONFIGURED: 'BACKEND_NOT_CONFIGURED',
  LEDGER_DISABLED: 'LEDGER_DISABLED',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  INVALID_ASSET: 'INVALID_ASSET',
  INVALID_IDEMPOTENCY_KEY: 'INVALID_IDEMPOTENCY_KEY',
  INVALID_DOUBLE_ENTRY: 'INVALID_DOUBLE_ENTRY',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  RECONCILIATION_MISMATCH: 'RECONCILIATION_MISMATCH',
  MOCK_ONLY: 'MOCK_ONLY',
});

export class LedgerBackendError extends Error {
  constructor({ code, message, status = 400, details = undefined }) {
    super(message);
    this.name = 'LedgerBackendError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function createLedgerDisabledError(message = 'Ledger backend real no esta configurado en esta fase.') {
  return new LedgerBackendError({
    code: LEDGER_ERROR_CODES.LEDGER_DISABLED,
    message,
    status: 503,
  });
}

export function toLedgerErrorResponse(error) {
  if (error instanceof LedgerBackendError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
    };
  }

  return {
    code: LEDGER_ERROR_CODES.TRANSACTION_FAILED,
    message: 'La operacion de ledger no pudo completarse.',
  };
}
