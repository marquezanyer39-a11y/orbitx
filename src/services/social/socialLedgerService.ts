import type { LedgerTransaction } from '../../types/ledger';
import { createLedgerTransaction } from '../ledger';

// SOCIAL_MOCK - refund temporal sobre ledger mock. No mueve dinero real.
export async function refundSocialGiftTransaction(
  transactionId: string,
): Promise<LedgerTransaction> {
  return createLedgerTransaction({
    debitAccountId: 'mock-receiver.social.USDT',
    creditAccountId: 'mock-user.social.USDT',
    amount: 1,
    asset: 'USDT',
    transactionType: 'SOCIAL_GIFT_REFUND',
    referenceId: `refund_${transactionId}`,
    metadata: {
      transactionId,
      isMock: true,
    },
  });
}
