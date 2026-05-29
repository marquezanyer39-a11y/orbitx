import { describe, expect, it } from 'vitest';

import { ASTRA_RISK_QA_SCENARIOS } from '../astraRiskQaFixtures';
import {
  ASTRA_RISK_QA_INITIAL_STATE,
  runRiskQaPipeline,
} from '../astraRiskQaPipeline';

describe('astraRiskQaPipeline', () => {
  it('Pipeline low token produce low y silent/card', async () => {
    const result = await runRiskQaPipeline({
      scenarioId: 'low_token',
      nowMs: 1000,
    });

    expect(result.riskResult?.riskLevel).toBe('low');
    expect(['none', 'card']).toContain(result.uiDisplayMode);
  });

  it('Pipeline high token produce banner', async () => {
    const result = await runRiskQaPipeline({
      scenarioId: 'high_token',
      nowMs: 1000,
    });

    expect(result.uiDisplayMode).toBe('banner');
    expect(result.status.insight).toBe('shown');
  });

  it('Pipeline critical token produce critical', async () => {
    const result = await runRiskQaPipeline({
      scenarioId: 'critical_token',
      nowMs: 1000,
    });

    expect(result.uiDisplayMode).toBe('critical');
    expect(result.insight?.tone).toBe('critical');
  });

  it('Adapter unavailable nunca produce critical', async () => {
    const result = await runRiskQaPipeline({
      scenarioId: 'adapter_unavailable',
      nowMs: 1000,
    });

    expect(result.event?.payload.riskEventType).toBe('adapter_unavailable');
    expect(result.uiDisplayMode).not.toBe('critical');
  });

  it('Infinite approval produce review_approval', async () => {
    const result = await runRiskQaPipeline({
      scenarioId: 'infinite_approval',
      nowMs: 1000,
    });

    expect(result.event?.payload.recommendedAction).toBe('review_approval');
  });

  it('Event preview no muestra direcciones completas', async () => {
    const result = await runRiskQaPipeline({
      scenarioId: 'critical_token',
      nowMs: 1000,
    });
    const rendered = JSON.stringify(result.event?.payload);

    expect(rendered).not.toContain('0x1234567890abcdef1234567890abcdef12345678');
    expect(result.event?.payload.tokenPreview).toBe('0x1234...5678');
  });

  it('Relevance preview contiene score/displayMode/reason', async () => {
    const result = await runRiskQaPipeline({
      scenarioId: 'high_token',
      nowMs: 1000,
    });

    expect(result.relevance?.score).toBeGreaterThan(0);
    expect(result.relevance?.displayMode).toBe('alert');
    expect(result.relevance?.reason).toContain('riskLevel');
  });

  it('Insight host recibe event/relevance, no scan directo', async () => {
    const result = await runRiskQaPipeline({
      scenarioId: 'high_token',
      nowMs: 1000,
    });

    expect(result.event).not.toBeNull();
    expect(result.relevance).not.toBeNull();
    expect(result.insight?.displayMode).toBe('banner');
  });

  it('Dedup repeated event bloquea segunda visualizacion', async () => {
    const result = await runRiskQaPipeline({
      scenarioId: 'dedup_repeated_event',
      nowMs: 1000,
      state: ASTRA_RISK_QA_INITIAL_STATE,
    });

    expect(result.status.insight).toBe('deduped');
    expect(result.insight).toBeNull();
  });

  it('Cooldown active bloquea spam', async () => {
    const result = await runRiskQaPipeline({
      scenarioId: 'cooldown_active',
      nowMs: 1000,
      state: ASTRA_RISK_QA_INITIAL_STATE,
    });

    expect(result.status.insight).toBe('cooldown_blocked');
  });

  it('Cooldown expired permite mostrar de nuevo', async () => {
    const result = await runRiskQaPipeline({
      scenarioId: 'cooldown_expired',
      nowMs: 1000 * 60 * 10,
      state: ASTRA_RISK_QA_INITIAL_STATE,
    });

    expect(result.status.insight).toBe('shown');
    expect(result.insight).not.toBeNull();
  });

  it('Flags disabled bloquean pipeline visual', async () => {
    const result = await runRiskQaPipeline({
      scenarioId: 'flags_disabled',
      nowMs: 1000,
    });

    expect(result.status.scan).toBe('blocked');
    expect(result.status.insight).toBe('hidden_by_flags');
  });

  it('incluye todos los escenarios obligatorios', () => {
    expect(ASTRA_RISK_QA_SCENARIOS.map((scenario) => scenario.id)).toEqual([
      'low_token',
      'high_token',
      'critical_token',
      'normal_approval',
      'infinite_approval',
      'adapter_unavailable',
      'flags_disabled',
      'dedup_repeated_event',
      'cooldown_active',
      'cooldown_expired',
    ]);
  });
});
