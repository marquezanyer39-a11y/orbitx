import type { Gift } from './domain';

export type SocialGift = Gift;

export interface GiftTransaction {
  id: string;
  streamId?: string | null;
  postId?: string | null;
  giftId: string;
  senderName: string;
  priceUsd: number;
  createdAt: string;
  status: 'sent' | 'failed';
}
