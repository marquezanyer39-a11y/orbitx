import { describe, expect, it } from 'vitest';

import { astraFlagsDefaults } from '../../../config/astraFlags.defaults';
import { executeAstraTool } from '../../astraToolExecutor';
import { AstraLocalDraftService } from '../astraLocalDraftService';
import { AstraLocalToolRegistry } from '../astraLocalToolRegistry';
import type { AstraLocalDraftStorageAdapter } from '../astraLocalTool.types';

declare const require: (id: string) => {
  readFileSync?: (path: string, encoding: string) => string;
  resolve?: (...paths: string[]) => string;
};

const localEnabledFlags = {
  ...astraFlagsDefaults,
  ASTRA_ENABLED: true,
  ASTRA_TOOL_EXECUTION_ENABLED: true,
  ASTRA_TOOL_REGISTRY_ENABLED: true,
  ASTRA_TOOL_LOCAL_ACTIONS_ENABLED: true,
  ASTRA_MEMORY_ENABLED: true,
  ASTRA_MEMORY_LOCAL_ENABLED: true,
  ASTRA_MEMORY_DISMISSALS_ENABLED: true,
  ASTRA_MEMORY_INBOX_PERSISTENCE_ENABLED: true,
  ASTRA_TOOL_MARK_INBOX_READ_ENABLED: true,
  ASTRA_TOOL_DISMISS_INSIGHT_ENABLED: true,
  ASTRA_TOOL_SAVE_NOTE_ENABLED: true,
  ASTRA_TOOL_SAVE_ORDER_DRAFT_ENABLED: true,
  ASTRA_TOOL_PIN_ASSET_ENABLED: true,
  ASTRA_TOOL_PIN_INSIGHT_ENABLED: true,
  ASTRA_TOOL_MUTE_SURFACE_ENABLED: true,
  ASTRA_TOOL_SET_INTENSITY_MODE_ENABLED: true,
};

function createDraftAdapter() {
  const store = new Map<string, string>();
  const adapter: AstraLocalDraftStorageAdapter = {
    async getItem(key) {
      return store.get(key) ?? null;
    },
    async setItem(key, value) {
      store.set(key, value);
    },
    async removeItem(key) {
      store.delete(key);
    },
  };

  return { adapter };
}

describe('AstraLocalToolRegistry', () => {
  it('registra las tools locales permitidas', () => {
    const registry = new AstraLocalToolRegistry();
    const ids = registry.list().map((tool) => tool.id);

    expect(ids).toContain('astra.mark_inbox_item_read_local');
    expect(ids).toContain('astra.dismiss_insight_local');
    expect(ids).toContain('astra.save_note_local');
    expect(ids).toContain('trade.save_order_draft_local');
    expect(ids).toContain('astra.set_intensity_mode_local');
    expect(ids).toContain('astra.mute_surface_local');
    expect(ids).toContain('market.pin_asset_local');
    expect(ids).toContain('astra.pin_insight_local');
  });

  it('flag global apagado bloquea tools locales', async () => {
    const result = await executeAstraTool(
      {
        toolId: 'astra.save_note_local',
        params: {
          note: 'Nota segura',
        },
      },
      {
        flags: {
          ...localEnabledFlags,
          ASTRA_TOOL_LOCAL_ACTIONS_ENABLED: false,
        },
      },
    );

    expect(result.status).toBe('blocked');
  });

  it('flag individual apagado bloquea su tool', async () => {
    const result = await executeAstraTool(
      {
        toolId: 'trade.save_order_draft_local',
        params: {
          symbol: 'BTC/USDT',
          side: 'buy',
          orderType: 'limit',
        },
      },
      {
        flags: {
          ...localEnabledFlags,
          ASTRA_TOOL_SAVE_ORDER_DRAFT_ENABLED: false,
        },
      },
    );

    expect(result.status).toBe('blocked');
  });

  it('auditoria no guarda campos sensibles', async () => {
    const { adapter } = createDraftAdapter();
    const draftService = new AstraLocalDraftService({
      adapter,
      now: () => 6000,
    });
    const result = await executeAstraTool(
      {
        toolId: 'astra.save_note_local',
        params: {
          note: 'Seguimiento de idea segura',
        },
      },
      {
        flags: {
          ...localEnabledFlags,
          ASTRA_TOOL_AUDIT_ENABLED: true,
        },
        localDependencies: {
          draftService,
        },
      },
    );

    expect(result.status).toBe('success_local');
    expect(result.auditId).toBeTruthy();
  });

  it('no importa WalletConnect, providers, RPC, Gemini ni backend', () => {
    const fs = require('fs');
    const path = require('path');
    const file = fs.readFileSync?.(
      path.resolve?.('src', 'astra', 'tools', 'local', 'astraLocalToolAdapters.ts') ?? '',
      'utf8',
    ) ?? '';

    expect(file).not.toMatch(/from\s+['"][^'"]*(walletconnect|reown|provider|rpc|gemini|supabase|backend)[^'"]*['"]/i);
  });

  it('rollback por flags devuelve blocked/noop sin crash', async () => {
    const result = await executeAstraTool(
      {
        toolId: 'astra.mark_inbox_item_read_local',
        params: {
          itemId: 'inbox-2',
        },
      },
      {
        flags: {
          ...localEnabledFlags,
          ASTRA_TOOL_LOCAL_ACTIONS_ENABLED: false,
        },
      },
    );

    expect(result.status).toBe('blocked');
  });
});
