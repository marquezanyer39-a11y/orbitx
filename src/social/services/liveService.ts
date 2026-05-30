import { useSocialStore as useOrbitxSocialStore } from '../../store/socialStore';
import type { SocialGiftOption } from '../../types/social';
import { SOCIAL_LIVE_MESSAGES_MOCK, SOCIAL_LIVE_STREAMS_MOCK } from '../mocks/liveStreams.mock';
import { createMockDelay } from '../utils/createMockDelay';
import { sendGift as sendGiftService } from './giftsService';

export async function getLiveStream(streamId?: string) {
  await createMockDelay();
  return (
    SOCIAL_LIVE_STREAMS_MOCK.find((stream) => stream.id === streamId) ??
    SOCIAL_LIVE_STREAMS_MOCK[0] ??
    null
  );
}

export async function joinLive(streamId: string) {
  await createMockDelay(120);
  useOrbitxSocialStore.getState().startLiveBroadcast(streamId);
  return true;
}

export async function leaveLive(streamId: string) {
  await createMockDelay(120);
  useOrbitxSocialStore.getState().endLiveBroadcast(streamId);
  return true;
}

export async function getLiveMessages(streamId: string) {
  await createMockDelay();
  return SOCIAL_LIVE_MESSAGES_MOCK.filter((message) => message.streamId === streamId);
}

export async function sendLiveMessage(
  streamId: string,
  body: string,
  currentUser: { id: string; displayName: string; handle: string },
) {
  await createMockDelay(90);
  return {
    id: `live-message-${Date.now()}`,
    streamId,
    authorId: currentUser.id,
    body,
    createdAt: new Date().toISOString(),
    type: 'message' as const,
    author: currentUser.displayName,
    handle: currentUser.handle,
  };
}

export async function sendReaction() {
  await createMockDelay(60);
  return true;
}

export async function sendGift(streamId: string, gift: SocialGiftOption) {
  return sendGiftService(streamId, gift);
}
