import { describe, expect, it } from 'vitest';

import { AstraEventBus } from '../../events/astraEventBus';
import { createMarketEvent } from '../../events/handlers/marketEventHandler';
import { createPortfolioEvent } from '../../events/handlers/portfolioEventHandler';
import { createWeb3Event } from '../../events/handlers/web3EventHandler';
import { computeRelevance } from '../relevanceEngine';

function createContext(intensityMode: 'silent' | 'balanced' | 'active' = 'balanced') {
  return {
    activeScreen: 'home',
    userProfile: {
      experienceLevel: 'intermediate' as const,
      riskTolerance: 'moderate' as const,
      intensityMode,
      language: 'es' as const,
      activeHours: [],
    },
  };
}

describe('computeRelevance', () => {
  it('intensityMode silent oculta eventos no criticos', () => {
    const event = createMarketEvent({
      id: 'market-1',
      title: 'Movimiento de mercado',
      message: 'BTC acelera al alza',
      severity: 'warning',
      pairSymbol: 'BTC/USDT',
      targetScreen: 'trade',
    });

    const result = computeRelevance({
      event,
      context: createContext('silent'),
      dismissalCount: 0,
    });

    expect(result.displayMode).toBe('silent');
    expect(result.reason).toContain('silent intensity');
  });

  it('evento critical siempre retorna critical', () => {
    const event = createWeb3Event({
      id: 'web3-1',
      title: 'Riesgo de aprobacion',
      message: 'Se detecto una aprobacion de alto riesgo',
      severity: 'critical',
      riskCode: 'approval',
    });

    const result = computeRelevance({
      event,
      context: createContext('silent'),
      dismissalCount: 4,
    });

    expect(result.displayMode).toBe('critical');
    expect(result.score).toBe(100);
  });

  it('score baja despues de varios dismissals', () => {
    const event = createPortfolioEvent({
      id: 'portfolio-1',
      title: 'Cambio de portfolio',
      message: 'Tu portfolio tuvo una variacion diaria',
      severity: 'warning',
      totalUsdValue: '1200.00',
      dailyUsdChange: '-25.00',
      drawdownPercent: '2.1',
      targetScreen: 'home',
    });

    const baseline = computeRelevance({
      event,
      context: createContext('balanced'),
      dismissalCount: 0,
    });
    const afterDismissals = computeRelevance({
      event,
      context: createContext('balanced'),
      dismissalCount: 3,
    });

    expect(afterDismissals.score).toBeLessThan(baseline.score);
  });

  it('computeRelevance es pura', () => {
    const event = createMarketEvent({
      id: 'market-2',
      title: 'Momentum',
      message: 'SOL gana traccion',
      severity: 'info',
      pairSymbol: 'SOL/USDT',
      direction: 'bullish',
    });
    const input = {
      event,
      context: createContext('active'),
      dismissalCount: 1,
    };
    const serializedInput = JSON.stringify(input);

    const resultA = computeRelevance(input);
    const resultB = computeRelevance(input);

    expect(resultA).toEqual(resultB);
    expect(JSON.stringify(input)).toBe(serializedInput);
  });
});

describe('AstraEventBus', () => {
  it('dedupKey evita duplicados dentro de 500ms', () => {
    let now = 1_000;
    const bus = new AstraEventBus({ now: () => now });
    const received: string[] = [];
    const unsubscribe = bus.subscribe('market', (event) => {
      received.push(event.id);
    });

    const event = createMarketEvent({
      id: 'market-3',
      title: 'RSI alto',
      message: 'BTC cerca de resistencia',
      severity: 'info',
      dedupKey: 'btc-resistance',
    });

    const firstResult = bus.publish(event);
    const secondResult = bus.publish({ ...event, id: 'market-3b' });

    now += 501;
    const thirdResult = bus.publish({ ...event, id: 'market-3c' });

    unsubscribe();

    expect(firstResult.published).toBe(true);
    expect(secondResult).toEqual({ published: false, reason: 'deduped' });
    expect(thirdResult.published).toBe(true);
    expect(received).toEqual(['market-3', 'market-3c']);
  });

  it('listener se limpia correctamente al hacer unsubscribe', () => {
    const bus = new AstraEventBus();
    const unsubscribe = bus.subscribe('portfolio', () => undefined);

    expect(bus.getListenerCount('portfolio')).toBe(1);

    unsubscribe();

    expect(bus.getListenerCount('portfolio')).toBe(0);
    expect(bus.getListenerCount()).toBe(0);
  });
});
