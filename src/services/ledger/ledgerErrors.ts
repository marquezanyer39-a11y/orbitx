import type { LedgerError as LedgerErrorShape, LedgerErrorCode } from '../../types/ledger';

export class LedgerError extends Error implements LedgerErrorShape {
  code: LedgerErrorCode;
  isRetryable: boolean;
  metadata?: Record<string, unknown>;

  constructor(input: {
    code: LedgerErrorCode;
    message: string;
    isRetryable?: boolean;
    metadata?: Record<string, unknown>;
  }) {
    super(input.message);
    this.name = 'LedgerError';
    this.code = input.code;
    this.isRetryable = input.isRetryable ?? false;
    this.metadata = input.metadata;
  }
}

export function createMockOnlyLedgerError() {
  return new LedgerError({
    code: 'MOCK_ONLY',
    message: 'Ledger mock aislado. No mueve dinero real ni afecta Wallet/Web3.',
  });
}
