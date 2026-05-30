import { useSocialStore as useOrbitxSocialStore } from '../../store/socialStore';
import { useAuthStore } from '../../store/authStore';
import { SOCIAL_CREATORS_MOCK } from '../mocks/socialUsers.mock';
import { SOCIAL_EARNINGS_STRIP_MOCK, SOCIAL_PROFILE_STATS_MOCK, SOCIAL_SUPPORTERS_MOCK } from '../mocks/socialUsers.mock';
import { SOCIAL_PROFILE_CONTENT_MOCK } from '../mocks/socialPosts.mock';
import { createMockDelay } from '../utils/createMockDelay';

function normalizeHandle(name: string, email: string) {
  const base =
    name.trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase() ||
    email.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() ||
    'qvexuser';

  return `@${base.slice(0, 16)}`;
}

export async function getCreatorProfile(creatorId?: string) {
  await createMockDelay();
  const socialState = useOrbitxSocialStore.getState();
  const authState = useAuthStore.getState();
  const currentCreator = {
    id: authState.profile.orbitId || 'current-user',
    username:
      authState.profile.handle?.replace('@', '').toLowerCase() ||
      normalizeHandle(authState.profile.name, authState.profile.email).replace('@', ''),
    displayName: authState.profile.name || 'QVEX User',
    avatarUri: authState.profile.avatarUri ?? null,
    bio: 'Mi actividad dentro de QVEX.',
    verified: authState.session.emailConfirmed,
    vipLevel: 'rising' as const,
    followers: 0,
    following: socialState.followingCreatorIds.length,
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
  const resolvedId = creatorId === 'current-user' ? currentCreator.id : creatorId;
  const mockProfile = SOCIAL_CREATORS_MOCK.find((creator) => creator.id === resolvedId);
  if (mockProfile) {
    const socialCreator = socialState.creators.find((creator) => creator.id === resolvedId);
    return socialCreator
      ? {
          ...mockProfile,
          displayName: socialCreator.displayName,
          avatarUri: socialCreator.avatarUri ?? mockProfile.avatarUri,
          bio: socialCreator.bio,
          verified: socialCreator.verified ?? mockProfile.verified,
          followers: socialCreator.followers,
          following: socialCreator.following,
        }
      : mockProfile;
  }

  return currentCreator;
}

export async function followCreator(creatorId: string) {
  await createMockDelay(120);
  useOrbitxSocialStore.getState().toggleFollowCreator(creatorId);
  return creatorId;
}

export async function getCreatorContent() {
  await createMockDelay();
  return SOCIAL_PROFILE_CONTENT_MOCK;
}

export async function getCreatorStats() {
  await createMockDelay();
  return SOCIAL_PROFILE_STATS_MOCK;
}

export async function getTopSupporters() {
  await createMockDelay();
  return SOCIAL_SUPPORTERS_MOCK;
}

export async function getCreatorEarningsStrip() {
  await createMockDelay();
  return SOCIAL_EARNINGS_STRIP_MOCK;
}
