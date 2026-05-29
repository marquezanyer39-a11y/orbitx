import { describe, expect, it } from 'vitest';

import {
  ASTRA_RISK_SANDBOX_SCENARIOS,
  createAstraRiskSandboxFlags,
} from '../astraRiskSandboxFixtures';

describe('astraRiskSandboxFixtures', () => {
  it('incluye escenarios obligatorios', () => {
    expect(ASTRA_RISK_SANDBOX_SCENARIOS.map((scenario) => scenario.id)).toEqual([
      'safe_token',
      'suspicious_token',
      'critical_token',
      'normal_approval',
      'infinite_approval',
      'adapter_failure',
    ]);
  });

  it('flags locales no activan adapters externos ni ejecución real', () => {
    const flags = createAstraRiskSandboxFlags();

    expect(flags.ASTRA_RISK_ENGINE_ENABLED).toBe(true);
    expect(flags.ASTRA_RISK_READ_ONLY_ENABLED).toBe(true);
    expect(flags.ASTRA_RISK_EXTERNAL_ADAPTERS_ENABLED).toBe(false);
    expect(flags.ASTRA_RISK_REAL_EXECUTION_ENABLED).toBe(false);
  });

  it('modo flags apagadas no toca defaults reales', () => {
    const flags = createAstraRiskSandboxFlags(true);

    expect(flags.ASTRA_RISK_ENGINE_ENABLED).toBe(false);
    expect(flags.ASTRA_RISK_REAL_EXECUTION_ENABLED).toBe(false);
  });
});
