import type {
  AstraApprovalRiskInput,
  AstraRiskSignal,
  AstraRiskSource,
  AstraTokenRiskInput,
} from '../astraRisk.types';

export interface AstraRiskAdapterResult {
  source: AstraRiskSource;
  confidence: number;
  signals: AstraRiskSignal[];
  metadata?: Record<string, unknown>;
}

export interface AstraRiskAdapter {
  scanToken(input: AstraTokenRiskInput): Promise<AstraRiskAdapterResult>;
  scanApproval(input: AstraApprovalRiskInput): Promise<AstraRiskAdapterResult>;
}
