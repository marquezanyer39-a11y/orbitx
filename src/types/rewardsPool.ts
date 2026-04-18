import type { LanguageCode } from '../../types';

export type RewardsPoolStatus =
  | 'open'
  | 'full'
  | 'expired'
  | 'distributing'
  | 'finalized';

export type RewardsPoolClosedReason = 'target_reached' | 'time_expired' | null;
export type RewardsPoolParticipationStatus = 'pending' | 'confirmed' | 'failed';
export type RewardsPoolPayoutStatus = 'pending' | 'ready' | 'paid';
export type RewardsPoolAssetSymbol = 'USDT' | 'USDC' | 'BTC' | 'ETH' | 'SOL';

export interface RewardsPoolConfig {
  durationDays: number;
  targetUsdCents: number;
  minimumUsdCents: number;
  maximumUsdCents: number;
  houseFeeBps: number;
  acceptedAssets: RewardsPoolAssetSymbol[];
}

export interface RewardsPoolState {
  id: string;
  status: RewardsPoolStatus;
  startAt: string;
  endAt: string;
  targetUsdCents: number;
  currentUsdCents: number;
  houseFeePercent: number;
  participantCount: number;
  acceptedAssets: RewardsPoolAssetSymbol[];
  closedReason: RewardsPoolClosedReason;
  distributionStartedAt?: string | null;
  finalizedAt?: string | null;
}

export interface RewardsPoolParticipation {
  id: string;
  poolId: string;
  userId: string;
  obixUserCodeMasked: string;
  assetSymbol: RewardsPoolAssetSymbol;
  assetAmount: string;
  aporteUsdCents: number;
  aporteRankingUsdCents: number;
  txHash: string;
  status: RewardsPoolParticipationStatus;
  createdAt: string;
  confirmedAt?: string | null;
}

export interface RewardsPoolResult {
  poolId: string;
  userId: string;
  aporteUsdCents: number;
  variableRewardCents: number;
  rankPosition: number | null;
  rankRewardCents: number;
  totalRewardCents: number;
  payoutStatus: RewardsPoolPayoutStatus;
}

export interface RewardsPoolSyntheticGroup {
  id: string;
  amountUsdCents: number;
  count: number;
  maskSeedStart: number;
  createdAtStart: string;
  createdAtStepMs?: number;
}

export interface RewardsPoolAssetOption {
  symbol: RewardsPoolAssetSymbol;
  name: string;
  logoUri?: string | null;
  networkLabel: string;
  priceUsd: number;
  balance: number;
  available: boolean;
  usdBalanceCents: number;
}

export interface RewardsPoolQuotePreview {
  assetSymbol: RewardsPoolAssetSymbol;
  assetAmountInput: string;
  assetAmountNumber: number;
  aporteUsdCents: number;
  aporteRankingUsdCents: number;
  isValid: boolean;
  errorCode?: 'invalid_amount' | 'below_minimum' | 'above_maximum' | 'insufficient_balance';
}

export interface RewardsPoolResolvedEntry {
  entryId: string;
  userId: string;
  maskedCode: string;
  aporteUsdCents: number;
  aporteRankingUsdCents: number;
  createdAt: string;
  isProjected?: boolean;
  isCurrentUser?: boolean;
}

export interface RewardsPoolLeaderboardRow extends RewardsPoolResolvedEntry {
  position: number;
}

export interface RewardsPoolFinalSummary {
  totalPoolUsdCents: number;
  houseFeeUsdCents: number;
  distributableUsdCents: number;
  top4PoolUsdCents: number;
  variablePoolUsdCents: number;
}

export interface RewardsPoolSnapshot {
  pool: RewardsPoolState;
  status: RewardsPoolStatus;
  closedReason: RewardsPoolClosedReason;
  totalPoolUsdCents: number;
  houseFeeUsdCents: number;
  distributableUsdCents: number;
  top4PoolUsdCents: number;
  variablePoolUsdCents: number;
  progressPercent: number;
  participantCount: number;
  orderedEntries: RewardsPoolResolvedEntry[];
  top4: RewardsPoolLeaderboardRow[];
  highlightedRows: RewardsPoolLeaderboardRow[];
  currentUserRow: RewardsPoolLeaderboardRow | null;
  currentUserParticipation: RewardsPoolParticipation | null;
  currentUserResult: RewardsPoolResult | null;
  projectedParticipation: RewardsPoolResolvedEntry | null;
  projectedRow: RewardsPoolLeaderboardRow | null;
  projectedResult: RewardsPoolResult | null;
  payoutMap: Record<string, RewardsPoolResult>;
}

export interface RewardsPoolCopy {
  language: LanguageCode;
  headerTitle: string;
  headerBody: string;
  headerBack: string;
  astraLabel: string;
  countdownSuffix: string;
  countdownPrefix: string;
  positionTitle: string;
  realContribution: string;
  rankingContribution: string;
  positionLabel: string;
  estimatedReward: string;
  rankingNote: string;
  rewardsTitle: string;
  rewardsExtra: string;
  liveParticipantsTitle: string;
  participateLabel: string;
  participatedLabel: string;
  blockedLabel: string;
  openStatus: string;
  fullStatus: string;
  expiredStatus: string;
  distributingStatus: string;
  finalizedStatus: string;
  fullBanner: string;
  expiredBanner: string;
  distributingBanner: string;
  finalizedBanner: string;
  finalResultsTitle: string;
  totalRaised: string;
  houseFee: string;
  distributed: string;
  yourReward: string;
  walletCta: string;
  askAstra: string;
  modalTitle: string;
  modalBody: string;
  assetSelectorLabel: string;
  amountLabel: string;
  usdEquivalent: string;
  estimatedPosition: string;
  confirmLabel: string;
  confirmPreviewTitle: string;
  confirmExecuteTitle: string;
  providerLabel: string;
  spreadLabel: string;
  etaLabel: string;
  availabilityLabel: string;
  recentTitle: string;
  favoritesTitle: string;
  actionPreview: string;
  actionExecute: string;
  searchPlaceholder: string;
  maxLabel: string;
  currentPoolTitle: string;
  poolHomeBody: string;
  poolHomeCta: string;
  poolResultsCta: string;
  minMaxLabel: string;
  txPending: string;
  txSuccess: string;
  duplicateError: string;
  poolClosedError: string;
  noBalanceError: string;
  invalidAmountError: string;
  belowMinimumError: string;
  aboveMaximumError: string;
  unavailablePair: string;
  thisIsYou: string;
  projectedBadge: string;
  oneParticipationRule: string;
  processedByOrbitX: string;
}
