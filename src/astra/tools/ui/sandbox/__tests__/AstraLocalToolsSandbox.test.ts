import { describe, expect, it } from 'vitest';

import type { AstraLocalToolAdapterDependencies } from '../../../local/astraLocalTool.types';
import {
  createAstraSandboxAuditPreviewModel,
  sanitizeAstraSandboxAuditMetadata,
  ASTRA_LOCAL_TOOL_SANDBOX_ALLOWED_IDS,
  ASTRA_LOCAL_TOOL_SANDBOX_BUTTON_LABEL,
  ASTRA_LOCAL_TOOL_SANDBOX_FIXTURES,
  createAstraLocalToolSandboxFlags,
  getAstraToolResultPanelMessage,
  hasUnsafeSandboxButtonCopy,
  runAstraLocalToolSandboxFixture,
} from '../astraLocalToolSandboxFixtures';

function createMockLocalDependencies(): AstraLocalToolAdapterDependencies {
  return {
    memoryService: {
      markInboxRead: async () => ({
        version: 1,
        dismissals: [],
        cooldowns: [],
        inbox: [],
        preferences: {
          intensityMode: 'balanced',
          mutedSurfaces: [],
        },
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
      recordDismissal: async () => ({
        version: 1,
        dismissals: [],
        cooldowns: [],
        inbox: [],
        preferences: {
          intensityMode: 'balanced',
          mutedSurfaces: [],
        },
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
      setExplicitPreferencesLocal: async () => ({
        version: 1,
        dismissals: [],
        cooldowns: [],
        inbox: [],
        preferences: {
          intensityMode: 'balanced',
          mutedSurfaces: [],
        },
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
    } as never,
    draftService: {
      saveNote: async (record) => ({
        ...record,
        id: 'note_demo_001',
        createdAt: '2026-01-01T00:00:00.000Z',
      }),
      saveOrderDraft: async (record) => ({
        ...record,
        id: 'draft_demo_001',
        createdAt: '2026-01-01T00:00:00.000Z',
      }),
      loadState: async () => ({
        version: 1,
        updatedAt: '2026-01-01T00:00:00.000Z',
        notes: [],
        orderDrafts: [],
      }),
      reset: async () => ({
        version: 1,
        updatedAt: '2026-01-01T00:00:00.000Z',
        notes: [],
        orderDrafts: [],
      }),
    },
    preferenceService: {
      loadState: async () => ({
        version: 1,
        updatedAt: '2026-01-01T00:00:00.000Z',
        pinnedAssets: [],
        pinnedInsights: [],
        mutedSurfaces: [],
      }),
      reset: async () => ({
        version: 1,
        updatedAt: '2026-01-01T00:00:00.000Z',
        pinnedAssets: [],
        pinnedInsights: [],
        mutedSurfaces: [],
      }),
      pinAsset: async (record) => ({
        version: 1,
        updatedAt: '2026-01-01T00:00:00.000Z',
        pinnedAssets: [{ ...record, pinnedAt: '2026-01-01T00:00:00.000Z' }],
        pinnedInsights: [],
        mutedSurfaces: [],
      }),
      pinInsight: async (record) => ({
        version: 1,
        updatedAt: '2026-01-01T00:00:00.000Z',
        pinnedAssets: [],
        pinnedInsights: [{ ...record, pinnedAt: '2026-01-01T00:00:00.000Z' }],
        mutedSurfaces: [],
      }),
      setSurfaceMuted: async (record) => ({
        version: 1,
        updatedAt: '2026-01-01T00:00:00.000Z',
        pinnedAssets: [],
        pinnedInsights: [],
        mutedSurfaces: [{ ...record, updatedAt: '2026-01-01T00:00:00.000Z' }],
      }),
    },
  };
}

describe('AstraLocalToolsSandbox', () => {
  it('renderiza lista de tools locales permitidas', () => {
    expect(ASTRA_LOCAL_TOOL_SANDBOX_ALLOWED_IDS).toEqual([
      'astra.mark_inbox_item_read_local',
      'astra.dismiss_insight_local',
      'astra.save_note_local',
      'trade.save_order_draft_local',
      'astra.set_intensity_mode_local',
      'astra.mute_surface_local',
      'market.pin_asset_local',
      'astra.pin_insight_local',
    ]);
    expect(ASTRA_LOCAL_TOOL_SANDBOX_FIXTURES).toHaveLength(8);
  });

  it('ejecutar save_note_local muestra success_local con payload seguro', async () => {
    const fixture = ASTRA_LOCAL_TOOL_SANDBOX_FIXTURES.find(
      (item) => item.toolId === 'astra.save_note_local',
    );
    expect(fixture).toBeDefined();

    const result = await runAstraLocalToolSandboxFixture(fixture!, {
      localDependencies: createMockLocalDependencies(),
    });

    expect(result.status).toBe('success_local');
    expect(result.toolId).toBe('astra.save_note_local');
    expect(getAstraToolResultPanelMessage(result)).toContain('Acción local completada');
  });

  it('payload con secreto muestra blocked seguro', async () => {
    const fixture = ASTRA_LOCAL_TOOL_SANDBOX_FIXTURES.find(
      (item) => item.toolId === 'astra.save_note_local',
    );

    const result = await runAstraLocalToolSandboxFixture(fixture!, {
      localDependencies: createMockLocalDependencies(),
      paramsOverride: {
        note: 'mi seed phrase no debe guardarse',
      },
    });

    expect(result.status).toBe('blocked');
    expect(JSON.stringify(result)).not.toContain('mi seed phrase');
  });

  it('flag global apagado muestra blocked/noop', async () => {
    const fixture = ASTRA_LOCAL_TOOL_SANDBOX_FIXTURES[0];
    const result = await runAstraLocalToolSandboxFixture(fixture, {
      simulateFlagsDisabled: true,
      localDependencies: createMockLocalDependencies(),
    });

    expect(result.status).toBe('blocked');
    expect(result.message).toContain('disabled');
  });

  it('pending_confirmation se muestra como estado visual sin ejecución real', () => {
    const message = getAstraToolResultPanelMessage({
      status: 'pending_confirmation',
      toolId: 'astra.save_note_local',
      message: 'pending',
      confirmationToken: 'sandbox_preview_token',
    });

    expect(message).toContain('No se aprueba ni ejecuta nada real');
  });

  it('auditoría no renderiza campos sensibles', () => {
    const params = {
      note: 'contiene seed phrase super secreta',
      privateKey: 'abc',
      address: '0x1111111111111111111111111111111111111111',
      source: 'sandbox',
      surface: 'market',
    };
    const audit = createAstraSandboxAuditPreviewModel('astra.save_note_local', params, {
      status: 'blocked',
      toolId: 'astra.save_note_local',
      message: 'blocked',
    });
    const rendered = JSON.stringify(audit);

    expect(rendered).not.toContain('seed phrase super secreta');
    expect(rendered).not.toContain('abc');
    expect(rendered).not.toContain('0x1111111111111111111111111111111111111111');
    expect(audit.redactedKeys).toContain('note');
    expect(audit.redactedKeys).toContain('privateKey');
  });

  it('sandbox expone fixtures exportables sin montar automáticamente', () => {
    expect(ASTRA_LOCAL_TOOL_SANDBOX_FIXTURES[0]?.toolId).toBe('astra.mark_inbox_item_read_local');
    expect(ASTRA_LOCAL_TOOL_SANDBOX_ALLOWED_IDS).toContain('astra.pin_insight_local');
  });

  it('botones no usan textos prohibidos', () => {
    expect(hasUnsafeSandboxButtonCopy(ASTRA_LOCAL_TOOL_SANDBOX_BUTTON_LABEL)).toBe(false);
    expect(ASTRA_LOCAL_TOOL_SANDBOX_BUTTON_LABEL).toBe('Ejecutar local');
  });

  it('simulación de flags apagadas no modifica defaults', () => {
    const disabled = createAstraLocalToolSandboxFlags(true);
    const enabled = createAstraLocalToolSandboxFlags(false);

    expect(disabled.ASTRA_TOOL_LOCAL_ACTIONS_ENABLED).toBe(false);
    expect(enabled.ASTRA_TOOL_LOCAL_ACTIONS_ENABLED).toBe(true);
    expect(enabled.ASTRA_TOOL_REAL_EXECUTION_ENABLED).toBe(false);
  });

  it('sanitizador oculta valores sensibles y direcciones completas', () => {
    const safe = sanitizeAstraSandboxAuditMetadata({
      accessToken: 'token_123',
      comment: 'ver 0x2222222222222222222222222222222222222222',
      assetSymbol: 'SOL',
    });

    expect(safe.metadata.accessToken).toBe('[redacted]');
    expect(safe.metadata.comment).toContain('0x2222...2222');
    expect(safe.metadata.comment).not.toContain('0x2222222222222222222222222222222222222222');
    expect(safe.metadata.assetSymbol).toBe('SOL');
  });
});
