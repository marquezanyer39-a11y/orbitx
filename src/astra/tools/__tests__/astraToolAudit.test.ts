import { describe, expect, it } from 'vitest';

import { createAstraToolAuditRecord, createMockParamsHash, sanitizeAstraToolMetadata } from '../astraToolAudit';

describe('astraToolAudit', () => {
  it('sanitiza datos sensibles', () => {
    const metadata = sanitizeAstraToolMetadata({
      symbol: 'ETH/USDT',
      privateKey: 'never-store-this',
      balance: '100000',
      nested: { value: true },
    });

    expect(metadata.symbol).toBe('ETH/USDT');
    expect(metadata.privateKey).toBe('[redacted]');
    expect(metadata.balance).toBe('[redacted]');
    expect(metadata.nested).toBe('[structured]');
  });

  it('usa hash mock para FASE 5A', () => {
    const audit = createAstraToolAuditRecord(
      {
        toolId: 'astra.save_note_mock',
        params: { note: 'safe note' },
      },
      'success',
    );

    expect(createMockParamsHash()).toBe('mock_hash');
    expect(audit.paramsHash).toBe('mock_hash');
  });
});
