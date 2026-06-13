import { createHash } from 'node:crypto';

import {
  IDEMPOTENCY_ERROR_CODES,
  createIdempotencyError,
} from './idempotency-errors.js';

const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9:_-]{12,160}$/;
const SENSITIVE_KEY_PATTERN = /token|secret|password|authorization|cookie|private|mnemonic|seed|key/i;

function stableSanitizedValue(value) {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => stableSanitizedValue(item));
  }

  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [
        key,
        SENSITIVE_KEY_PATTERN.test(key) ? '[redacted]' : stableSanitizedValue(value[key]),
      ]),
  );
}

function assertPersistenceEnabled(context = {}) {
  const enabled = `${process.env.IDEMPOTENCY_PERSISTENCE_ENABLED ?? 'false'}` === 'true';

  if (!enabled || !context.db) {
    throw createIdempotencyError(
      IDEMPOTENCY_ERROR_CODES.IDEMPOTENCY_DISABLED,
      'Idempotencia persistente requiere DB real antes de ejecutar operaciones financieras.',
    );
  }
}

export function requireIdempotencyKey(req) {
  const key = `${req.headers?.['idempotency-key'] ?? req.body?.idempotencyKey ?? ''}`.trim();

  if (!key) {
    throw createIdempotencyError(
      IDEMPOTENCY_ERROR_CODES.IDEMPOTENCY_REQUIRED,
      'idempotencyKey requerido para POST financiero.',
    );
  }

  if (!IDEMPOTENCY_KEY_PATTERN.test(key)) {
    throw createIdempotencyError(
      IDEMPOTENCY_ERROR_CODES.IDEMPOTENCY_INVALID,
      'idempotencyKey invalido. Usa una clave estable, unica y sin datos sensibles.',
    );
  }

  return key;
}

export function createRequestHash(payload) {
  const sanitizedPayload = stableSanitizedValue(payload ?? {});
  return createHash('sha256')
    .update(JSON.stringify(sanitizedPayload))
    .digest('hex');
}

export async function checkIdempotency(key, operationType, context = {}) {
  requireValidKeyAndOperation(key, operationType);
  assertPersistenceEnabled(context);
  throw createIdempotencyError(
    IDEMPOTENCY_ERROR_CODES.IDEMPOTENCY_NOT_IMPLEMENTED,
    'checkIdempotency debe consultar idempotency_keys dentro de una transaccion DB.',
  );
}

export async function saveProcessingKey(key, operationType, userId, requestHash, context = {}) {
  requireValidKeyAndOperation(key, operationType);
  assertPersistenceEnabled(context);
  throw createIdempotencyError(
    IDEMPOTENCY_ERROR_CODES.IDEMPOTENCY_NOT_IMPLEMENTED,
    'saveProcessingKey debe persistir estado processing con unique(key).',
    { userId, requestHash },
  );
}

export async function saveCompletedKey(key, responseSnapshot, context = {}) {
  requireValidKey(key);
  assertPersistenceEnabled(context);
  throw createIdempotencyError(
    IDEMPOTENCY_ERROR_CODES.IDEMPOTENCY_NOT_IMPLEMENTED,
    'saveCompletedKey debe guardar el snapshot original sin secretos.',
    { responseSnapshot },
  );
}

export async function saveFailedKey(key, error, context = {}) {
  requireValidKey(key);
  assertPersistenceEnabled(context);
  throw createIdempotencyError(
    IDEMPOTENCY_ERROR_CODES.IDEMPOTENCY_NOT_IMPLEMENTED,
    'saveFailedKey debe persistir fallos de forma auditable.',
    { error },
  );
}

export async function replayIdempotentResponse(key, context = {}) {
  requireValidKey(key);
  assertPersistenceEnabled(context);
  throw createIdempotencyError(
    IDEMPOTENCY_ERROR_CODES.IDEMPOTENCY_NOT_IMPLEMENTED,
    'replayIdempotentResponse debe devolver response_snapshot original desde DB.',
  );
}

function requireValidKey(key) {
  const value = `${key ?? ''}`.trim();

  if (!IDEMPOTENCY_KEY_PATTERN.test(value)) {
    throw createIdempotencyError(
      IDEMPOTENCY_ERROR_CODES.IDEMPOTENCY_INVALID,
      'idempotencyKey invalido.',
    );
  }

  return value;
}

function requireValidKeyAndOperation(key, operationType) {
  const value = requireValidKey(key);
  const operation = `${operationType ?? ''}`.trim();

  if (!operation) {
    throw createIdempotencyError(
      IDEMPOTENCY_ERROR_CODES.IDEMPOTENCY_INVALID,
      'operationType requerido para idempotencia persistente.',
    );
  }

  return { key: value, operationType: operation };
}
