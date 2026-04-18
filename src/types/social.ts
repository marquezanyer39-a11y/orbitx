export type SocialFeedTab = 'for_you' | 'following' | 'live';
export type SocialPostMediaType = 'video' | 'image';
export type SocialPostCategory = 'analysis' | 'meme' | 'news';
export type SocialGiftMediaType = 'video';
export type SocialGiftOverlayMediaType = 'video' | 'animated_image';

export interface SocialCreator {
  id: string;
  displayName: string;
  handle: string;
  avatar?: string | null;
  avatarUri?: string | null;
  bio: string;
  verified?: boolean;
  followers: number;
  following: number;
}

export interface SocialPost {
  id: string;
  authorId: string;
  mediaType: SocialPostMediaType;
  mediaUri: string;
  posterUri?: string | null;
  description: string;
  hashtags: string[];
  tokenSymbol?: string | null;
  category: SocialPostCategory;
  commentsEnabled: boolean;
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  isLive?: boolean;
  liveViewers?: number | null;
}

export interface SocialGiftOption {
  id: string;
  label: string;
  subtitle: string;
  priceUsd: number;
  mediaType: SocialGiftMediaType;
  previewAsset: number;
  overlayAsset?: number;
  overlayAssetType?: SocialGiftOverlayMediaType;
  soundAsset?: number;
}

export interface SocialGiftBurst {
  id: string;
  postId: string;
  giftId: string;
  label: string;
  priceUsd: number;
  previewAsset: number;
  overlayAsset?: number;
  overlayAssetType?: SocialGiftOverlayMediaType;
  soundAsset?: number;
  senderName: string;
  createdAt: string;
}

export interface SocialGiftTransaction {
  id: string;
  postId: string;
  giftId: string;
  senderName: string;
  priceUsd: number;
  createdAt: string;
  status: 'sent' | 'failed';
}

export interface SocialComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  body: string;
  createdAt: string;
  likes: number;
  replyToCommentId?: string | null;
}

export interface SocialMessage {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export interface SocialThread {
  id: string;
  peerId: string;
  peerName: string;
  peerHandle: string;
  peerAvatar?: string | null;
  peerAvatarUri?: string | null;
  unreadCount: number;
  messages: SocialMessage[];
}

export interface SocialComposerDraft {
  mediaType: SocialPostMediaType;
  mediaUri: string;
  posterUri?: string | null;
  description: string;
  hashtags: string[];
  tokenSymbol?: string | null;
  category: SocialPostCategory;
  commentsEnabled: boolean;
  isLive?: boolean;
  liveViewers?: number | null;
}
