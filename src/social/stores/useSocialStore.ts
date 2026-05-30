import { create } from 'zustand';

import type { SocialFeedTab } from '../types';

interface SocialStoreState {
  selectedTab: SocialFeedTab;
  activePostId: string | null;
  commentsSheetOpen: boolean;
  shareModalOpen: boolean;
  selectedPostId: string | null;
  savedPostIds: string[];
  setSelectedTab: (tab: SocialFeedTab) => void;
  openCommentsSheet: (postId: string) => void;
  closeCommentsSheet: () => void;
  openShareModal: (postId: string) => void;
  closeShareModal: () => void;
  selectPost: (postId: string | null) => void;
  toggleSavedPost: (postId: string) => void;
}

export const useSocialStore = create<SocialStoreState>((set) => ({
  selectedTab: 'for_you',
  activePostId: null,
  commentsSheetOpen: false,
  shareModalOpen: false,
  selectedPostId: null,
  savedPostIds: [],
  setSelectedTab: (tab) => set({ selectedTab: tab }),
  openCommentsSheet: (postId) =>
    set({
      activePostId: postId,
      commentsSheetOpen: true,
    }),
  closeCommentsSheet: () =>
    set({
      commentsSheetOpen: false,
    }),
  openShareModal: (postId) =>
    set({
      selectedPostId: postId,
      shareModalOpen: true,
    }),
  closeShareModal: () =>
    set({
      shareModalOpen: false,
    }),
  selectPost: (postId) => set({ selectedPostId: postId }),
  toggleSavedPost: (postId) =>
    set((state) => ({
      savedPostIds: state.savedPostIds.includes(postId)
        ? state.savedPostIds.filter((item) => item !== postId)
        : [postId, ...state.savedPostIds],
    })),
}));
