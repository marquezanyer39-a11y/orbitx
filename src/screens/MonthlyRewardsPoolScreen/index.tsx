import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenContainer } from '../../components/common/ScreenContainer';
import { LiveParticipantsList } from '../../components/rewardsPool/LiveParticipantsList';
import { ParticipateBottomSheet } from '../../components/rewardsPool/ParticipateBottomSheet';
import { PoolFinalResultsCard } from '../../components/rewardsPool/PoolFinalResultsCard';
import { PoolHeader } from '../../components/rewardsPool/PoolHeader';
import { PoolStateBanner } from '../../components/rewardsPool/PoolStateBanner';
import { POOL_THEME } from '../../components/rewardsPool/poolVisualTheme';
import { RewardsBreakdown } from '../../components/rewardsPool/RewardsBreakdown';
import { UserPoolPositionCard } from '../../components/rewardsPool/UserPoolPositionCard';
import { useMonthlyRewardsPool } from '../../hooks/useMonthlyRewardsPool';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import type { RewardsPoolAssetSymbol } from '../../types/rewardsPool';
import { PoolHeroCard } from './components/PoolHeroCard';
import { PoolParticipateButton } from './components/PoolParticipateButton';

export default function MonthlyRewardsPoolScreen() {
  const insets = useSafeAreaInsets();
  const showToast = useUiStore((state) => state.showToast);
  const profile = useAuthStore((state) => state.profile);
  const params = useLocalSearchParams<{ participate?: string }>();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState<RewardsPoolAssetSymbol | null>(null);
  const [amountInput, setAmountInput] = useState('50');
  const [submitting, setSubmitting] = useState(false);
  const {
    copy,
    pool,
    finalSummary,
    snapshot,
    assetOptions,
    selectedAsset,
    quotePreview,
    countdownLabel,
    progressLabel,
    amountLabel,
    handleOpenAstra,
    currentUserDisplayResult,
    currentUserDisplayRow,
    submitParticipation,
  } = useMonthlyRewardsPool({
    assetSymbol: selectedAssetSymbol,
    amountInput,
  });
  const poolStatus = snapshot.status;
  const displayCountdownLabel =
    copy.language === 'es' ? countdownLabel.replace('remaining', 'restantes') : countdownLabel;

  const lastPositionRef = useRef<number | null>(null);
  const lastTop4Ref = useRef<boolean | null>(null);
  const lastStatusRef = useRef(pool.status);
  const autoOpenHandledRef = useRef(false);
  const hasRealParticipation = Boolean(snapshot.currentUserParticipation);
  const liveRows = snapshot.highlightedRows;

  useEffect(() => {
    if (!selectedAssetSymbol && assetOptions.length) {
      setSelectedAssetSymbol(assetOptions[0].symbol);
    }
  }, [assetOptions, selectedAssetSymbol]);

  useEffect(() => {
    if (
      params.participate === '1' &&
      !autoOpenHandledRef.current &&
      poolStatus === 'open' &&
      !hasRealParticipation
    ) {
      autoOpenHandledRef.current = true;
      setSheetVisible(true);
    }
  }, [hasRealParticipation, params.participate, poolStatus]);

  useEffect(() => {
    const currentTop4 = currentUserDisplayRow ? currentUserDisplayRow.position <= 4 : false;
    const previousTop4 = lastTop4Ref.current;

    if (previousTop4 !== null && previousTop4 !== currentTop4) {
      showToast(
        currentTop4
          ? copy.language === 'es'
            ? 'Entraste al top 4 del pool.'
            : 'You entered the top 4 of the pool.'
          : copy.language === 'es'
            ? 'Saliste del top 4 del pool.'
            : 'You left the top 4 of the pool.',
        currentTop4 ? 'success' : 'info',
      );
    }

    if (
      lastPositionRef.current !== null &&
      currentUserDisplayRow &&
      currentUserDisplayRow.position < lastPositionRef.current
    ) {
      showToast(
        copy.language === 'es'
          ? `Subiste a la posición #${currentUserDisplayRow.position}.`
          : `You climbed to position #${currentUserDisplayRow.position}.`,
        'success',
      );
    }

    if (poolStatus !== lastStatusRef.current) {
      if (poolStatus === 'full') {
        showToast(copy.fullBanner, 'info');
      } else if (poolStatus === 'expired') {
        showToast(copy.expiredBanner, 'info');
      } else if (poolStatus === 'finalized') {
        showToast(copy.finalizedBanner, 'success');
      }
      lastStatusRef.current = poolStatus;
    }

    lastTop4Ref.current = currentTop4;
    lastPositionRef.current = currentUserDisplayRow?.position ?? null;
  }, [
    copy.expiredBanner,
    copy.finalizedBanner,
    copy.fullBanner,
    copy.language,
    currentUserDisplayRow,
    poolStatus,
    showToast,
  ]);

  const handleMax = () => {
    if (!selectedAsset) {
      return;
    }

    const maxUsd = Math.min(selectedAsset.usdBalanceCents, 5_000);
    if (selectedAsset.priceUsd <= 0) {
      return;
    }

    const assetAmount = maxUsd / 100 / selectedAsset.priceUsd;
    setAmountInput(String(Number(assetAmount.toFixed(8))));
  };

  const handleConfirm = async () => {
    if (!selectedAssetSymbol || !selectedAsset) {
      return;
    }

    setSubmitting(true);
    const result = await submitParticipation({
      userId: profile.orbitId,
      orbitId: profile.orbitId,
      assetSymbol: selectedAssetSymbol,
      assetAmountInput: amountInput,
      assetPriceUsd: selectedAsset.priceUsd,
      assetBalance: selectedAsset.balance,
    });
    setSubmitting(false);

    if (result.ok) {
      showToast(copy.txSuccess, 'success');
      setSheetVisible(false);
      return;
    }

    const message =
      result.code === 'duplicate'
        ? copy.duplicateError
        : result.code === 'closed'
          ? copy.poolClosedError
          : result.code === 'wallet_rejected' || result.code === 'insufficient_balance'
            ? copy.noBalanceError
            : copy.invalidAmountError;

    showToast(message, 'error');
  };

  const ctaLabel =
    hasRealParticipation || poolStatus !== 'open'
      ? hasRealParticipation
        ? copy.participatedLabel
        : copy.blockedLabel
      : copy.participateLabel;

  return (
    <ScreenContainer
      scrollable={false}
      contentContainerStyle={styles.content}
      backgroundMode="plain"
    >
      <View style={styles.screen}>
        <PoolHeader
          title="Pool mensual"
          backLabel={copy.headerBack}
          astraLabel={copy.astraLabel}
          onBack={() => router.back()}
          onAstra={handleOpenAstra}
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <PoolHeroCard
            title={copy.headerTitle}
            subtitle={copy.headerBody}
            countdownLabel={displayCountdownLabel}
            amountLabel={amountLabel}
            percentLabel={progressLabel}
            progressPercent={snapshot.progressPercent}
          />

          <PoolStateBanner status={poolStatus} copy={copy} />

          <UserPoolPositionCard
            copy={copy}
            language={copy.language}
            row={currentUserDisplayRow}
            result={currentUserDisplayResult}
          />

          <RewardsBreakdown copy={copy} />

          <LiveParticipantsList copy={copy} rows={liveRows} language={copy.language} />

          {poolStatus === 'finalized' ? (
            <PoolFinalResultsCard
              copy={copy}
              language={copy.language}
              summary={finalSummary}
              top4={snapshot.top4}
              currentUserResult={snapshot.currentUserResult}
              onWallet={() => router.push('/(tabs)/wallet')}
            />
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 18) }]}>
          <PoolParticipateButton
            label={ctaLabel}
            disabled={poolStatus !== 'open' || hasRealParticipation}
            onPress={() => {
              if (poolStatus !== 'open' || hasRealParticipation) {
                return;
              }
              setSheetVisible(true);
            }}
          />
        </View>
      </View>

      <ParticipateBottomSheet
        visible={sheetVisible}
        copy={copy}
        language={copy.language}
        assets={assetOptions}
        selectedAsset={selectedAsset}
        amountInput={amountInput}
        preview={quotePreview}
        estimatedRow={snapshot.projectedRow}
        estimatedResult={snapshot.projectedResult}
        status={poolStatus}
        locked={hasRealParticipation}
        submitting={submitting}
        onClose={() => setSheetVisible(false)}
        onChangeAsset={(symbol) => setSelectedAssetSymbol(symbol)}
        onChangeAmount={setAmountInput}
        onMax={handleMax}
        onConfirm={handleConfirm}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: POOL_THEME.colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: POOL_THEME.colors.background,
  },
  scrollContent: {
    gap: 14,
    paddingHorizontal: POOL_THEME.spacing.screenH,
    paddingTop: 16,
    paddingBottom: 124,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: POOL_THEME.colors.border,
    backgroundColor: 'rgba(8,9,11,0.94)',
    paddingHorizontal: POOL_THEME.spacing.screenH,
    paddingTop: 10,
  },
});
