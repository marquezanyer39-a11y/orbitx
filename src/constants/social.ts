import socialGiftNebula from '../../assets/social-gift-nebula.mp4';
import socialGiftInfernoLion from '../../assets/social-gift-inferno-lion.mp4';

import type {
  SocialComment,
  SocialCreator,
  SocialGiftOption,
  SocialPost,
  SocialThread,
} from '../types/social';

export const SOCIAL_DISCLAIMER =
  'El contenido publicado por usuarios no constituye asesoria financiera. OrbitX no se hace responsable por decisiones tomadas en base a este contenido.';

export const SOCIAL_CREATORS: SocialCreator[] = [
  {
    id: 'creator-nebula',
    displayName: 'Nebula Alpha',
    handle: '@nebulaalpha',
    avatar: 'N',
    bio: 'Lecturas rapidas de momentum, breakouts y flujo on-chain.',
    verified: true,
    followers: 12480,
    following: 182,
  },
  {
    id: 'creator-meme',
    displayName: 'Meme Radar',
    handle: '@memeradar',
    avatar: 'M',
    bio: 'Memes, sentimiento social y tokens que empiezan a moverse.',
    verified: true,
    followers: 8420,
    following: 91,
  },
  {
    id: 'creator-jupiter',
    displayName: 'Jupiter Flow',
    handle: '@jupiterflow',
    avatar: 'J',
    bio: 'Noticias breves, contexto macro y oportunidades de la semana.',
    followers: 5060,
    following: 131,
  },
];

export const SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'post-eth-live',
    authorId: 'creator-jupiter',
    mediaType: 'video',
    mediaUri: 'https://assets.mixkit.co/videos/preview/mixkit-stock-market-data-on-screen-32798-large.mp4',
    posterUri:
      'https://images.unsplash.com/photo-1640161704729-cbe966a08476?auto=format&fit=crop&w=1200&q=80',
    description:
      'La narrativa de ETF vuelve a encender el radar. El mercado reacciona primero en majors.',
    hashtags: ['#Macro', '#ETF', '#Noticias'],
    tokenSymbol: 'ETH',
    category: 'news',
    commentsEnabled: true,
    createdAt: '2026-04-05T10:05:00.000Z',
    likes: 303,
    comments: 27,
    shares: 11,
    isLive: true,
    liveViewers: 1284,
  },
  {
    id: 'post-btc-breakout',
    authorId: 'creator-nebula',
    mediaType: 'video',
    mediaUri: 'https://assets.mixkit.co/videos/preview/mixkit-stock-market-tracking-screen-32795-large.mp4',
    posterUri:
      'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&w=1200&q=80',
    description: 'BTC esta defendiendo una zona clave y el flujo sigue entrando con fuerza institucional.',
    hashtags: ['#BTC', '#Momentum', '#Mercado'],
    tokenSymbol: 'BTC',
    category: 'analysis',
    commentsEnabled: true,
    createdAt: '2026-04-05T09:30:00.000Z',
    likes: 942,
    comments: 84,
    shares: 31,
  },
  {
    id: 'post-pepe-sentiment',
    authorId: 'creator-meme',
    mediaType: 'image',
    mediaUri:
      'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=1200&q=80',
    posterUri:
      'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=1200&q=80',
    description: 'PEPE vuelve a capturar atencion social. El volumen aun no confirma, pero el sentimiento si.',
    hashtags: ['#PEPE', '#Memes', '#Sentimiento'],
    tokenSymbol: 'PEPE',
    category: 'meme',
    commentsEnabled: true,
    createdAt: '2026-04-05T08:10:00.000Z',
    likes: 688,
    comments: 52,
    shares: 19,
  },
  {
    id: 'post-sol-rotations',
    authorId: 'creator-nebula',
    mediaType: 'video',
    mediaUri: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-data-code-42667-large.mp4',
    posterUri:
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
    description: 'SOL mantiene rotaciones limpias. Si el funding no se recalienta, todavia tiene espacio.',
    hashtags: ['#SOL', '#Scalping', '#Altcoins'],
    tokenSymbol: 'SOL',
    category: 'analysis',
    commentsEnabled: true,
    createdAt: '2026-04-05T07:45:00.000Z',
    likes: 521,
    comments: 39,
    shares: 14,
  },
  {
    id: 'post-flash-news',
    authorId: 'creator-jupiter',
    mediaType: 'image',
    mediaUri:
      'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1200&q=80',
    posterUri:
      'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1200&q=80',
    description: 'La narrativa de ETF vuelve a encender el radar. El mercado reacciona primero en majors.',
    hashtags: ['#Macro', '#ETF', '#Noticias'],
    tokenSymbol: 'ETH',
    category: 'news',
    commentsEnabled: true,
    createdAt: '2026-04-05T06:55:00.000Z',
    likes: 302,
    comments: 27,
    shares: 11,
  },
];

export const SOCIAL_COMMENTS: SocialComment[] = [
  {
    id: 'comment-1',
    postId: 'post-btc-breakout',
    authorId: 'creator-jupiter',
    authorName: 'Jupiter Flow',
    authorHandle: '@jupiterflow',
    body: 'La estructura sigue limpia mientras no pierda el VWAP diario.',
    createdAt: '2026-04-05T09:42:00.000Z',
    likes: 12,
  },
  {
    id: 'comment-2',
    postId: 'post-btc-breakout',
    authorId: 'creator-meme',
    authorName: 'Meme Radar',
    authorHandle: '@memeradar',
    body: 'Sentimiento fuerte y memes acompanan. Buen combo si no se enfria el volumen.',
    createdAt: '2026-04-05T09:44:00.000Z',
    likes: 8,
  },
  {
    id: 'comment-3',
    postId: 'post-pepe-sentiment',
    authorId: 'creator-nebula',
    authorName: 'Nebula Alpha',
    authorHandle: '@nebulaalpha',
    body: 'Si rompe con volumen, el siguiente trigger puede ser rapido.',
    createdAt: '2026-04-05T08:26:00.000Z',
    likes: 15,
  },
];

export const SOCIAL_THREADS: SocialThread[] = [
  {
    id: 'thread-nebula',
    peerId: 'creator-nebula',
    peerName: 'Nebula Alpha',
    peerHandle: '@nebulaalpha',
    peerAvatar: 'N',
    unreadCount: 1,
    messages: [
      {
        id: 'msg-nebula-1',
        senderId: 'creator-nebula',
        body: 'Si quieres, te paso la watchlist de majors para esta semana.',
        createdAt: '2026-04-05T08:40:00.000Z',
      },
    ],
  },
  {
    id: 'thread-meme',
    peerId: 'creator-meme',
    peerName: 'Meme Radar',
    peerHandle: '@memeradar',
    peerAvatar: 'M',
    unreadCount: 0,
    messages: [
      {
        id: 'msg-meme-1',
        senderId: 'current-user',
        body: 'Avisame si ves rotacion fuerte en memes de Solana.',
        createdAt: '2026-04-04T23:10:00.000Z',
      },
      {
        id: 'msg-meme-2',
        senderId: 'creator-meme',
        body: 'Claro. Hoy estoy viendo PEPE, BONK y WIF con mas ruido social.',
        createdAt: '2026-04-04T23:15:00.000Z',
      },
    ],
  },
];

export const SOCIAL_GIFTS: SocialGiftOption[] = [
  {
    id: 'gift-inferno-lion',
    label: 'Inferno Lion',
    subtitle: 'Rugido titanico con fuego, impacto premium y entrada dominante',
    priceUsd: 10,
    mediaType: 'video',
    previewAsset: socialGiftInfernoLion,
    overlayAsset: socialGiftInfernoLion,
    overlayAssetType: 'video',
    soundAsset: socialGiftInfernoLion,
  },
  {
    id: 'gift-nebula',
    label: 'Nebula Burst',
    subtitle: 'Animacion premium para apoyar el live',
    priceUsd: 1,
    mediaType: 'video',
    previewAsset: socialGiftNebula,
    overlayAsset: socialGiftNebula,
    overlayAssetType: 'video',
    soundAsset: socialGiftNebula,
  },
];
