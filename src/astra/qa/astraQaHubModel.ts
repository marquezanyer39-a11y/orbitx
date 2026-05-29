import type { AstraFeatureFlags } from '../config/astraFlags';
import { astraFlagsDefaults } from '../config/astraFlags.defaults';
import type {
  AstraQaHubFlagRow,
  AstraQaHubModuleStatus,
  AstraQaHubModuleStatusItem,
  AstraQaModuleHealthItem,
  AstraQaHubTabDefinition,
  AstraQaHubTabId,
} from './astraQaHub.types';

export const ASTRA_QA_HUB_TABS: AstraQaHubTabDefinition[] = [
  {
    id: 'status',
    label: 'Status',
    description: 'Resumen read-only de módulos ASTRA.',
    requiredFlag: 'ASTRA_QA_HUB_ENABLED',
  },
  {
    id: 'risk',
    label: 'Risk QA',
    description: 'Pipeline Risk Scan -> Event -> Relevance -> UI.',
    requiredFlag: 'ASTRA_QA_HUB_RISK_SANDBOX_ENABLED',
  },
  {
    id: 'tools',
    label: 'Local Tools',
    description: 'Sandbox de tools locales sin fondos.',
    requiredFlag: 'ASTRA_QA_HUB_LOCAL_TOOLS_SANDBOX_ENABLED',
  },
  {
    id: 'confirmation',
    label: 'Confirmation',
    description: 'Bridge visual de confirmación con fixture seguro.',
    requiredFlag: 'ASTRA_QA_HUB_CONFIRMATION_BRIDGE_ENABLED',
  },
  {
    id: 'remoteConfig',
    label: 'Remote Config',
    description: 'RefreshHost aislado con refreshOnMount=false.',
    requiredFlag: 'ASTRA_QA_HUB_REMOTE_CONFIG_PANEL_ENABLED',
  },
  {
    id: 'ui',
    label: 'UI Sandbox',
    description: 'Componentes UI ASTRA controlados por props mock.',
    requiredFlag: 'ASTRA_QA_HUB_UI_SANDBOX_ENABLED',
  },
  {
    id: 'flags',
    label: 'Flags',
    description: 'Feature flags en modo lectura.',
    requiredFlag: 'ASTRA_QA_HUB_FLAGS_PANEL_ENABLED',
  },
  {
    id: 'checklist',
    label: 'Checklist',
    description: 'Checklist técnico de seguridad ASTRA QA.',
    requiredFlag: 'ASTRA_QA_HUB_ENABLED',
  },
];

const HIDDEN_FLAG_PATTERN = /(SECRET|PRIVATE|TOKEN|SESSION|KEY|MNEMONIC|SEED|SIGNATURE|PAYLOAD)/i;

export function createAstraQaHubSandboxFlags(
  overrides: Partial<AstraFeatureFlags> = {},
): AstraFeatureFlags {
  return {
    ...astraFlagsDefaults,
    ASTRA_ENABLED: true,
    ASTRA_QA_HUB_ENABLED: true,
    ASTRA_QA_HUB_RISK_SANDBOX_ENABLED: true,
    ASTRA_QA_HUB_LOCAL_TOOLS_SANDBOX_ENABLED: true,
    ASTRA_QA_HUB_CONFIRMATION_BRIDGE_ENABLED: true,
    ASTRA_QA_HUB_REMOTE_CONFIG_PANEL_ENABLED: true,
    ASTRA_QA_HUB_UI_SANDBOX_ENABLED: true,
    ASTRA_QA_HUB_FLAGS_PANEL_ENABLED: true,
    ASTRA_RISK_ENGINE_ENABLED: true,
    ASTRA_RISK_READ_ONLY_ENABLED: true,
    ASTRA_RISK_TOKEN_SCAN_ENABLED: true,
    ASTRA_RISK_APPROVAL_SCAN_ENABLED: true,
    ASTRA_RISK_EVENT_PUBLISHING_ENABLED: true,
    ASTRA_RISK_RELEVANCE_ENABLED: true,
    ASTRA_RISK_INSIGHT_HOST_ENABLED: true,
    ASTRA_RISK_INSIGHT_CARDS_ENABLED: true,
    ASTRA_RISK_INSIGHT_BANNERS_ENABLED: true,
    ASTRA_RISK_INSIGHT_CRITICAL_ENABLED: true,
    ASTRA_TOOL_CONFIRMATION_UI_ENABLED: true,
    ASTRA_UI_CONFIRMATION_SHEET_ENABLED: true,
    ...overrides,
    ASTRA_RISK_EXTERNAL_ADAPTERS_ENABLED: false,
    ASTRA_RISK_REAL_EXECUTION_ENABLED: false,
    ASTRA_TOOL_REAL_EXECUTION_ENABLED: false,
    ASTRA_NOTIFICATION_LOCAL_DELIVERY_ENABLED: false,
    ASTRA_NOTIFICATION_PUSH_ENABLED: false,
    ASTRA_SYNC_WRITE_ENABLED: false,
  };
}

export function resolveAstraQaHubFlags(
  flags: Partial<AstraFeatureFlags> = {},
): AstraFeatureFlags {
  return {
    ...astraFlagsDefaults,
    ...flags,
    ASTRA_RISK_REAL_EXECUTION_ENABLED: false,
    ASTRA_TOOL_REAL_EXECUTION_ENABLED: false,
    ASTRA_NOTIFICATION_PUSH_ENABLED: false,
    ASTRA_NOTIFICATION_LOCAL_DELIVERY_ENABLED: false,
  };
}

export function isAstraQaHubEnabled(flags: AstraFeatureFlags, enabled?: boolean): boolean {
  return enabled !== false && flags.ASTRA_ENABLED && flags.ASTRA_QA_HUB_ENABLED && !flags.ASTRA_KILL_SWITCH;
}

export function getAstraQaHubVisibleTabs(flags: AstraFeatureFlags): AstraQaHubTabDefinition[] {
  if (!isAstraQaHubEnabled(flags)) {
    return [];
  }

  return ASTRA_QA_HUB_TABS.filter((tab) => flags[tab.requiredFlag]);
}

export function resolveAstraQaHubInitialTab(
  flags: AstraFeatureFlags,
  initialTab?: AstraQaHubTabId,
): AstraQaHubTabId | null {
  const visibleTabs = getAstraQaHubVisibleTabs(flags);
  if (visibleTabs.length === 0) {
    return null;
  }

  if (initialTab && visibleTabs.some((tab) => tab.id === initialTab)) {
    return initialTab;
  }

  return visibleTabs[0]?.id ?? null;
}

function getStatus(flagEnabled: boolean, hubEnabled: boolean): AstraQaHubModuleStatus {
  if (!hubEnabled) {
    return 'blocked';
  }

  return flagEnabled ? 'enabled' : 'disabled';
}

export function getAstraQaHubModuleStatuses(flags: AstraFeatureFlags): AstraQaHubModuleStatusItem[] {
  const hubEnabled = isAstraQaHubEnabled(flags);

  return ASTRA_QA_HUB_TABS.map((tab) => ({
    id: tab.id,
    label: tab.label,
    status: getStatus(Boolean(flags[tab.requiredFlag]), hubEnabled),
    detail: tab.description,
  }));
}

export function getAstraQaModuleHealthItems(flags: AstraFeatureFlags): AstraQaModuleHealthItem[] {
  const hubEnabled = isAstraQaHubEnabled(flags);

  return ASTRA_QA_HUB_TABS
    .filter((tab) => tab.id !== 'checklist')
    .map((tab) => {
      const flagEnabled = Boolean(flags[tab.requiredFlag]);
      const status = !hubEnabled
        ? 'blocked'
        : flagEnabled
          ? 'available'
          : 'disabled_by_flag';

      return {
        id: tab.id,
        name: tab.label,
        status,
        description: tab.description,
        safetyLevel: status === 'available' ? 'safe' : status === 'blocked' ? 'blocked' : 'caution',
        relatedFlag: tab.requiredFlag,
      };
    });
}

export function getAstraQaHubFlagRows(flags: AstraFeatureFlags): AstraQaHubFlagRow[] {
  return Object.entries(flags)
    .filter(([key]) => !HIDDEN_FLAG_PATTERN.test(key))
    .map(([key, value]) => ({
      key: key as keyof AstraFeatureFlags,
      value: Boolean(value),
      category: getAstraQaHubFlagCategory(key),
    }))
    .sort((a, b) => String(a.key).localeCompare(String(b.key)));
}

function getAstraQaHubFlagCategory(key: string): AstraQaHubFlagRow['category'] {
  if (key.includes('QA_HUB')) return 'qa';
  if (key.includes('RISK')) return 'risk';
  if (key.includes('TOOL')) return 'tools';
  if (key.includes('UI')) return 'ui';
  if (key.includes('MEMORY') || key.includes('INBOX')) return 'memory';
  if (key.includes('NOTIFICATION')) return 'notifications';
  if (key.includes('REMOTE') || key.includes('SYNC') || key.includes('KILL')) return 'remote';
  return 'master';
}
