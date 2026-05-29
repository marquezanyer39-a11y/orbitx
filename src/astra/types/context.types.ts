export type ISO8601String = string;

export type SupportedLanguage = 'es';

export type AstraIntensityMode = 'silent' | 'balanced' | 'active';

export interface TokenContext {
  symbol: string;
  address?: string;
  network?: string;
}

export interface TradingPairContext {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
}

export interface WalletContext {
  address: string;
  type: 'eoa' | 'smart_contract';
}

export type EVMNetwork = 'ethereum' | 'polygon' | 'arbitrum' | 'optimism' | 'base';
export type SolanaNetwork = 'solana';

export interface PortfolioSnapshot {
  totalUsdValue: string; // NUMERIC string
  lastUpdated: ISO8601String;
}

export interface PnLSnapshot {
  dailyUsdChange: string; // NUMERIC string
  dailyPercentageChange: string; // NUMERIC string
}

export interface MarketContext {
  isBullish: boolean;
  globalVolume24h: string; // NUMERIC string
}

export interface VolatilityState {
  level: 'low' | 'medium' | 'high' | 'extreme';
  score: string; // NUMERIC string 0.0 - 1.0
}

export interface UserAction {
  type: string;
  timestamp: ISO8601String;
  metadata?: Record<string, string>;
}

export interface HourRange {
  startHour: number;
  endHour: number;
  timezone: string;
}

export interface AstraUserProfile {
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  intensityMode: AstraIntensityMode;
  language: SupportedLanguage;
  activeHours?: HourRange[];
}

// Para la pantalla actual se puede usar un string genérico que mapea con las rutas.
export type KiroScreen = string;

export interface AstraContext {
  // SUPERFICIE
  activeScreen: KiroScreen;
  activeToken?: TokenContext;
  activePair?: TradingPairContext;

  // WALLET
  connectedWallet: WalletContext | null;
  activeNetwork: EVMNetwork | SolanaNetwork | null;

  // PORTFOLIO — valores como NUMERIC strings
  portfolio: PortfolioSnapshot;
  pnl: PnLSnapshot;

  // MERCADO
  marketContext: MarketContext;
  volatilityState: VolatilityState;

  // HISTORIAL
  recentActions: UserAction[];

  // META
  userProfile: AstraUserProfile;
  sessionId: string;
  capturedAt: ISO8601String;
}
