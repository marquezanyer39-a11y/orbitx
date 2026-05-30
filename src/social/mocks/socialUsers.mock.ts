import { SOCIAL_CREATORS } from '../../constants/social';
import type { CreatorStat, CreatorSupporter, SocialCreatorProfile } from '../types';

export const SOCIAL_CREATORS_MOCK: SocialCreatorProfile[] = [
  {
    id: 'creator-whale-pro',
    username: 'cryptowhalepro',
    displayName: 'CryptoWhale Pro',
    avatarUri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=480&q=80',
    bannerUri: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=90',
    bio: 'Perfil creator demo para QA visual de QVEX Social.',
    verified: true,
    vipLevel: 'vip',
    followers: 1200000,
    following: 450,
    totalLikes: 8500000,
    creatorLevel: 'legend',
    supporterCount: 2100,
    streamCount: 328,
    clipCount: 912,
    engagementRate: 14.8,
    winRate: 78.4,
    giftsReceivedUsd: 184000,
    earningsUsd: 241000,
    activeExternalAccounts: [
      {
        id: 'ext-x-creator-whale-pro',
        platform: 'x',
        username: '@CryptoWhale_Pro',
        connected: false,
      },
    ],
  },
  ...SOCIAL_CREATORS.map((creator) => ({
    id: creator.id,
    username: creator.handle.replace('@', '').toLowerCase(),
    displayName: creator.displayName,
    avatarUri: creator.avatarUri ?? null,
    bio: creator.bio,
    verified: creator.verified ?? false,
    vipLevel: creator.verified ? ('verified' as const) : ('rising' as const),
    followers: creator.followers,
    following: creator.following,
    totalLikes: creator.followers * 4,
    creatorLevel: creator.verified ? ('vip' as const) : ('rising' as const),
    supporterCount: Math.max(Math.round(creator.followers / 120), 18),
    streamCount: Math.max(Math.round(creator.followers / 600), 8),
    clipCount: Math.max(Math.round(creator.followers / 220), 21),
    engagementRate: 11.3,
    winRate: creator.id === 'creator-bitqueenie' ? 72.5 : null,
    giftsReceivedUsd: creator.followers * 0.42,
    earningsUsd: creator.followers * 0.76,
    activeExternalAccounts: [],
  })),
];

export const SOCIAL_PROFILE_STATS_MOCK: CreatorStat[] = [
  { label: 'STREAMS DEMO', value: '328 demo' },
  { label: 'CLIPS DEMO', value: '912 demo' },
  { label: 'ENGAGEMENT DEMO', value: '14.8% demo' },
  { label: 'WIN RATE DEMO', value: '78.4% demo' },
  { label: 'SUPPORTERS DEMO', value: '2.1k demo' },
  { label: 'GIFTS DEMO', value: '184 ETH demo' },
];

export const SOCIAL_SUPPORTERS_MOCK: CreatorSupporter[] = [
  {
    id: 'supporter-1',
    name: 'CryptoKing_99',
    avatarUri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80',
    valueLabel: '12.4 ETH demo',
    badge: 'Whale supporter demo',
  },
  {
    id: 'supporter-2',
    name: 'MoonGirl_Trading',
    avatarUri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80',
    valueLabel: '8.1 ETH demo',
    badge: 'Alpha ally demo',
  },
  {
    id: 'supporter-3',
    name: 'ZeroHash',
    avatarUri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
    valueLabel: '4.5 ETH demo',
    badge: 'Early backer demo',
  },
];

export const SOCIAL_EARNINGS_STRIP_MOCK = [
  { label: 'Regalos demo', value: '184 ETH demo' },
  { label: 'Propinas demo', value: '$82.4k demo' },
  { label: 'Earnings demo', value: '$241k demo' },
  { label: 'Supporters demo', value: '388 demo' },
] as const;
