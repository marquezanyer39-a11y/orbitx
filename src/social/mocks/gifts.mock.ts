import { SOCIAL_GIFTS } from '../../constants/social';
import type { GiftTransaction, SocialGift } from '../types';

export const SOCIAL_GIFTS_MOCK: SocialGift[] = SOCIAL_GIFTS.map((gift) => ({
  id: gift.id,
  name: gift.label,
  subtitle: gift.subtitle,
  priceUsd: gift.priceUsd,
  rarity: gift.priceUsd >= 10 ? 'legendary' : gift.priceUsd >= 5 ? 'premium' : 'core',
  previewAsset: gift.previewAsset,
}));

export const SOCIAL_GIFT_TRANSACTIONS_MOCK: GiftTransaction[] = [];
