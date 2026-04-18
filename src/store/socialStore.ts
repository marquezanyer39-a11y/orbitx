import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  SOCIAL_COMMENTS,
  SOCIAL_CREATORS,
  SOCIAL_GIFTS,
  SOCIAL_POSTS,
  SOCIAL_THREADS,
} from '../constants/social';
import type {
  SocialComment,
  SocialComposerDraft,
  SocialCreator,
  SocialGiftOption,
  SocialGiftTransaction,
  SocialMessage,
  SocialPost,
  SocialThread,
} from '../types/social';

interface SocialStoreState {
  disclaimerAccepted: boolean;
  creators: SocialCreator[];
  posts: SocialPost[];
  comments: SocialComment[];
  threads: SocialThread[];
  followingCreatorIds: string[];
  likedPostIds: string[];
  likedCommentIds: string[];
  gifts: SocialGiftOption[];
  activeLivePostId: string | null;
  viewerGiftBalanceUsd: number;
  giftTransactions: SocialGiftTransaction[];
}

interface SocialStoreActions {
  acceptDisclaimer: () => void;
  dismissSocialData: () => void;
  toggleFollowCreator: (creatorId: string) => void;
  toggleLikePost: (postId: string) => void;
  toggleLikeComment: (commentId: string) => void;
  addPost: (
    draft: SocialComposerDraft,
    author: Pick<SocialCreator, 'id' | 'displayName' | 'handle' | 'avatar' | 'avatarUri'>,
  ) => SocialPost;
  addComment: (
    postId: string,
    payload: { body: string; replyToCommentId?: string | null },
    author: { id: string; displayName: string; handle: string },
  ) => SocialComment | null;
  ensureThreadWithCreator: (
    creator: Pick<SocialCreator, 'id' | 'displayName' | 'handle' | 'avatar' | 'avatarUri'>,
  ) => string;
  sendMessage: (
    threadId: string,
    body: string,
    senderId: string,
  ) => SocialMessage | null;
  markThreadRead: (threadId: string) => void;
  startLiveBroadcast: (postId: string) => void;
  endLiveBroadcast: (postId: string) => void;
  recordGiftTransaction: (transaction: SocialGiftTransaction) => void;
  debitViewerGiftBalance: (amountUsd: number) => void;
}

type SocialStore = SocialStoreState & SocialStoreActions;

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useSocialStore = create<SocialStore>()(
  persist(
    (set, get) => ({
      disclaimerAccepted: false,
      creators: SOCIAL_CREATORS,
      posts: SOCIAL_POSTS,
      comments: SOCIAL_COMMENTS,
      threads: SOCIAL_THREADS,
      followingCreatorIds: ['creator-nebula', 'creator-jupiter'],
      likedPostIds: [],
      likedCommentIds: [],
      gifts: SOCIAL_GIFTS,
      activeLivePostId: null,
      viewerGiftBalanceUsd: 248.5,
      giftTransactions: [],

      acceptDisclaimer: () => set({ disclaimerAccepted: true }),

      dismissSocialData: () =>
        set({
          disclaimerAccepted: false,
          creators: SOCIAL_CREATORS,
          posts: SOCIAL_POSTS,
          comments: SOCIAL_COMMENTS,
          threads: SOCIAL_THREADS,
          followingCreatorIds: ['creator-nebula', 'creator-jupiter'],
          likedPostIds: [],
          likedCommentIds: [],
          gifts: SOCIAL_GIFTS,
          activeLivePostId: null,
          viewerGiftBalanceUsd: 248.5,
          giftTransactions: [],
        }),

      toggleFollowCreator: (creatorId) =>
        set((state) => {
          const isFollowing = state.followingCreatorIds.includes(creatorId);
          const followingCreatorIds = isFollowing
            ? state.followingCreatorIds.filter((item) => item !== creatorId)
            : [creatorId, ...state.followingCreatorIds];

          const creators = state.creators.map((creator) =>
            creator.id === creatorId
              ? {
                  ...creator,
                  followers: Math.max(creator.followers + (isFollowing ? -1 : 1), 0),
                }
              : creator,
          );

          return { followingCreatorIds, creators };
        }),

      toggleLikePost: (postId) =>
        set((state) => {
          const liked = state.likedPostIds.includes(postId);
          return {
            likedPostIds: liked
              ? state.likedPostIds.filter((item) => item !== postId)
              : [postId, ...state.likedPostIds],
            posts: state.posts.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    likes: Math.max(post.likes + (liked ? -1 : 1), 0),
                  }
                : post,
            ),
          };
        }),

      toggleLikeComment: (commentId) =>
        set((state) => {
          const liked = state.likedCommentIds.includes(commentId);
          return {
            likedCommentIds: liked
              ? state.likedCommentIds.filter((item) => item !== commentId)
              : [commentId, ...state.likedCommentIds],
            comments: state.comments.map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    likes: Math.max(comment.likes + (liked ? -1 : 1), 0),
                  }
                : comment,
            ),
          };
        }),

      addPost: (draft, author) => {
        const nextPost: SocialPost = {
          id: createId('post'),
          authorId: author.id,
          mediaType: draft.mediaType,
          mediaUri: draft.mediaUri,
          posterUri: draft.posterUri ?? null,
          description: draft.description.trim(),
          hashtags: draft.hashtags,
          tokenSymbol: draft.tokenSymbol?.trim().toUpperCase() || null,
          category: draft.category,
          commentsEnabled: draft.commentsEnabled,
          createdAt: new Date().toISOString(),
          likes: 0,
          comments: 0,
          shares: 0,
          isLive: draft.isLive ?? false,
          liveViewers: draft.liveViewers ?? null,
        };

        set((state) => {
          const hasCreator = state.creators.some((creator) => creator.id === author.id);
          const creators = hasCreator
            ? state.creators.map((creator) =>
                creator.id === author.id
                  ? {
                      ...creator,
                      displayName: author.displayName,
                      handle: author.handle,
                      avatar: author.avatar,
                      avatarUri: author.avatarUri ?? null,
                    }
                  : creator,
              )
            : [
                {
                  id: author.id,
                  displayName: author.displayName,
                  handle: author.handle,
                  avatar: author.avatar,
                  avatarUri: author.avatarUri ?? null,
                  bio: 'Creador OrbitX',
                  followers: 0,
                  following: 0,
                },
                ...state.creators,
              ];

          return {
            creators,
            posts: [nextPost, ...state.posts],
          };
        });

        return nextPost;
      },

      addComment: (postId, payload, author) => {
        const trimmedBody = payload.body.trim();
        if (!trimmedBody) {
          return null;
        }

        const comment: SocialComment = {
          id: createId('comment'),
          postId,
          authorId: author.id,
          authorName: author.displayName,
          authorHandle: author.handle,
          body: trimmedBody,
          createdAt: new Date().toISOString(),
          likes: 0,
          replyToCommentId: payload.replyToCommentId ?? null,
        };

        set((state) => ({
          comments: [comment, ...state.comments],
          posts: state.posts.map((post) =>
            post.id === postId ? { ...post, comments: post.comments + 1 } : post,
          ),
        }));

        return comment;
      },

      ensureThreadWithCreator: (creator) => {
        const existing = get().threads.find((thread) => thread.peerId === creator.id);
        if (existing) {
          return existing.id;
        }

        const threadId = createId('thread');
        const nextThread: SocialThread = {
          id: threadId,
          peerId: creator.id,
          peerName: creator.displayName,
          peerHandle: creator.handle,
          peerAvatar: creator.avatar,
          peerAvatarUri: creator.avatarUri ?? null,
          unreadCount: 0,
          messages: [],
        };

        set((state) => ({
          threads: [nextThread, ...state.threads],
        }));

        return threadId;
      },

      sendMessage: (threadId, body, senderId) => {
        const trimmedBody = body.trim();
        if (!trimmedBody) {
          return null;
        }

        const nextMessage: SocialMessage = {
          id: createId('message'),
          senderId,
          body: trimmedBody,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          threads: state.threads.map((thread) =>
            thread.id === threadId
              ? {
                  ...thread,
                  unreadCount: senderId === thread.peerId ? thread.unreadCount + 1 : 0,
                  messages: [...thread.messages, nextMessage],
                }
              : thread,
          ),
        }));

        return nextMessage;
      },

      markThreadRead: (threadId) =>
        set((state) => ({
          threads: state.threads.map((thread) =>
            thread.id === threadId ? { ...thread, unreadCount: 0 } : thread,
          ),
        })),

      startLiveBroadcast: (postId) =>
        set((state) => ({
          activeLivePostId: postId,
          posts: state.posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isLive: true,
                  liveViewers: Math.max(post.liveViewers ?? 1, 1),
                }
              : post,
          ),
        })),

      endLiveBroadcast: (postId) =>
        set((state) => ({
          activeLivePostId: state.activeLivePostId === postId ? null : state.activeLivePostId,
          posts: state.posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isLive: false,
                  liveViewers: 0,
                }
              : post,
          ),
        })),

      recordGiftTransaction: (transaction) =>
        set((state) => ({
          giftTransactions: [transaction, ...state.giftTransactions].slice(0, 80),
        })),

      debitViewerGiftBalance: (amountUsd) =>
        set((state) => ({
          viewerGiftBalanceUsd: Math.max(
            Number((state.viewerGiftBalanceUsd - Math.max(amountUsd, 0)).toFixed(2)),
            0,
          ),
        })),
    }),
    {
      name: 'orbitx-social-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        disclaimerAccepted: state.disclaimerAccepted,
        creators: state.creators,
        posts: state.posts,
        comments: state.comments,
        threads: state.threads,
        followingCreatorIds: state.followingCreatorIds,
        likedPostIds: state.likedPostIds,
        likedCommentIds: state.likedCommentIds,
        gifts: state.gifts,
        viewerGiftBalanceUsd: state.viewerGiftBalanceUsd,
        giftTransactions: state.giftTransactions,
      }),
    },
  ),
);
