import { creditReward as creditLedgerReward } from '../ledger/ledger-service.js';
import { createLedgerDisabledError } from '../ledger/ledger-errors.js';

export async function creditReward(userId, asset, amount, reason, idempotencyKey, context = {}) {
  return creditLedgerReward(userId, asset, amount, reason, idempotencyKey, context);
}

export async function distributeRewardBatch(_batchId, _items, _idempotencyKey, _context = {}) {
  throw createLedgerDisabledError('Batch rewards requiere reserva, DB transaction e idempotencia por item.');
}

export async function validateRewardReserve(_asset, _amount, _context = {}) {
  throw createLedgerDisabledError('Validacion de reward reserve requiere ledger_balances real.');
}
