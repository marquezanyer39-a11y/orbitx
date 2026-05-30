import type {
  Comment,
  CreatorEarning,
  CreatorProfile,
  ExternalAccount,
  FeedItem,
  Gift,
  Notification,
  Stream,
  StreamMessage,
} from '../../types';

export interface SocialFeedServiceContract {
  getFeed(): Promise<FeedItem[]>;
  getCreatorProfiles(): Promise<CreatorProfile[]>;
  getComments(entityId: string): Promise<Comment[]>;
}

export interface SocialLiveServiceContract {
  getLiveStreams(): Promise<Stream[]>;
  getStreamMessages(streamId: string): Promise<StreamMessage[]>;
}

export interface SocialEconomyServiceContract {
  getGiftCatalog(): Promise<Gift[]>;
  getCreatorEarnings(creatorId: string): Promise<CreatorEarning[]>;
}

export interface SocialExternalAccountServiceContract {
  getExternalAccounts(userId: string): Promise<ExternalAccount[]>;
  getXConnectionStatus(userId: string): Promise<'not_connected' | 'connected' | 'sync_pending'>;
}

export interface SocialNotificationsServiceContract {
  getNotifications(): Promise<Notification[]>;
}
