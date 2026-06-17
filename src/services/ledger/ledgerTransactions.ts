import type { LedgerMovementRequest, LedgerTransaction } from '../../types/ledger';
import { LedgerError } from './ledgerErrors';

export function validateLedgerTransaction(input: LedgerMovementRequest): boolean {
  return Boolean(
    input.debitAccountId &&
      input.creditAccountId &&
      input.debitAccountId !== input.creditAccountId &&
      input.asset.trim() &&
      Number.isFinite(input.amount) &&
      input.amount > 0,
  );
}

export async function createLedgerTransaction(
  input: LedgerMovementRequest,
): Promise<LedgerTransaction> {
  if (!validateLedgerTransaction(input)) {
    throw new LedgerError({
      code: 'TRANSACTION_FAILED',
      message: 'Movimiento ledger invalido. Revisa cuentas, asset y monto.',
    });
  }

  const createdAt = new Date().toISOString();
  const referenceId = input.referenceId ?? `ledger_ref_${Date.now()}`;

  return {
    id: `ledger_tx_${Date.now()}`,
    debitAccountId: input.debitAccountId,
    creditAccountId: input.creditAccountId,
    amount: input.amount,
    asset: input.asset.toUpperCase(),
    transactionType: input.transactionType,
    status: 'completed',
    referenceId,
    createdAt,
    updatedAt: createdAt,
    entries: [
      {
        id: `ledger_entry_${Date.now()}`,
        accountId: input.debitAccountId,
        debitAccountId: input.debitAccountId,
        creditAccountId: input.creditAccountId,
        amount: input.amount,
        asset: input.asset.toUpperCase(),
        transactionType: input.transactionType,
        status: 'completed',
        referenceId,
        createdAt,
        metadata: {
          isMock: true,
          note: 'Entrada doble controlada. No mueve dinero real.',
        },
      },
    ],
    metadata: {
      ...(input.metadata ?? {}),
      isMock: true,
      warning: 'Ledger mock aislado. No usar en produccion.',
    },
  };
}
