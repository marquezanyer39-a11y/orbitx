import {
  createOkxError,
  createRealTradingDisabledError,
  OKX_ERROR_CODES,
} from './okx-errors.js';

function requireIdempotencyKey(idempotencyKey) {
  const value = `${idempotencyKey ?? ''}`.trim();
  if (!value) {
    throw createOkxError(
      OKX_ERROR_CODES.OKX_TRANSFER_REJECTED,
      'idempotencyKey requerido para transferencias OKX.',
      undefined,
      422,
    );
  }
  return value;
}

export async function createTransfer(_userId, _transferRequest, idempotencyKey, _env = process.env) {
  requireIdempotencyKey(idempotencyKey);
  throw createRealTradingDisabledError('Transferencias OKX bloqueadas: no se mueve dinero real en esta fase.');
}

export async function getTransferStatus(_userId, transferId, _env = process.env) {
  return {
    providerId: 'okx',
    transferId: `${transferId ?? ''}`.trim() || null,
    status: 'not_implemented',
    message: 'Consulta de transferencias OKX requiere backend productivo, auth y provider real.',
  };
}
