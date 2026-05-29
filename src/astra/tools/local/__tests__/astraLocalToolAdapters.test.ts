import { describe, expect, it } from 'vitest';

import { astraFlagsDefaults } from '../../../config/astraFlags.defaults';
import { AstraMemoryService } from '../../../memory/astraMemoryService';
import type { AstraMemoryStorageAdapter } from '../../../memory/astraMemory.types';
import type { AstraNotificationIntent } from '../../../notifications/astraNotification.types';
import { AstraLocalDraftService } from '../astraLocalDraftService';
import { AstraLocalPreferenceService } from '../astraLocalPreferenceService';
import { executeAstraLocalTool } from '../astraLocalToolAdapters';
import type { AstraLocalDraftStorageAdapter } from '../astraLocalTool.types';
import type { AstraLocalPreferenceStorageAdapter } from '../astraLocalPreferenceService';

function createMemoryAdapter() {
  const store = new Map<string, string>();
  const adapter: AstraMemoryStorageAdapter = {
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

function createPreferenceAdapter() {
  const store = new Map<string, string>();
  const adapter: AstraLocalPreferenceStorageAdapter = {
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

function createEnabledFlags() {
  return {
    ...astraFlagsDefaults,
    ASTRA_ENABLED: true,
    ASTRA_TOOL_EXECUTION_ENABLED: true,
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
}

describe('executeAstraLocalTool', () => {
  it('mark_inbox_item_read_local escribe solo read state local', async () => {
    const { adapter } = createMemoryAdapter();
    const memoryService = new AstraMemoryService({
      adapter,
      getFlags: createEnabledFlags,
      now: () => 1000,
    });

    const intent: AstraNotificationIntent = {
      id: 'inbox-1',
      key: 'inbox-1',
      title: 'Hola',
      body: 'Mensaje',
      delivery: 'in_app',
      eventType: 'market',
      displayMode: 'ambient',
      tone: 'neutral',
      severity: 'info',
      createdAt: '2026-01-01T00:00:00.000Z',
      expiresAt: '2026-01-02T00:00:00.000Z',
      sourceEventId: 'event-1',
    };

    await memoryService.saveInboxIntent(intent);
    const result = await executeAstraLocalTool(
      'astra.mark_inbox_item_read_local',
      {
        itemId: 'inbox-1',
        source: 'astra',
        surface: 'market',
      },
      {
        memoryService,
        getFlags: createEnabledFlags,
      },
    );

    const state = await memoryService.loadState();
    expect(result.status).toBe('success_local');
    expect(state.inbox[0]?.read).toBe(true);
    expect(result.auditParams.itemId).toBe('inbox-1');
  });

  it('dismiss_insight_local registra dismissal sanitizado', async () => {
    const { adapter } = createMemoryAdapter();
    const memoryService = new AstraMemoryService({
      adapter,
      getFlags: createEnabledFlags,
      now: () => 2000,
    });

    const result = await executeAstraLocalTool(
      'astra.dismiss_insight_local',
      {
        insightId: 'insight-42',
        source: 'astra',
        surface: 'trade',
      },
      {
        memoryService,
        getFlags: createEnabledFlags,
        now: () => 2000,
      },
    );

    const state = await memoryService.loadState();
    expect(result.status).toBe('success_local');
    expect(state.dismissals).toHaveLength(1);
    expect(result.auditParams.insightId).toBe('insight-42');
  });

  it('save_note_local guarda nota segura', async () => {
    const { adapter } = createDraftAdapter();
    const draftService = new AstraLocalDraftService({
      adapter,
      now: () => 3000,
    });

    const result = await executeAstraLocalTool(
      'astra.save_note_local',
      {
        note: 'Revisar 0x1234567890abcdef1234567890abcdef12345678 en la siguiente sesion.',
        source: 'astra',
        surface: 'wallet',
      },
      {
        draftService,
        getFlags: createEnabledFlags,
      },
    );

    const state = await draftService.loadState();
    expect(result.status).toBe('success_local');
    expect(state.notes).toHaveLength(1);
    expect(state.notes[0]?.preview).toContain('0x1234...5678');
    expect(result.auditParams.notePreview).not.toContain('0x1234567890abcdef1234567890abcdef12345678');
  });

  it('save_note_local bloquea secretos', async () => {
    const { adapter } = createDraftAdapter();
    const draftService = new AstraLocalDraftService({
      adapter,
      now: () => 4000,
    });

    const result = await executeAstraLocalTool(
      'astra.save_note_local',
      {
        note: 'Mi private key es secret-123',
        source: 'astra',
        surface: 'wallet',
      },
      {
        draftService,
        getFlags: createEnabledFlags,
      },
    );

    const state = await draftService.loadState();
    expect(result.status).toBe('blocked');
    expect(state.notes).toHaveLength(0);
  });

  it('save_order_draft_local guarda draft local y no ejecuta orden', async () => {
    const { adapter } = createDraftAdapter();
    const draftService = new AstraLocalDraftService({
      adapter,
      now: () => 5000,
    });

    const result = await executeAstraLocalTool(
      'trade.save_order_draft_local',
      {
        symbol: 'sol/usdt',
        side: 'buy',
        orderType: 'limit',
        thesis: 'Esperar confirmacion por encima de 150.',
        source: 'astra',
        surface: 'trade',
      },
      {
        draftService,
        getFlags: createEnabledFlags,
      },
    );

    const state = await draftService.loadState();
    expect(result.status).toBe('success_local');
    expect(state.orderDrafts[0]?.symbol).toBe('SOL/USDT');
    expect(state.orderDrafts[0]?.isRealExecution).toBe(false);
    expect(result.message).toContain('No real trade');
  });

  it('set_intensity_mode_local actualiza solo intensityMode local', async () => {
    const { adapter } = createMemoryAdapter();
    const memoryService = new AstraMemoryService({
      adapter,
      getFlags: createEnabledFlags,
      now: () => 6000,
    });

    const result = await executeAstraLocalTool(
      'astra.set_intensity_mode_local',
      {
        intensityMode: 'silent',
        source: 'astra',
      },
      {
        memoryService,
        getFlags: createEnabledFlags,
      },
    );

    const state = await memoryService.loadState();
    expect(result.status).toBe('success_local');
    expect(state.preferences.explicit.intensityMode).toBe('silent');
    expect(state.preferences.explicit.pinnedSurfaces).toBeUndefined();
  });

  it('mute_surface_local actualiza mute por surface sin afectar otras surfaces', async () => {
    const { adapter } = createPreferenceAdapter();
    const preferenceService = new AstraLocalPreferenceService({
      adapter,
      now: () => 7000,
    });

    await executeAstraLocalTool(
      'astra.mute_surface_local',
      {
        surface: 'market',
        muted: true,
        source: 'astra',
      },
      {
        preferenceService,
        getFlags: createEnabledFlags,
      },
    );
    await executeAstraLocalTool(
      'astra.mute_surface_local',
      {
        surface: 'wallet',
        muted: false,
        source: 'astra',
      },
      {
        preferenceService,
        getFlags: createEnabledFlags,
      },
    );

    const state = await preferenceService.loadState();
    const market = state.mutedSurfaces.find((item) => item.surface === 'market');
    const wallet = state.mutedSurfaces.find((item) => item.surface === 'wallet');
    expect(market?.muted).toBe(true);
    expect(wallet?.muted).toBe(false);
  });

  it('market.pin_asset_local guarda assetSymbol sanitizado', async () => {
    const { adapter } = createPreferenceAdapter();
    const preferenceService = new AstraLocalPreferenceService({
      adapter,
      now: () => 8000,
    });

    const result = await executeAstraLocalTool(
      'market.pin_asset_local',
      {
        assetSymbol: 'sol',
        source: 'astra',
        surface: 'market',
      },
      {
        preferenceService,
        getFlags: createEnabledFlags,
      },
    );

    const state = await preferenceService.loadState();
    expect(result.status).toBe('success_local');
    expect(state.pinnedAssets[0]?.assetSymbol).toBe('SOL');
  });

  it('astra.pin_insight_local guarda insightId local', async () => {
    const { adapter } = createPreferenceAdapter();
    const preferenceService = new AstraLocalPreferenceService({
      adapter,
      now: () => 9000,
    });

    const result = await executeAstraLocalTool(
      'astra.pin_insight_local',
      {
        insightId: 'insight-alpha',
        source: 'astra',
        surface: 'trade',
      },
      {
        preferenceService,
        getFlags: createEnabledFlags,
      },
    );

    const state = await preferenceService.loadState();
    expect(result.status).toBe('success_local');
    expect(state.pinnedInsights[0]?.insightId).toBe('insight-alpha');
  });

  it('no guarda direcciones completas en market.pin_asset_local', async () => {
    const { adapter } = createPreferenceAdapter();
    const preferenceService = new AstraLocalPreferenceService({
      adapter,
      now: () => 10_000,
    });

    const result = await executeAstraLocalTool(
      'market.pin_asset_local',
      {
        assetSymbol: '0x1234567890abcdef1234567890abcdef12345678',
        source: 'astra',
        surface: 'market',
      },
      {
        preferenceService,
        getFlags: createEnabledFlags,
      },
    );

    const state = await preferenceService.loadState();
    expect(result.status).toBe('blocked');
    expect(state.pinnedAssets).toHaveLength(0);
  });

  it('flag global apagado bloquea las cuatro tools nuevas', async () => {
    const disabledFlags = {
      ...createEnabledFlags(),
      ASTRA_TOOL_LOCAL_ACTIONS_ENABLED: false,
    };

    const results = await Promise.all([
      executeAstraLocalTool('astra.set_intensity_mode_local', { intensityMode: 'active' }, { getFlags: () => disabledFlags }),
      executeAstraLocalTool('astra.mute_surface_local', { surface: 'market' }, { getFlags: () => disabledFlags }),
      executeAstraLocalTool('market.pin_asset_local', { assetSymbol: 'BTC' }, { getFlags: () => disabledFlags }),
      executeAstraLocalTool('astra.pin_insight_local', { insightId: 'insight-2' }, { getFlags: () => disabledFlags }),
    ]);

    results.forEach((result) => {
      expect(result.status).toBe('blocked');
    });
  });

  it('flag individual apagado bloquea cada tool nueva', async () => {
    const cases = [
      {
        toolId: 'astra.set_intensity_mode_local' as const,
        params: { intensityMode: 'balanced' },
        flags: { ASTRA_TOOL_SET_INTENSITY_MODE_ENABLED: false },
      },
      {
        toolId: 'astra.mute_surface_local' as const,
        params: { surface: 'market' },
        flags: { ASTRA_TOOL_MUTE_SURFACE_ENABLED: false },
      },
      {
        toolId: 'market.pin_asset_local' as const,
        params: { assetSymbol: 'BTC' },
        flags: { ASTRA_TOOL_PIN_ASSET_ENABLED: false },
      },
      {
        toolId: 'astra.pin_insight_local' as const,
        params: { insightId: 'insight-3' },
        flags: { ASTRA_TOOL_PIN_INSIGHT_ENABLED: false },
      },
    ];

    for (const testCase of cases) {
      const result = await executeAstraLocalTool(testCase.toolId, testCase.params, {
        getFlags: () => ({
          ...createEnabledFlags(),
          ...testCase.flags,
        }),
      });

      expect(result.status).toBe('blocked');
    }
  });
});
