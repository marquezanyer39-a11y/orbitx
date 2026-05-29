import type { AstraFeatureFlags } from '../../../config/astraFlags';
import { astraFlagsDefaults } from '../../../config/astraFlags.defaults';
import type { AstraLocalToolId } from '../../local/astraLocalTool.types';
import type {
  AstraToolExecutionRequest,
  AstraToolExecutionResult,
  AstraToolStatus,
} from '../../astraTool.types';
import { executeAstraTool } from '../../astraToolExecutor';
import type { AstraLocalToolAdapterDependencies } from '../../local/astraLocalTool.types';

export interface AstraLocalToolSandboxFixture {
  toolId: AstraLocalToolId;
  title: string;
  description: string;
  safePayload: Record<string, unknown>;
}

export interface AstraLocalToolSandboxRunOptions {
  simulateFlagsDisabled?: boolean;
  paramsOverride?: Record<string, unknown>;
  localDependencies?: AstraLocalToolAdapterDependencies;
}

export interface AstraToolSandboxAuditPreviewModel {
  toolId: AstraLocalToolId;
  timestamp: string;
  status: AstraToolStatus;
  source: string;
  surface: string;
  paramsHash: string;
  metadata: Record<string, string>;
  redactedKeys: string[];
}

const BLOCKED_BUTTON_WORDS = ['Comprar', 'Firmar', 'Enviar', 'Transferir'] as const;
const SENSITIVE_KEY_PATTERN =
  /(seed|private|secret|token|signature|payload|balance|amount|mnemonic|key|session|calldata|transaction)/i;
const SENSITIVE_VALUE_PATTERN =
  /(private\s*key|seed(?:\s*phrase)?|mnemonic|access\s*token|refresh\s*token|session|signature|raw\s*transaction|calldata|signing\s*payload)/i;
const FULL_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;
const ADDRESS_IN_TEXT_PATTERN = /0x[a-fA-F0-9]{40}/g;

export const ASTRA_LOCAL_TOOL_SANDBOX_BUTTON_LABEL = 'Ejecutar local';

export const ASTRA_LOCAL_TOOL_SANDBOX_FIXTURES: AstraLocalToolSandboxFixture[] = [
  {
    toolId: 'astra.mark_inbox_item_read_local',
    title: 'Marcar inbox como leído',
    description: 'Marca un item local de ASTRA como leído sin backend.',
    safePayload: {
      itemId: 'inbox_demo_001',
      source: 'sandbox',
      surface: 'portfolio',
    },
  },
  {
    toolId: 'astra.dismiss_insight_local',
    title: 'Descartar insight',
    description: 'Registra un dismissal local sanitizado.',
    safePayload: {
      insightId: 'insight_demo_breakout',
      source: 'sandbox',
      surface: 'market',
    },
  },
  {
    toolId: 'astra.save_note_local',
    title: 'Guardar nota local',
    description: 'Guarda una nota corta local sin datos sensibles.',
    safePayload: {
      note: 'Revisar momentum de SOL en la próxima sesión.',
      source: 'sandbox',
      surface: 'market',
    },
  },
  {
    toolId: 'trade.save_order_draft_local',
    title: 'Guardar borrador de orden',
    description: 'Crea un borrador local. No coloca órdenes reales.',
    safePayload: {
      symbol: 'BTCUSDT',
      side: 'buy',
      orderType: 'limit',
      thesis: 'Setup educativo: esperar confirmación sobre resistencia.',
      source: 'sandbox',
      surface: 'trade',
    },
  },
  {
    toolId: 'astra.set_intensity_mode_local',
    title: 'Cambiar intensidad',
    description: 'Actualiza una preferencia local explícita de ASTRA.',
    safePayload: {
      intensityMode: 'balanced',
      source: 'sandbox',
    },
  },
  {
    toolId: 'astra.mute_surface_local',
    title: 'Silenciar superficie',
    description: 'Silencia una superficie local sin afectar la app global.',
    safePayload: {
      surface: 'wallet',
      muted: true,
      source: 'sandbox',
    },
  },
  {
    toolId: 'market.pin_asset_local',
    title: 'Fijar activo',
    description: 'Fija un símbolo local sin contratos ni balances.',
    safePayload: {
      assetSymbol: 'SOL',
      source: 'sandbox',
      surface: 'market',
    },
  },
  {
    toolId: 'astra.pin_insight_local',
    title: 'Fijar insight',
    description: 'Fija un insight local sin guardar payload crudo.',
    safePayload: {
      insightId: 'insight_demo_volatility',
      source: 'sandbox',
      surface: 'portfolio',
    },
  },
];

export const ASTRA_LOCAL_TOOL_SANDBOX_ALLOWED_IDS = ASTRA_LOCAL_TOOL_SANDBOX_FIXTURES.map(
  (fixture) => fixture.toolId,
);

function truncateAddress(value: string): string {
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export function hasUnsafeSandboxButtonCopy(label: string): boolean {
  return BLOCKED_BUTTON_WORDS.some((word) => label.includes(word));
}

export function getAstraToolResultPanelMessage(result: AstraToolExecutionResult): string {
  if (result.status === 'success_local') {
    return 'Acción local completada. No se ejecutó una orden real ni se tocaron fondos.';
  }

  if (result.status === 'blocked') {
    return 'Tool desactivada por configuración.';
  }

  if (result.status === 'pending_confirmation') {
    return 'Confirmación pendiente visual. No se aprueba ni ejecuta nada real desde este sandbox.';
  }

  if (result.status === 'failed') {
    return 'Error seguro. No se muestran raw params ni datos sensibles.';
  }

  return 'Resultado no-op seguro.';
}

export function sanitizeAstraSandboxAuditMetadata(
  params: Record<string, unknown>,
): Pick<AstraToolSandboxAuditPreviewModel, 'metadata' | 'redactedKeys'> {
  const redactedKeys = new Set<string>();
  const metadata = Object.entries(params).reduce<Record<string, string>>((safeMetadata, [key, value]) => {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      redactedKeys.add(key);
      safeMetadata[key] = '[redacted]';
      return safeMetadata;
    }

    if (typeof value === 'string') {
      if (SENSITIVE_VALUE_PATTERN.test(value)) {
        redactedKeys.add(key);
        safeMetadata[key] = '[redacted]';
        return safeMetadata;
      }

      if (FULL_ADDRESS_PATTERN.test(value)) {
        redactedKeys.add(key);
        safeMetadata[key] = truncateAddress(value);
        return safeMetadata;
      }

      safeMetadata[key] = value.replace(ADDRESS_IN_TEXT_PATTERN, (address) => {
        redactedKeys.add(key);
        return truncateAddress(address);
      }).slice(0, 80);
      return safeMetadata;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      safeMetadata[key] = String(value);
      return safeMetadata;
    }

    safeMetadata[key] = '[structured]';
    return safeMetadata;
  }, {});

  return {
    metadata,
    redactedKeys: Array.from(redactedKeys),
  };
}

export function createAstraSandboxAuditPreviewModel(
  toolId: AstraLocalToolId,
  params: Record<string, unknown>,
  result: AstraToolExecutionResult,
): AstraToolSandboxAuditPreviewModel {
  const sanitized = sanitizeAstraSandboxAuditMetadata(params);

  return {
    toolId,
    timestamp: new Date().toISOString(),
    status: result.status,
    source: typeof params.source === 'string' ? params.source : 'sandbox',
    surface: typeof params.surface === 'string' ? params.surface : 'unknown',
    paramsHash: 'mock_hash',
    metadata: sanitized.metadata,
    redactedKeys: sanitized.redactedKeys,
  };
}

export function createAstraLocalToolSandboxFlags(
  simulateFlagsDisabled: boolean = false,
): Partial<AstraFeatureFlags> {
  return {
    ...astraFlagsDefaults,
    ASTRA_ENABLED: true,
    ASTRA_TOOL_EXECUTION_ENABLED: true,
    ASTRA_TOOL_REGISTRY_ENABLED: true,
    ASTRA_TOOL_AUDIT_ENABLED: true,
    ASTRA_TOOL_LOCAL_ACTIONS_ENABLED: !simulateFlagsDisabled,
    ASTRA_TOOL_MARK_INBOX_READ_ENABLED: !simulateFlagsDisabled,
    ASTRA_TOOL_DISMISS_INSIGHT_ENABLED: !simulateFlagsDisabled,
    ASTRA_TOOL_SAVE_NOTE_ENABLED: !simulateFlagsDisabled,
    ASTRA_TOOL_SAVE_ORDER_DRAFT_ENABLED: !simulateFlagsDisabled,
    ASTRA_TOOL_SET_INTENSITY_MODE_ENABLED: !simulateFlagsDisabled,
    ASTRA_TOOL_MUTE_SURFACE_ENABLED: !simulateFlagsDisabled,
    ASTRA_TOOL_PIN_ASSET_ENABLED: !simulateFlagsDisabled,
    ASTRA_TOOL_PIN_INSIGHT_ENABLED: !simulateFlagsDisabled,
    ASTRA_TOOL_REAL_EXECUTION_ENABLED: false,
  };
}

export function createAstraLocalToolSandboxRequest(
  fixture: AstraLocalToolSandboxFixture,
  paramsOverride: Record<string, unknown> = {},
): AstraToolExecutionRequest {
  return {
    toolId: fixture.toolId,
    params: {
      ...fixture.safePayload,
      ...paramsOverride,
    },
    requestedBy: 'user',
    source: 'astra-local-tools-sandbox',
  };
}

export async function runAstraLocalToolSandboxFixture(
  fixture: AstraLocalToolSandboxFixture,
  options: AstraLocalToolSandboxRunOptions = {},
): Promise<AstraToolExecutionResult> {
  return executeAstraTool(createAstraLocalToolSandboxRequest(fixture, options.paramsOverride), {
    flags: createAstraLocalToolSandboxFlags(options.simulateFlagsDisabled),
    localDependencies: options.localDependencies,
  });
}
