import type { AstraEvent } from '../../events/astraEvents.types';
import { astraFlagsDefaults } from '../../config/astraFlags.defaults';
import type { AstraFeatureFlags } from '../../config/astraFlags';
import { astraMemoryService } from '../../memory/astraMemoryService';
import type { AstraSurface } from '../../ui/containers/astraSurfaceMappers';
import { astraLocalDraftService } from './astraLocalDraftService';
import { astraLocalPreferenceService } from './astraLocalPreferenceService';
import type {
  AstraLocalToolAdapterDependencies,
  AstraLocalToolExecutionResult,
  AstraLocalToolId,
} from './astraLocalTool.types';

const SENSITIVE_CONTENT_PATTERN =
  /(private\s*key|seed(?:\s*phrase)?|mnemonic|access\s*token|refresh\s*token|session|signature|raw\s*transaction|calldata|signing\s*payload)/i;
const ADDRESS_PATTERN = /0x[a-fA-F0-9]{40}/g;
const BALANCE_PATTERN = /\b(balance|saldo)\b[^0-9]{0,12}([0-9]+(?:[.,][0-9]+)?)/gi;
const EXACT_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/i;

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function sanitizeTextPreview(text: string): { preview: string; redactedKeys: string[] } {
  let preview = text.trim();
  const redactedKeys: string[] = [];

  preview = preview.replace(ADDRESS_PATTERN, (match) => {
    redactedKeys.push('address');
    return truncateAddress(match);
  });

  preview = preview.replace(BALANCE_PATTERN, (_match, label) => {
    redactedKeys.push('balance');
    return `${label} [redacted]`;
  });

  return {
    preview: preview.slice(0, 140),
    redactedKeys: Array.from(new Set(redactedKeys)),
  };
}

function getEffectiveFlags(getFlags?: () => AstraFeatureFlags): AstraFeatureFlags {
  return getFlags?.() ?? astraFlagsDefaults;
}

function isSecretLikeContent(value?: string): boolean {
  return !!value && SENSITIVE_CONTENT_PATTERN.test(value);
}

function buildLocalDismissalEvent(
  insightId: string,
  source: string,
  surface?: AstraSurface,
  now: number = Date.now(),
): AstraEvent {
  return {
    id: `dismiss-${insightId}`,
    type: 'market',
    severity: 'info',
    title: 'Insight dismissed',
    message: 'Local ASTRA insight dismissal recorded.',
    timestamp: new Date(now).toISOString(),
    source,
    dedupKey: `local-insight:${insightId}`,
    targetScreen: surface,
    payload: {},
  };
}

export function isAstraLocalToolEnabled(toolId: AstraLocalToolId, flags: AstraFeatureFlags): boolean {
  if (!flags.ASTRA_ENABLED || !flags.ASTRA_TOOL_EXECUTION_ENABLED || !flags.ASTRA_TOOL_LOCAL_ACTIONS_ENABLED) {
    return false;
  }

  switch (toolId) {
    case 'astra.mark_inbox_item_read_local':
      return flags.ASTRA_TOOL_MARK_INBOX_READ_ENABLED;
    case 'astra.dismiss_insight_local':
      return flags.ASTRA_TOOL_DISMISS_INSIGHT_ENABLED;
    case 'astra.save_note_local':
      return flags.ASTRA_TOOL_SAVE_NOTE_ENABLED;
    case 'trade.save_order_draft_local':
      return flags.ASTRA_TOOL_SAVE_ORDER_DRAFT_ENABLED;
    case 'astra.set_intensity_mode_local':
      return flags.ASTRA_TOOL_SET_INTENSITY_MODE_ENABLED;
    case 'astra.mute_surface_local':
      return flags.ASTRA_TOOL_MUTE_SURFACE_ENABLED;
    case 'market.pin_asset_local':
      return flags.ASTRA_TOOL_PIN_ASSET_ENABLED;
    case 'astra.pin_insight_local':
      return flags.ASTRA_TOOL_PIN_INSIGHT_ENABLED;
    default:
      return false;
  }
}

export async function executeAstraLocalTool(
  toolId: AstraLocalToolId,
  params: Record<string, unknown>,
  dependencies: AstraLocalToolAdapterDependencies = {},
): Promise<AstraLocalToolExecutionResult> {
  const flags = getEffectiveFlags(dependencies.getFlags);
  const memoryService = dependencies.memoryService ?? astraMemoryService;
  const draftService = dependencies.draftService ?? astraLocalDraftService;
  const preferenceService = dependencies.preferenceService ?? astraLocalPreferenceService;
  const now = dependencies.now ?? (() => Date.now());

  if (!isAstraLocalToolEnabled(toolId, flags) || flags.ASTRA_TOOL_REAL_EXECUTION_ENABLED) {
    return {
      status: 'blocked',
      message: 'ASTRA local tool execution is disabled by feature flags.',
      auditParams: {
        source: typeof params.source === 'string' ? params.source : 'astra',
        surface: typeof params.surface === 'string' ? params.surface : 'unknown',
      },
    };
  }

  switch (toolId) {
    case 'astra.mark_inbox_item_read_local': {
      await memoryService.markInboxRead(String(params.itemId));
      return {
        status: 'success_local',
        message: 'Inbox item marked as read locally.',
        auditParams: {
          itemId: String(params.itemId).slice(0, 60),
          read: 'true',
          source: typeof params.source === 'string' ? params.source : 'astra',
          surface: typeof params.surface === 'string' ? params.surface : 'unknown',
        },
      };
    }
    case 'astra.dismiss_insight_local': {
      const source = typeof params.source === 'string' ? params.source : 'astra';
      const surface = typeof params.surface === 'string' ? (params.surface as AstraSurface) : undefined;
      await memoryService.recordDismissal(
        buildLocalDismissalEvent(String(params.insightId), source, surface, now()),
        surface,
      );
      return {
        status: 'success_local',
        message: 'Insight dismissal recorded locally.',
        auditParams: {
          insightId: String(params.insightId).slice(0, 60),
          dismissed: 'true',
          source,
          surface: surface ?? 'unknown',
        },
      };
    }
    case 'astra.save_note_local': {
      const note = String(params.note ?? '').trim();
      if (isSecretLikeContent(note)) {
        return {
          status: 'blocked',
          message: 'Sensitive note content is not allowed in local ASTRA storage.',
          auditParams: {
            noteLength: String(note.length),
            source: typeof params.source === 'string' ? params.source : 'astra',
            surface: typeof params.surface === 'string' ? params.surface : 'unknown',
            redactedKeys: ['sensitive_note_content'],
          },
        };
      }

      const sanitized = sanitizeTextPreview(note);
      const saved = await draftService.saveNote({
        preview: sanitized.preview,
        noteLength: note.length,
        source: typeof params.source === 'string' ? params.source : undefined,
        surface: typeof params.surface === 'string' ? (params.surface as AstraSurface) : undefined,
        redactedKeys: sanitized.redactedKeys,
      });

      return {
        status: 'success_local',
        message: 'Local ASTRA note saved without backend writes.',
        auditParams: {
          noteId: saved.id,
          notePreview: saved.preview,
          noteLength: String(saved.noteLength),
          source: saved.source ?? 'astra',
          surface: saved.surface ?? 'unknown',
          redactedKeys: saved.redactedKeys,
        },
      };
    }
    case 'trade.save_order_draft_local': {
      const thesis = typeof params.thesis === 'string' ? params.thesis.trim() : '';
      if (isSecretLikeContent(thesis)) {
        return {
          status: 'blocked',
          message: 'Sensitive thesis content is not allowed in local draft storage.',
          auditParams: {
            symbol: String(params.symbol ?? '').slice(0, 24),
            source: typeof params.source === 'string' ? params.source : 'astra',
            surface: typeof params.surface === 'string' ? params.surface : 'unknown',
            redactedKeys: ['sensitive_thesis_content'],
          },
        };
      }

      const sanitized = sanitizeTextPreview(thesis);
      const saved = await draftService.saveOrderDraft({
        symbol: String(params.symbol).trim().toUpperCase(),
        side: params.side as 'buy' | 'sell',
        orderType: params.orderType as 'market' | 'limit',
        thesisPreview: sanitized.preview || undefined,
        thesisLength: thesis.length,
        source: typeof params.source === 'string' ? params.source : undefined,
        surface: typeof params.surface === 'string' ? (params.surface as AstraSurface) : undefined,
        isRealExecution: false,
        redactedKeys: sanitized.redactedKeys,
      });

      return {
        status: 'success_local',
        message: 'Order draft saved locally. No real trade was executed.',
        auditParams: {
          draftId: saved.id,
          symbol: saved.symbol,
          side: saved.side,
          orderType: saved.orderType,
          thesisPreview: saved.thesisPreview ?? '',
          thesisLength: String(saved.thesisLength),
          isRealExecution: 'false',
          source: saved.source ?? 'astra',
          surface: saved.surface ?? 'unknown',
          redactedKeys: saved.redactedKeys,
        },
      };
    }
    case 'astra.set_intensity_mode_local': {
      const intensityMode = String(params.intensityMode) as 'silent' | 'balanced' | 'active';
      await memoryService.setExplicitPreferencesLocal({
        intensityMode,
      });

      return {
        status: 'success_local',
        message: 'ASTRA intensity mode updated locally.',
        auditParams: {
          intensityMode,
          source: typeof params.source === 'string' ? params.source : 'astra',
        },
      };
    }
    case 'astra.mute_surface_local': {
      const surface = params.surface as AstraSurface;
      const muted = typeof params.muted === 'boolean' ? params.muted : true;
      await preferenceService.setSurfaceMuted({
        surface,
        muted,
        source: typeof params.source === 'string' ? params.source : undefined,
      });

      return {
        status: 'success_local',
        message: 'ASTRA surface mute preference updated locally.',
        auditParams: {
          surface,
          muted: muted ? 'true' : 'false',
          source: typeof params.source === 'string' ? params.source : 'astra',
        },
      };
    }
    case 'market.pin_asset_local': {
      const assetSymbol = String(params.assetSymbol ?? '').trim().toUpperCase();
      if (EXACT_ADDRESS_PATTERN.test(assetSymbol)) {
        return {
          status: 'blocked',
          message: 'Contract addresses are not allowed in local ASTRA asset pins.',
          auditParams: {
            assetSymbol: '[redacted]',
            source: typeof params.source === 'string' ? params.source : 'astra',
            surface: typeof params.surface === 'string' ? params.surface : 'unknown',
            redactedKeys: ['assetSymbol'],
          },
        };
      }

      await preferenceService.pinAsset({
        assetSymbol,
        source: typeof params.source === 'string' ? params.source : undefined,
        surface: typeof params.surface === 'string' ? (params.surface as AstraSurface) : undefined,
      });

      return {
        status: 'success_local',
        message: 'Asset pinned locally for ASTRA surfaces.',
        auditParams: {
          assetSymbol,
          source: typeof params.source === 'string' ? params.source : 'astra',
          surface: typeof params.surface === 'string' ? params.surface : 'unknown',
        },
      };
    }
    case 'astra.pin_insight_local': {
      const insightId = String(params.insightId ?? '').trim().slice(0, 120);
      await preferenceService.pinInsight({
        insightId,
        source: typeof params.source === 'string' ? params.source : undefined,
        surface: typeof params.surface === 'string' ? (params.surface as AstraSurface) : undefined,
      });

      return {
        status: 'success_local',
        message: 'Insight pinned locally for ASTRA.',
        auditParams: {
          insightId,
          source: typeof params.source === 'string' ? params.source : 'astra',
          surface: typeof params.surface === 'string' ? params.surface : 'unknown',
        },
      };
    }
    default:
      return {
        status: 'failed',
        message: 'Unsupported local ASTRA tool.',
        auditParams: {},
      };
  }
}
