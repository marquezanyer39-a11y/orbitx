import { describe, expect, it } from 'vitest';

import { createMarketEvent } from '../../../events/handlers/marketEventHandler';
import { createWeb3Event } from '../../../events/handlers/web3EventHandler';
import {
  mapDisplayModeToUiComponent,
  mapEventToInsightContent,
  resolveSurfaceInsight,
} from '../astraSurfaceMappers';

describe('astraSurfaceMappers', () => {
  it('si flag esta apagada, no produce insight', () => {
    const event = createMarketEvent({
      id: 'surface-1',
      title: 'Mercado en pausa',
      message: 'BTC sigue lateral',
      severity: 'info',
      targetScreen: 'market',
    });

    const result = resolveSurfaceInsight({
      enabled: false,
      event,
      surface: 'market',
    });

    expect(result).toBeNull();
  });

  it('displayMode silent no renderiza', () => {
    const event = createMarketEvent({
      id: 'surface-2',
      title: 'Movimiento menor',
      message: 'ETH muestra consolidacion',
      severity: 'warning',
      targetScreen: 'trade',
    });

    const result = resolveSurfaceInsight({
      enabled: true,
      event,
      surface: 'trade',
      intensityMode: 'silent',
    });

    expect(result).toBeNull();
  });

  it('displayMode ambient produce MicroCard', () => {
    const event = createMarketEvent({
      id: 'surface-3',
      title: 'Momentum temprano',
      message: 'SOL gana traccion gradual',
      severity: 'info',
    });

    const result = resolveSurfaceInsight({
      enabled: true,
      event,
      surface: 'market',
      intensityMode: 'active',
    });

    expect(result?.relevance.displayMode).toBe('ambient');
    expect(result?.uiComponent).toBe('microCard');
  });

  it('displayMode alert produce AlertBanner', () => {
    const event = createMarketEvent({
      id: 'surface-4',
      title: 'Volatilidad detectada',
      message: 'BTC acelera cerca de resistencia',
      severity: 'warning',
      targetScreen: 'trade',
    });

    const result = resolveSurfaceInsight({
      enabled: true,
      event,
      surface: 'trade',
      intensityMode: 'balanced',
    });

    expect(result?.relevance.displayMode).toBe('alert');
    expect(result?.uiComponent).toBe('alertBanner');
  });

  it('evento critical produce AlertBanner critical', () => {
    const event = createWeb3Event({
      id: 'surface-5',
      title: 'Permiso riesgoso',
      message: 'Se detecto una aprobacion de alto riesgo',
      severity: 'critical',
      targetScreen: 'wallet',
      riskCode: 'approval',
    });

    const result = resolveSurfaceInsight({
      enabled: true,
      event,
      surface: 'wallet',
      intensityMode: 'silent',
    });

    expect(result?.relevance.displayMode).toBe('critical');
    expect(result?.uiComponent).toBe('alertBanner');
    expect(result?.tone).toBe('critical');
  });

  it('mapper es puro con mismo input', () => {
    const event = createMarketEvent({
      id: 'surface-6',
      title: 'Pullback controlado',
      message: 'BNB mantiene estructura alcista',
      severity: 'info',
      targetScreen: 'market',
    });
    const relevance = {
      score: 46,
      displayMode: 'ambient' as const,
      reason: 'deterministic test',
    };

    const first = mapEventToInsightContent(event, relevance);
    const second = mapEventToInsightContent(event, relevance);

    expect(first).toEqual(second);
    expect(mapDisplayModeToUiComponent('silent')).toBe('none');
  });
});
