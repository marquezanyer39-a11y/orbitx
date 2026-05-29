import { describe, expect, it } from 'vitest';

import { hasFullRiskAddress, sanitizeRiskMetadata, truncateRiskAddress } from '../astraRiskSanitizer';

describe('astraRiskSanitizer', () => {
  it('trunca direcciones completas', () => {
    expect(truncateRiskAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe('0x1234...5678');
  });

  it('no guarda direcciones completas ni balances exactos', () => {
    const metadata = sanitizeRiskMetadata({
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      tokenAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      exactBalance: '12345.6789',
      label: 'spender 0x1111111111111111111111111111111111111111',
    });

    const rendered = JSON.stringify(metadata);
    expect(rendered).not.toContain('0x1234567890abcdef1234567890abcdef12345678');
    expect(rendered).not.toContain('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd');
    expect(rendered).not.toContain('0x1111111111111111111111111111111111111111');
    expect(rendered).not.toContain('12345.6789');
    expect(metadata.exactBalance).toBe('[redacted]');
  });

  it('detecta direcciones completas en texto', () => {
    expect(hasFullRiskAddress('0x1111111111111111111111111111111111111111')).toBe(true);
  });
});
