import { useMemo } from 'react';

import { useAuthStore } from '../store/authStore';
import { useSocialStore } from '../store/socialStore';
import type { SocialComposerDraft, SocialFeedTab } from '../types/social';

function normalizeHandle(name: string, email: string) {
  const base =
    name.trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase() ||
    email.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() ||
    'orbitxuser';

  return `@${base.slice(0, 16)}`;
}

export function useSocialFeed(feedTab: SocialFeedTab = 'for_you') {
  const authProfile = useAuthStore((state) => state.profile);
  const session = useAuthStore((state) => state.session);

  const disclaimerAccepted = useSocialStore((state) => state.disclaimerAccepted);
  const creators = useSocialStore((state) => state.creators);
  const posts = useSocialStore((state) => state.posts);
  const comments = useSocialStore((state) => state.comments);
  const threads = useSocialStore((state) => state.threads);
  const followingCreatorIds = useSocialStore((state) => state.followingCreatorIds);
  const likedPostIds = useSocialStore((state) => state.likedPostIds);
  const likedCommentIds = useSocialStore((state) => state.likedCommentIds);
  const gifts = useSocialStore((state) => state.gifts);
  const activeLivePostId = useSocialStore((state) => state.activeLivePostId);
  const viewerGiftBalanceUsd = useSocialStore((state) => state.viewerGiftBalanceUsd);
  const giftTransactions = useSocialStore((state) => state.giftTransactions);

  const acceptDisclaimer = useSocialStore((state) => state.acceptDisclaimer);
  const toggleFollowCreator = useSocialStore((state) => state.toggleFollowCreator);
  const toggleLikePost = useSocialStore((state) => state.toggleLikePost);
  const toggleLikeComment = useSocialStore((state) => state.toggleLikeComment);
  const addPost = useSocialStore((state) => state.addPost);
  const addComment = useSocialStore((state) => state.addComment);
  const ensureThreadWithCreator = useSocialStore((state) => state.ensureThreadWithCreator);
  const sendMessage = useSocialStore((state) => state.sendMessage);
  const markThreadRead = useSocialStore((state) => state.markThreadRead);
  const startLiveBroadcast = useSocialStore((state) => state.startLiveBroadcast);
  const endLiveBroadcast = useSocialStore((state) => state.endLiveBroadcast);
  const recordGiftTransaction = useSocialStore((state) => state.recordGiftTransaction);
  const debitViewerGiftBalance = useSocialStore((state) => state.debitViewerGiftBalance);

  const currentCreator = useMemo(
    () => ({
      id: authProfile.orbitId || 'current-user',
      displayName: authProfile.name || 'OrbitX User',
      handle: authProfile.handle || normalizeHandle(authProfile.name, authProfile.email),
      avatar: authProfile.avatar || authProfile.name.slice(0, 1).toUpperCase() || 'O',
      avatarUri: authProfile.avatarUri ?? null,
      bio: 'Mi actividad dentro de OrbitX.',
      verified: session.emailConfirmed,
      followers: 0,
      following: followingCreatorIds.length,
    }),
    [
      authProfile.avatar,
      authProfile.avatarUri,
      authProfile.email,
      authProfile.handle,
      authProfile.orbitId,
      authProfile.name,
      followingCreatorIds.length,
      session.emailConfirmed,
    ],
  );

  const allCreators = useMemo(() => {
    const exists = creators.some((creator) => creator.id === currentCreator.id);
    if (!exists) {
      return [currentCreator, ...creators];
    }

    return creators.map((creator) =>
      creator.id === currentCreator.id
        ? {
            ...creator,
            ...currentCreator,
            followers: creator.followers,
          }
        : creator,
    );
  }, [creators, currentCreator]);

  const feedPosts = useMemo(() => {
    const sorted = [...posts].sort((left, right) => {
      const now = Date.now();
      const leftAgeHours = Math.max(
        (now - new Date(left.createdAt).getTime()) / (1000 * 60 * 60),
        0,
      );
      const rightAgeHours = Math.max(
        (now - new Date(right.createdAt).getTime()) / (1000 * 60 * 60),
        0,
      );
      const leftRecencyBoost = Math.max(36 - leftAgeHours, 0) * 8;
      const rightRecencyBoost = Math.max(36 - rightAgeHours, 0) * 8;
      const leftScore =
        left.likes * 2 +
        left.comments +
        left.shares * 1.5 +
        leftRecencyBoost +
        (left.authorId === currentCreator.id ? 24 : 0);
      const rightScore =
        right.likes * 2 +
        right.comments +
        right.shares * 1.5 +
        rightRecencyBoost +
        (right.authorId === currentCreator.id ? 24 : 0);
      return rightScore - leftScore;
    });

    if (feedTab === 'live') {
      return sorted.filter((post) => post.isLive);
    }

    if (feedTab === 'following') {
      return sorted.filter(
        (post) => followingCreatorIds.includes(post.authorId) || post.authorId === currentCreator.id,
      );
    }

    return sorted;
  }, [currentCreator.id, feedTab, followingCreatorIds, posts]);

  const groupedComments = useMemo(() => {
    return comments.reduce<Record<string, typeof comments>>((accumulator, comment) => {
      if (!accumulator[comment.postId]) {
        accumulator[comment.postId] = [];
      }
      accumulator[comment.postId].push(comment);
      return accumulator;
    }, {});
  }, [comments]);

  const enrichedThreads = useMemo(
    () =>
      [...threads].sort((left, right) => {
        const leftDate = left.messages[left.messages.length - 1]?.createdAt ?? '';
        const rightDate = right.messages[right.messages.length - 1]?.createdAt ?? '';
        return rightDate.localeCompare(leftDate);
      }),
    [threads],
  );

  return {
    disclaimerAccepted,
    currentCreator,
    creators: allCreators,
    posts: feedPosts,
    comments,
    commentsByPost: groupedComments,
    threads: enrichedThreads,
    followingCreatorIds,
    likedPostIds,
    likedCommentIds,
    gifts,
    activeLivePostId,
    viewerGiftBalanceUsd,
    giftTransactions,
    acceptDisclaimer,
    toggleFollowCreator,
    toggleLikePost,
    toggleLikeComment,
    publishPost: (draft: SocialComposerDraft) => addPost(draft, currentCreator),
    publishComment: (postId: string, body: string, replyToCommentId?: string | null) =>
      addComment(postId, { body, replyToCommentId }, currentCreator),
    ensureThreadWithCreator,
    sendThreadMessage: (threadId: string, body: string) =>
      sendMessage(threadId, body, currentCreator.id),
    markThreadRead,
    startLiveBroadcast,
    endLiveBroadcast,
    recordGiftTransaction,
    debitViewerGiftBalance,
  };
}
