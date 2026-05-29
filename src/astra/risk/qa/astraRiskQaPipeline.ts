import { scanApprovalRisk, scanTokenRisk } from '../astraRiskEngine';
import type { AstraRiskEngineResult } from '../astraRisk.types';
import { mapRiskResultToAstraEvent, mapRiskResultToEventPayload } from '../events/astraRiskEventMapper';
import type { AstraRiskWeb3Event } from '../events/astraRiskEvents.types';
import { computeRiskRelevance } from '../relevance/astraRiskRelevanceRules';
import type { AstraRiskRelevanceResult } from '../relevance/astraRiskRelevanceRules';
import { mapRiskDisplayModeToUi } from '../relevance/astraRiskDisplayMapper';
import type { AstraRiskUiDisplayMode } from '../relevance/astraRiskDisplayMapper';
import {
  getRiskInsightCooldownMs,
  isRiskInsightDisplayAllowed,
  shouldShowRiskInsight,
} from '../insights/astraRiskInsightGuards';
import { mapRiskInsightToAstraUi } from '../insights/astraRiskInsightMappers';
import type { AstraRiskInsightViewModel } from '../insights/astraRiskInsight.types';
import { createAstraRiskQaFlags, ASTRA_RISK_QA_SCENARIOS } from './astraRiskQaFixtures';
import type { AstraRiskQaScenario, AstraRiskQaScenarioId } from './astraRiskQaFixtures';

export type AstraRiskQaScanStatus = 'completed' | 'blocked' | 'failed';
export type AstraRiskQaStepStatus = 'mapped' | 'blocked' | 'failed';
export type AstraRiskQaRelevanceStatus = 'computed' | 'blocked' | 'failed';
export type AstraRiskQaInsightStatus = 'shown' | 'deduped' | 'cooldown_blocked' | 'hidden_by_flags';

export interface AstraRiskQaPipelineStatus {
  scan: AstraRiskQaScanStatus;
  event: AstraRiskQaStepStatus;
  relevance: AstraRiskQaRelevanceStatus;
  insight: AstraRiskQaInsightStatus;
}

export interface AstraRiskQaState {
  lastShownAtByDedupKey: Record<string, number>;
}

export interface AstraRiskQaPipelineResult {
  scenario: AstraRiskQaScenario;
  status: AstraRiskQaPipelineStatus;
  riskResult: AstraRiskEngineResult | null;
  event: AstraRiskWeb3Event | null;
  relevance: AstraRiskRelevanceResult | null;
  uiDisplayMode: AstraRiskUiDisplayMode;
  insight: AstraRiskInsightViewModel | null;
  nextState: AstraRiskQaState;
}

export interface RunRiskQaPipelineOptions {
  scenarioId: AstraRiskQaScenarioId;
  state?: AstraRiskQaState;
  nowMs?: number;
}

export const ASTRA_RISK_QA_INITIAL_STATE: AstraRiskQaState = {
  lastShownAtByDedupKey: {},
};

function findQaScenario(scenarioId: AstraRiskQaScenarioId): AstraRiskQaScenario {
  return ASTRA_RISK_QA_SCENARIOS.find((scenario) => scenario.id === scenarioId) ?? ASTRA_RISK_QA_SCENARIOS[0];
}

function cloneState(state: AstraRiskQaState = ASTRA_RISK_QA_INITIAL_STATE): AstraRiskQaState {
  return {
    lastShownAtByDedupKey: {
      ...state.lastShownAtByDedupKey,
    },
  };
}

function seedCooldownState(
  scenario: AstraRiskQaScenario,
  event: AstraRiskWeb3Event,
  state: AstraRiskQaState,
  nowMs: number,
): void {
  const dedupKey = event.dedupKey ?? event.id;

  if (scenario.mode === 'duplicate' || scenario.mode === 'cooldown_active') {
    state.lastShownAtByDedupKey[dedupKey] = nowMs;
  }

  if (scenario.mode === 'cooldown_expired') {
    state.lastShownAtByDedupKey[dedupKey] = nowMs - getRiskInsightCooldownMs(event) - 1;
  }
}

export async function runRiskQaPipeline(
  options: RunRiskQaPipelineOptions,
): Promise<AstraRiskQaPipelineResult> {
  const scenario = findQaScenario(options.scenarioId);
  const nowMs = options.nowMs ?? Date.now();
  const nextState = cloneState(options.state);
  const flags = createAstraRiskQaFlags(scenario.mode === 'flags_disabled');

  const riskResult =
    scenario.baseScenario.kind === 'approval'
      ? await scanApprovalRisk(scenario.baseScenario.approvalInput!, { flags })
      : await scanTokenRisk(scenario.baseScenario.tokenInput!, { flags });

  if (riskResult.blocked) {
    return {
      scenario,
      status: {
        scan: 'blocked',
        event: 'blocked',
        relevance: 'blocked',
        insight: 'hidden_by_flags',
      },
      riskResult,
      event: null,
      relevance: null,
      uiDisplayMode: 'none',
      insight: null,
      nextState,
    };
  }

  const event = mapRiskResultToAstraEvent(riskResult, {
    surface: 'wallet',
    eventSource: 'manual_test',
  });
  const relevance = computeRiskRelevance({
    payload: mapRiskResultToEventPayload(riskResult),
    intensityMode: 'balanced',
  });
  const uiDisplayMode = mapRiskDisplayModeToUi(relevance.displayMode);
  const insight = mapRiskInsightToAstraUi(event, relevance);

  seedCooldownState(scenario, event, nextState, nowMs);

  const shownMap = new Map(Object.entries(nextState.lastShownAtByDedupKey));
  const cooldownMs = getRiskInsightCooldownMs(event);
  const canShow = shouldShowRiskInsight(event, nowMs, shownMap, cooldownMs);
  const allowed = isRiskInsightDisplayAllowed(insight, flags);
  nextState.lastShownAtByDedupKey = Object.fromEntries(shownMap.entries());

  let insightStatus: AstraRiskQaInsightStatus = 'shown';
  if (!allowed) {
    insightStatus = 'hidden_by_flags';
  } else if (!canShow && scenario.mode === 'duplicate') {
    insightStatus = 'deduped';
  } else if (!canShow) {
    insightStatus = 'cooldown_blocked';
  }

  return {
    scenario,
    status: {
      scan: 'completed',
      event: 'mapped',
      relevance: 'computed',
      insight: insightStatus,
    },
    riskResult,
    event,
    relevance,
    uiDisplayMode,
    insight: allowed && canShow ? insight : null,
    nextState,
  };
}
