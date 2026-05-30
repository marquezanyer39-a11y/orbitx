import { useSocialStore as useOrbitxSocialStore } from '../../store/socialStore';
import type { SocialFeedTab as LegacySocialFeedTab } from '../../types/social';
import { createMockDelay } from '../utils/createMockDelay';

export async function getFeed(tab: LegacySocialFeedTab = 'for_you') {
  await createMockDelay();
  const state = useOrbitxSocialStore.getState();
  const sorted = [...state.posts].sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  if (tab === 'live') {
    return sorted.filter((post) => post.isLive);
  }

  if (tab === 'following') {
    return sorted.filter((post) => state.followingCreatorIds.includes(post.authorId));
  }

  return sorted;
}

export async function likePost(postId: string) {
  await createMockDelay(120);
  useOrbitxSocialStore.getState().toggleLikePost(postId);
  return postId;
}

export async function sharePost(postId: string) {
  await createMockDelay(120);
  return {
    success: true,
    postId,
  };
}

export async function savePost(postId: string) {
  await createMockDelay(120);
  return {
    success: true,
    postId,
  };
}
