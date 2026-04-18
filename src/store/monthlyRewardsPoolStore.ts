import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { useWalletStore } from './walletStore';
import type {
  RewardsPoolAssetSymbol,
  RewardsPoolFinalSummary,
  RewardsPoolParticipation,
  RewardsPoolResult,
  RewardsPoolState,
  RewardsPoolSyntheticGroup,
} from '../types/rewardsPool';
import {
  buildRewardsPoolQuotePreview,
  buildRewardsPoolResultsArray,
  buildRewardsPoolSnapshot,
  buildMaskedOrbitCode,
  resolveRewardsPoolStatus,
} from '../services/rewardsPool/poolMath';
import {
  MONTHLY_REWARDS_POOL_CONFIG,
  MONTHLY_REWARDS_POOL_ID,
  createMonthlyRewardsPoolSeed,
} from '../services/rewardsPool/poolSeed';

interface SubmitParticipationInput {
  userId: string;
  orbitId: string;
  assetSymbol: RewardsPoolAssetSymbol;
  assetAmountInput: string;
  assetPriceUsd: number;
  assetBalance: number;
}

interface SubmitParticipationResult {
  ok: boolean;
  code?:
    | 'duplicate'
    | 'closed'
    | 'invalid'
    | 'insufficient_balance'
    | 'wallet_rejected';
  participationId?: string;
}

interface MonthlyRewardsPoolState {
  hasHydrated: boolean;
  pool: RewardsPoolState;
  participations: RewardsPoolParticipation[];
  syntheticGroups: RewardsPoolSyntheticGroup[];
  results: RewardsPoolResult[];
  finalSummary: RewardsPoolFinalSummary | null;
  lastUpdatedAt: string;
  hydratePool: () => void;
  refreshLifecycle: (now?: number) => void;
  submitParticipation: (input: SubmitParticipationInput) => Promise<SubmitParticipationResult>;
  startDistribution: (now?: number) => void;
  finalizePool: (userId?: string, now?: number) => void;
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function nowIso() {
  return new Date().toISOString();
}

function getInitialState() {
  const seed = createMonthlyRewardsPoolSeed();
  return {
    pool: seed.pool,
    participations: seed.participations,
    syntheticGroups: seed.syntheticGroups,
    results: [] as RewardsPoolResult[],
    finalSummary: null as RewardsPoolFinalSummary | null,
    lastUpdatedAt: nowIso(),
  };
}

const initialState = getInitialState();

export const useMonthlyRewardsPoolStore = create<MonthlyRewardsPoolState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      ...initialState,

      hydratePool: () => {
        const state = get();
        if (state.hasHydrated) {
          return;
        }

        set({
          hasHydrated: true,
        });
      },

      refreshLifecycle: (now = Date.now()) => {
        const state = get();
        const snapshot = buildRewardsPoolSnapshot({
          pool: state.pool,
          participations: state.participations,
          syntheticGroups: state.syntheticGroups,
          currentUserId: '__lifecycle__',
          currentUserMask: '****0000',
          now,
        });

        set({
          pool: snapshot.pool,
          lastUpdatedAt: nowIso(),
        });
      },

      submitParticipation: async ({
        userId,
        orbitId,
        assetSymbol,
        assetAmountInput,
        assetPriceUsd,
        assetBalance,
      }) => {
        const state = get();
        const existing = state.participations.find(
          (item) =>
            item.userId === userId &&
            (item.status === 'pending' || item.status === 'confirmed'),
        );

        if (existing) {
          return {
            ok: false,
            code: 'duplicate',
          };
        }

        const lifecycle = resolveRewardsPoolStatus({
          pool: state.pool,
          totalPoolUsdCents: state.pool.currentUsdCents,
        });
        if (lifecycle.status !== 'open') {
          return {
            ok: false,
            code: 'closed',
          };
        }

        const preview = buildRewardsPoolQuotePreview({
          amountInput: assetAmountInput,
          asset: {
            symbol: assetSymbol,
            name: assetSymbol,
            networkLabel: assetSymbol,
            priceUsd: assetPriceUsd,
            balance: assetBalance,
            available: true,
            usdBalanceCents: Math.round(assetBalance * assetPriceUsd * 100),
          },
          config: MONTHLY_REWARDS_POOL_CONFIG,
        });

        if (!preview.isValid) {
          return {
            ok: false,
            code:
              preview.errorCode === 'insufficient_balance'
                ? 'insufficient_balance'
                : 'invalid',
          };
        }

        const participationId = `${MONTHLY_REWARDS_POOL_ID}-${userId}-${Date.now()}`;
        const pendingParticipation: RewardsPoolParticipation = {
          id: participationId,
          poolId: MONTHLY_REWARDS_POOL_ID,
          userId,
          obixUserCodeMasked: buildMaskedOrbitCode(orbitId),
          assetSymbol,
          assetAmount: assetAmountInput,
          aporteUsdCents: preview.aporteUsdCents,
          aporteRankingUsdCents: preview.aporteRankingUsdCents,
          txHash: '',
          status: 'pending',
          createdAt: nowIso(),
          confirmedAt: null,
        };

        set((current) => ({
          participations: [...current.participations, pendingParticipation],
          lastUpdatedAt: nowIso(),
        }));

        await wait(1_100);

        const walletAccepted = useWalletStore
          .getState()
          .withdrawFromSpot(assetSymbol, preview.assetAmountNumber);

        if (!walletAccepted) {
          set((current) => ({
            participations: current.participations.map((item) =>
              item.id === participationId ? { ...item, status: 'failed' } : item,
            ),
            lastUpdatedAt: nowIso(),
          }));

          return {
            ok: false,
            code: 'wallet_rejected',
          };
        }

        const confirmedAt = nowIso();
        const txHash = `0xpool${Date.now().toString(16)}${participationId
          .slice(-6)
          .replace(/-/g, '')}`;

        set((current) => {
          const nextParticipations = current.participations.map((item) =>
            item.id === participationId
              ? {
                  ...item,
                  txHash,
                  status: 'confirmed' as const,
                  confirmedAt,
                }
              : item,
          );

          const snapshot = buildRewardsPoolSnapshot({
            pool: current.pool,
            participations: nextParticipations,
            syntheticGroups: current.syntheticGroups,
            currentUserId: userId,
            currentUserMask: buildMaskedOrbitCode(orbitId),
          });

          return {
            participations: nextParticipations,
            pool: snapshot.pool,
            lastUpdatedAt: confirmedAt,
          };
        });

        return {
          ok: true,
          participationId,
        };
      },

      startDistribution: (now = Date.now()) => {
        const state = get();
        if (state.pool.status === 'distributing' || state.pool.status === 'finalized') {
          return;
        }

        const lifecycle = resolveRewardsPoolStatus({
          pool: state.pool,
          totalPoolUsdCents: state.pool.currentUsdCents,
          now,
        });

        if (lifecycle.status !== 'full' && lifecycle.status !== 'expired') {
          return;
        }

        set((current) => ({
          pool: {
            ...current.pool,
            status: 'distributing',
            closedReason: lifecycle.closedReason,
            distributionStartedAt: new Date(now).toISOString(),
          },
          lastUpdatedAt: nowIso(),
        }));
      },

      finalizePool: (userId, now = Date.now()) => {
        const state = get();
        if (state.pool.status === 'finalized') {
          return;
        }

        const snapshot = buildRewardsPoolSnapshot({
          pool: {
            ...state.pool,
            status: 'distributing',
            distributionStartedAt: state.pool.distributionStartedAt ?? new Date(now).toISOString(),
          },
          participations: state.participations,
          syntheticGroups: state.syntheticGroups,
          currentUserId: userId ?? '__finalize__',
          currentUserMask: '****0000',
          now,
        });

        const results = buildRewardsPoolResultsArray(snapshot).map((result) => ({
          ...result,
          payoutStatus:
            (result.userId === userId && result.totalRewardCents > 0 ? 'paid' : 'ready') as
              | 'paid'
              | 'ready',
        }));

        const rewardForCurrentUser =
          userId ? results.find((item) => item.userId === userId) ?? null : null;
        if (rewardForCurrentUser && rewardForCurrentUser.totalRewardCents > 0) {
          useWalletStore
            .getState()
            .depositToSpot('USDT', rewardForCurrentUser.totalRewardCents / 100);
        }

        set((current) => ({
          pool: {
            ...snapshot.pool,
            status: 'finalized',
            closedReason: snapshot.closedReason,
            distributionStartedAt:
              current.pool.distributionStartedAt ?? new Date(now).toISOString(),
            finalizedAt: new Date(now).toISOString(),
          },
          results,
          finalSummary: {
            totalPoolUsdCents: snapshot.totalPoolUsdCents,
            houseFeeUsdCents: snapshot.houseFeeUsdCents,
            distributableUsdCents: snapshot.distributableUsdCents,
            top4PoolUsdCents: snapshot.top4PoolUsdCents,
            variablePoolUsdCents: snapshot.variablePoolUsdCents,
          },
          lastUpdatedAt: nowIso(),
        }));
      },
    }),
    {
      name: 'orbitx-monthly-rewards-pool-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        pool: state.pool,
        participations: state.participations,
        syntheticGroups: state.syntheticGroups,
        results: state.results,
        finalSummary: state.finalSummary,
        lastUpdatedAt: state.lastUpdatedAt,
      }),
      onRehydrateStorage: () => () => {
        useMonthlyRewardsPoolStore.setState({ hasHydrated: true });
      },
    },
  ),
);
