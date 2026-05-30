import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSocialFeed as useLegacySocialFeed } from '../../hooks/useSocialFeed';
import type { SocialGiftBurst, SocialGiftOption, SocialPost } from '../../types/social';
import { SOCIAL_LIVE_CHAT_SEED_MOCK, SOCIAL_LIVE_REACTION_TEMPLATES_MOCK } from '../mocks/liveStreams.mock';
import { useGifts } from './useGifts';
import { useComments } from './useComments';
import { useLiveStore } from '../stores/useLiveStore';
import * as liveService from '../services/liveService';
import * as astraSocialService from '../services/astraSocialService';

export function useLiveRoom() {
  const legacy = useLegacySocialFeed('live');
  const { gifts, sendGift } = useGifts();
  const messages = useLiveStore((state) => state.messages);
  const viewers = useLiveStore((state) => state.viewers);
  const reactions = useLiveStore((state) => state.reactions);
  const giftQueue = useLiveStore((state) => state.giftQueue);
  const setActiveStream = useLiveStore((state) => state.setActiveStream);
  const setMessages = useLiveStore((state) => state.setMessages);
  const pushMessage = useLiveStore((state) => state.pushMessage);
  const setViewers = useLiveStore((state) => state.setViewers);
  const pushReaction = useLiveStore((state) => state.pushReaction);
  const removeReaction = useLiveStore((state) => state.removeReaction);
  const enqueueGift = useLiveStore((state) => state.enqueueGift);
  const resetLiveStore = useLiveStore((state) => state.reset);
  const [loading, setLoading] = useState(false);
  const [astraInsight, setAstraInsight] = useState('');
  const [giftBurst, setGiftBurst] = useState<SocialGiftBurst | null>(null);

  const streamPost = useMemo<SocialPost | null>(
    () =>
      legacy.posts.find((post) => post.id === 'post-sol-live-bitqueenie') ??
      legacy.posts.find((post) => post.isLive) ??
      legacy.posts[0] ??
      null,
    [legacy.posts],
  );
  const creator = useMemo(
    () => legacy.creators.find((entry) => entry.id === streamPost?.authorId) ?? null,
    [legacy.creators, streamPost?.authorId],
  );

  const comments = useComments(streamPost?.id ?? null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!streamPost) return;
      setLoading(true);
      try {
        const [stream, messages, insight] = await Promise.all([
          liveService.getLiveStream(streamPost.id),
          liveService.getLiveMessages(streamPost.id),
          astraSocialService.getLiveInsight(streamPost.tokenSymbol),
        ]);

        if (!cancelled) {
          setActiveStream(stream);
          setMessages(
            messages.map((message, index) => ({
              ...message,
              author: SOCIAL_LIVE_CHAT_SEED_MOCK[index % SOCIAL_LIVE_CHAT_SEED_MOCK.length]?.author ?? 'QVEX',
              handle: SOCIAL_LIVE_CHAT_SEED_MOCK[index % SOCIAL_LIVE_CHAT_SEED_MOCK.length]?.handle ?? '@qvex',
            })),
          );
          setViewers(stream?.viewerCount ?? streamPost.liveViewers ?? 0);
          setAstraInsight(insight ?? '');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [setActiveStream, setMessages, setViewers, streamPost]);

  const sendMessage = useCallback(async (body: string) => {
    if (!streamPost) return null;
    const trimmed = body.trim();
    if (!trimmed) return null;
    const nextMessage = await liveService.sendLiveMessage(streamPost.id, trimmed, legacy.currentCreator);
    pushMessage({
      ...nextMessage,
    });
    return nextMessage;
  }, [legacy.currentCreator, pushMessage, streamPost]);

  const sendReaction = useCallback(async () => {
    await liveService.sendReaction();
    const template =
      SOCIAL_LIVE_REACTION_TEMPLATES_MOCK[
        Math.floor(Math.random() * SOCIAL_LIVE_REACTION_TEMPLATES_MOCK.length)
      ];
    const id = `reaction-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    pushReaction({
      id,
      icon: template.icon,
      color: template.color,
      right: 52 + Math.random() * 64,
      bottom: 130 + Math.random() * 90,
      size: 18 + Math.round(Math.random() * 6),
    });
    return id;
  }, [pushReaction]);

  const sendSelectedGift = useCallback(async (gift: SocialGiftOption) => {
    if (!streamPost) return null;
    const result = await sendGift(streamPost.id, gift);
    if (result.success) {
      const transaction = result.transaction;
      enqueueGift({
        id: transaction.id,
        streamId: streamPost.id,
        postId: streamPost.id,
        giftId: transaction.giftId,
        senderName: transaction.senderName,
        priceUsd: transaction.priceUsd,
        createdAt: transaction.createdAt,
        status: transaction.status,
      });
      setGiftBurst({
        id: `burst-${Date.now()}`,
        postId: streamPost.id,
        giftId: gift.id,
        label: gift.label,
        priceUsd: gift.priceUsd,
        previewAsset: gift.previewAsset,
        overlayAsset: gift.overlayAsset,
        overlayAssetType: gift.overlayAssetType,
        soundAsset: gift.soundAsset,
        senderName: transaction.senderName,
        createdAt: transaction.createdAt,
      });
    }
    return result;
  }, [enqueueGift, sendGift, streamPost]);

  const leaveStream = useCallback(async () => {
    if (!streamPost) return;
    await liveService.leaveLive(streamPost.id);
    resetLiveStore();
  }, [resetLiveStore, streamPost]);

  return {
    loading,
    stream: streamPost,
    creator,
    messages,
    viewers: viewers || streamPost?.liveViewers || 0,
    reactions,
    giftQueue,
    giftBurst,
    astraInsight,
    gifts,
    comments,
    currentCreator: legacy.currentCreator,
    followingCreatorIds: legacy.followingCreatorIds,
    toggleFollowCreator: legacy.toggleFollowCreator,
    likedPostIds: legacy.likedPostIds,
    toggleLikePost: legacy.toggleLikePost,
    viewerGiftBalanceUsd: legacy.viewerGiftBalanceUsd,
    removeReaction,
    clearGiftBurst: () => setGiftBurst(null),
    sendMessage,
    sendReaction,
    sendGift: sendSelectedGift,
    leaveStream,
  };
}
