import { BaseAgent, SimContext } from './BaseAgent';
import type { AgentOutput, AgentRole } from '../types/simulation.types';

export class BullAgent extends BaseAgent {
  role: AgentRole = 'bull';
  name = 'Alex Bull';
  bias = 0.8;

  reason(ctx: SimContext): AgentOutput {
    const { percentage = 30 } = ctx.query;
    const projectedLow = ctx.simulatedCurrentBtcPrice * (1 - percentage / 100);
    const recoveryReference = projectedLow * 1.25;

    this.remember(
      `Simulated demand pressure may appear near ${projectedLow.toFixed(0)}`,
      'bullish_pressure',
    );
    this.setBelief('simulated_recovery_pressure', 0.58);

    return {
      role: this.role,
      opinion:
        `In this educational model, a ${percentage}% stress event could create bullish pressure if ` +
        'liquidity absorbs forced market pressure. This is scenario context, not an instruction.',
      simulatedPriceReference: Number(recoveryReference.toFixed(0)),
      confidence: 0.61,
      pressureLabel: 'bullish_pressure',
      keyArgument:
        `The simulated lower zone near ${projectedLow.toFixed(0)} may show demand pressure, ` +
        'but the model does not predict price behavior.',
    };
  }
}

export class BearAgent extends BaseAgent {
  role: AgentRole = 'bear';
  name = 'Sara Bear';
  bias = -0.9;

  reason(ctx: SimContext): AgentOutput {
    const { percentage = 30 } = ctx.query;
    const projectedLow = ctx.simulatedCurrentBtcPrice * (1 - percentage / 100);
    const extensionReference = projectedLow * 0.88;

    this.remember(
      `Simulated stress can extend below ${projectedLow.toFixed(0)}`,
      'bearish_pressure',
    );
    this.setBelief('simulated_stress_extension', 0.64);

    return {
      role: this.role,
      opinion:
        `In this educational model, a ${percentage}% stress event may create additional bearish pressure ` +
        'through liquidations, sentiment deterioration and thinner liquidity.',
      simulatedPriceReference: Number(extensionReference.toFixed(0)),
      confidence: 0.66,
      pressureLabel: 'bearish_pressure',
      keyArgument:
        'Liquidation pressure and market fear can amplify downside scenarios in a simulated stress test.',
    };
  }
}

export class NeutralAgent extends BaseAgent {
  role: AgentRole = 'neutral';
  name = 'Marco Analisis';
  bias = 0;

  reason(ctx: SimContext): AgentOutput {
    const { percentage = 30 } = ctx.query;
    const projected = ctx.simulatedCurrentBtcPrice * (1 - percentage / 100);

    this.remember('Simulated sideways digestion before a clearer regime', 'neutral_pressure');
    this.setBelief('simulated_sideways_probability', 0.55);

    return {
      role: this.role,
      opinion:
        `A ${percentage}% simulated stress event can also resolve into a sideways phase. ` +
        'The model frames possible paths without ranking them as instructions.',
      simulatedPriceReference: Number(projected.toFixed(0)),
      confidence: 0.6,
      pressureLabel: 'neutral_pressure',
      keyArgument:
        'Neutral pressure reflects uncertainty and the need to review multiple scenarios.',
    };
  }
}

export class RiskAgent extends BaseAgent {
  role: AgentRole = 'risk';
  name = 'Lena Risk';
  bias = -0.4;

  reason(ctx: SimContext): AgentOutput {
    const { percentage = 30 } = ctx.query;
    const altcoinContagion = percentage * 1.25;
    const liquidationBand = percentage > 20 ? 'elevated simulated liquidation band' : 'moderate simulated liquidation band';

    this.remember(
      `Risk alert for simulated cross-asset contagion: ${altcoinContagion.toFixed(0)}%`,
      'risk_alert',
    );
    this.setBelief('simulated_systemic_risk', Math.min((percentage / 100) * 1.5, 1));

    return {
      role: this.role,
      opinion:
        `The educational model flags a risk alert: alt assets may react more sharply than BTC ` +
        `in the simulated context. Liquidation pressure is categorized as ${liquidationBand}.`,
      confidence: 0.78,
      pressureLabel: 'risk_alert',
      keyArgument:
        'Risk review should focus on exposure, leverage sensitivity and scenario uncertainty.',
    };
  }
}

export class MarketAgent extends BaseAgent {
  role: AgentRole = 'market';
  name = 'Market Sim';
  bias = -0.1;

  reason(ctx: SimContext): AgentOutput {
    const { percentage = 30 } = ctx.query;
    const projectedFearGreed = Math.max(5, ctx.fearGreedIndex - percentage * 1.8);
    const simulatedPrice = ctx.simulatedCurrentBtcPrice * (1 - percentage / 100);
    const volumeContext = percentage > 20 ? 'elevated simulated volume' : 'moderate simulated volume';

    this.remember(
      `Simulated fear-greed context: ${projectedFearGreed.toFixed(0)}`,
      'risk_alert',
    );
    this.setBelief('simulated_fear_greed', projectedFearGreed / 100);

    return {
      role: this.role,
      opinion:
        `The simulated market context shows ${volumeContext}, lower sentiment and a BTC reference ` +
        `level near ${simulatedPrice.toFixed(0)}. This is not real-time market data.`,
      simulatedPriceReference: Number(simulatedPrice.toFixed(0)),
      confidence: 0.72,
      pressureLabel: 'risk_alert',
      keyArgument:
        `Simulated sentiment index: ${projectedFearGreed.toFixed(0)}. Context only, not a forecast.`,
    };
  }
}
