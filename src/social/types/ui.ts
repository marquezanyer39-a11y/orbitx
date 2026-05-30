import type { SocialFeedKind } from './domain';

export type SocialScreenKey =
  | 'home_feed'
  | 'live_room'
  | 'creator_profile'
  | 'comments_overlay'
  | 'create_post'
  | 'stream_discovery'
  | 'notifications'
  | 'gift_store'
  | 'social_wallet'
  | 'x_connection_settings';

export type SocialOverlayKey =
  | 'comments'
  | 'share'
  | 'creator_profile'
  | 'astra'
  | 'gift_store'
  | 'trade_share'
  | null;

export interface SocialNavItem {
  key: string;
  label: string;
  icon: string;
}

export interface SocialTabItem {
  key: string;
  label: string;
  kind?: SocialFeedKind;
}

export interface SocialModuleSection {
  id: string;
  title: string;
  description: string;
}
