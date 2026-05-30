import { useSocialStore as useOrbitxSocialStore } from '../../store/socialStore';
import type { SocialGiftOption } from '../../types/social';
import { createMockDelay } from '../utils/createMockDelay';

export async function getAvailableGifts() {
  await createMockDelay();
  return useOrbitxSocialStore.getState().gifts;
}

export async function sendGift(
  streamOrPostId: string,
  gift: SocialGiftOption,
  senderName = 'QVEX Viewer',
) {
  await createMockDelay(180);

  const state = useOrbitxSocialStore.getState();
  if (state.viewerGiftBalanceUsd < gift.priceUsd) {
    return {
      success: false,
      reason: 'INSUFFICIENT_BALANCE',
    } as const;
  }

  state.debitViewerGiftBalance(gift.priceUsd);
  const transaction = {
    id: `gift-tx-${Date.now()}`,
    postId: streamOrPostId,
    giftId: gift.id,
    senderName,
    priceUsd: gift.priceUsd,
    createdAt: new Date().toISOString(),
    status: 'sent' as const,
  };
  state.recordGiftTransaction(transaction);

  return {
    success: true,
    transaction,
  } as const;
}
