import { z } from 'zod';

import type { AstraToolDefinition } from '../astraTool.types';

const optionalSafeText = z.string().trim().min(1).max(280).optional();

export function createAstraMockTools(): AstraToolDefinition[] {
  return [
    {
      id: 'astra.open_insight',
      label: 'Open insight',
      description: 'No-op placeholder for opening an ASTRA insight in a future UI surface.',
      category: 'astra',
      riskLevel: 'safe',
      executionMode: 'noop',
      requiresConfirmation: false,
      schema: z.object({
        insightId: z.string().trim().min(1).max(120),
      }),
    },
    {
      id: 'astra.save_note_mock',
      label: 'Save note mock',
      description: 'Mock-only note capture. Does not write backend data.',
      category: 'astra',
      riskLevel: 'safe',
      executionMode: 'mock',
      requiresConfirmation: false,
      schema: z.object({
        note: z.string().trim().min(1).max(500),
        source: optionalSafeText,
      }),
    },
    {
      id: 'astra.prepare_trade_note_mock',
      label: 'Prepare trade note mock',
      description: 'Mock-only trade note preparation without order placement.',
      category: 'trade',
      riskLevel: 'safe',
      executionMode: 'mock',
      requiresConfirmation: false,
      schema: z.object({
        symbol: z.string().trim().min(1).max(24),
        thesis: z.string().trim().min(1).max(500),
      }),
    },
    {
      id: 'web3.review_approval_mock',
      label: 'Review approval mock',
      description: 'Sensitive mock review. Does not revoke approvals or sign transactions.',
      category: 'web3',
      riskLevel: 'sensitive',
      executionMode: 'noop',
      requiresConfirmation: true,
      schema: z.object({
        chainId: z.number().int().positive(),
        tokenSymbol: z.string().trim().min(1).max(16),
        spenderLabel: z.string().trim().min(1).max(80),
      }),
    },
    {
      id: 'trade.prepare_order_mock',
      label: 'Prepare order mock',
      description: 'Sensitive mock order preparation. Does not place or sign trades.',
      category: 'trade',
      riskLevel: 'sensitive',
      executionMode: 'noop',
      requiresConfirmation: true,
      schema: z.object({
        symbol: z.string().trim().min(1).max(24),
        side: z.enum(['buy', 'sell']),
        orderType: z.enum(['market', 'limit']),
      }),
    },
  ];
}
