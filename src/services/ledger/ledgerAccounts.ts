import type { LedgerAccount, LedgerBalance, LedgerAccountType } from '../../types/ledger';
import { mockLedgerAccounts, mockUserLedgerBalances } from './ledgerMocks';

// Ledger mock aislado. No representa dinero real.
export async function getLedgerAccounts(userId: string): Promise<LedgerAccount[]> {
  return mockLedgerAccounts.filter((account) => !account.userId || account.userId === userId);
}

export async function getUserLedgerBalance(userId: string): Promise<LedgerBalance[]> {
  return mockUserLedgerBalances.filter((balance) => !balance.userId || balance.userId === userId);
}

export function buildLedgerAccountId(userId: string, type: LedgerAccountType, asset: string) {
  return `${userId}.${type}.${asset.toUpperCase()}`;
}
