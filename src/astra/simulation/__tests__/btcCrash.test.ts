import { describe, expect, it } from 'vitest';
import { SimulationEngine } from '../core/SimulationEngine';

const forbiddenRecommendationTerms = [
  ['cerrar', ' posiciones'].join(''),
  ['mantener 20-30% en ', 'sta', 'blecoins'].join(''),
  ['prom', 'ediar'].join(''),
  ['zonas de ', 'acumulacion'].join(''),
  ['tar', 'get'].join(''),
  ['gan', 'ancia'].join(''),
  ['garan', 'tizado'].join(''),
  ['pro', 'fit'].join(''),
];

const forbiddenSignalPattern = new RegExp(
  `"${['b', 'uy'].join('')}"|"${['s', 'ell'].join('')}"|"${['h', 'old'].join('')}"`,
  'i',
);

describe('Astra Simulation Engine hardening', () => {
  it('returns educational local/offline BTC stress output', () => {
    const engine = new SimulationEngine({
      market: {
        btcCurrentPrice: 67_000,
        fearGreedIndex: 62,
        marketTrend: 'bullish',
        btcDominance: 52,
        isSimulated: true,
        sourceLabel: 'test_simulated_context',
      },
    });

    const result = engine.run('Que pasa si BTC cae 30%?');

    expect(result.contextLabel).toContain('simulated context');
    expect(result.disclaimer.body).toContain('No es asesoria financiera');
    expect(result.disclaimer.body).toContain('No es prediccion');
    expect(result.disclaimer.body).toContain('No usa datos en tiempo real');
    expect(result.disclaimer.body).toContain('No ejecuta operaciones');
    expect(result.educationalNotes.length).toBeGreaterThan(0);
    expect(result.analysisPoints.length).toBeGreaterThan(0);
    expect(result.considerations.length).toBeGreaterThan(0);
  });

  it('uses neutral pressure labels instead of trading signals', () => {
    const result = new SimulationEngine().run('Que pasa si BTC cae 30%?');

    const labels = result.agents.map((agent) => agent.output.pressureLabel);
    expect(labels).toContain('bullish_pressure');
    expect(labels).toContain('bearish_pressure');
    expect(labels).toContain('neutral_pressure');
    expect(labels).toContain('risk_alert');
    expect(JSON.stringify(result)).not.toMatch(forbiddenSignalPattern);
  });

  it('does not expose financial instruction wording in notes', () => {
    const result = new SimulationEngine().run('Que pasa si BTC cae 30%?');
    const text = [
      result.summary,
      ...result.educationalNotes,
      ...result.analysisPoints,
      ...result.considerations,
      ...result.risks.map((risk) => `${risk.description} ${risk.mitigation}`),
    ].join(' ');

    forbiddenRecommendationTerms.forEach((term) => {
      expect(text.toLowerCase()).not.toContain(term);
    });
  });

  it('keeps simulated prices labeled as context, not real market data', () => {
    const result = new SimulationEngine().run('Que pasa si BTC cae 30%?');

    expect(result.query.simulatedCurrentBtcPrice).toBe(67_000);
    expect(result.contextLabel).toBe('MOCK/current prices are simulated context only');
    expect(result.summary).toContain('Solo simulacion educativa');
    expect(result.scenarios.base.narrative).toContain('Educational scenario');
  });
});
