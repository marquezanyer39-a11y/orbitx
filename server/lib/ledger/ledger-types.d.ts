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
export type LedgerDirection = 'debit' | 'credit';
export type IdempotencyKey = string;
export type LedgerAsset = string;

export interface MoneyAmount {
  asset: LedgerAsset;
  amountDecimal: string;
  amountMinor?: string;
  decimals?: number;
}

export interface LedgerAccount {
  id: string;
  userId?: string | null;
  accountType: LedgerAccountType;
  asset: LedgerAsset;
  status: LedgerAccountStatus;
  providerId?: string | null;
  allowNegative: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerEntry {
  id?: string;
  transactionId?: string;
  accountId?: string;
  accountKey?: {
    userId?: string | null;
    accountType: LedgerAccountType;
    asset: LedgerAsset;
    providerId?: string | null;
  };
  direction: LedgerDirection;
  asset: LedgerAsset;
  amountDecimal: string;
  amountMinor?: string;
  balanceAfterDecimal?: string | null;
  createdAt?: string;
}

export interface LedgerTransaction {
  id: string;
  transactionType: LedgerTransactionType;
  status: LedgerTransactionStatus;
  asset: LedgerAsset;
  amountDecimal: string;
  amountMinor?: string;
  idempotencyKey: IdempotencyKey;
  referenceType?: string | null;
  referenceId?: string | null;
  providerId?: string | null;
  providerReference?: string | null;
  createdBy?: string | null;
  metadata?: Record<string, unknown>;
  entries: LedgerEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface LedgerMovementRequest {
  transactionType: LedgerTransactionType;
  asset: LedgerAsset;
  amountDecimal: string;
  amountMinor?: string;
  idempotencyKey: IdempotencyKey;
  referenceType?: string;
  referenceId?: string;
  providerId?: string;
  providerReference?: string;
  createdBy?: string;
  metadata?: Record<string, unknown>;
  entries: LedgerEntry[];
}

export interface LedgerReconciliationResult {
  matched: boolean;
  providerId: string;
  asset: LedgerAsset;
  internalTotalDecimal: string;
  providerTotalDecimal: string;
  differenceDecimal: string;
  severity: 'ok' | 'warning' | 'critical';
  status: 'open' | 'reviewed' | 'resolved';
  message: string;
  checkedAt: string;
}

export type LedgerErrorCode =
  | 'BACKEND_NOT_CONFIGURED'
  | 'LEDGER_DISABLED'
  | 'INVALID_AMOUNT'
  | 'INVALID_ASSET'
  | 'INVALID_IDEMPOTENCY_KEY'
  | 'INVALID_DOUBLE_ENTRY'
  | 'INSUFFICIENT_BALANCE'
  | 'ACCOUNT_NOT_FOUND'
  | 'TRANSACTION_FAILED'
  | 'RECONCILIATION_MISMATCH'
  | 'MOCK_ONLY';

export interface LedgerError {
  code: LedgerErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export interface PoolPosition {
  id: string;
  userId: string;
  poolId: string;
  asset: LedgerAsset;
  principalAmountDecimal: string;
  rankingAmountDecimal: string;
  rewardAmountDecimal: string;
  status: 'active' | 'redeemed' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface SocialGift {
  id: string;
  senderId: string;
  receiverId: string;
  giftId: string;
  asset: LedgerAsset;
  amountDecimal: string;
  ledgerTransactionId?: string;
  status: 'sent' | 'refunded' | 'failed';
  metadata?: Record<string, unknown>;
  createdAt: string;
}
