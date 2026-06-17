export type LedgerAccountType =
  | 'available'
  | 'trading'
  | 'pool'
  | 'social'
  | 'rewards'
  | 'locked'
  | 'fees'
  | 'pending_withdrawal'
  | 'provider_reserve'
  | 'orbitx_reserve'
  | 'adjustment'
  | 'bonus'
  | 'chargeback'
  | 'dispute';

export type LedgerAccountStatus = 'active' | 'frozen' | 'closed';

export type LedgerTransactionType =
  | 'DEPOSIT_CREDIT'
  | 'WITHDRAWAL_REQUEST'
  | 'WITHDRAWAL_COMPLETE'
  | 'TRADE_LOCK'
  | 'TRADE_UNLOCK'
  | 'TRADE_SETTLEMENT'
  | 'POOL_SUBSCRIBE'
  | 'POOL_REDEEM'
  | 'POOL_REWARD'
  | 'SOCIAL_GIFT'
  | 'SOCIAL_GIFT_REFUND'
  | 'REWARD_DISTRIBUTION'
  | 'FEE_COLLECT'
  | 'FEE_REFUND'
  | 'INTERNAL_TRANSFER'
  | 'PROVIDER_RECONCILIATION'
  | 'MANUAL_ADJUSTMENT';

export type LedgerTransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed';

export type LedgerErrorCode =
  | 'INSUFFICIENT_BALANCE'
  | 'ACCOUNT_NOT_FOUND'
  | 'TRANSACTION_FAILED'
  | 'RECONCILIATION_MISMATCH'
  | 'MOCK_ONLY';

export interface LedgerAccount {
  id: string;
  userId?: string;
  type: LedgerAccountType;
  asset: string;
  status: LedgerAccountStatus;
  displayName: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface LedgerEntry {
  id: string;
  accountId: string;
  debitAccountId: string;
  creditAccountId: string;
  amount: number;
  asset: string;
  transactionType: LedgerTransactionType;
  status: LedgerTransactionStatus;
  referenceId: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface LedgerTransaction {
  id: string;
  debitAccountId: string;
  creditAccountId: string;
  amount: number;
  asset: string;
  transactionType: LedgerTransactionType;
  status: LedgerTransactionStatus;
  referenceId: string;
  createdAt: string;
  updatedAt: string;
  entries: LedgerEntry[];
  metadata?: Record<string, unknown>;
}

export interface LedgerBalance {
  accountId: string;
  userId?: string;
  accountType: LedgerAccountType;
  asset: string;
  amount: number;
  updatedAt: string;
  isMock: boolean;
}

export interface LedgerAsset {
  symbol: string;
  name: string;
  decimals: number;
  isEnabled: boolean;
}

export interface LedgerReconciliationResult {
  matched: boolean;
  internalTotal: number;
  providerTotal: number;
  difference: number;
  severity: 'ok' | 'warning' | 'critical';
  message: string;
  checkedAt: string;
}

export interface LedgerAuditTrail {
  id: string;
  transactionId: string;
  actorId: string;
  action: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface LedgerError {
  code: LedgerErrorCode;
  message: string;
  isRetryable: boolean;
  metadata?: Record<string, unknown>;
}

export interface LedgerMovementRequest {
  debitAccountId: string;
  creditAccountId: string;
  amount: number;
  asset: string;
  transactionType: LedgerTransactionType;
  referenceId?: string;
  metadata?: Record<string, unknown>;
}
