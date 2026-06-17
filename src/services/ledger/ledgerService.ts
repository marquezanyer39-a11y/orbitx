import type {
  LedgerAccount,
  LedgerBalance,
  LedgerMovementRequest,
  LedgerReconciliationResult,
  LedgerTransaction,
} from '../../types/ledger';
import { buildLedgerAccountId, getLedgerAccounts as getAccounts } from './ledgerAccounts';
import { reconcileWithProviderBalance as reconcileProvider } from './ledgerReconciliation';
import {
  createLedgerTransaction as createTransaction,
  validateLedgerTransaction as validateTransaction,
} from './ledgerTransactions';

export async function getUserLedgerBalance(userId: string): Promise<LedgerBalance[]> {
  const { getUserLedgerBalance: getBalances } = await import('./ledgerAccounts');
  return getBalances(userId);
}

export async function getLedgerAccounts(userId: string): Promise<LedgerAccount[]> {
  return getAccounts(userId);
}

export async function createLedgerTransaction(
  input: LedgerMovementRequest,
): Promise<LedgerTransaction> {
  return createTransaction(input);
}

export async function moveAvailableToPool(
  userId: string,
  asset: string,
  amount: number,
): Promise<LedgerTransaction> {
  return createTransaction({
    debitAccountId: buildLedgerAccountId(userId, 'available', asset),
    creditAccountId: buildLedgerAccountId(userId, 'pool', asset),
    amount,
    asset,
    transactionType: 'POOL_SUBSCRIBE',
  });
}

export async function movePoolToAvailable(
  userId: string,
  asset: string,
  amount: number,
): Promise<LedgerTransaction> {
  return createTransaction({
    debitAccountId: buildLedgerAccountId(userId, 'pool', asset),
    creditAccountId: buildLedgerAccountId(userId, 'available', asset),
    amount,
    asset,
    transactionType: 'POOL_REDEEM',
  });
}

export async function transferSocialGift(
  senderId: string,
  receiverId: string,
  asset: string,
  amount: number,
): Promise<LedgerTransaction> {
  return createTransaction({
    debitAccountId: buildLedgerAccountId(senderId, 'social', asset),
    creditAccountId: buildLedgerAccountId(receiverId, 'social', asset),
    amount,
    asset,
    transactionType: 'SOCIAL_GIFT',
  });
}

export async function creditReward(
  userId: string,
  asset: string,
  amount: number,
  reason: string,
): Promise<LedgerTransaction> {
  return createTransaction({
    debitAccountId: `orbitx.rewards_reserve.${asset.toUpperCase()}`,
    creditAccountId: buildLedgerAccountId(userId, 'rewards', asset),
    amount,
    asset,
    transactionType: 'REWARD_DISTRIBUTION',
    metadata: { reason },
  });
}

export async function lockBalance(
  userId: string,
  asset: string,
  amount: number,
  reason: string,
): Promise<LedgerTransaction> {
  return createTransaction({
    debitAccountId: buildLedgerAccountId(userId, 'available', asset),
    creditAccountId: buildLedgerAccountId(userId, 'locked', asset),
    amount,
    asset,
    transactionType: 'TRADE_LOCK',
    metadata: { reason },
  });
}

export async function unlockBalance(
  userId: string,
  asset: string,
  amount: number,
  reason: string,
): Promise<LedgerTransaction> {
  return createTransaction({
    debitAccountId: buildLedgerAccountId(userId, 'locked', asset),
    creditAccountId: buildLedgerAccountId(userId, 'available', asset),
    amount,
    asset,
    transactionType: 'TRADE_UNLOCK',
    metadata: { reason },
  });
}

export async function collectFee(
  userId: string,
  asset: string,
  amount: number,
  reason: string,
): Promise<LedgerTransaction> {
  return createTransaction({
    debitAccountId: buildLedgerAccountId(userId, 'available', asset),
    creditAccountId: `orbitx.fees.${asset.toUpperCase()}`,
    amount,
    asset,
    transactionType: 'FEE_COLLECT',
    metadata: { reason },
  });
}

export async function refundFee(
  userId: string,
  asset: string,
  amount: number,
  reason: string,
): Promise<LedgerTransaction> {
  return createTransaction({
    debitAccountId: `orbitx.fees.${asset.toUpperCase()}`,
    creditAccountId: buildLedgerAccountId(userId, 'available', asset),
    amount,
    asset,
    transactionType: 'FEE_REFUND',
    metadata: { reason },
  });
}

export async function requestWithdrawal(
  userId: string,
  asset: string,
  amount: number,
): Promise<LedgerTransaction> {
  return createTransaction({
    debitAccountId: buildLedgerAccountId(userId, 'available', asset),
    creditAccountId: buildLedgerAccountId(userId, 'pending_withdrawal', asset),
    amount,
    asset,
    transactionType: 'WITHDRAWAL_REQUEST',
  });
}

export async function completeWithdrawal(
  userId: string,
  asset: string,
  amount: number,
  providerReference: string,
): Promise<LedgerTransaction> {
  return createTransaction({
    debitAccountId: buildLedgerAccountId(userId, 'pending_withdrawal', asset),
    creditAccountId: `provider.reserve.${asset.toUpperCase()}`,
    amount,
    asset,
    transactionType: 'WITHDRAWAL_COMPLETE',
    metadata: { providerReference },
  });
}

export async function reconcileWithProviderBalance(
  providerId: string,
  asset: string,
  providerBalance: number,
): Promise<LedgerReconciliationResult> {
  return reconcileProvider(providerId, asset, providerBalance);
}

export function validateLedgerTransaction(input: LedgerMovementRequest): boolean {
  return validateTransaction(input);
}
