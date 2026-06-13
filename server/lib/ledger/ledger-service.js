import { LedgerBackendError, LEDGER_ERROR_CODES, createLedgerDisabledError } from './ledger-errors.js';

const ASSET_PATTERN = /^[A-Z0-9]{2,16}$/;
const IDEMPOTENCY_PATTERN = /^[A-Za-z0-9:_-]{12,160}$/;
const MONEY_PATTERN = /^(0|[1-9]\d*)(\.\d{1,8})?$/;

function decimalToAtomic(value, scale = 8) {
  if (!MONEY_PATTERN.test(value)) {
    throw new LedgerBackendError({
      code: LEDGER_ERROR_CODES.INVALID_AMOUNT,
      message: 'Monto invalido. Usa decimal positivo como string, por ejemplo "10.50".',
      status: 422,
    });
  }

  const [whole, fraction = ''] = value.split('.');
  const paddedFraction = fraction.padEnd(scale, '0');
  const atomic = `${whole}${paddedFraction}`.replace(/^0+(?=\d)/, '');
  return BigInt(atomic || '0');
}

export function normalizeAsset(asset) {
  const normalized = String(asset || '').trim().toUpperCase();

  if (!ASSET_PATTERN.test(normalized)) {
    throw new LedgerBackendError({
      code: LEDGER_ERROR_CODES.INVALID_ASSET,
      message: 'Asset invalido para ledger.',
      status: 422,
    });
  }

  return normalized;
}

export function validatePositiveAmount(amountDecimal) {
  const value = String(amountDecimal || '').trim();
  const atomic = decimalToAtomic(value);

  if (atomic <= 0n) {
    throw new LedgerBackendError({
      code: LEDGER_ERROR_CODES.INVALID_AMOUNT,
      message: 'El monto debe ser mayor a cero.',
      status: 422,
    });
  }

  return value;
}

export function validateNonNegativeAmount(amountDecimal) {
  const value = String(amountDecimal || '').trim();
  decimalToAtomic(value);
  return value;
}

export function validateIdempotencyKey(idempotencyKey) {
  const value = String(idempotencyKey || '').trim();

  if (!IDEMPOTENCY_PATTERN.test(value)) {
    throw new LedgerBackendError({
      code: LEDGER_ERROR_CODES.INVALID_IDEMPOTENCY_KEY,
      message: 'idempotencyKey requerido y debe ser estable por operacion.',
      status: 422,
    });
  }

  return value;
}

export function validateDoubleEntry(entries) {
  if (!Array.isArray(entries) || entries.length < 2) {
    throw new LedgerBackendError({
      code: LEDGER_ERROR_CODES.INVALID_DOUBLE_ENTRY,
      message: 'Toda transaccion ledger requiere al menos un debito y un credito.',
      status: 422,
    });
  }

  const totalsByAsset = new Map();

  for (const entry of entries) {
    const asset = normalizeAsset(entry.asset);
    const amountAtomic = decimalToAtomic(validatePositiveAmount(entry.amountDecimal));
    const current = totalsByAsset.get(asset) || { debit: 0n, credit: 0n };

    if (entry.direction === 'debit') {
      current.debit += amountAtomic;
    } else if (entry.direction === 'credit') {
      current.credit += amountAtomic;
    } else {
      throw new LedgerBackendError({
        code: LEDGER_ERROR_CODES.INVALID_DOUBLE_ENTRY,
        message: 'Cada entry debe ser debit o credit.',
        status: 422,
      });
    }

    totalsByAsset.set(asset, current);
  }

  for (const [asset, totals] of totalsByAsset.entries()) {
    if (totals.debit !== totals.credit) {
      throw new LedgerBackendError({
        code: LEDGER_ERROR_CODES.INVALID_DOUBLE_ENTRY,
        message: `Entries no balanceadas para ${asset}. Total debit debe igualar total credit.`,
        status: 422,
      });
    }
  }

  return true;
}

export async function ensureIdempotency(idempotencyKey, context = {}) {
  validateIdempotencyKey(idempotencyKey);

  if (!context.db) {
    throw createLedgerDisabledError('Idempotencia requiere una base de datos ACID antes de mover fondos.');
  }

  return true;
}

export async function createLedgerTransaction(input, context = {}) {
  normalizeAsset(input.asset);
  validatePositiveAmount(input.amountDecimal);
  validateIdempotencyKey(input.idempotencyKey);
  validateDoubleEntry(input.entries);

  if (!context.db) {
    throw createLedgerDisabledError('createLedgerTransaction esta preparado, pero no esta conectado a DB real.');
  }

  throw createLedgerDisabledError('Implementar con transaccion DB, snapshots, audit log e idempotencia.');
}

export async function getUserLedgerBalance(_userId, _asset, context = {}) {
  if (!context.db) {
    throw createLedgerDisabledError('Lectura de saldos ledger requiere DB real.');
  }

  throw createLedgerDisabledError();
}

export async function getOrCreateUserAccount(_userId, _accountType, _asset, context = {}) {
  if (!context.db) {
    throw createLedgerDisabledError('Creacion de cuentas ledger requiere DB real.');
  }

  throw createLedgerDisabledError();
}

function movementEntry({ userId, accountType, asset, direction, amountDecimal, providerId = null }) {
  return {
    accountKey: {
      userId,
      accountType,
      asset,
      providerId,
    },
    direction,
    asset,
    amountDecimal,
  };
}

function createMovementInput({
  transactionType,
  userId,
  asset,
  amount,
  idempotencyKey,
  debitAccountType,
  creditAccountType,
  debitUserId = userId,
  creditUserId = userId,
  metadata = {},
  referenceType,
  referenceId,
}) {
  const normalizedAsset = normalizeAsset(asset);
  const amountDecimal = validatePositiveAmount(amount);

  return {
    transactionType,
    status: 'pending',
    asset: normalizedAsset,
    amountDecimal,
    idempotencyKey: validateIdempotencyKey(idempotencyKey),
    referenceType,
    referenceId,
    metadata,
    entries: [
      movementEntry({
        userId: debitUserId,
        accountType: debitAccountType,
        asset: normalizedAsset,
        direction: 'debit',
        amountDecimal,
      }),
      movementEntry({
        userId: creditUserId,
        accountType: creditAccountType,
        asset: normalizedAsset,
        direction: 'credit',
        amountDecimal,
      }),
    ],
  };
}

export async function moveAvailableToPool(userId, asset, amount, idempotencyKey, context = {}) {
  return createLedgerTransaction(
    createMovementInput({
      transactionType: 'POOL_SUBSCRIBE',
      userId,
      asset,
      amount,
      idempotencyKey,
      debitAccountType: 'available',
      creditAccountType: 'pool',
      metadata: { source: 'pool', ...(context.metadata || {}) },
      referenceType: 'pool',
      referenceId: context.referenceId,
    }),
    context,
  );
}

export async function movePoolToAvailable(userId, asset, amount, idempotencyKey, context = {}) {
  return createLedgerTransaction(
    createMovementInput({
      transactionType: 'POOL_REDEEM',
      userId,
      asset,
      amount,
      idempotencyKey,
      debitAccountType: 'pool',
      creditAccountType: 'available',
      metadata: { source: 'pool', ...(context.metadata || {}) },
      referenceType: 'pool',
      referenceId: context.referenceId,
    }),
    context,
  );
}

export async function transferSocialGift(senderId, receiverId, asset, amount, idempotencyKey, context = {}) {
  return createLedgerTransaction(
    createMovementInput({
      transactionType: 'SOCIAL_GIFT',
      userId: senderId,
      debitUserId: senderId,
      creditUserId: receiverId,
      asset,
      amount,
      idempotencyKey,
      debitAccountType: 'social',
      creditAccountType: 'social',
      metadata: { source: 'social_gift', ...(context.metadata || {}) },
      referenceType: 'social_gift',
      referenceId: context.referenceId,
    }),
    context,
  );
}

export async function creditReward(userId, asset, amount, reason, idempotencyKey, context = {}) {
  return createLedgerTransaction(
    createMovementInput({
      transactionType: 'REWARD_DISTRIBUTION',
      userId,
      debitUserId: null,
      creditUserId: userId,
      asset,
      amount,
      idempotencyKey,
      debitAccountType: 'orbitx_reserve',
      creditAccountType: 'rewards',
      metadata: { reason },
      referenceType: 'reward',
    }),
    context,
  );
}

export async function lockBalance(userId, asset, amount, reason, idempotencyKey, context = {}) {
  return createLedgerTransaction(
    createMovementInput({
      transactionType: 'TRADE_LOCK',
      userId,
      asset,
      amount,
      idempotencyKey,
      debitAccountType: 'available',
      creditAccountType: 'locked',
      metadata: { reason },
      referenceType: 'lock',
    }),
    context,
  );
}

export async function unlockBalance(userId, asset, amount, reason, idempotencyKey, context = {}) {
  return createLedgerTransaction(
    createMovementInput({
      transactionType: 'TRADE_UNLOCK',
      userId,
      asset,
      amount,
      idempotencyKey,
      debitAccountType: 'locked',
      creditAccountType: 'available',
      metadata: { reason },
      referenceType: 'unlock',
    }),
    context,
  );
}

export async function collectFee(userId, asset, amount, reason, idempotencyKey, context = {}) {
  return createLedgerTransaction(
    createMovementInput({
      transactionType: 'FEE_COLLECT',
      userId,
      debitUserId: userId,
      creditUserId: null,
      asset,
      amount,
      idempotencyKey,
      debitAccountType: 'available',
      creditAccountType: 'fees',
      metadata: { reason },
      referenceType: 'fee',
    }),
    context,
  );
}

export async function refundFee(userId, asset, amount, reason, idempotencyKey, context = {}) {
  return createLedgerTransaction(
    createMovementInput({
      transactionType: 'FEE_REFUND',
      userId,
      debitUserId: null,
      creditUserId: userId,
      asset,
      amount,
      idempotencyKey,
      debitAccountType: 'fees',
      creditAccountType: 'available',
      metadata: { reason },
      referenceType: 'fee_refund',
    }),
    context,
  );
}

export async function requestWithdrawal(userId, asset, amount, idempotencyKey, context = {}) {
  return createLedgerTransaction(
    createMovementInput({
      transactionType: 'WITHDRAWAL_REQUEST',
      userId,
      asset,
      amount,
      idempotencyKey,
      debitAccountType: 'available',
      creditAccountType: 'pending_withdrawal',
      referenceType: 'withdrawal',
    }),
    context,
  );
}

export async function completeWithdrawal(userId, asset, amount, providerReference, idempotencyKey, context = {}) {
  return createLedgerTransaction(
    createMovementInput({
      transactionType: 'WITHDRAWAL_COMPLETE',
      userId,
      debitUserId: userId,
      creditUserId: null,
      asset,
      amount,
      idempotencyKey,
      debitAccountType: 'pending_withdrawal',
      creditAccountType: 'provider_reserve',
      metadata: { providerReference },
      referenceType: 'withdrawal',
      referenceId: providerReference,
    }),
    context,
  );
}

export async function reconcileWithProviderBalance(providerId, asset, providerBalance, context = {}) {
  const { reconcileWithProviderBalance: reconcile } = await import('./ledger-reconciliation.js');
  return reconcile(providerId, asset, providerBalance, context);
}
