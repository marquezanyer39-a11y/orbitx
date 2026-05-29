import { z } from 'zod';

import type { AstraToolDefinition } from '../astraTool.types';
import type { AstraLocalToolId } from './astraLocalTool.types';

const optionalContextText = z.string().trim().min(1).max(80).optional();

export function createAstraLocalTools(): AstraToolDefinition[] {
  return [
    {
      id: 'astra.mark_inbox_item_read_local',
      label: 'Mark inbox item read local',
      description: 'Marks an ASTRA inbox item as read locally without backend delivery.',
      category: 'astra',
      riskLevel: 'safe',
      executionMode: 'local',
      requiresConfirmation: false,
      schema: z.object({
        itemId: z.string().trim().min(1).max(120),
        source: optionalContextText,
        surface: z.enum(['market', 'trade', 'wallet', 'portfolio']).optional(),
      }),
    },
    {
      id: 'astra.dismiss_insight_local',
      label: 'Dismiss insight local',
      description: 'Registers a local ASTRA insight dismissal without deleting remote data.',
      category: 'astra',
      riskLevel: 'safe',
      executionMode: 'local',
      requiresConfirmation: false,
      schema: z.object({
        insightId: z.string().trim().min(1).max(120),
        source: optionalContextText,
        surface: z.enum(['market', 'trade', 'wallet', 'portfolio']).optional(),
      }),
    },
    {
      id: 'astra.save_note_local',
      label: 'Save note local',
      description: 'Stores a local sanitized note preview without backend writes.',
      category: 'astra',
      riskLevel: 'safe',
      executionMode: 'local',
      requiresConfirmation: false,
      schema: z.object({
        note: z.string().trim().min(1).max(280),
        source: optionalContextText,
        surface: z.enum(['market', 'trade', 'wallet', 'portfolio']).optional(),
      }),
    },
    {
      id: 'trade.save_order_draft_local',
      label: 'Save order draft local',
      description: 'Stores a local order draft without placing or signing a trade.',
      category: 'trade',
      riskLevel: 'safe',
      executionMode: 'local',
      requiresConfirmation: false,
      schema: z.object({
        symbol: z.string().trim().min(1).max(24),
        side: z.enum(['buy', 'sell']),
        orderType: z.enum(['market', 'limit']),
        thesis: z.string().trim().min(1).max(280).optional(),
        source: optionalContextText,
        surface: z.enum(['market', 'trade', 'wallet', 'portfolio']).optional(),
      }),
    },
    {
      id: 'astra.set_intensity_mode_local',
      label: 'Set intensity mode local',
      description: 'Stores an explicit local ASTRA intensity mode without changing remote config.',
      category: 'astra',
      riskLevel: 'safe',
      executionMode: 'local',
      requiresConfirmation: false,
      schema: z.object({
        intensityMode: z.enum(['silent', 'balanced', 'active']),
        source: optionalContextText,
      }),
    },
    {
      id: 'astra.mute_surface_local',
      label: 'Mute surface local',
      description: 'Stores a local mute preference for one ASTRA surface only.',
      category: 'astra',
      riskLevel: 'safe',
      executionMode: 'local',
      requiresConfirmation: false,
      schema: z.object({
        surface: z.enum(['market', 'trade', 'wallet', 'portfolio']),
        muted: z.boolean().default(true),
        source: optionalContextText,
      }),
    },
    {
      id: 'market.pin_asset_local',
      label: 'Pin asset local',
      description: 'Pins a market asset locally without backend watchlists or contract addresses.',
      category: 'market',
      riskLevel: 'safe',
      executionMode: 'local',
      requiresConfirmation: false,
      schema: z.object({
        assetSymbol: z.string().trim().min(1).max(24),
        source: optionalContextText,
        surface: z.enum(['market', 'trade', 'wallet', 'portfolio']).optional(),
      }),
    },
    {
      id: 'astra.pin_insight_local',
      label: 'Pin insight local',
      description: 'Pins an ASTRA insight locally without storing raw insight payloads.',
      category: 'astra',
      riskLevel: 'safe',
      executionMode: 'local',
      requiresConfirmation: false,
      schema: z.object({
        insightId: z.string().trim().min(1).max(120),
        source: optionalContextText,
        surface: z.enum(['market', 'trade', 'wallet', 'portfolio']).optional(),
      }),
    },
  ];
}

export class AstraLocalToolRegistry {
  private readonly tools = new Map<AstraLocalToolId, AstraToolDefinition>();

  constructor(initialTools: AstraToolDefinition[] = createAstraLocalTools()) {
    initialTools.forEach((tool) => {
      this.tools.set(tool.id as AstraLocalToolId, tool);
    });
  }

  get(toolId: string): AstraToolDefinition | null {
    return this.tools.get(toolId as AstraLocalToolId) ?? null;
  }

  list(): AstraToolDefinition[] {
    return Array.from(this.tools.values());
  }
}

export const astraLocalToolRegistry = new AstraLocalToolRegistry();
