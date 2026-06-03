export const BTC_HISTORICAL_CONTEXT_LEVELS = [0.618, 0.5, 0.382];

export const ALTCOIN_STRESS_BETA = 1.4;
export const ETH_STRESS_BETA = 1.2;
export const DEFI_STRESS_BETA = 2;
export const DEFENSIVE_LIQUIDITY_SHIFT_RATIO = 0.35;

export const RECOVERY_DAYS_BY_STRESS: Record<string, { optimist: number; base: number; stress: number }> = {
  '10-20': { optimist: 30, base: 90, stress: 180 },
  '20-35': { optimist: 60, base: 180, stress: 365 },
  '35-50': { optimist: 120, base: 365, stress: 730 },
  '50+': { optimist: 180, base: 545, stress: 1095 },
};

export interface BtcStressProbabilities {
  optimist: number;
  base: number;
  stress: number;
}

export function getBtcStressProbabilities(dropPct: number): BtcStressProbabilities {
  if (dropPct < 15) return { optimist: 0.45, base: 0.45, stress: 0.1 };
  if (dropPct < 25) return { optimist: 0.3, base: 0.5, stress: 0.2 };
  if (dropPct < 35) return { optimist: 0.25, base: 0.55, stress: 0.2 };
  if (dropPct < 50) return { optimist: 0.15, base: 0.5, stress: 0.35 };
  return { optimist: 0.1, base: 0.4, stress: 0.5 };
}

export interface BtcSimulatedPriceReferences {
  stressReference: number;
  optimistReference: number;
  baseReference: number;
  extendedStressReference: number;
}

export function projectBtcSimulationReferences(
  simulatedCurrentPrice: number,
  dropPct: number,
): BtcSimulatedPriceReferences {
  const stressReference = simulatedCurrentPrice * (1 - dropPct / 100);

  return {
    stressReference,
    optimistReference: stressReference * 1.25,
    baseReference: stressReference * 1.1,
    extendedStressReference: stressReference * 0.88,
  };
}

export function getStressTimeframe(dropPct: number): string {
  const key = dropPct < 20 ? '10-20'
    : dropPct < 35 ? '20-35'
    : dropPct < 50 ? '35-50'
    : '50+';
  const days = RECOVERY_DAYS_BY_STRESS[key];
  return `Optimist: ${days.optimist} days | Base: ${days.base} days | Stress: ${days.stress} days`;
}

export function estimateLiquidationContext(dropPct: number): string {
  if (dropPct < 10) return 'low simulated liquidation context';
  if (dropPct < 20) return 'moderate simulated liquidation context';
  if (dropPct < 30) return 'elevated simulated liquidation context';
  if (dropPct < 40) return 'high simulated liquidation context';
  return 'critical simulated liquidation context';
}

export function projectSimulatedFearGreed(currentFG: number, dropPct: number): number {
  const drop = currentFG - dropPct * 1.8;
  return Math.max(3, Math.round(drop));
}
