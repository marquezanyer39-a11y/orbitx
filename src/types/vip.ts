export type VipRankId = 'basic' | 'plus' | 'vizconde' | 'gran_duque';

export type VipRequirementKind =
  | 'verification'
  | 'deposit_usdt'
  | 'trade_volume_usd'
  | 'monthly_volume_usd'
  | 'spot_futures_volume_usd'
  | 'internal_review'
  | 'monthly_limit';

export type VipBenefitKind =
  | 'ring_skin'
  | 'user_validated'
  | 'social_highlight'
  | 'live_highlight'
  | 'permanent_plus'
  | 'exclusive_airdrops'
  | 'free_projects'
  | 'live_entry_skin'
  | 'live_chat_highlight'
  | 'premium_verification'
  | 'priority_airdrops'
  | 'project_alerts'
  | 'lifetime_skin'
  | 'visibility_priority'
  | 'presence_highlight';

export type VipBenefitStatus =
  | 'lifetime'
  | 'active'
  | 'paused'
  | 'blocked'
  | 'review_required';

export type VipReviewStatus =
  | 'not_eligible'
  | 'eligible'
  | 'in_review'
  | 'approved'
  | 'rejected';

export type VipRequirementState = 'completed' | 'in_progress' | 'missing' | 'external';

export interface VipRequirement {
  id: string;
  kind: VipRequirementKind;
  label: string;
  value?: number;
}

export interface VipBenefit {
  id: string;
  kind: VipBenefitKind;
  label: string;
  description?: string;
  lifetime?: boolean;
}

export interface VipBenefitState {
  benefit: VipBenefit;
  status: VipBenefitStatus;
  reason?: string;
}

export interface VipRankVisualStyle {
  accent: string;
  accentSoft: string;
  icon: string;
}

export interface VipRank {
  id: VipRankId;
  order: number;
  level: number;
  name: string;
  shortLabel: string;
  description: string;
  requirements: VipRequirement[];
  benefits: VipBenefit[];
  lifetimeBenefits: VipBenefit[];
  activeBenefits: VipBenefit[];
  maintenanceRequirement?: VipRequirement | null;
  isExclusive: boolean;
  requiresReview: boolean;
  monthlyLimit?: number | null;
  badgeLabel: string;
  visualStyle: VipRankVisualStyle;
}

export interface VipUserStats {
  verificationStatus: 'verified' | 'pending' | 'rejected';
  totalDepositUsdt: number;
  totalTradeVolumeUsd: number;
  monthlyTradeVolumeUsd: number;
  spotAndFuturesVolumeUsd: number;
  granDuqueReviewStatus: VipReviewStatus;
  currentRankOverride?: VipRankId | null;
}

export interface VipRequirementStatus {
  requirement: VipRequirement;
  state: VipRequirementState;
  completed: boolean;
  progressFraction: number;
  currentValue?: number;
  targetValue?: number;
  missingValue?: number;
  helperText?: string;
}

export interface VipProgressResult {
  currentRank: VipRank;
  targetRank: VipRank | null;
  progressPercent: number;
  completedRequirements: VipRequirementStatus[];
  missingRequirements: VipRequirementStatus[];
  primaryMessage: string;
  nextActionLabel: string;
}

export interface VipRankDisplayState {
  currentRank: VipRank;
  nextRank: VipRank | null;
  badgeLabel: string;
  subtitle: string;
  reviewStatus: VipReviewStatus;
  isEligibleForReview: boolean;
  hasMaintenanceWarning: boolean;
  maintenanceMessage?: string;
  reviewMessage?: string;
}
