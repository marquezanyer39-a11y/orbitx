import { useEffect, useMemo, useState } from 'react';

import { useOrbitStore } from '../../store/useOrbitStore';
import { useAstra } from './useAstra';
import { useAuthStore } from '../store/authStore';
import { useMonthlyRewardsPoolStore } from '../store/monthlyRewardsPoolStore';
import { useWalletStore } from '../store/walletStore';
import type { RewardsPoolAssetSymbol } from '../types/rewardsPool';
import {
  buildRewardsPoolAssetOptions,
  buildRewardsPoolQuotePreview,
  buildRewardsPoolSnapshot,
  buildMaskedOrbitCode,
  getRewardsPoolRemainingMs,
} from '../services/rewardsPool/poolMath';
import {
  formatPoolCountdown,
  formatPoolPercent,
  formatPoolStatus,
  formatUsdCents,
  getRewardsPoolCopy,
} from '../services/rewardsPool/poolCopy';
import { MONTHLY_REWARDS_POOL_CONFIG } from '../services/rewardsPool/poolSeed';

interface ProjectionDraft {
  assetSymbol?: RewardsPoolAssetSymbol | null;
  amountInput?: string;
}

export function useMonthlyRewardsPool(draft?: ProjectionDraft) {
  const language = useOrbitStore((state) => state.settings.language);
  const tokens = useOrbitStore((state) => state.tokens);
  const profile = useAuthStore((state) => state.profile);
  const pool = useMonthlyRewardsPoolStore((state) => state.pool);
  const participations = useMonthlyRewardsPoolStore((state) => state.participations);
  const syntheticGroups = useMonthlyRewardsPoolStore((state) => state.syntheticGroups);
  const results = useMonthlyRewardsPoolStore((state) => state.results);
  const finalSummary = useMonthlyRewardsPoolStore((state) => state.finalSummary);
  const hydratePool = useMonthlyRewardsPoolStore((state) => state.hydratePool);
  const refreshLifecycle = useMonthlyRewardsPoolStore((state) => state.refreshLifecycle);
  const startDistribution = useMonthlyRewardsPoolStore((state) => state.startDistribution);
  const finalizePool = useMonthlyRewardsPoolStore((state) => state.finalizePool);
  const submitParticipation = useMonthlyRewardsPoolStore((state) => state.submitParticipation);
  const spotBalances = useWalletStore((state) => state.spotBalances);
  const { openAstra } = useAstra();

  const copy = useMemo(() => getRewardsPoolCopy(language), [language]);
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    hydratePool();
    refreshLifecycle();
  }, [hydratePool, refreshLifecycle]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNowTick(Date.now());
    }, 1_000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (pool.status === 'distributing' && !pool.finalizedAt) {
      const finalizeTimeout = setTimeout(() => {
        finalizePool(profile.orbitId);
      }, 1_600);

      return () => {
        clearTimeout(finalizeTimeout);
      };
    }

    return undefined;
  }, [finalizePool, pool.finalizedAt, pool.status, profile.orbitId]);

  const assetOptions = useMemo(
    () =>
      buildRewardsPoolAssetOptions({
        config: MONTHLY_REWARDS_POOL_CONFIG,
        tokens,
        spotBalances,
      }),
    [spotBalances, tokens],
  );

  const selectedAsset =
    assetOptions.find((asset) => asset.symbol === draft?.assetSymbol) ??
    assetOptions[0] ??
    null;

  const quotePreview = useMemo(
    () =>
      buildRewardsPoolQuotePreview({
        amountInput: draft?.amountInput ?? '',
        asset: selectedAsset,
        config: MONTHLY_REWARDS_POOL_CONFIG,
      }),
    [draft?.amountInput, selectedAsset],
  );

  const snapshot = useMemo(
    () =>
      buildRewardsPoolSnapshot({
        pool,
        participations,
        syntheticGroups,
        currentUserId: profile.orbitId,
        currentUserMask: buildMaskedOrbitCode(profile.orbitId),
        projectedQuote: quotePreview.isValid ? quotePreview : null,
        now: nowTick,
      }),
    [nowTick, participations, pool, profile.orbitId, quotePreview, syntheticGroups],
  );

  useEffect(() => {
    if ((snapshot.status === 'full' || snapshot.status === 'expired') && !pool.distributionStartedAt) {
      const distributionTimeout = setTimeout(() => {
        startDistribution();
      }, 1_200);

      return () => {
        clearTimeout(distributionTimeout);
      };
    }

    return undefined;
  }, [pool.distributionStartedAt, snapshot.status, startDistribution]);

  useEffect(() => {
    if (snapshot.status !== pool.status || snapshot.closedReason !== pool.closedReason) {
      refreshLifecycle(nowTick);
    }
  }, [nowTick, pool.closedReason, pool.status, refreshLifecycle, snapshot.closedReason, snapshot.status]);

  const remainingMs = getRewardsPoolRemainingMs(snapshot.pool, nowTick);
  const countdownLabel = formatPoolCountdown(language, remainingMs, copy);
  const progressLabel = formatPoolPercent(language, snapshot.progressPercent);
  const amountLabel = `${formatUsdCents(language, snapshot.totalPoolUsdCents)} / ${formatUsdCents(
    language,
    snapshot.pool.targetUsdCents,
  )}`;
  const currentUserDisplayRow = snapshot.currentUserRow ?? snapshot.projectedRow;
  const currentUserDisplayResult = snapshot.currentUserResult ?? snapshot.projectedResult;
  const statusLabel = formatPoolStatus(copy, snapshot.status);
  const homeSummary = `${amountLabel} · ${progressLabel}`;

  const handleOpenAstra = () => {
    openAstra({
      surface: 'pool',
      screenName: 'MonthlyRewardsPool',
      surfaceTitle: copy.currentPoolTitle,
      summary: `${copy.headerBody}. ${amountLabel}. ${countdownLabel}.`,
      poolStatusLabel: statusLabel,
      poolAmountLabel: formatUsdCents(language, snapshot.totalPoolUsdCents),
      poolTargetLabel: formatUsdCents(language, snapshot.pool.targetUsdCents),
      poolTimeRemainingLabel: countdownLabel,
      poolUserParticipationLabel: currentUserDisplayRow
        ? formatUsdCents(language, currentUserDisplayRow.aporteUsdCents)
        : undefined,
      poolEstimatedPositionLabel: currentUserDisplayRow
        ? `#${currentUserDisplayRow.position}`
        : undefined,
    });
  };

  return {
    language,
    copy,
    pool,
    results,
    finalSummary,
    snapshot,
    assetOptions,
    selectedAsset,
    quotePreview,
    countdownLabel,
    progressLabel,
    amountLabel,
    remainingMs,
    statusLabel,
    currentUserDisplayRow,
    currentUserDisplayResult,
    homeSummary,
    handleOpenAstra,
    submitParticipation,
  };
}
