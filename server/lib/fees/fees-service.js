import { collectFee as collectLedgerFee, refundFee as refundLedgerFee } from '../ledger/ledger-service.js';
import { createLedgerDisabledError } from '../ledger/ledger-errors.js';

export async function collectFee(userId, asset, amount, reason, idempotencyKey, context = {}) {
  return collectLedgerFee(userId, asset, amount, reason, idempotencyKey, context);
}

export async function refundFee(userId, asset, amount, reason, idempotencyKey, context = {}) {
  return refundLedgerFee(userId, asset, amount, reason, idempotencyKey, context);
}

export async function getFeeAccount(_asset, _context = {}) {
  throw createLedgerDisabledError('Cuenta de fees requiere ledger_accounts real.');
}
