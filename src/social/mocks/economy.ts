import type { Notification } from '../types';

import { SOCIAL_X_IMPORTS_MOCK } from './astraInsights.mock';
import { SOCIAL_GIFTS_MOCK } from './gifts.mock';
import { SOCIAL_CREATORS_MOCK } from './socialUsers.mock';

export const SOCIAL_MOCK_GIFTS = SOCIAL_GIFTS_MOCK;

export const SOCIAL_MOCK_EARNINGS = SOCIAL_CREATORS_MOCK
  .slice(0, 1)
  .map((creator) => ({
    id: `earning-${creator.id}`,
    creatorId: creator.id,
    type: 'gift' as const,
    label: 'Creator economy earnings',
    amountUsd: creator.earningsUsd,
    createdAt: '2026-05-20T11:45:00.000Z',
  }));

export const SOCIAL_MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-follow-1',
    kind: 'follow',
    actorId: 'supporter-cryptoking',
    entityId: 'creator-whale-pro',
    title: 'Nuevo follower',
    body: 'CryptoKing_99 empezó a seguir tu perfil.',
    createdAt: '2026-05-20T10:00:00.000Z',
    read: false,
  },
  {
    id: 'notif-live-1',
    kind: 'stream_live',
    actorId: 'creator-bitqueenie',
    entityId: 'post-sol-live-bitqueenie',
    title: 'Stream demo',
    body: 'BitQueenie aparece en un live simulado analizando SOL.',
    createdAt: '2026-05-20T09:55:00.000Z',
    read: true,
  },
  {
    id: 'notif-x-import-1',
    kind: 'astra',
    entityId: SOCIAL_X_IMPORTS_MOCK[0]?.id ?? null,
    title: 'Importación X mock disponible',
    body: 'Hay contenido mock listo para enlazar con X cuando actives la integración.',
    createdAt: '2026-05-20T09:15:00.000Z',
    read: true,
  },
];
