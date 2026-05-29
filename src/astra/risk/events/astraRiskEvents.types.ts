import type { AstraEventPublishResult, AstraWeb3Event } from '../../events/astraEvents.types';
import type {
  AstraRiskLevel,
  AstraRiskRecommendedAction,
  AstraRiskSource,
} from '../astraRisk.types';

export type AstraRiskEventType =
  | 'token_scanned'
  | 'approval_scanned'
  | 'high_risk_detected'
  | 'critical_risk_detected'
  | 'adapter_unavailable';

export type AstraRiskEventSource = 'risk_sandbox' | 'manual_test' | 'internal_controller';

export type AstraRiskEventSurface = 'wallet' | 'market' | 'trade' | 'portfolio';

export interface AstraRiskEventPayload {
  riskEventType: AstraRiskEventType;
  chainId: number;
  tokenPreview: string;
  riskScore: number;
  riskLevel: AstraRiskLevel;
  reasons: string[];
  warnings: string[];
  recommendedAction: AstraRiskRecommendedAction;
  confidence: number;
  source: AstraRiskSource;
  scannedAt: string;
}

export type AstraRiskWeb3Event = AstraWeb3Event & {
  payload: AstraRiskEventPayload;
};

export interface AstraRiskPublishResult extends AstraEventPublishResult {
  event?: AstraRiskWeb3Event;
  skipped?: 'flags_disabled' | 'publish_failed';
}
