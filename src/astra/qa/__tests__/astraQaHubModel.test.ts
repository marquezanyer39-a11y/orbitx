import { describe, expect, it } from 'vitest';

import { astraFlagsDefaults } from '../../config/astraFlags.defaults';
import {
  ASTRA_QA_HUB_TABS,
  createAstraQaHubSandboxFlags,
  getAstraQaHubFlagRows,
  getAstraQaHubModuleStatuses,
  getAstraQaHubVisibleTabs,
  isAstraQaHubEnabled,
  resolveAstraQaHubFlags,
  resolveAstraQaHubInitialTab,
} from '../astraQaHubModel';

describe('Astra Internal QA Hub model', () => {
  it('define las tabs internas requeridas', () => {
    expect(ASTRA_QA_HUB_TABS.map((tab) => tab.id)).toEqual([
      'status',
      'risk',
      'tools',
      'confirmation',
      'remoteConfig',
      'ui',
      'flags',
      'checklist',
    ]);
  });

  it('queda apagado con defaults productivos', () => {
    const flags = resolveAstraQaHubFlags(astraFlagsDefaults);

    expect(isAstraQaHubEnabled(flags)).toBe(false);
    expect(getAstraQaHubVisibleTabs(flags)).toEqual([]);
  });

  it('crea flags sandbox con real execution siempre apagado', () => {
    const flags = createAstraQaHubSandboxFlags({
      ASTRA_RISK_REAL_EXECUTION_ENABLED: true,
      ASTRA_TOOL_REAL_EXECUTION_ENABLED: true,
    });

    expect(flags.ASTRA_QA_HUB_ENABLED).toBe(true);
    expect(flags.ASTRA_RISK_REAL_EXECUTION_ENABLED).toBe(false);
    expect(flags.ASTRA_TOOL_REAL_EXECUTION_ENABLED).toBe(false);
    expect(flags.ASTRA_NOTIFICATION_PUSH_ENABLED).toBe(false);
    expect(flags.ASTRA_SYNC_WRITE_ENABLED).toBe(false);
  });

  it('resuelve tabs visibles solo cuando sus flags estan activas', () => {
    const flags = createAstraQaHubSandboxFlags({
      ASTRA_QA_HUB_UI_SANDBOX_ENABLED: false,
    });
    const tabs = getAstraQaHubVisibleTabs(flags).map((tab) => tab.id);

    expect(tabs).toContain('risk');
    expect(tabs).toContain('tools');
    expect(tabs).not.toContain('ui');
  });

  it('elige initial tab valida o vuelve al primer tab visible', () => {
    const flags = createAstraQaHubSandboxFlags();

    expect(resolveAstraQaHubInitialTab(flags, 'tools')).toBe('tools');
    expect(
      resolveAstraQaHubInitialTab(
        createAstraQaHubSandboxFlags({ ASTRA_QA_HUB_LOCAL_TOOLS_SANDBOX_ENABLED: false }),
        'tools',
      ),
    ).toBe('status');
  });

  it('status general marca modulos sin ejecutar nada', () => {
    const statuses = getAstraQaHubModuleStatuses(createAstraQaHubSandboxFlags());

    expect(statuses.find((item) => item.id === 'risk')?.status).toBe('enabled');
    expect(statuses.find((item) => item.id === 'remoteConfig')?.detail).toContain('RefreshHost');
  });

  it('flags read-only no exponen claves sensibles por nombre', () => {
    const rows = getAstraQaHubFlagRows(createAstraQaHubSandboxFlags());
    const rendered = JSON.stringify(rows);

    expect(rendered).not.toMatch(/SECRET|PRIVATE|TOKEN|SESSION|MNEMONIC|SEED|SIGNATURE|PAYLOAD/i);
    expect(rows.some((row) => row.key === 'ASTRA_QA_HUB_ENABLED')).toBe(true);
  });

  it('kill switch bloquea el hub', () => {
    const flags = createAstraQaHubSandboxFlags({ ASTRA_KILL_SWITCH: true });

    expect(isAstraQaHubEnabled(flags)).toBe(false);
    expect(getAstraQaHubVisibleTabs(flags)).toEqual([]);
  });
});
