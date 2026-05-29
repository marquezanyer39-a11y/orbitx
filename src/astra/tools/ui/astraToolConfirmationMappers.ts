import type { AstraUiTone } from '../../ui/types/astraUi.types';
import type {
  AstraToolConfirmationField,
  AstraToolConfirmationMapperOptions,
  AstraToolConfirmationSanitizedPayload,
  AstraToolConfirmationToneConfig,
  AstraToolConfirmationViewModel,
  AstraToolResolvedPendingConfirmation,
} from './astraToolConfirmation.types';

const SENSITIVE_PARAM_KEYS = new Set([
  'privatekey',
  'seed',
  'mnemonic',
  'signature',
  'accesstoken',
  'refreshtoken',
  'session',
  'rawtransaction',
  'calldata',
  'signingpayload',
]);

const DEFAULT_CONFIRMATION_COPY: AstraToolConfirmationToneConfig = {
  title: 'Accion pendiente de confirmacion',
  tone: 'warning',
  confirmLabel: 'Aprobar simulacion',
  cancelLabel: 'Cancelar',
};

const TOOL_CONFIRMATION_COPY: Record<string, AstraToolConfirmationToneConfig> = {
  'web3.review_approval_mock': {
    title: 'Revisar aprobacion mock',
    tone: 'warning',
    confirmLabel: 'Confirmar revision',
    cancelLabel: 'Rechazar',
  },
  'trade.prepare_order_mock': {
    title: 'Revisar orden mock',
    tone: 'warning',
    confirmLabel: 'Preparar mock',
    cancelLabel: 'Cancelar',
  },
};

const CONFIRMABLE_TOOL_IDS = new Set([
  'web3.review_approval_mock',
  'trade.prepare_order_mock',
]);

export function isAstraToolUiConfirmable(toolId: string): boolean {
  return CONFIRMABLE_TOOL_IDS.has(toolId);
}

export function truncateAddress(value: string): string {
  if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
    return value;
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function isAddressLike(value: unknown): value is string {
  return typeof value === 'string' && /^0x[a-fA-F0-9]{40}$/.test(value);
}

function formatNumericPreview(value: number): string {
  if (!Number.isFinite(value)) {
    return 'No disponible';
  }

  if (Math.abs(value) >= 1000) {
    return value.toLocaleString('en-US', {
      maximumFractionDigits: 2,
    });
  }

  return value.toLocaleString('en-US', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 4,
  });
}

function formatPreviewValue(key: string, value: unknown): string {
  if (isAddressLike(value)) {
    return truncateAddress(value);
  }

  if (typeof value === 'number') {
    return formatNumericPreview(value);
  }

  if (typeof value === 'boolean') {
    return value ? 'Si' : 'No';
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return 'No disponible';
    }

    const maybeNumber = Number(trimmed);
    if (/amount|qty|quantity|value|size|price/i.test(key) && Number.isFinite(maybeNumber)) {
      return formatNumericPreview(maybeNumber);
    }

    return /^0x[a-fA-F0-9]{40}$/.test(trimmed) ? truncateAddress(trimmed) : trimmed.slice(0, 120);
  }

  return 'Dato estructurado';
}

function titleizeKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

export function sanitizeAstraToolParamsForUi(
  params: Record<string, unknown> = {},
): AstraToolConfirmationSanitizedPayload {
  const fields: AstraToolConfirmationField[] = [];
  const redactedKeys: string[] = [];

  Object.entries(params).forEach(([key, value]) => {
    if (SENSITIVE_PARAM_KEYS.has(key.toLowerCase())) {
      redactedKeys.push(key);
      return;
    }

    fields.push({
      label: titleizeKey(key),
      value: formatPreviewValue(key, value),
    });
  });

  return {
    summary: fields.length > 0 ? 'Revisa los datos visibles antes de continuar.' : 'Accion pendiente de confirmacion.',
    fields,
    redactedKeys,
  };
}

function mapSpecificToolFields(
  toolId: string,
  params: Record<string, unknown>,
): AstraToolConfirmationField[] | null {
  if (toolId === 'web3.review_approval_mock') {
    return [
      {
        label: 'Token',
        value: formatPreviewValue('tokenSymbol', params.tokenSymbol),
      },
      {
        label: 'Red',
        value: formatPreviewValue('chainId', params.chainId),
      },
      {
        label: 'Spender',
        value: formatPreviewValue('spenderLabel', params.spenderLabel),
      },
    ];
  }

  if (toolId === 'trade.prepare_order_mock') {
    return [
      {
        label: 'Par',
        value: formatPreviewValue('symbol', params.symbol),
      },
      {
        label: 'Lado',
        value: formatPreviewValue('side', params.side),
      },
      {
        label: 'Tipo',
        value: formatPreviewValue('orderType', params.orderType),
      },
    ];
  }

  return null;
}

function buildBody(summary: string, fields: AstraToolConfirmationField[]): string {
  if (fields.length === 0) {
    return summary;
  }

  const fieldLines = fields.map((field) => `${field.label}: ${field.value}`);
  return `${summary}\n\n${fieldLines.join('\n')}`;
}

function getToolToneConfig(toolId: string): AstraToolConfirmationToneConfig {
  return TOOL_CONFIRMATION_COPY[toolId] ?? DEFAULT_CONFIRMATION_COPY;
}

export function mapPendingConfirmationToSheetModel(
  input: AstraToolResolvedPendingConfirmation,
  options: AstraToolConfirmationMapperOptions = {},
): AstraToolConfirmationViewModel {
  const now = options.now ?? (() => Date.now());
  const toolCopy = getToolToneConfig(input.result.toolId);
  const sanitized = sanitizeAstraToolParamsForUi(input.params);
  const specificFields = mapSpecificToolFields(input.result.toolId, input.params ?? {});
  const fields = specificFields ?? sanitized.fields;
  const summary = fields.length > 0 ? input.record.safeSummary : sanitized.summary;
  const body = buildBody(summary, fields);
  const isExpired = new Date(input.record.expiresAt).getTime() <= now();
  const tone: AstraUiTone = isExpired ? 'critical' : toolCopy.tone;

  return {
    toolId: input.result.toolId,
    token: input.record.token,
    expiresAt: input.record.expiresAt,
    title: isExpired ? 'Confirmacion expirada' : toolCopy.title,
    body: isExpired ? 'La solicitud ya no esta disponible. Vuelve a intentarlo.' : body,
    tone,
    confirmLabel: toolCopy.confirmLabel,
    cancelLabel: toolCopy.cancelLabel,
    summary,
    fields,
    redactedKeys: sanitized.redactedKeys,
  };
}
