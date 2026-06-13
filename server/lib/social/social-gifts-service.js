import { createLedgerTransaction, transferSocialGift } from '../ledger/ledger-service.js';
import { createLedgerDisabledError } from '../ledger/ledger-errors.js';

export async function getGiftCatalog(_context = {}) {
  throw createLedgerDisabledError('Catalogo de regalos real requiere DB/configuracion backend.');
}

export async function sendGift(senderId, receiverId, giftId, asset, amount, idempotencyKey, context = {}) {
  return transferSocialGift(senderId, receiverId, asset, amount, idempotencyKey, {
    ...context,
    metadata: { giftId },
    referenceId: giftId,
  });
}

export async function refundGift(giftTransactionId, reason, idempotencyKey, context = {}) {
  return createLedgerTransaction(
    {
      transactionType: 'SOCIAL_GIFT_REFUND',
      asset: context.asset,
      amountDecimal: context.amountDecimal,
      idempotencyKey,
      referenceType: 'social_gift',
      referenceId: giftTransactionId,
      metadata: { reason },
      entries: context.entries || [],
    },
    context,
  );
}
