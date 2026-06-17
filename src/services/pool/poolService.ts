import type { LedgerTransaction } from '../../types/ledger';
import { creditReward, moveAvailableToPool, movePoolToAvailable } from '../ledger';
import { mockPoolPositions, mockPools } from './poolMocks';
import type { Pool, PoolPosition } from './poolTypes';

// POOL_MOCK - servicio temporal sobre ledger mock. No mueve dinero real.
export async function getPools(): Promise<Pool[]> {
  return mockPools;
}

export async function getUserPoolPositions(userId: string): Promise<PoolPosition[]> {
  return mockPoolPositions.filter((position) => position.userId === userId);
}

export async function subscribeToPool(
  userId: string,
  _poolId: string,
  asset: string,
  amount: number,
): Promise<LedgerTransaction> {
  return moveAvailableToPool(userId, asset, amount);
}

export async function redeemFromPool(
  userId: string,
  _poolId: string,
  asset: string,
  amount: number,
): Promise<LedgerTransaction> {
  return movePoolToAvailable(userId, asset, amount);
}

export async function distributePoolReward(
  _poolId: string,
  userId: string,
  asset: string,
  amount: number,
): Promise<LedgerTransaction> {
  return creditReward(userId, asset, amount, 'pool_reward');
}
