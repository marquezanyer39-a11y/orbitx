import type { Comment, FeedItem, Notification, Reaction, SocialPost, User } from './domain';

export type SocialFeedTab = 'for_you' | 'following' | 'live' | 'ai' | 'memecoins' | 'trading';

export type SocialRouteName =
  | 'social_home'
  | 'live_room'
  | 'social_profile'
  | 'comments_overlay'
  | 'create_post'
  | 'stream_discovery'
  | 'social_notifications'
  | 'gift_store'
  | 'social_wallet'
  | 'x_connection_settings';

export type SocialUser = User;
export type SocialFeedItem = FeedItem;
export type SocialReaction = Reaction;
export type SocialComment = Comment;
export type SocialNotification = Notification;
export type SocialContentPost = SocialPost;
