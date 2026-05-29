import { describe, expect, it } from 'vitest';

import { AstraToolRegistry } from '../astraToolRegistry';
import { validateAstraToolParams } from '../astraToolValidator';

describe('validateAstraToolParams', () => {
  it('valida params correctos con zod', () => {
    const registry = new AstraToolRegistry();
    const tool = registry.get('astra.open_insight');

    const result = validateAstraToolParams(tool!, { insightId: 'insight-1' });

    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rechaza params invalidos con zod', () => {
    const registry = new AstraToolRegistry();
    const tool = registry.get('astra.open_insight');

    const result = validateAstraToolParams(tool!, { insightId: '' });

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
