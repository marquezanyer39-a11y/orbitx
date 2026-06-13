import {
  creditReward,
  moveAvailableToPool,
  movePoolToAvailable,
} from '../ledger/ledger-service.js';
import { createLedgerDisabledError } from '../ledger/ledger-errors.js';

export async function getPools(_context = {}) {
  throw createLedgerDisabledError('Pool real requiere DB, auth y reglas de producto aprobadas.');
}

export async function getUserPoolPosition(_userId, _poolId, _context = {}) {
  throw createLedgerDisabledError('Posicion de pool real requiere DB.');
}

export async function subscribeToPool(userId, poolId, asset, amount, idempotencyKey, context = {}) {
  return moveAvailableToPool(userId, asset, amount, idempotencyKey, {
    ...context,
    metadata: { poolId },
    referenceId: poolId,
  });
}

export async function redeemFromPool(userId, poolId, asset, amount, idempotencyKey, context = {}) {
  return movePoolToAvailable(userId, asset, amount, idempotencyKey, {
    ...context,
    metadata: { poolId },
    referenceId: poolId,
  });
}

export async function distributePoolRewards(poolId, distributionId, idempotencyKey, context = {}) {
  if (!context.distribution) {
    throw createLedgerDisabledError('Distribucion de pool requiere reserva, batch idempotente y DB real.');
  }

  const { userId, asset, amount } = context.distribution;
  return creditReward(userId, asset, amount, `pool:${poolId}:${distributionId}`, idempotencyKey, context);
}
