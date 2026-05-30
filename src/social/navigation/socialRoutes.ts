import type { SocialScreenKey } from '../types';

export const SOCIAL_ROUTES: Record<SocialScreenKey, string> = {
  home_feed: '/social',
  live_room: '/social/live',
  creator_profile: '/social/profile',
  comments_overlay: '/social/comments/[postId]',
  create_post: '/social/create',
  stream_discovery: '/social/discovery',
  notifications: '/social/notifications',
  gift_store: '/social/gifts',
  social_wallet: '/social/wallet',
  x_connection_settings: '/social/settings/x',
};

export function buildCreatorRoute(creatorId: string) {
  return `/social/creator/${creatorId}`;
}

export function buildCommentsRoute(postId: string) {
  return `/social/comments/${postId}`;
}
