import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useSocialFeed as useLegacySocialFeed } from '../../hooks/useSocialFeed';
import type { SocialFeedTab as LegacySocialFeedTab, SocialPost } from '../../types/social';
import { SOCIAL_FEED_ASTRA_INSIGHTS_MOCK } from '../mocks/astraInsights.mock';
import { SOCIAL_HOME_TABS_MOCK } from '../mocks/socialPosts.mock';
import { useSocialStore } from '../stores/useSocialStore';
import * as socialFeedService from '../services/socialFeedService';
import type { SocialFeedTab } from '../types';

function mapToLegacyTab(tab: SocialFeedTab): LegacySocialFeedTab {
  if (tab === 'following') return 'following';
  if (tab === 'live') return 'live';
  return 'for_you';
}

function filterPostsForTab(posts: SocialPost[], tab: SocialFeedTab) {
  if (tab === 'memecoins') {
    return posts.filter(
      (post) => post.category === 'meme' || ['PEPE', 'BONK', 'WIF'].includes(post.tokenSymbol ?? ''),
    );
  }

  if (tab === 'trading') {
    return posts.filter((post) => post.category === 'analysis');
  }

  if (tab === 'ai') {
    return posts.filter((post) => post.category === 'analysis' || Boolean(post.tokenSymbol));
  }

  return posts;
}

export function useSocialFeed(initialTab: SocialFeedTab = 'for_you') {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const initializedTab = useRef<SocialFeedTab | null>(null);
  const selectedTab = useSocialStore((state) => state.selectedTab);
  const setSelectedTab = useSocialStore((state) => state.setSelectedTab);
  const openCommentsSheet = useSocialStore((state) => state.openCommentsSheet);
  const openShareModal = useSocialStore((state) => state.openShareModal);
  const toggleSavedPost = useSocialStore((state) => state.toggleSavedPost);
  const savedPostIds = useSocialStore((state) => state.savedPostIds);

  useEffect(() => {
    if (initializedTab.current !== initialTab) {
      initializedTab.current = initialTab;
      setSelectedTab(initialTab);
    }
  }, [initialTab, setSelectedTab]);

  const legacy = useLegacySocialFeed(mapToLegacyTab(selectedTab));
  const feedItems = useMemo(
    () => filterPostsForTab(legacy.posts, selectedTab),
    [legacy.posts, selectedTab],
  );

  const refreshFeed = useCallback(async () => {
    setRefreshing(true);
    try {
      await socialFeedService.getFeed(mapToLegacyTab(selectedTab));
    } finally {
      setRefreshing(false);
    }
  }, [selectedTab]);

  const likePost = useCallback(async (postId: string) => {
    setLoading(true);
    try {
      await socialFeedService.likePost(postId);
    } finally {
      setLoading(false);
    }
  }, []);

  const sharePost = useCallback(async (postId: string) => {
    openShareModal(postId);
    return socialFeedService.sharePost(postId);
  }, [openShareModal]);

  const savePost = useCallback(async (postId: string) => {
    toggleSavedPost(postId);
    return socialFeedService.savePost(postId);
  }, [toggleSavedPost]);

  const getAstraInsight = useCallback((post: SocialPost) => {
    const symbol = post.tokenSymbol?.replace('$', '').toUpperCase() ?? '';
    return (
      SOCIAL_FEED_ASTRA_INSIGHTS_MOCK[symbol] ??
      'Astra detecta aumento de atención social y momentum técnico. Espera confirmación antes de actuar.'
    );
  }, []);

  return {
    loading,
    refreshing,
    selectedTab,
    tabs: SOCIAL_HOME_TABS_MOCK,
    feedItems,
    savedPostIds,
    refreshFeed,
    likePost,
    sharePost,
    savePost,
    changeTab: setSelectedTab,
    openCommentsSheet,
    getAstraInsight,
    ...legacy,
  };
}
