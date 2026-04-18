import type { MarketToken } from '../../../types';
import type {
  RewardsPoolAssetOption,
  RewardsPoolAssetSymbol,
  RewardsPoolClosedReason,
  RewardsPoolConfig,
  RewardsPoolFinalSummary,
  RewardsPoolLeaderboardRow,
  RewardsPoolParticipation,
  RewardsPoolParticipationStatus,
  RewardsPoolQuotePreview,
  RewardsPoolResolvedEntry,
  RewardsPoolResult,
  RewardsPoolSnapshot,
  RewardsPoolState,
  RewardsPoolStatus,
  RewardsPoolSyntheticGroup,
} from '../../types/rewardsPool';

interface SpotBalanceLike {
  symbol: string;
  amount: number;
}

interface BuildSnapshotOptions {
  pool: RewardsPoolState;
  participations: RewardsPoolParticipation[];
  syntheticGroups: RewardsPoolSyntheticGroup[];
  currentUserId: string;
  currentUserMask: string;
  projectedQuote?: RewardsPoolQuotePreview | null;
  now?: number;
}

const DECIMAL_SCALE = 12n;
const SCALE_FACTOR = 10n ** DECIMAL_SCALE;
const HUNDRED = 100n;
const TEN_DOLLARS_CENTS = 1_000;
const SYNTHETIC_ENTRY_CACHE = new Map<string, RewardsPoolResolvedEntry[]>();

const ACCEPTED_ASSET_META: Record<
  RewardsPoolAssetSymbol,
  { tokenIds: string[]; symbol: string; name: string; networkLabel: string }
> = {
  USDT: {
    tokenIds: ['usdt'],
    symbol: 'USDT',
    name: 'Tether USD',
    networkLabel: 'Base',
  },
  USDC: {
    tokenIds: ['usd', 'usdc'],
    symbol: 'USDC',
    name: 'USD Coin',
    networkLabel: 'Base',
  },
  BTC: {
    tokenIds: ['btc'],
    symbol: 'BTC',
    name: 'Bitcoin',
    networkLabel: 'Bitcoin',
  },
  ETH: {
    tokenIds: ['eth'],
    symbol: 'ETH',
    name: 'Ethereum',
    networkLabel: 'Base',
  },
  SOL: {
    tokenIds: ['sol'],
    symbol: 'SOL',
    name: 'Solana',
    networkLabel: 'Solana',
  },
};

function normalizeInput(value: string) {
  return value.replace(',', '.').trim();
}

function parseDecimalToScaledInt(value: string, scale = Number(DECIMAL_SCALE)) {
  const normalized = normalizeInput(value);
  if (!normalized) {
    return null;
  }

  const match = normalized.match(/^(\d+)(?:\.(\d+))?$/);
  if (!match) {
    return null;
  }

  const integerPart = match[1] ?? '0';
  const decimalPart = (match[2] ?? '').slice(0, scale).padEnd(scale, '0');
  return BigInt(`${integerPart}${decimalPart}`);
}

function divideRounded(numerator: bigint, denominator: bigint) {
  if (denominator === 0n) {
    return 0n;
  }

  return (numerator + denominator / 2n) / denominator;
}

function sumNumbers(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0);
}

function toIso(baseMs: number) {
  return new Date(baseMs).toISOString();
}

function buildEntryCacheKey(group: RewardsPoolSyntheticGroup) {
  return [
    group.id,
    group.amountUsdCents,
    group.count,
    group.maskSeedStart,
    group.createdAtStart,
    group.createdAtStepMs ?? 0,
  ].join('|');
}

function buildMaskFromSeed(value: number) {
  return `****${String(value).padStart(4, '0').slice(-4)}`;
}

function buildParticipationEntry(
  participation: RewardsPoolParticipation,
): RewardsPoolResolvedEntry {
  return {
    entryId: participation.id,
    userId: participation.userId,
    maskedCode: participation.obixUserCodeMasked,
    aporteUsdCents: participation.aporteUsdCents,
    aporteRankingUsdCents: participation.aporteRankingUsdCents,
    createdAt: participation.confirmedAt ?? participation.createdAt,
  };
}

export function buildMaskedOrbitCode(orbitId: string) {
  const digits = orbitId.replace(/\D/g, '');
  return `****${digits.slice(-4).padStart(4, '0')}`;
}

export function getRewardsPoolRemainingMs(pool: RewardsPoolState, now = Date.now()) {
  return Math.max(new Date(pool.endAt).getTime() - now, 0);
}

export function buildRewardsPoolAssetOptions({
  config,
  tokens,
  spotBalances,
}: {
  config: RewardsPoolConfig;
  tokens: MarketToken[];
  spotBalances: SpotBalanceLike[];
}): RewardsPoolAssetOption[] {
  return config.acceptedAssets.map((symbol) => {
    const meta = ACCEPTED_ASSET_META[symbol];
    const token =
      tokens.find((item) => item.symbol.toUpperCase() === symbol) ??
      tokens.find((item) => meta.tokenIds.includes(item.id));
    const balance = spotBalances.find((item) => item.symbol.toUpperCase() === symbol)?.amount ?? 0;
    const priceUsd =
      token?.price ??
      (symbol === 'USDT' || symbol === 'USDC' ? 1 : 0);
    const networkLabel =
      token?.chain === 'ethereum'
        ? 'Ethereum'
        : token?.chain === 'base'
          ? 'Base'
          : token?.chain === 'bnb'
            ? 'BNB Chain'
            : token?.chain === 'solana'
              ? 'Solana'
              : meta.networkLabel;

    return {
      symbol,
      name: token?.name ?? meta.name,
      logoUri: token?.logo ?? null,
      networkLabel,
      priceUsd,
      balance,
      available: Boolean(priceUsd),
      usdBalanceCents: Math.max(Math.round(balance * priceUsd * 100), 0),
    };
  });
}

export function buildRewardsPoolQuotePreview({
  amountInput,
  asset,
  config,
}: {
  amountInput: string;
  asset: RewardsPoolAssetOption | null;
  config: RewardsPoolConfig;
}): RewardsPoolQuotePreview {
  const normalized = normalizeInput(amountInput);
  const parsedAmount = Number.parseFloat(normalized);

  if (!asset || !normalized || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return {
      assetSymbol: asset?.symbol ?? 'USDT',
      assetAmountInput: amountInput,
      assetAmountNumber: Number.isFinite(parsedAmount) ? parsedAmount : 0,
      aporteUsdCents: 0,
      aporteRankingUsdCents: 0,
      isValid: false,
      errorCode: 'invalid_amount',
    };
  }

  const amountInt = parseDecimalToScaledInt(normalized);
  const priceInt = parseDecimalToScaledInt(asset.priceUsd.toFixed(Number(DECIMAL_SCALE)));
  if (!amountInt || !priceInt || asset.priceUsd <= 0) {
    return {
      assetSymbol: asset.symbol,
      assetAmountInput: amountInput,
      assetAmountNumber: parsedAmount,
      aporteUsdCents: 0,
      aporteRankingUsdCents: 0,
      isValid: false,
      errorCode: 'invalid_amount',
    };
  }

  const aporteUsdCents = Number(
    divideRounded(amountInt * priceInt * HUNDRED, SCALE_FACTOR * SCALE_FACTOR),
  );

  if (aporteUsdCents < config.minimumUsdCents) {
    return {
      assetSymbol: asset.symbol,
      assetAmountInput: amountInput,
      assetAmountNumber: parsedAmount,
      aporteUsdCents,
      aporteRankingUsdCents: Math.min(aporteUsdCents, TEN_DOLLARS_CENTS),
      isValid: false,
      errorCode: 'below_minimum',
    };
  }

  if (aporteUsdCents > config.maximumUsdCents) {
    return {
      assetSymbol: asset.symbol,
      assetAmountInput: amountInput,
      assetAmountNumber: parsedAmount,
      aporteUsdCents,
      aporteRankingUsdCents: Math.min(aporteUsdCents, TEN_DOLLARS_CENTS),
      isValid: false,
      errorCode: 'above_maximum',
    };
  }

  if (parsedAmount - asset.balance > 0.0000001) {
    return {
      assetSymbol: asset.symbol,
      assetAmountInput: amountInput,
      assetAmountNumber: parsedAmount,
      aporteUsdCents,
      aporteRankingUsdCents: Math.min(aporteUsdCents, TEN_DOLLARS_CENTS),
      isValid: false,
      errorCode: 'insufficient_balance',
    };
  }

  return {
    assetSymbol: asset.symbol,
    assetAmountInput: amountInput,
    assetAmountNumber: parsedAmount,
    aporteUsdCents,
    aporteRankingUsdCents: Math.min(aporteUsdCents, TEN_DOLLARS_CENTS),
    isValid: true,
  };
}

export function compareRewardsPoolEntries(
  left: RewardsPoolResolvedEntry,
  right: RewardsPoolResolvedEntry,
) {
  if (left.aporteRankingUsdCents !== right.aporteRankingUsdCents) {
    return right.aporteRankingUsdCents - left.aporteRankingUsdCents;
  }

  const leftTime = new Date(left.createdAt).getTime();
  const rightTime = new Date(right.createdAt).getTime();

  if (leftTime !== rightTime) {
    return leftTime - rightTime;
  }

  return left.entryId.localeCompare(right.entryId);
}

export function expandSyntheticGroups(groups: RewardsPoolSyntheticGroup[]) {
  const entries: RewardsPoolResolvedEntry[] = [];

  groups.forEach((group) => {
    const cacheKey = buildEntryCacheKey(group);
    const cached = SYNTHETIC_ENTRY_CACHE.get(cacheKey);
    if (cached) {
      entries.push(...cached);
      return;
    }

    const createdAtStartMs = new Date(group.createdAtStart).getTime();
    const generated: RewardsPoolResolvedEntry[] = Array.from({ length: group.count }, (_, index) => {
      const maskSeed = group.maskSeedStart + index;
      const createdAtMs = createdAtStartMs + index * (group.createdAtStepMs ?? 60_000);

      return {
        entryId: `${group.id}-${index + 1}`,
        userId: `${group.id}-user-${index + 1}`,
        maskedCode: buildMaskFromSeed(maskSeed),
        aporteUsdCents: group.amountUsdCents,
        aporteRankingUsdCents: Math.min(group.amountUsdCents, TEN_DOLLARS_CENTS),
        createdAt: toIso(createdAtMs),
      };
    });

    SYNTHETIC_ENTRY_CACHE.set(cacheKey, generated);
    entries.push(...generated);
  });

  return entries;
}

export function calculateRewardsPoolSummary(totalPoolUsdCents: number): RewardsPoolFinalSummary {
  const houseFeeUsdCents = Number((BigInt(totalPoolUsdCents) * 10n) / 100n);
  const distributableUsdCents = totalPoolUsdCents - houseFeeUsdCents;
  const top4PoolUsdCents = Number((BigInt(distributableUsdCents) * 50n) / 100n);
  const variablePoolUsdCents = distributableUsdCents - top4PoolUsdCents;

  return {
    totalPoolUsdCents,
    houseFeeUsdCents,
    distributableUsdCents,
    top4PoolUsdCents,
    variablePoolUsdCents,
  };
}

function allocateCentsByWeight(
  totalCents: number,
  weights: Array<{ key: string; weight: number }>,
) {
  const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0 || totalCents <= 0 || !weights.length) {
    return Object.fromEntries(weights.map((item) => [item.key, 0]));
  }

  const denominator = BigInt(totalWeight);
  const allocations: Record<string, number> = {};
  let assigned = 0;

  const remainders = weights.map((item, index) => {
    const numerator = BigInt(totalCents) * BigInt(item.weight);
    const floorShare = Number(numerator / denominator);
    allocations[item.key] = floorShare;
    assigned += floorShare;

    return {
      key: item.key,
      remainder: numerator % denominator,
      index,
    };
  });

  let remainderCents = totalCents - assigned;
  if (remainderCents <= 0) {
    return allocations;
  }

  remainders
    .sort((left, right) => {
      if (left.remainder === right.remainder) {
        return left.index - right.index;
      }

      return left.remainder > right.remainder ? -1 : 1;
    })
    .forEach((item) => {
      if (remainderCents <= 0) {
        return;
      }
      allocations[item.key] += 1;
      remainderCents -= 1;
    });

  return allocations;
}

function buildResultsMap(
  poolId: string,
  orderedEntries: RewardsPoolResolvedEntry[],
  summary: RewardsPoolFinalSummary,
) {
  const variableAllocations = allocateCentsByWeight(
    summary.variablePoolUsdCents,
    orderedEntries.map((entry) => ({
      key: entry.userId,
      weight: entry.aporteUsdCents,
    })),
  );

  const rankWeights = [60, 24, 12, 4];
  const top4Entries = orderedEntries.slice(0, 4);
  const rankAllocations = allocateCentsByWeight(
    summary.top4PoolUsdCents,
    top4Entries.map((entry, index) => ({
      key: entry.userId,
      weight: rankWeights[index] ?? 0,
    })),
  );

  const payoutMap: Record<string, RewardsPoolResult> = {};

  orderedEntries.forEach((entry, index) => {
    const rankPosition = index < 4 ? index + 1 : null;
    const variableRewardCents = variableAllocations[entry.userId] ?? 0;
    const rankRewardCents = rankAllocations[entry.userId] ?? 0;

    payoutMap[entry.userId] = {
      poolId,
      userId: entry.userId,
      aporteUsdCents: entry.aporteUsdCents,
      variableRewardCents,
      rankPosition,
      rankRewardCents,
      totalRewardCents: variableRewardCents + rankRewardCents,
      payoutStatus: 'pending',
    };
  });

  return payoutMap;
}

function buildLeaderboardRows(entries: RewardsPoolResolvedEntry[]): RewardsPoolLeaderboardRow[] {
  return entries.map((entry, index) => ({
    ...entry,
    position: index + 1,
  }));
}

function buildProjectedEntry(
  currentUserId: string,
  currentUserMask: string,
  quote: RewardsPoolQuotePreview,
  now: number,
): RewardsPoolResolvedEntry {
  return {
    entryId: `projected-${currentUserId}`,
    userId: currentUserId,
    maskedCode: currentUserMask,
    aporteUsdCents: quote.aporteUsdCents,
    aporteRankingUsdCents: quote.aporteRankingUsdCents,
    createdAt: toIso(now),
    isProjected: true,
    isCurrentUser: true,
  };
}

export function resolveRewardsPoolStatus({
  pool,
  totalPoolUsdCents,
  now = Date.now(),
}: {
  pool: RewardsPoolState;
  totalPoolUsdCents: number;
  now?: number;
}): { status: RewardsPoolStatus; closedReason: RewardsPoolClosedReason } {
  if (pool.finalizedAt) {
    return {
      status: 'finalized',
      closedReason: pool.closedReason,
    };
  }

  if (pool.distributionStartedAt) {
    return {
      status: 'distributing',
      closedReason: pool.closedReason,
    };
  }

  if (totalPoolUsdCents >= pool.targetUsdCents) {
    return {
      status: 'full',
      closedReason: 'target_reached',
    };
  }

  if (now >= new Date(pool.endAt).getTime()) {
    return {
      status: 'expired',
      closedReason: 'time_expired',
    };
  }

  return {
    status: 'open',
    closedReason: null,
  };
}

export function buildRewardsPoolSnapshot({
  pool,
  participations,
  syntheticGroups,
  currentUserId,
  currentUserMask,
  projectedQuote,
  now = Date.now(),
}: BuildSnapshotOptions): RewardsPoolSnapshot {
  const confirmedParticipations = participations.filter(
    (item): item is RewardsPoolParticipation & { status: RewardsPoolParticipationStatus } =>
      item.status === 'confirmed',
  );
  const actualEntries = [
    ...confirmedParticipations.map(buildParticipationEntry),
    ...expandSyntheticGroups(syntheticGroups),
  ].sort(compareRewardsPoolEntries);

  const totalPoolUsdCents = sumNumbers(actualEntries.map((entry) => entry.aporteUsdCents));
  const summary = calculateRewardsPoolSummary(totalPoolUsdCents);
  const payoutMap = buildResultsMap(pool.id, actualEntries, summary);
  const actualRows = buildLeaderboardRows(actualEntries);
  const currentUserParticipation =
    confirmedParticipations.find((item) => item.userId === currentUserId) ?? null;
  const currentUserRow =
    actualRows.find((row) => row.userId === currentUserId) ?? null;
  const currentUserResult = currentUserParticipation ? payoutMap[currentUserId] ?? null : null;
  const lifecycle = resolveRewardsPoolStatus({ pool, totalPoolUsdCents, now });

  let projectedEntry: RewardsPoolResolvedEntry | null = null;
  let projectedRows: RewardsPoolLeaderboardRow[] | null = null;
  let projectedResult: RewardsPoolResult | null = null;
  let projectedRow: RewardsPoolLeaderboardRow | null = null;

  if (!currentUserParticipation && projectedQuote?.isValid && lifecycle.status === 'open') {
    projectedEntry = buildProjectedEntry(currentUserId, currentUserMask, projectedQuote, now);
    const withProjection = [...actualEntries, projectedEntry].sort(compareRewardsPoolEntries);
    const projectedSummary = calculateRewardsPoolSummary(
      totalPoolUsdCents + projectedEntry.aporteUsdCents,
    );
    const projectedPayouts = buildResultsMap(pool.id, withProjection, projectedSummary);
    projectedRows = buildLeaderboardRows(withProjection);
    projectedRow = projectedRows.find((row) => row.userId === currentUserId) ?? null;
    projectedResult = projectedPayouts[currentUserId] ?? null;
  }

  const displayRowsSource = projectedRows ?? actualRows;
  const preferredPositions = [1, 2, 3, 4, 25, 87];
  const highlightedRows: RewardsPoolLeaderboardRow[] = [];

  preferredPositions.forEach((position) => {
    const row = displayRowsSource.find((item) => item.position === position);
    if (row) {
      highlightedRows.push(row);
    }
  });

  const displayCurrentRow = projectedRow ?? currentUserRow;
  if (displayCurrentRow && !highlightedRows.some((item) => item.position === displayCurrentRow.position)) {
    highlightedRows.push(displayCurrentRow);
  }

  highlightedRows.sort((left, right) => left.position - right.position);

  return {
    pool: {
      ...pool,
      status: lifecycle.status,
      closedReason: lifecycle.closedReason,
      currentUsdCents: totalPoolUsdCents,
      participantCount: actualEntries.length,
    },
    status: lifecycle.status,
    closedReason: lifecycle.closedReason,
    totalPoolUsdCents,
    houseFeeUsdCents: summary.houseFeeUsdCents,
    distributableUsdCents: summary.distributableUsdCents,
    top4PoolUsdCents: summary.top4PoolUsdCents,
    variablePoolUsdCents: summary.variablePoolUsdCents,
    progressPercent: Math.min((totalPoolUsdCents / pool.targetUsdCents) * 100, 100),
    participantCount: actualEntries.length,
    orderedEntries: actualEntries,
    top4: actualRows.slice(0, 4),
    highlightedRows,
    currentUserRow,
    currentUserParticipation,
    currentUserResult,
    projectedParticipation: projectedEntry,
    projectedRow,
    projectedResult,
    payoutMap,
  };
}

export function buildRewardsPoolResultsArray(
  snapshot: RewardsPoolSnapshot,
): RewardsPoolResult[] {
  return snapshot.orderedEntries
    .map((entry) => snapshot.payoutMap[entry.userId])
    .filter(Boolean);
}
