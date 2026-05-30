import { SOCIAL_POSTS } from '../../constants/social';
import type { CreatorContentItem, SocialContentPost, SocialFeedTab } from '../types';

export const SOCIAL_HOME_TABS_MOCK: Array<{ key: SocialFeedTab; label: string }> = [
  { key: 'for_you', label: 'Para ti' },
  { key: 'following', label: 'Siguiendo' },
  { key: 'live', label: 'Lives' },
  { key: 'ai', label: 'AI ✨' },
  { key: 'memecoins', label: 'Memecoins' },
  { key: 'trading', label: 'Trading' },
];

export const SOCIAL_POSTS_MOCK: SocialContentPost[] = SOCIAL_POSTS.map((post) => ({
  id: post.id,
  authorId: post.authorId,
  kind: post.isLive ? 'clip' : post.category === 'analysis' ? 'trade' : 'post',
  category:
    post.category === 'analysis'
      ? 'analysis'
      : post.category === 'meme'
        ? 'meme'
        : 'news',
  mediaUri: post.mediaUri,
  posterUri: post.posterUri ?? null,
  title: post.tokenSymbol ? `${post.tokenSymbol} spotlight` : undefined,
  description: post.description,
  hashtags: post.hashtags,
  tokenSymbol: post.tokenSymbol ?? null,
  likeCount: post.likes,
  commentCount: post.comments,
  shareCount: post.shares,
  createdAt: post.createdAt,
  pinned: Boolean(post.isLive),
}));

export const SOCIAL_PROFILE_TABS_MOCK: Array<{ key: string; label: string }> = [
  { key: 'posts', label: 'Posts' },
  { key: 'streams', label: 'Streams' },
  { key: 'clips', label: 'Clips' },
  { key: 'trades', label: 'Trades' },
  { key: 'ai', label: 'AI' },
  { key: 'likes', label: 'Likes' },
] ;

export const SOCIAL_PROFILE_CONTENT_MOCK: Record<string, CreatorContentItem[]> = {
  posts: [
    {
      id: 'post-live-btc',
      kind: 'live',
      title: 'Analizando el breakout de BTC en live demo',
      subtitle: 'LIVE DEMO',
      imageUri: 'https://images.unsplash.com/photo-1640161704729-cbe966a08476?auto=format&fit=crop&w=1200&q=90',
      badge: 'LIVE DEMO',
      metric: '4.2k',
    },
    {
      id: 'post-signal-eth',
      kind: 'signal',
      title: '$ETH / USDT Setup',
      body: 'Niveles de acumulación detectados en $2,420. RSI indicando divergencia alcista en 4H.',
      accentValue: '78.4%',
    },
    {
      id: 'post-clip-gas',
      kind: 'clip',
      title: 'Por qué el Gas de ETH bajará',
      subtitle: 'Clips',
      imageUri: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=900&q=80',
      metric: 'Play',
    },
  ],
  streams: [
    {
      id: 'stream-btc',
      kind: 'live',
      title: 'Macro desk: BTC vs DXY',
      subtitle: 'Streams',
      imageUri: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=90',
      badge: 'STREAM',
      metric: '11.8k',
    },
    {
      id: 'stream-sol',
      kind: 'clip',
      title: 'Solana momentum room',
      subtitle: 'Replay',
      imageUri: 'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&w=900&q=90',
      metric: '8.3k',
    },
  ],
  clips: [
    {
      id: 'clip-1',
      kind: 'clip',
      title: 'Entrada rápida en ETH',
      subtitle: 'Clip',
      imageUri: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
      metric: 'Play',
    },
    {
      id: 'clip-2',
      kind: 'clip',
      title: 'Riesgo antes de FOMC',
      subtitle: 'Clip',
      imageUri: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80',
      metric: 'Play',
    },
    {
      id: 'clip-3',
      kind: 'clip',
      title: 'Setup mental para scalping',
      subtitle: 'Clip',
      imageUri: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80',
      metric: 'Play',
    },
  ],
  trades: [
    {
      id: 'trade-1',
      kind: 'signal',
      title: '$SOL breakout journal',
      body: 'Entrada progresiva sobre resistencia rota. Gestión defensiva mientras el funding sigue estable.',
      accentValue: '86.1%',
    },
    {
      id: 'trade-2',
      kind: 'clip',
      title: 'Trade recap: PEPE swing',
      subtitle: 'Trade recap',
      imageUri: 'https://images.unsplash.com/photo-1642052502725-cd1fe2af67d0?auto=format&fit=crop&w=900&q=80',
      metric: '2.4k',
    },
  ],
  ai: [
    {
      id: 'ai-1',
      kind: 'signal',
      title: 'Astra Creator Layer',
      body: 'Las señales de este creator están generando +27% más retención cuando combina macro con setup táctico.',
      accentValue: 'A+',
    },
    {
      id: 'ai-2',
      kind: 'clip',
      title: 'Insight corto sobre rotación L2',
      subtitle: 'AI highlight',
      imageUri: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
      metric: '1.1k',
    },
  ],
  likes: [
    {
      id: 'like-1',
      kind: 'clip',
      title: 'Loved clip: market psychology',
      subtitle: 'Liked',
      imageUri: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80',
      metric: 'Saved',
    },
    {
      id: 'like-2',
      kind: 'clip',
      title: 'Liquidity map breakdown',
      subtitle: 'Liked',
      imageUri: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
      metric: 'Saved',
    },
  ],
};

export const SOCIAL_CREATE_POST_CATEGORIES: Array<{ key: 'analysis' | 'meme' | 'news'; label: string }> = [
  { key: 'analysis', label: 'Analisis' },
  { key: 'meme', label: 'Meme' },
  { key: 'news', label: 'Noticia' },
];
