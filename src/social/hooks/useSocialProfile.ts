import { useCallback, useEffect, useState } from 'react';

import { useSocialFeed as useLegacySocialFeed } from '../../hooks/useSocialFeed';
import { SOCIAL_PROFILE_ASTRA_INSIGHT_MOCK } from '../mocks/astraInsights.mock';
import { SOCIAL_PROFILE_TABS_MOCK } from '../mocks/socialPosts.mock';
import * as profileService from '../services/profileService';
import { useCreatorStore } from '../stores/useCreatorStore';
import type { CreatorContentItem, CreatorStat, CreatorSupporter, SocialCreatorProfile } from '../types';

export function useSocialProfile(creatorId?: string | null) {
  const legacy = useLegacySocialFeed();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<SocialCreatorProfile | null>(null);
  const [content, setContent] = useState<Record<string, CreatorContentItem[]>>({});
  const [stats, setStats] = useState<CreatorStat[]>([]);
  const [supporters, setSupporters] = useState<CreatorSupporter[]>([]);
  const [earningsStrip, setEarningsStrip] = useState<Array<{ label: string; value: string }>>([]);
  const setActiveProfileId = useCreatorStore((state) => state.setActiveProfileId);
  const setFollowingState = useCreatorStore((state) => state.setFollowingState);
  const setSupportersState = useCreatorStore((state) => state.setSupporters);

  const resolvedCreatorId =
    creatorId === 'current-user' ? legacy.currentCreator.id : creatorId ?? 'creator-whale-pro';
  const activeProfile = profile ?? {
    id: legacy.currentCreator.id,
    username: legacy.currentCreator.handle.replace('@', ''),
    displayName: legacy.currentCreator.displayName,
    avatarUri: legacy.currentCreator.avatarUri ?? null,
    bio: legacy.currentCreator.bio,
    verified: legacy.currentCreator.verified,
    vipLevel: 'rising' as const,
    followers: 0,
    following: legacy.currentCreator.following,
    totalLikes: 0,
    creatorLevel: 'rising' as const,
    supporterCount: 0,
    streamCount: 0,
    clipCount: 0,
    engagementRate: 0,
    winRate: null,
    giftsReceivedUsd: 0,
    earningsUsd: 0,
    activeExternalAccounts: [],
  };
  const isFollowing = legacy.followingCreatorIds.includes(activeProfile.id);

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      setLoading(true);
      try {
        const [nextProfile, nextContent, nextStats, nextSupporters, nextEarnings] = await Promise.all([
          profileService.getCreatorProfile(resolvedCreatorId),
          profileService.getCreatorContent(),
          profileService.getCreatorStats(),
          profileService.getTopSupporters(),
          profileService.getCreatorEarningsStrip(),
        ]);

        if (!cancelled) {
          setProfile(nextProfile);
          setContent(nextContent);
          setStats(nextStats);
          setSupporters(nextSupporters);
          setSupportersState(nextSupporters);
          setEarningsStrip([...nextEarnings]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    setActiveProfileId(resolvedCreatorId);
    void loadAll();

    return () => {
      cancelled = true;
    };
  }, [resolvedCreatorId, setActiveProfileId, setSupportersState]);

  const follow = useCallback(async () => {
    await profileService.followCreator(activeProfile.id);
    setFollowingState(activeProfile.id, !isFollowing);
  }, [activeProfile.id, isFollowing, setFollowingState]);

  const shareProfile = useCallback(async () => activeProfile.id, [activeProfile.id]);

  return {
    loading,
    profile: activeProfile,
    content,
    stats,
    supporters,
    earningsStrip,
    tabs: SOCIAL_PROFILE_TABS_MOCK,
    isFollowing,
    astraInsight: SOCIAL_PROFILE_ASTRA_INSIGHT_MOCK,
    follow,
    shareProfile,
    threads: legacy.threads,
    currentCreator: legacy.currentCreator,
    ensureThreadWithCreator: legacy.ensureThreadWithCreator,
  };
}
