export type LanguageCode =
  | 'en'
  | 'es'
  | 'pt'
  | 'zh-Hans'
  | 'hi'
  | 'ru'
  | 'ar'
  | 'id';
export type AppearanceMode = 'night' | 'day' | 'orbit';
export type OrbitAccentPreset = 'violet' | 'cyan' | 'lime' | 'sunset' | 'rose';
export type OrbitTextPreset = 'default' | 'ice' | 'neon' | 'gold';
export type OrbitMotionPreset =
  | 'bull'
  | 'bear'
  | 'battle';
export type OrbitUsageMode = 'basic' | 'pro';
export type UiDensity = 'compact' | 'comfortable';
export type PrivacyMode = 'standard' | 'strict';
export type AppLayoutMode = 'default' | 'reordered';
export type QuickAccessAction = 'trade' | 'browser' | 'markets' | 'launchpad';
export type MarketFilter = 'trending' | 'new' | 'popular';
export type OrbitChainKey =
  | 'ethereum'
  | 'base'
  | 'bnb'
  | 'tron'
  | 'solana'
  | 'bitcoin';
export type LaunchChain = 'ethereum' | 'base' | 'bnb' | 'solana' | 'tron';
export type LaunchVenue = 'orbitx' | 'uniswap' | 'pancakeswap' | 'raydium';
export type TokenLaunchMode = 'orbitx' | 'dex';
export type DexLaunchNetwork = 'ethereum' | 'base' | 'bnb' | 'solana';
export type WalletNetwork = 'ethereum' | 'base' | 'bnb' | 'solana';
export type ExternalWalletProvider = 'metamask' | 'walletconnect';
export type TokenLifecycleStatus =
  | 'created'
  | 'ready_to_list'
  | 'external_listing_selected'
  | 'orbitx_listing_pending_checks'
  | 'orbitx_listing_checks_failed'
  | 'orbitx_listing_pending_liquidity'
  | 'orbitx_listing_pending_lock'
  | 'orbitx_listed'
  | 'lock_expired'
  | 'high_risk';
export type TokenListingType = 'external' | 'orbitx_protected';
export type ContractSafetyStatus = 'idle' | 'running' | 'passed' | 'failed';
export type PreListingValidationStatus = 'idle' | 'running' | 'passed' | 'failed';
export type LiquidityLockStatus = 'unavailable' | 'pending' | 'locked' | 'failed' | 'expired';
export type WalletMode = 'custodial' | 'non-custodial';
export type FundsAction = 'deposit' | 'withdraw' | 'send';
export type TradeSide = 'buy' | 'sell';
export type BotRisk = 'conservative' | 'balanced' | 'aggressive';
export type BotMarketType = 'spot' | 'futures';
export type ToastTone = 'success' | 'error' | 'info';
export type ReactionKey = 'fire' | 'rocket' | 'diamond';
export type SessionStatus = 'signed_out' | 'authenticated';
export type AuthProvider = 'local' | 'supabase';
export type PortfolioMode = 'simulated' | 'onchain';
export type WalletSyncStatus = 'idle' | 'syncing' | 'success' | 'error';
export type ActivityKind =
  | 'auth'
  | 'deposit'
  | 'withdraw'
  | 'send'
  | 'buy'
  | 'sell'
  | 'create_token'
  | 'bot'
  | 'social'
  | 'settings';

export interface ContractSafetyReport {
  status: ContractSafetyStatus;
  checkedAt?: string;
  network?: LaunchChain;
  contractAddress?: string;
  runtimeCodeHash?: string;
  expectedRuntimeCodeHash?: string;
  codeVerified: boolean;
  templateMatched: boolean;
  reasons: string[];
  warnings: string[];
}

export interface PreListingTradeValidation {
  status: PreListingValidationStatus;
  checkedAt?: string;
  network?: WalletNetwork;
  buyPathValid: boolean;
  sellPathValid: boolean;
  sellBlocked: boolean;
  estimatedSellFeePct?: number;
  priceImpactPct?: number;
  reasons: string[];
}

export interface TokenLiquidityState {
  listingType: TokenListingType;
  network: LaunchChain;
  dexVenue: LaunchVenue;
  poolAddress: string;
  creatorWallet: string;
  tokenAddress: string;
  pairKind: 'native' | 'stable';
  quoteTokenId?: string;
  quoteAddress?: string;
  quoteDecimals?: number;
  tokenDecimals?: number;
  tokenAmount: string;
  quoteAmount: string;
  liquidityAmountUsd: number;
  lpTokenAmount?: string;
  createdAt: string;
  txHash: string;
}

export interface TokenLiquidityLock {
  status: LiquidityLockStatus;
  lockerAddress?: string;
  poolAddress?: string;
  creatorWallet?: string;
  lockStart?: string;
  lockEnd?: string;
  lockDurationDays?: number;
  lockedLiquidityAmount?: string;
  lockedLiquidityAmountUsd?: number;
  lpTokenAmount?: string;
  txHash?: string;
  deployTxHash?: string;
  reason?: string;
}

export interface TokenTransparency {
  network: OrbitChainKey;
  chainId?: number;
  contractAddress?: string;
  contractExplorerUrl?: string;
  creationTxHash?: string;
  creationExplorerUrl?: string;
  creatorWallet?: string;
  creatorExplorerUrl?: string;
  poolAddress?: string;
  poolExplorerUrl?: string;
  liquidityTxHash?: string;
  liquidityExplorerUrl?: string;
  lockTxHash?: string;
  lockExplorerUrl?: string;
  lockerAddress?: string;
  lockerExplorerUrl?: string;
}

export interface MarketToken {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  holders: number;
  color: string;
  categories: MarketFilter[];
  description: string;
  logo?: string | null;
  creator?: string;
  contractAddress?: string | null;
  deploymentTxHash?: string | null;
  deployerAddress?: string | null;
  tokenSupply?: string | null;
  tokenDecimals?: number | null;
  chainId?: number | null;
  quoteTokenId?: string | null;
  quoteAddress?: string | null;
  quoteDecimals?: number | null;
  liquidityTxHash?: string | null;
  chain?: LaunchChain;
  networkKey?: OrbitChainKey;
  launchVenue?: LaunchVenue;
  launchMode?: TokenLaunchMode;
  dexNetwork?: DexLaunchNetwork;
  poolReference?: string | null;
  poolAddress?: string | null;
  launchStatus?: 'created' | 'launched';
  listingStatus?: TokenLifecycleStatus;
  listingType?: TokenListingType | null;
  contractSafety?: ContractSafetyReport | null;
  preListingValidation?: PreListingTradeValidation | null;
  liquidity?: TokenLiquidityState | null;
  liquidityLock?: TokenLiquidityLock | null;
  transparency?: TokenTransparency | null;
  liquidityPoolUsd?: number;
  houseFeePct?: number;
  createdAt?: string;
  updatedAt?: string;
  coingeckoId?: string;
  isTradeable: boolean;
  isUserCreated?: boolean;
  kind: 'cash' | 'bluechip' | 'layer1' | 'utility' | 'meme' | 'ai';
  sparkline: number[];
}

export interface WalletAsset {
  tokenId: string;
  amount: number;
  averageCost: number;
  network?: WalletNetwork;
}

export interface PortfolioAsset extends WalletAsset {
  token: MarketToken;
  valueUsd: number;
  pnlUsd: number;
  pnlPct: number;
}

export interface BotTrade {
  id: string;
  side: TradeSide;
  tokenId: string;
  amountUsd: number;
  pnlUsd: number;
  status: 'open' | 'closed';
  timestamp: string;
}

export interface BotState {
  enabled: boolean;
  marketType: BotMarketType;
  risk: BotRisk;
  allocatedUsd: number;
  allocationPct: number;
  selectedTokenId: string;
  selectedQuoteAssetId: string;
  feePct: number;
  lastFeeUsd: number;
  dailyPnlUsd: number;
  dailyGainPct: number;
  totalProfitUsd: number;
  maxDailyTrades: number;
  history: BotTrade[];
}

export interface SocialComment {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  text: string;
  timestamp: string;
}

export interface FeedPost {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  content: string;
  timestamp: string;
  tokenSymbols: string[];
  reactions: Record<ReactionKey, number>;
  comments: SocialComment[];
}

export interface ActivityEntry {
  id: string;
  kind: ActivityKind;
  title: string;
  description: string;
  timestamp: string;
}

export interface SessionState {
  status: SessionStatus;
  provider: AuthProvider;
  recoveryEmail: string;
  passwordResetPending: boolean;
  emailConfirmed: boolean;
  lastAuthAt?: string;
}

export interface AppSettings {
  language: LanguageCode;
  appearanceMode: AppearanceMode;
  orbitAccentPreset: OrbitAccentPreset;
  orbitTextPreset: OrbitTextPreset;
  orbitMotionEnabled: boolean;
  orbitMotionPreset: OrbitMotionPreset;
  usageMode: OrbitUsageMode;
  uiDensity: UiDensity;
  privacyMode: PrivacyMode;
  appLayoutMode: AppLayoutMode;
  quickAccessAction: QuickAccessAction;
  notificationsEnabled: boolean;
  currency: 'USD';
}

export interface ExternalWalletState {
  provider: ExternalWalletProvider | null;
  address: string;
  simulated: boolean;
  signingReady?: boolean;
  connectedAt?: string;
}

export interface WalletFutureState {
  simulated: boolean;
  portfolioMode: PortfolioMode;
  onchainAssets: WalletAsset[];
  syncStatus: WalletSyncStatus;
  supportedRealTokenIds: string[];
  lastOnchainSyncAt?: string;
  lastOnchainSyncError?: string;
  seedPhraseStatus: 'planned' | 'ready' | 'generated';
  seedPhraseRevealedAt?: string;
  seedPhraseConfirmedAt?: string;
  backupReminderEnabled: boolean;
  biometricsEnabled: boolean;
  receiveAddresses: Record<WalletNetwork, string>;
  externalWallet: ExternalWalletState;
  lastWalletInitAt?: string;
  lastMarketSyncAt?: string;
}

export interface UserProfile {
  orbitId: string;
  name: string;
  email: string;
  handle: string;
  avatar: string;
  avatarUri?: string | null;
  level: string;
  walletMode: WalletMode;
}

export interface ToastMessage {
  id: string;
  message: string;
  tone: ToastTone;
}

export interface ActionResult {
  ok: boolean;
  message: string;
  code?: string;
}

export interface CreateTokenPayload {
  name: string;
  symbol: string;
  decimals: number;
  logo?: string | null;
  description?: string;
  supply: string;
  chain: LaunchChain;
  launchVenue: LaunchVenue;
  contractAddress: string;
  deploymentTxHash: string;
  deployerAddress: string;
}

export interface LaunchTokenPayload {
  mode: TokenLaunchMode;
  listingType: TokenListingType;
  lifecycleStatus: TokenLifecycleStatus;
  dexNetwork?: DexLaunchNetwork;
  pairKind?: 'native' | 'stable';
  tokenLiquidityAmount?: number;
  quoteLiquidityAmount?: number;
  liquidityPoolUsd: number;
  estimatedFeeUsd: number;
  poolReference?: string;
  poolAddress?: string;
  quoteTokenId?: string;
  quoteAddress?: string;
  quoteDecimals?: number;
  tokenDecimals?: number;
  priceUsd?: number;
  marketCapUsd?: number;
  liquidityTxHash?: string;
  creatorWallet?: string;
  dexVenue?: LaunchVenue;
  chainId?: number;
  contractSafety?: ContractSafetyReport | null;
  preListingValidation?: PreListingTradeValidation | null;
  liquidityLock?: TokenLiquidityLock | null;
  lpTokenAmount?: string;
}

export interface OrbitPersistedState {
  profile: UserProfile;
  settings: AppSettings;
  walletFuture: WalletFutureState;
  tokens: MarketToken[];
  assets: WalletAsset[];
  bot: BotState;
  feed: FeedPost[];
  activity: ActivityEntry[];
}

export interface OrbitStoreState extends OrbitPersistedState {
  hasHydrated: boolean;
  toast: ToastMessage | null;
}

export interface OrbitStoreActions {
  setHasHydrated: (value: boolean) => void;
  showToast: (message: string, tone?: ToastTone) => void;
  hideToast: () => void;
  setLanguage: (language: LanguageCode) => void;
  setAppearanceMode: (mode: AppearanceMode) => void;
  setOrbitAccentPreset: (preset: OrbitAccentPreset) => void;
  setOrbitTextPreset: (preset: OrbitTextPreset) => void;
  toggleOrbitMotion: () => void;
  setOrbitMotionPreset: (preset: OrbitMotionPreset) => void;
  applyOrbitThemePreset: (
    accentPreset: OrbitAccentPreset,
    textPreset: OrbitTextPreset,
    motionPreset: OrbitMotionPreset,
  ) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setUsageMode: (mode: OrbitUsageMode) => void;
  setUiDensity: (density: UiDensity) => void;
  setPrivacyMode: (mode: PrivacyMode) => void;
  setAppLayoutMode: (mode: AppLayoutMode) => void;
  setQuickAccessAction: (action: QuickAccessAction) => void;
  updateProfileIdentity: (username: string) => ActionResult;
  toggleWalletMode: () => void;
  toggleBiometrics: () => Promise<ActionResult>;
  toggleBackupReminder: () => void;
  depositFunds: (assetId: string, amount: number) => ActionResult;
  withdrawFunds: (assetId: string, amount: number, destination: string) => ActionResult;
  sendFunds: (assetId: string, amount: number, destination: string) => ActionResult;
  buyToken: (tokenId: string, usdAmount: number) => ActionResult;
  sellToken: (tokenId: string, usdAmount: number) => ActionResult;
  createToken: (
    payload: CreateTokenPayload,
  ) => ActionResult & { tokenId?: string };
  markTokenReadyToList: (tokenId: string) => ActionResult;
  updateTokenRecord: (
    tokenId: string,
    payload: Partial<MarketToken>,
  ) => ActionResult;
  launchToken: (
    tokenId: string,
    payload: LaunchTokenPayload,
  ) => ActionResult & { poolAddress?: string };
  setBotEnabled: (enabled: boolean) => void;
  setBotMarketType: (marketType: BotMarketType) => void;
  setBotRisk: (risk: BotRisk) => void;
  setBotTargetToken: (tokenId: string) => void;
  setBotQuoteAsset: (assetId: string) => void;
  setBotAllocationPct: (percent: number) => void;
  activateBot: () => ActionResult;
  createFeedPost: (text: string, tokenSymbol?: string) => ActionResult;
  addReaction: (postId: string, reaction: ReactionKey) => void;
  addComment: (postId: string, text: string) => ActionResult;
  initializeWalletBeta: () => Promise<ActionResult>;
  connectExternalWallet: (
    provider: ExternalWalletProvider,
    address?: string,
  ) => Promise<ActionResult>;
  disconnectExternalWallet: () => void;
  syncLiveMarket: (force?: boolean) => Promise<void>;
  syncOnchainPortfolio: (force?: boolean) => Promise<void>;
  tickMarket: () => void;
}

export type OrbitStore = OrbitStoreState & OrbitStoreActions;
