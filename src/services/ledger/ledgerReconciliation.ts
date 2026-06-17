import type { LedgerReconciliationResult } from '../../types/ledger';
import { mockUserLedgerBalances } from './ledgerMocks';

const INCLUDED_RECONCILIATION_TYPES = new Set([
  'available',
  'trading',
  'pool',
  'social',
  'rewards',
  'locked',
  'fees',
  'pending_withdrawal',
]);

function resolveSeverity(difference: number): LedgerReconciliationResult['severity'] {
  if (difference === 0) {
    return 'ok';
  }

  return difference <= 1 ? 'warning' : 'critical';
}

export async function reconcileWithProviderBalance(
  providerId: string,
  asset: string,
  providerBalance: number,
): Promise<LedgerReconciliationResult> {
  const normalizedAsset = asset.toUpperCase();
  const internalTotal = mockUserLedgerBalances
    .filter(
      (balance) =>
        balance.asset.toUpperCase() === normalizedAsset &&
        INCLUDED_RECONCILIATION_TYPES.has(balance.accountType),
    )
    .reduce((sum, balance) => sum + balance.amount, 0);
  const difference = Math.abs(internalTotal - providerBalance);
  const severity = resolveSeverity(difference);

  return {
    matched: difference === 0,
    internalTotal,
    providerTotal: providerBalance,
    difference,
    severity,
    message:
      difference === 0
        ? `Ledger interno mock coincide con ${providerId}.`
        : `Diferencia de ${difference} ${normalizedAsset} entre ledger interno mock y ${providerId}.`,
    checkedAt: new Date().toISOString(),
  };
}
