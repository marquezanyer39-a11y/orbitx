import type {
  LedgerAccount,
  LedgerBalance,
  LedgerReconciliationResult,
  LedgerTransaction,
} from '../../types/ledger';

// LEDGER_MOCK - no usar en produccion. No alimentar Home ni Wallet/Web3.
export const LEDGER_MOCK_USER_ID = 'mock-user-orbitx';
export const LEDGER_MOCK_PROVIDER_ID = 'mock-provider-reserve';

const now = new Date().toISOString();

// LEDGER_MOCK - cuentas internas temporales.
export const mockLedgerAccounts: LedgerAccount[] = [
  {
    id: 'mock-user.available.USDT',
    userId: LEDGER_MOCK_USER_ID,
    type: 'available',
    asset: 'USDT',
    status: 'active',
    displayName: 'Disponible mock USDT',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'mock-user.pool.USDT',
    userId: LEDGER_MOCK_USER_ID,
    type: 'pool',
    asset: 'USDT',
    status: 'active',
    displayName: 'Pool mock USDT',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'mock-user.social.USDT',
    userId: LEDGER_MOCK_USER_ID,
    type: 'social',
    asset: 'USDT',
    status: 'active',
    displayName: 'Social mock USDT',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'mock-user.rewards.USDT',
    userId: LEDGER_MOCK_USER_ID,
    type: 'rewards',
    asset: 'USDT',
    status: 'active',
    displayName: 'Rewards mock USDT',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'orbitx.rewards_reserve.USDT',
    type: 'orbitx_reserve',
    asset: 'USDT',
    status: 'active',
    displayName: 'Reserva rewards mock',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'orbitx.fees.USDT',
    type: 'fees',
    asset: 'USDT',
    status: 'active',
    displayName: 'Fees mock QVEX',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'provider.reserve.USDT',
    type: 'provider_reserve',
    asset: 'USDT',
    status: 'active',
    displayName: 'Reserva proveedor mock',
    createdAt: now,
    updatedAt: now,
  },
];

// LEDGER_MOCK - balance visible solo para pruebas de ledger.
export const mockUserLedgerBalances: LedgerBalance[] = [
  {
    accountId: 'mock-user.available.USDT',
    userId: LEDGER_MOCK_USER_ID,
    accountType: 'available',
    asset: 'USDT',
    amount: 1000,
    updatedAt: now,
    isMock: true,
  },
  {
    accountId: 'mock-user.pool.USDT',
    userId: LEDGER_MOCK_USER_ID,
    accountType: 'pool',
    asset: 'USDT',
    amount: 500,
    updatedAt: now,
    isMock: true,
  },
  {
    accountId: 'provider.reserve.USDT',
    accountType: 'provider_reserve',
    asset: 'USDT',
    amount: 1500,
    updatedAt: now,
    isMock: true,
  },
];

function createMockTransaction(
  id: string,
  debitAccountId: string,
  creditAccountId: string,
  amount: number,
  type: LedgerTransaction['transactionType'],
): LedgerTransaction {
  const createdAt = new Date().toISOString();
  return {
    id,
    debitAccountId,
    creditAccountId,
    amount,
    asset: 'USDT',
    transactionType: type,
    status: 'completed',
    referenceId: `${id}-ref`,
    createdAt,
    updatedAt: createdAt,
    entries: [
      {
        id: `${id}-entry`,
        accountId: debitAccountId,
        debitAccountId,
        creditAccountId,
        amount,
        asset: 'USDT',
        transactionType: type,
        status: 'completed',
        referenceId: `${id}-ref`,
        createdAt,
        metadata: { isMock: true },
      },
    ],
    metadata: { isMock: true },
  };
}

// LEDGER_MOCK - ejemplos de movimientos de doble entrada.
export const mockPoolTransaction = createMockTransaction(
  'mock-pool-subscribe',
  'mock-user.available.USDT',
  'mock-user.pool.USDT',
  500,
  'POOL_SUBSCRIBE',
);

export const mockSocialGift = createMockTransaction(
  'mock-social-gift',
  'mock-user.social.USDT',
  'mock-receiver.social.USDT',
  10,
  'SOCIAL_GIFT',
);

export const mockRewardDistribution = createMockTransaction(
  'mock-reward-distribution',
  'orbitx.rewards_reserve.USDT',
  'mock-user.rewards.USDT',
  50,
  'REWARD_DISTRIBUTION',
);

export const mockFeeCollection = createMockTransaction(
  'mock-fee-collection',
  'mock-user.available.USDT',
  'orbitx.fees.USDT',
  2,
  'FEE_COLLECT',
);

// LEDGER_MOCK - resultado de reconciliacion controlado.
export const mockReconciliationResult: LedgerReconciliationResult = {
  matched: true,
  internalTotal: 1500,
  providerTotal: 1500,
  difference: 0,
  severity: 'ok',
  message: 'Ledger mock reconciliado con reserva mock.',
  checkedAt: now,
};
