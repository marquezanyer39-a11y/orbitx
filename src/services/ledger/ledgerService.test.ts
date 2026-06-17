import { describe, expect, it } from 'vitest';

import {
  creditReward,
  moveAvailableToPool,
  reconcileWithProviderBalance,
  transferSocialGift,
} from './ledgerService';

describe('ledgerService double entry safety', () => {
  it('moves available funds to pool with debit and credit accounts', async () => {
    const tx = await moveAvailableToPool('user-1', 'USDT', 100);

    expect(tx.transactionType).toBe('POOL_SUBSCRIBE');
    expect(tx.debitAccountId).toBe('user-1.available.USDT');
    expect(tx.creditAccountId).toBe('user-1.pool.USDT');
    expect(tx.entries[0]?.debitAccountId).toBe(tx.debitAccountId);
    expect(tx.entries[0]?.creditAccountId).toBe(tx.creditAccountId);
    expect(tx.metadata?.isMock).toBe(true);
  });

  it('transfers a social gift with debit and credit accounts', async () => {
    const tx = await transferSocialGift('sender-1', 'receiver-1', 'USDT', 10);

    expect(tx.transactionType).toBe('SOCIAL_GIFT');
    expect(tx.debitAccountId).toBe('sender-1.social.USDT');
    expect(tx.creditAccountId).toBe('receiver-1.social.USDT');
    expect(tx.debitAccountId).not.toBe(tx.creditAccountId);
  });

  it('credits rewards from QVEX reserve into user rewards', async () => {
    const tx = await creditReward('user-1', 'USDT', 25, 'test_reward');

    expect(tx.transactionType).toBe('REWARD_DISTRIBUTION');
    expect(tx.debitAccountId).toBe('orbitx.rewards_reserve.USDT');
    expect(tx.creditAccountId).toBe('user-1.rewards.USDT');
    expect(tx.metadata?.reason).toBe('test_reward');
  });

  it('reconciles mock internal ledger totals against provider totals', async () => {
    const matched = await reconcileWithProviderBalance('mock-provider', 'USDT', 1500);
    const mismatch = await reconcileWithProviderBalance('mock-provider', 'USDT', 1498);

    expect(matched.matched).toBe(true);
    expect(matched.severity).toBe('ok');
    expect(mismatch.matched).toBe(false);
    expect(mismatch.severity).toBe('critical');
  });
});
