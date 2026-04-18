import type { SocialGiftBurst, SocialGiftOption, SocialGiftTransaction } from '../../types/social';

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function createGiftBurst(
  postId: string,
  gift: SocialGiftOption,
  senderName: string,
): SocialGiftBurst {
  return {
    id: createId('gift-burst'),
    postId,
    giftId: gift.id,
    label: gift.label,
    priceUsd: gift.priceUsd,
    previewAsset: gift.previewAsset,
    overlayAsset: gift.overlayAsset ?? gift.previewAsset,
    overlayAssetType: gift.overlayAssetType ?? 'video',
    soundAsset: gift.soundAsset ?? gift.previewAsset,
    senderName,
    createdAt: new Date().toISOString(),
  };
}

export async function submitLiveGiftToBackend(payload: {
  postId: string;
  gift: SocialGiftOption;
  senderName: string;
}): Promise<SocialGiftTransaction> {
  await wait(420);

  return {
    id: createId('gift-tx'),
    postId: payload.postId,
    giftId: payload.gift.id,
    senderName: payload.senderName,
    priceUsd: payload.gift.priceUsd,
    createdAt: new Date().toISOString(),
    status: 'sent',
  };
}
