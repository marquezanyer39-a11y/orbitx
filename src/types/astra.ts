import type { LanguageCode } from '../../types';

export type AstraLanguage = LanguageCode;

export type AstraSurface =
  | 'home'
  | 'profile'
  | 'wallet'
  | 'trade'
  | 'market'
  | 'social'
  | 'create_token'
  | 'bot_futures'
  | 'security'
  | 'settings'
  | 'pool'
  | 'ramp'
  | 'error'
  | 'general';

export type AstraIntent =
  | 'navigation'
  | 'direct_action'
  | 'explanation'
  | 'error_resolution'
  | 'security'
  | 'guided_help'
  | 'context'
  | 'general';

export type AstraMode = 'quick' | 'guided' | 'error' | 'context';

export type AstraGuideId =
  | 'create_wallet'
  | 'import_wallet'
  | 'connect_external_wallet'
  | 'buy_crypto'
  | 'sell_crypto'
  | 'convert_assets'
  | 'deposit'
  | 'withdraw'
  | 'spot_trade'
  | 'review_chart'
  | 'understand_order_book'
  | 'change_language'
  | 'resolve_error'
  | 'activate_security';

export type AstraScreenTarget =
  | 'home'
  | 'monthly_rewards_pool'
  | 'create_token'
  | 'wallet_create'
  | 'wallet_import'
  | 'wallet'
  | 'trade'
  | 'chart'
  | 'profile'
  | 'browser'
  | 'favorites'
  | 'history'
  | 'security'
  | 'personalization'
  | 'markets'
  | 'bot_futures'
  | 'bot_futures_connect_exchange'
  | 'receive'
  | 'send'
  | 'language'
  | 'social'
  | 'ramp_buy'
  | 'ramp_sell'
  | 'ramp_convert'
  | 'ramp_pay';

export type AstraActionKind =
  | 'open_screen'
  | 'open_chart'
  | 'connect_external_wallet'
  | 'go_security_settings'
  | 'change_language'
  | 'start_guide'
  | 'resume_guide'
  | 'next_guide_step'
  | 'previous_guide_step'
  | 'cancel_guide'
  | 'resolve_with_astra';

export type AstraActionAlias =
  | 'create_memecoin'
  | 'view_market';

export interface AstraCapabilities {
  hasWalletModule: boolean;
  hasWalletCreate: boolean;
  hasWalletImport: boolean;
  hasExternalWalletConnect: boolean;
  hasDepositFlow: boolean;
  hasWithdrawFlow: boolean;
  hasTradeModule: boolean;
  hasCharts: boolean;
  hasOrderBook: boolean;
  hasMonthlyRewardsPool: boolean;
  hasSecurityCenter: boolean;
  hasLanguageSettings: boolean;
  hasSocial: boolean;
  hasP2P: boolean;
  hasRampBuy: boolean;
  hasRampSell: boolean;
  hasRampConvert: boolean;
  hasRampPay: boolean;
}

export type AstraContextPrimitive = string | number | boolean | null;

export interface AstraSelectedEntity {
  type?: string;
  id?: string;
  symbol?: string;
  name?: string;
  pair?: string;
  network?: string;
  provider?: string;
  status?: string;
  [key: string]: unknown;
}

export interface AstraUiState {
  [key: string]: unknown;
}

export interface AstraUserState {
  [key: string]: unknown;
}

export type AstraContextLabels = Record<string, AstraContextPrimitive | undefined>;

export interface AstraSupportContext {
  surface: AstraSurface;
  path: string;
  language: AstraLanguage;
  surfaceTitle?: string;
  screenName?: string;
  summary?: string;
  currentTask?: string;
  currentPairSymbol?: string;
  currentPriceLabel?: string;
  selectedEntity?: AstraSelectedEntity;
  uiState?: AstraUiState;
  userState?: AstraUserState;
  capabilities?: Partial<AstraCapabilities>;
  labels?: AstraContextLabels;
  poolStatusLabel?: string;
  poolAmountLabel?: string;
  poolTargetLabel?: string;
  poolTimeRemainingLabel?: string;
  poolUserParticipationLabel?: string;
  poolEstimatedPositionLabel?: string;
  walletReady?: boolean;
  walletStatusLabel?: string;
  seedBackedUp?: boolean;
  externalWalletConnected?: boolean;
  emailVerified?: boolean;
  accountStatusLabel?: string;
  currentThemeLabel?: string;
  twoFactorEnabled?: boolean;
  activeSessionsCount?: number;
  autoLockMinutes?: number;
  usageMode?: string;
  rampMode?: string;
  rampProviderLabel?: string;
  errorTitle?: string;
  errorBody?: string;
  balanceLabel?: string;
  spotBalanceLabel?: string;
  web3BalanceLabel?: string;
  botEnabled?: boolean;
  botRiskLabel?: string;
  botTokenLabel?: string;
  botAllocationLabel?: string;
  botDailyPnlLabel?: string;
  botStatusLabel?: string;
  botMaxTradesLabel?: string;
}

export interface AstraRecentSurface {
  id: string;
  surface: AstraSurface;
  path: string;
  screenName: string;
  pairSymbol?: string;
  visitedAt: string;
}

export interface AstraRecentError {
  id: string;
  surface: AstraSurface;
  title: string;
  body: string;
  occurredAt: string;
  linkedGuideId?: AstraGuideId;
}

export interface AstraGuideProgress {
  guideId: AstraGuideId;
  stepIndex: number;
  status: 'active' | 'paused';
  startedAt: string;
  updatedAt: string;
}

export interface AstraFlowMemory {
  guideId: AstraGuideId;
  status: 'started' | 'failed' | 'completed';
  updatedAt: string;
  error?: string;
}

export interface AstraMemorySnapshot {
  recentSurfaces: AstraRecentSurface[];
  lastIntent: AstraIntent | null;
  lastQuestion: string | null;
  lastTopic: string | null;
  lastError: AstraRecentError | null;
  lastGuideId: AstraGuideId | null;
  walletFlow: AstraFlowMemory | null;
}

export interface AstraQuickPrompt {
  id: string;
  label: string;
  question: string;
}

export interface AstraAction {
  id: string;
  label: string;
  helper?: string;
  icon: string;
  tone?: 'primary' | 'secondary' | 'positive' | 'ghost';
  kind: AstraActionKind;
  targetScreen?: AstraScreenTarget;
  chartSymbol?: string;
  language?: AstraLanguage;
  guideId?: AstraGuideId;
}

export interface AstraGuideStep {
  id: string;
  title: string;
  body: string;
  explainText?: string;
  action?: AstraAction;
}

export interface AstraGuideDefinition {
  id: AstraGuideId;
  title: string;
  summary: string;
  steps: AstraGuideStep[];
}

export interface AstraResponse {
  mode: AstraMode;
  intent: AstraIntent;
  title: string;
  body: string;
  steps?: string[];
  actions: AstraAction[];
  actionAliases?: AstraActionAlias[];
  guideId?: AstraGuideId;
}

export interface AstraMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  createdAt: string;
  helpful?: boolean | null;
  response?: AstraResponse;
}
