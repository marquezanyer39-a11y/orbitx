import type {
  RewardsPoolConfig,
  RewardsPoolParticipation,
  RewardsPoolState,
  RewardsPoolSyntheticGroup,
} from '../../types/rewardsPool';

export const MONTHLY_REWARDS_POOL_ID = 'orbitx-monthly-pool-001';
export const REFERENCE_REMAINING_MS =
  (((12 * 24) + 4) * 60 + 21) * 60 * 1000;

export const MONTHLY_REWARDS_POOL_CONFIG: RewardsPoolConfig = {
  durationDays: 30,
  targetUsdCents: 5_000_000,
  minimumUsdCents: 100,
  maximumUsdCents: 5_000,
  houseFeeBps: 1_000,
  acceptedAssets: ['USDT', 'USDC', 'BTC', 'ETH', 'SOL'],
};

function createSeedParticipation(
  id: string,
  userId: string,
  maskedCode: string,
  aporteUsdCents: number,
  createdAt: string,
): RewardsPoolParticipation {
  return {
    id,
    poolId: MONTHLY_REWARDS_POOL_ID,
    userId,
    obixUserCodeMasked: maskedCode,
    assetSymbol: 'USDT',
    assetAmount: String(aporteUsdCents / 100),
    aporteUsdCents,
    aporteRankingUsdCents: Math.min(aporteUsdCents, 1_000),
    txHash: `0xseed${id.replace(/[^a-z0-9]/gi, '').toLowerCase()}`,
    status: 'confirmed',
    createdAt,
    confirmedAt: createdAt,
  };
}

export function createMonthlyRewardsPoolSeed(now = Date.now()): {
  pool: RewardsPoolState;
  syntheticGroups: RewardsPoolSyntheticGroup[];
  participations: RewardsPoolParticipation[];
} {
  const durationMs = MONTHLY_REWARDS_POOL_CONFIG.durationDays * 24 * 60 * 60 * 1000;
  const startAt = new Date(now - (durationMs - REFERENCE_REMAINING_MS));
  const endAt = new Date(startAt.getTime() + durationMs);

  const participations: RewardsPoolParticipation[] = [
    createSeedParticipation(
      'seed-9281',
      'seed-user-9281',
      '****9281',
      5_000,
      new Date(startAt.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    ),
    createSeedParticipation(
      'seed-1142',
      'seed-user-1142',
      '****1142',
      1_000,
      new Date(startAt.getTime() + (2 * 60 * 60 + 60) * 1000).toISOString(),
    ),
  ];

  const syntheticGroups: RewardsPoolSyntheticGroup[] = [
    {
      id: 'group-nine-majority',
      amountUsdCents: 900,
      count: 3_598,
      maskSeedStart: 2200,
      createdAtStart: new Date(startAt.getTime() + 3 * 60 * 60 * 1000).toISOString(),
      createdAtStepMs: 60_000,
    },
    {
      id: 'group-eight-tail',
      amountUsdCents: 800,
      count: 1,
      maskSeedStart: 9182,
      createdAtStart: new Date(startAt.getTime() + (3 * 60 * 60 + 3_598 * 60) * 1000).toISOString(),
      createdAtStepMs: 60_000,
    },
  ];

  const pool: RewardsPoolState = {
    id: MONTHLY_REWARDS_POOL_ID,
    status: 'open',
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
    targetUsdCents: MONTHLY_REWARDS_POOL_CONFIG.targetUsdCents,
    currentUsdCents: 3_245_000,
    houseFeePercent: 10,
    participantCount: 3_601,
    acceptedAssets: MONTHLY_REWARDS_POOL_CONFIG.acceptedAssets,
    closedReason: null,
    distributionStartedAt: null,
    finalizedAt: null,
  };

  return {
    pool,
    syntheticGroups,
    participations,
  };
}
