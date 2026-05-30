import type { SocialComment } from '../../../types/social';
import {
  SOCIAL_MOCK_COMMENTS,
  SOCIAL_MOCK_CREATORS,
  SOCIAL_MOCK_EARNINGS,
  SOCIAL_MOCK_FEED_ITEMS,
  SOCIAL_MOCK_GIFTS,
  SOCIAL_MOCK_NOTIFICATIONS,
  SOCIAL_MOCK_STREAM_MESSAGES,
  SOCIAL_MOCK_STREAMS,
} from '../../mocks';
import type {
  Comment,
  CreatorEarning,
  CreatorProfile,
  ExternalAccount,
  StreamMessage,
} from '../../types';
import type {
  SocialEconomyServiceContract,
  SocialExternalAccountServiceContract,
  SocialFeedServiceContract,
  SocialLiveServiceContract,
  SocialNotificationsServiceContract,
} from '../contracts/socialContracts';

export const socialMockGateway: SocialFeedServiceContract &
  SocialLiveServiceContract &
  SocialEconomyServiceContract &
  SocialExternalAccountServiceContract &
  SocialNotificationsServiceContract = {
  async getFeed() {
    return SOCIAL_MOCK_FEED_ITEMS;
  },
  async getCreatorProfiles() {
    return SOCIAL_MOCK_CREATORS;
  },
  async getComments(entityId) {
    return SOCIAL_MOCK_COMMENTS.filter((comment: SocialComment) => comment.postId === entityId).map<Comment>((comment) => ({
      id: comment.id,
      entityId: comment.postId,
      entityType: 'post',
      authorId: comment.authorId,
      body: comment.body,
      createdAt: comment.createdAt,
      likeCount: comment.likes,
      replyToCommentId: comment.replyToCommentId ?? null,
      highlighted: false,
    }));
  },
  async getLiveStreams() {
    return SOCIAL_MOCK_STREAMS;
  },
  async getStreamMessages(streamId) {
    return SOCIAL_MOCK_STREAM_MESSAGES.filter((message: StreamMessage) => message.streamId === streamId);
  },
  async getGiftCatalog() {
    return SOCIAL_MOCK_GIFTS;
  },
  async getCreatorEarnings(creatorId) {
    return SOCIAL_MOCK_EARNINGS.filter((earning: CreatorEarning) => earning.creatorId === creatorId);
  },
  async getExternalAccounts(userId) {
    const creator = SOCIAL_MOCK_CREATORS.find((item: CreatorProfile) => item.id === userId);
    return creator?.activeExternalAccounts ?? [];
  },
  async getXConnectionStatus(userId) {
    const creator = SOCIAL_MOCK_CREATORS.find((item: CreatorProfile) => item.id === userId);
    if (!creator?.activeExternalAccounts.some((account: ExternalAccount) => account.platform === 'x' && account.connected)) {
      return 'not_connected';
    }

    return 'connected';
  },
  async getNotifications() {
    return SOCIAL_MOCK_NOTIFICATIONS;
  },
};
