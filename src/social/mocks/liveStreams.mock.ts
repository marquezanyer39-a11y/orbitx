import { SOCIAL_POSTS } from '../../constants/social';
import type { LiveReactionTemplate, LiveStream, LiveMessage } from '../types';

export const SOCIAL_LIVE_STREAMS_MOCK: LiveStream[] = SOCIAL_POSTS.filter((post) => post.isLive).map((post) => ({
  id: post.id,
  creatorId: post.authorId,
  title: post.description,
  coverUri: post.posterUri || post.mediaUri,
  posterUri: post.posterUri || post.mediaUri,
  tokenSymbol: post.tokenSymbol ?? null,
  live: true,
  viewerCount: post.liveViewers ?? 0,
  startedAt: post.createdAt,
  tags: post.hashtags,
  giftCount: Math.max(Math.round(post.likes / 420), 12),
}));

export const SOCIAL_LIVE_CHAT_SEED_MOCK: Array<{ author: string; handle: string; body: string }> = [
  { author: 'Neo', handle: '@neoalpha', body: 'SOL se ve fortísimo hoy.' },
  { author: 'Luna', handle: '@lunax', body: 'Esa zona de $154 está limpia para breakout.' },
  { author: 'Kira', handle: '@kiraflow', body: 'Ojo con la volatilidad del cierre americano.' },
  { author: 'Mati', handle: '@maticore', body: '¿Ves confirmación o fakeout?' },
  { author: 'Dani', handle: '@danivibes', body: 'Ese glow del chart está brutal.' },
  { author: 'Sofi', handle: '@sofionchain', body: 'Astra clavó el momentum antes del spike.' },
];

export const SOCIAL_LIVE_MESSAGES_MOCK: LiveMessage[] = SOCIAL_LIVE_CHAT_SEED_MOCK.map((entry, index) => ({
  id: `live-message-${index + 1}`,
  streamId: SOCIAL_LIVE_STREAMS_MOCK[0]?.id ?? 'post-sol-live-bitqueenie',
  authorId: `${entry.handle.replace('@', '')}-${index}`,
  body: entry.body,
  createdAt: new Date(Date.now() - index * 180000).toISOString(),
  type: entry.author === 'Sofi' ? 'astra' : 'message',
}));

export const SOCIAL_LIVE_REACTION_TEMPLATES_MOCK: LiveReactionTemplate[] = [
  { icon: 'heart', color: '#FF6F8E' },
  { icon: 'flash', color: '#3FE56C' },
  { icon: 'rocket', color: '#7FE9FF' },
  { icon: 'sparkles', color: '#FFD76A' },
];

export const SOCIAL_DISCOVERY_STREAMS_MOCK = SOCIAL_LIVE_STREAMS_MOCK.map((stream, index) => ({
  ...stream,
  id: `${stream.id}-discovery-${index}`,
  title: index === 0 ? stream.title : `${stream.tokenSymbol ?? 'Crypto'} live room`,
}));
