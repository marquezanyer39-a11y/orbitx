import { describe, expect, it } from 'vitest';

import { AstraToolRegistry } from '../astraToolRegistry';

describe('AstraToolRegistry', () => {
  it('registra tools mock iniciales', () => {
    const registry = new AstraToolRegistry();

    expect(registry.list().map((tool) => tool.id)).toContain('astra.open_insight');
    expect(registry.list().map((tool) => tool.id)).toContain('web3.review_approval_mock');
  });

  it('devuelve null para tool inexistente', () => {
    const registry = new AstraToolRegistry();

    expect(registry.get('missing.tool' as never)).toBeNull();
  });
});
