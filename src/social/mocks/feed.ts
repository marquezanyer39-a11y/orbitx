import type { FeedItem } from '../types';

import { SOCIAL_POSTS_MOCK } from './socialPosts.mock';

export const SOCIAL_MOCK_POSTS = SOCIAL_POSTS_MOCK;

export const SOCIAL_MOCK_FEED_ITEMS: FeedItem[] = SOCIAL_POSTS_MOCK.map((post) => ({
  id: post.id,
  kind: post.kind,
  creatorId: post.authorId,
  title: post.title,
  description: post.description,
  coverUri: post.posterUri ?? post.mediaUri ?? null,
  metrics: {
    likes: post.likeCount,
    comments: post.commentCount,
    shares: post.shareCount,
  },
  createdAt: post.createdAt,
  tokenSymbol: post.tokenSymbol,
  tags: post.hashtags,
}));
