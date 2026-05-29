import type { AstraToolConfirmationRecord, AstraToolDefinition, AstraToolExecutionRequest } from './astraTool.types';
import { createAstraToolId, createMockParamsHash } from './astraToolAudit';

const DEFAULT_CONFIRMATION_TTL_MS = 1000 * 60 * 5;

export class AstraToolConfirmationStore {
  private readonly pending = new Map<string, AstraToolConfirmationRecord>();
  private readonly ttlMs: number;
  private readonly now: () => number;

  constructor(options: { ttlMs?: number; now?: () => number } = {}) {
    this.ttlMs = options.ttlMs ?? DEFAULT_CONFIRMATION_TTL_MS;
    this.now = options.now ?? (() => Date.now());
  }

  createPending(
    tool: AstraToolDefinition,
    _request: AstraToolExecutionRequest,
  ): AstraToolConfirmationRecord {
    this.cleanupExpired();

    const requestedAt = this.now();
    const record: AstraToolConfirmationRecord = {
      token: createAstraToolId('astra-confirmation'),
      toolId: tool.id,
      safeSummary: `${tool.label}: confirmation required before mock/no-op execution.`,
      requestedAt: new Date(requestedAt).toISOString(),
      expiresAt: new Date(requestedAt + this.ttlMs).toISOString(),
      paramsHash: createMockParamsHash(),
    };

    this.pending.set(record.token, record);
    return record;
  }

  getPending(token: string): AstraToolConfirmationRecord | null {
    this.cleanupExpired();
    return this.pending.get(token) ?? null;
  }

  cleanupExpired(): void {
    const nowIso = new Date(this.now()).toISOString();
    this.pending.forEach((record, token) => {
      if (record.expiresAt <= nowIso) {
        this.pending.delete(token);
      }
    });
  }

  clear(): void {
    this.pending.clear();
  }

  getPendingCount(): number {
    this.cleanupExpired();
    return this.pending.size;
  }
}

export const astraToolConfirmationStore = new AstraToolConfirmationStore();
