import type { AstraToolAuditRecord, AstraToolExecutionRequest, AstraToolStatus } from './astraTool.types';

const SENSITIVE_KEY_PATTERN = /(seed|private|secret|token|signature|payload|balance|amount|mnemonic|key)/i;

export function createAstraToolId(prefix: string = 'astra-tool'): string {
  const randomUUID = globalThis.crypto?.randomUUID;
  if (typeof randomUUID === 'function') {
    return `${prefix}-${randomUUID.call(globalThis.crypto)}`;
  }

  // Mock/no-op fallback only. Replace with Expo-compatible secure randomness before real execution.
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createMockParamsHash(): string {
  return 'mock_hash';
}

export function sanitizeAstraToolMetadata(params: Record<string, unknown>): Record<string, string> {
  return Object.entries(params).reduce<Record<string, string>>((metadata, [key, value]) => {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      metadata[key] = '[redacted]';
      return metadata;
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      metadata[key] = String(value).slice(0, 80);
      return metadata;
    }

    metadata[key] = '[structured]';
    return metadata;
  }, {});
}

export function createAstraToolAuditRecord(
  request: AstraToolExecutionRequest,
  status: AstraToolStatus,
): AstraToolAuditRecord {
  return {
    id: createAstraToolId('astra-audit'),
    toolId: request.toolId,
    status,
    createdAt: new Date().toISOString(),
    paramsHash: createMockParamsHash(),
    metadata: sanitizeAstraToolMetadata(request.params),
  };
}
