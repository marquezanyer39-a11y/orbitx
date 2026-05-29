export type AstraRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type AstraRiskSource = 'mock' | 'local' | 'adapter';

export type AstraRiskRecommendedAction =
  | 'monitor_only'
  | 'avoid_interaction'
  | 'review_contract'
  | 'review_approval'
  | 'do_not_sign'
  | 'disconnect_from_site'
  | 'manual_review_required';

export type AstraRiskReasonCode =
  | 'token_suspicious'
  | 'contract_unverified'
  | 'possible_honeypot'
  | 'low_liquidity'
  | 'holder_concentration'
  | 'ownership_not_renounced'
  | 'high_buy_sell_tax'
  | 'blacklist_whitelist_controls'
  | 'proxy_contract'
  | 'dangerous_permissions'
  | 'infinite_approval'
  | 'suspicious_spender'
  | 'rug_pull_risk'
  | 'phishing_or_scam_signals'
  | 'adapter_unavailable'
  | 'read_only_disabled';

export interface AstraRiskReason {
  code: AstraRiskReasonCode;
  label: string;
  severity: AstraRiskLevel;
  weight: number;
}

export interface AstraRiskSignal {
  code: AstraRiskReasonCode;
  active: boolean;
  severity: AstraRiskLevel;
  weight: number;
  label?: string;
}

export interface AstraTokenRiskInput {
  chainId: number;
  tokenAddress: string;
  tokenSymbol?: string;
  scenario?: 'safe' | 'suspicious' | 'critical' | 'adapter_failure';
  metadata?: Record<string, unknown>;
}

export interface AstraApprovalRiskInput {
  chainId: number;
  tokenAddress: string;
  spenderAddress?: string;
  allowance?: string;
  scenario?: 'normal' | 'infinite_approval' | 'adapter_failure';
  metadata?: Record<string, unknown>;
}

export interface AstraRiskScanResult {
  riskScore: number;
  riskLevel: AstraRiskLevel;
  reasons: AstraRiskReason[];
  warnings: string[];
  recommendedAction: AstraRiskRecommendedAction;
  source: AstraRiskSource;
  confidence: number;
  scannedAt: string;
}

export interface AstraRiskEngineResult extends AstraRiskScanResult {
  chainId: number;
  tokenPreview: string;
  blocked?: boolean;
}

export interface AstraRiskAuditRecord {
  toolId?: string;
  eventId?: string;
  timestamp: string;
  chainId: number;
  tokenPreview: string;
  riskLevel: AstraRiskLevel;
  riskScore: number;
  reasons: string[];
  paramsHash: 'mock_hash';
}
