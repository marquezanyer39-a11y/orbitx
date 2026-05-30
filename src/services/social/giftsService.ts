import type { LedgerTransaction } from '../../types/ledger';
import { transferSocialGift } from '../ledger';
import { mockGiftCatalog, type Gift } from './socialMocks';
import { refundSocialGiftTransaction } from './socialLedgerService';

// SOCIAL_MOCK - servicio temporal sobre ledger mock. No mueve dinero real.
export async function getGiftCatalog(): Promise<Gift[]> {
  return mockGiftCatalog;
}

export async function sendGift(
  senderId: string,
  receiverId: string,
  _giftId: string,
  asset: string,
  amount: number,
): Promise<LedgerTransaction> {
  return transferSocialGift(senderId, receiverId, asset, amount);
}

export async function refundGift(transactionId: string): Promise<LedgerTransaction> {
  return refundSocialGiftTransaction(transactionId);
}
