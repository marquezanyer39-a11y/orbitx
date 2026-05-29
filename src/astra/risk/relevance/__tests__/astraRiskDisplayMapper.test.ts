import { describe, expect, it } from 'vitest';

import { mapRiskDisplayModeToUi } from '../astraRiskDisplayMapper';

describe('astraRiskDisplayMapper', () => {
  it('convierte silent a none', () => {
    expect(mapRiskDisplayModeToUi('silent')).toBe('none');
  });

  it('convierte ambient a card', () => {
    expect(mapRiskDisplayModeToUi('ambient')).toBe('card');
  });

  it('convierte alert a banner', () => {
    expect(mapRiskDisplayModeToUi('alert')).toBe('banner');
  });

  it('convierte critical a critical', () => {
    expect(mapRiskDisplayModeToUi('critical')).toBe('critical');
  });
});
