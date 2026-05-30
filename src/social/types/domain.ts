export type ExternalPlatform = 'orbitx' | 'x' | 'discord' | 'telegram';
export type SocialFeedKind = 'post' | 'stream' | 'clip' | 'trade' | 'ai';
export type SocialPostCategory = 'analysis' | 'meme' | 'news' | 'education' | 'trade';
export type ReactionKind = 'like' | 'rocket' | 'fire' | 'gift' | 'astra';
export type CreatorLevel = 'rising' | 'verified' | 'vip' | 'legend';
export type NotificationKind =
  | 'follow'
  | 'comment'
  | 'reply'
  | 'like'
  | 'gift'
  | 'stream_live'
  | 'astra'
  | 'trade_share';

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUri?: string | null;
  bio?: string;
  vipLevel?: CreatorLevel;
  verified?: boolean;
}

export interface ExternalAccount {
  id: string;
  platform: ExternalPlatform;
  username: string;
  connected: boolean;
  importedFollowers?: number;
  lastSyncAt?: string | null;
}

export interface CreatorProfile extends User {
  bannerUri?: string | null;
  followers: number;
  following: number;
  totalLikes: number;
  creatorLevel: CreatorLevel;
  supporterCount: number;
  streamCount: number;
  clipCount: number;
  engagementRate: number;
  winRate?: number | null;
  giftsReceivedUsd: number;
  earningsUsd: number;
  activeExternalAccounts: ExternalAccount[];
}

export interface Reaction {
  id: string;
  type: ReactionKind;
  actorId: string;
  createdAt: string;
}

export interface AstraInsight {
  id: string;
  targetId: string;
  targetType: 'feed' | 'stream' | 'profile' | 'comments';
  title: string;
  body: string;
  confidence?: number;
  sentiment?: 'bullish' | 'neutral' | 'bearish';
  createdAt: string;
}

export interface SocialPost {
  id: string;
  authorId: string;
  kind: Extract<SocialFeedKind, 'post' | 'clip' | 'trade' | 'ai'>;
  category: SocialPostCategory;
  mediaUri?: string | null;
  posterUri?: string | null;
  title?: string;
  description: string;
  hashtags: string[];
  tokenSymbol?: string | null;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: string;
  pinned?: boolean;
}

export interface Comment {
  id: string;
  entityId: string;
  entityType: 'post' | 'stream' | 'clip';
  authorId: string;
  body: string;
  createdAt: string;
  likeCount: number;
  replyToCommentId?: string | null;
  highlighted?: boolean;
}

export interface StreamMessage {
  id: string;
  streamId: string;
  authorId: string;
  body: string;
  createdAt: string;
  type: 'message' | 'system' | 'astra';
}

export interface Stream {
  id: string;
  creatorId: string;
  title: string;
  coverUri: string;
  posterUri?: string | null;
  tokenSymbol?: string | null;
  live: boolean;
  viewerCount: number;
  startedAt: string;
  tags: string[];
  giftCount: number;
}

export interface Gift {
  id: string;
  name: string;
  subtitle: string;
  priceUsd: number;
  rarity: 'core' | 'premium' | 'legendary';
  previewAsset?: string | number;
}

export interface CreatorEarning {
  id: string;
  creatorId: string;
  type: 'gift' | 'tip' | 'subscription' | 'referral';
  label: string;
  amountUsd: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  kind: NotificationKind;
  actorId?: string | null;
  entityId?: string | null;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface FeedItem {
  id: string;
  kind: SocialFeedKind;
  creatorId: string;
  title?: string;
  description: string;
  coverUri?: string | null;
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    viewers?: number;
  };
  createdAt: string;
  tokenSymbol?: string | null;
  tags: string[];
}
