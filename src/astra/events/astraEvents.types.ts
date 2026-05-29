export type AstraEventType = 'market' | 'portfolio' | 'web3';

export type AstraEventSeverity = 'info' | 'warning' | 'critical';

export interface AstraEventBase<TType extends AstraEventType, TPayload> {
  id: string;
  type: TType;
  severity: AstraEventSeverity;
  title: string;
  message: string;
  timestamp: string;
  source: string;
  dedupKey?: string;
  throttleMs?: number;
  targetScreen?: string;
  payload: TPayload;
}

export interface AstraMarketEventPayload {
  pairSymbol?: string;
  direction?: 'bullish' | 'bearish' | 'sideways';
  changePercent?: string;
}

export interface AstraPortfolioEventPayload {
  totalUsdValue?: string;
  dailyUsdChange?: string;
  drawdownPercent?: string;
}

export interface AstraWeb3EventPayload {
  walletAddress?: string;
  network?: string;
  riskCode?: 'approval' | 'phishing' | 'simulation' | 'transaction';
  riskEventType?:
    | 'token_scanned'
    | 'approval_scanned'
    | 'high_risk_detected'
    | 'critical_risk_detected'
    | 'adapter_unavailable';
  chainId?: number;
  tokenPreview?: string;
  riskScore?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  reasons?: string[];
  warnings?: string[];
  recommendedAction?:
    | 'monitor_only'
    | 'avoid_interaction'
    | 'review_contract'
    | 'review_approval'
    | 'do_not_sign'
    | 'disconnect_from_site'
    | 'manual_review_required';
  confidence?: number;
  riskSource?: 'mock' | 'local' | 'adapter';
  scannedAt?: string;
}

export type AstraMarketEvent = AstraEventBase<'market', AstraMarketEventPayload>;
export type AstraPortfolioEvent = AstraEventBase<'portfolio', AstraPortfolioEventPayload>;
export type AstraWeb3Event = AstraEventBase<'web3', AstraWeb3EventPayload>;

export type AstraEvent = AstraMarketEvent | AstraPortfolioEvent | AstraWeb3Event;

export type AstraEventMap = {
  market: AstraMarketEvent;
  portfolio: AstraPortfolioEvent;
  web3: AstraWeb3Event;
};

export type AstraEventListener<TType extends AstraEventType> = (event: AstraEventMap[TType]) => void;

export interface AstraEventPublishResult {
  published: boolean;
  reason?: 'deduped' | 'throttled';
}
