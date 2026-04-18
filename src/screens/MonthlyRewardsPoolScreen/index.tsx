import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, SPACING, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { useMonthlyRewardsPool } from '../../hooks/useMonthlyRewardsPool';
import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { LiveParticipantsList } from '../../components/rewardsPool/LiveParticipantsList';
import { ParticipateBottomSheet } from '../../components/rewardsPool/ParticipateBottomSheet';
import { PoolCountdownPill } from '../../components/rewardsPool/PoolCountdownPill';
import { PoolFinalResultsCard } from '../../components/rewardsPool/PoolFinalResultsCard';
import { PoolHeader } from '../../components/rewardsPool/PoolHeader';
import { PoolProgressBar } from '../../components/rewardsPool/PoolProgressBar';
import { PoolStateBanner } from '../../components/rewardsPool/PoolStateBanner';
import { RewardsBreakdown } from '../../components/rewardsPool/RewardsBreakdown';
import { UserPoolPositionCard } from '../../components/rewardsPool/UserPoolPositionCard';
import type { RewardsPoolAssetSymbol } from '../../types/rewardsPool';

export default function MonthlyRewardsPoolScreen() {
  const { colors } = useAppTheme();
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
          ? `Subiste a la posicion #${currentUserDisplayRow.position}.`
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
  const displayCtaLabel =
    poolStatus === 'open' && !hasRealParticipation ? `[ ${ctaLabel} ]` : ctaLabel;

  return (
    <ScreenContainer contentContainerStyle={styles.content} backgroundMode="default">
      <View style={styles.headerWrap}>
        <PoolHeader
          title={copy.currentPoolTitle}
          backLabel={copy.headerBack}
          astraLabel={copy.astraLabel}
          onBack={() => router.back()}
          onAstra={handleOpenAstra}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={['rgba(10, 18, 31, 0.98)', 'rgba(8, 12, 20, 0.98)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={[
            styles.hero,
            {
              borderColor: withOpacity('#22E8FF', 0.12),
            },
          ]}
        >
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>{copy.headerTitle}</Text>
            <Text style={styles.heroBody}>{copy.headerBody}</Text>
          </View>

          <PoolCountdownPill label={countdownLabel} />
          <PoolProgressBar
            amountLabel={amountLabel}
            percentLabel={progressLabel}
            progressPercent={snapshot.progressPercent}
          />
        </LinearGradient>

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

      <View style={styles.footer}>
        <Pressable
          onPress={() => {
            if (poolStatus !== 'open' || hasRealParticipation) {
              return;
            }
            setSheetVisible(true);
          }}
          disabled={poolStatus !== 'open' || hasRealParticipation}
        >
          <LinearGradient
            colors={
              poolStatus !== 'open' || hasRealParticipation
                ? ['rgba(117, 126, 138, 0.5)', 'rgba(52, 60, 74, 0.8)']
                : ['#39ECFF', '#73D5FF']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaButton}
          >
            <Text
              style={[
                styles.ctaLabel,
                {
                  color:
                    pool.status !== 'open' || hasRealParticipation ? colors.textSoft : '#082330',
                },
              ]}
            >
              {displayCtaLabel}
            </Text>
          </LinearGradient>
        </Pressable>
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
    gap: 12,
    paddingBottom: SPACING.xs,
  },
  headerWrap: {
    paddingTop: 0,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 12,
  },
  hero: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 10,
  },
  heroCopy: {
    gap: 2,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: 22,
    lineHeight: 25,
  },
  heroBody: {
    color: '#B1BDCF',
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    paddingBottom: SPACING.xs,
  },
  ctaButton: {
    minHeight: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22E8FF',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  ctaLabel: {
    fontFamily: FONT.bold,
    fontSize: 18,
    letterSpacing: 0.2,
  },
});
