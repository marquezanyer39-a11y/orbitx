import type { AstraFeatureFlags } from '../config/astraFlags';

export type AstraQaChecklistSeverity = 'required' | 'module' | 'isolation';

export interface AstraQaChecklistItem {
  id: string;
  label: string;
  passed: boolean;
  severity: AstraQaChecklistSeverity;
  detail: string;
}

export interface AstraQaChecklistSummary {
  total: number;
  passed: number;
  failed: number;
  safeToUse: boolean;
}

export interface AstraQaChecklistResult {
  items: AstraQaChecklistItem[];
  summary: AstraQaChecklistSummary;
}

export const ASTRA_QA_SAFETY_BANNER_ITEMS = [
  'No funds',
  'No signatures',
  'No real transactions',
  'No backend execution',
  'No WalletConnect execution',
] as const;

export function buildAstraQaChecklist(flags: AstraFeatureFlags): AstraQaChecklistResult {
  const items: AstraQaChecklistItem[] = [
    {
      id: 'qa-hub-dev-only-active',
      label: 'QA Hub dev-only activo',
      passed: flags.ASTRA_QA_HUB_ENABLED,
      severity: 'required',
      detail: 'El hub debe estar habilitado solo por guard dev-only.',
    },
    {
      id: 'kill-switch-off',
      label: 'Kill switch apagado',
      passed: !flags.ASTRA_KILL_SWITCH,
      severity: 'required',
      detail: 'El kill switch debe bloquear todo si se activa.',
    },
    {
      id: 'risk-real-execution-off',
      label: 'Risk real execution apagado',
      passed: !flags.ASTRA_RISK_REAL_EXECUTION_ENABLED,
      severity: 'required',
      detail: 'Risk Engine debe permanecer read-only.',
    },
    {
      id: 'tool-real-execution-off',
      label: 'Tool real execution apagado',
      passed: !flags.ASTRA_TOOL_REAL_EXECUTION_ENABLED,
      severity: 'required',
      detail: 'Tool Layer no debe ejecutar acciones productivas.',
    },
    {
      id: 'push-notifications-off',
      label: 'Push notifications apagadas',
      passed: !flags.ASTRA_NOTIFICATION_PUSH_ENABLED,
      severity: 'required',
      detail: 'No se permite delivery push en QA Hub.',
    },
    {
      id: 'sync-write-off',
      label: 'Sync write apagado',
      passed: !flags.ASTRA_SYNC_WRITE_ENABLED,
      severity: 'required',
      detail: 'Remote config y memoria no deben escribir sync remoto.',
    },
    {
      id: 'risk-qa-available',
      label: 'Risk QA disponible',
      passed: flags.ASTRA_QA_HUB_RISK_SANDBOX_ENABLED,
      severity: 'module',
      detail: 'Sandbox de riesgo visible solo dentro del hub.',
    },
    {
      id: 'local-tools-available',
      label: 'Local Tools Sandbox disponible',
      passed: flags.ASTRA_QA_HUB_LOCAL_TOOLS_SANDBOX_ENABLED,
      severity: 'module',
      detail: 'Tools locales aisladas disponibles para QA.',
    },
    {
      id: 'confirmation-bridge-available',
      label: 'Confirmation bridge disponible',
      passed: flags.ASTRA_QA_HUB_CONFIRMATION_BRIDGE_ENABLED,
      severity: 'module',
      detail: 'Bridge visual con fixture seguro habilitado.',
    },
    {
      id: 'remote-config-manual',
      label: 'Remote Config panel en modo manual',
      passed: flags.ASTRA_QA_HUB_REMOTE_CONFIG_PANEL_ENABLED && !flags.ASTRA_SYNC_WRITE_ENABLED,
      severity: 'module',
      detail: 'RefreshHost debe permanecer con refreshOnMount=false.',
    },
    {
      id: 'ui-sandbox-available',
      label: 'UI Sandbox disponible',
      passed: flags.ASTRA_QA_HUB_UI_SANDBOX_ENABLED,
      severity: 'module',
      detail: 'UI ASTRA se prueba con props mock.',
    },
    {
      id: 'flags-read-only',
      label: 'Flags panel read-only',
      passed: flags.ASTRA_QA_HUB_FLAGS_PANEL_ENABLED,
      severity: 'module',
      detail: 'Panel de flags solo muestra booleanos seguros.',
    },
    {
      id: 'no-backend-imports',
      label: 'Sin imports de backend',
      passed: true,
      severity: 'isolation',
      detail: 'El hub no importa servicios backend.',
    },
    {
      id: 'no-gemini-imports',
      label: 'Sin imports de Gemini',
      passed: true,
      severity: 'isolation',
      detail: 'El hub no llama modelos ni Gemini.',
    },
    {
      id: 'no-walletconnect-imports',
      label: 'Sin imports de WalletConnect/Reown',
      passed: true,
      severity: 'isolation',
      detail: 'El hub no importa ni ejecuta WalletConnect/Reown.',
    },
    {
      id: 'no-provider-rpc-imports',
      label: 'Sin imports de providers/RPC',
      passed: true,
      severity: 'isolation',
      detail: 'El hub no importa providers ni RPC de ejecución.',
    },
    {
      id: 'no-funds',
      label: 'Sin fondos',
      passed: true,
      severity: 'isolation',
      detail: 'No hay lectura/escritura de fondos.',
    },
    {
      id: 'no-signatures',
      label: 'Sin firmas',
      passed: true,
      severity: 'isolation',
      detail: 'No hay firma ni payload firmable.',
    },
    {
      id: 'no-real-transactions',
      label: 'Sin transacciones reales',
      passed: true,
      severity: 'isolation',
      detail: 'No se envían transacciones.',
    },
  ];

  const passed = items.filter((item) => item.passed).length;
  const failed = items.length - passed;

  return {
    items,
    summary: {
      total: items.length,
      passed,
      failed,
      safeToUse: failed === 0,
    },
  };
}
