import type { AstraFeatureFlags } from '../../config/astraFlags';
import type { AstraEventBus } from '../../events/astraEventBus';
import type { AstraUiTone } from '../../ui/types/astraUi.types';
import type { AstraRiskWeb3Event, AstraRiskEventSurface } from '../events/astraRiskEvents.types';
import type { AstraRiskUiDisplayMode } from '../relevance/astraRiskDisplayMapper';
import type { AstraRiskRelevanceResult } from '../relevance/astraRiskRelevanceRules';

export interface AstraRiskInsightMetadata {
  chainId: number;
  tokenPreview: string;
  riskLevel: string;
  riskScore: string;
  recommendedAction: string;
}

export interface AstraRiskInsightViewModel {
  displayMode: AstraRiskUiDisplayMode;
  title: string;
  body: string;
  tone: AstraUiTone;
  actionLabel?: 'Revisar riesgo';
  metadata: AstraRiskInsightMetadata;
  dedupKey?: string;
}

export interface AstraRiskInsightHostProps {
  enabled?: boolean;
  event?: AstraRiskWeb3Event | null;
  relevance?: AstraRiskRelevanceResult | null;
  eventBus?: AstraEventBus;
  surface?: AstraRiskEventSurface;
  showCriticalAsSheet?: boolean;
  flags?: Partial<AstraFeatureFlags>;
  now?: () => number;
  cooldownMs?: number;
  adapterUnavailableCooldownMs?: number;
  onDismiss?: () => void;
  onShow?: (insight: AstraRiskInsightViewModel) => void;
}

export interface AstraRiskInsightState {
  activeInsight: AstraRiskInsightViewModel | null;
  queue: AstraRiskInsightViewModel[];
}
