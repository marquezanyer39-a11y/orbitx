import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';

import { FONT, RADII, SPACING, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { EmptyState } from '../../components/common/EmptyState';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { SectionHeader } from '../../components/common/SectionHeader';
import { AstraEntryPoint } from '../../components/astra/AstraEntryPoint';
import { ConvertAssetSelectorSheet } from '../../components/convert/ConvertAssetSelectorSheet';
import { ConvertConfirmSheet } from '../../components/convert/ConvertConfirmSheet';
import { useAstra } from '../../hooks/useAstra';
import { useMarketData } from '../../hooks/useMarketData';
import {
  buildConvertAssetOptions,
  getConvertQuote,
  getDefaultConvertSelection,
} from '../../services/convert/convertService';
import {
  formatConvertAmount,
  formatConvertMoney,
  getConvertCopy,
} from '../../services/convert/convertCopy';
import { detectDeviceCountryCode } from '../../services/ramp/rampConfig';
import { useConvertStore } from '../../store/convertStore';
import { useUiStore } from '../../store/uiStore';
import { useWalletStore } from '../../store/walletStore';
import { useAstraStore } from '../../store/astraStore';
import type { ConvertAssetOption, ConvertQuote } from '../../types/convert';

function parseAmount(value: string) {
  const normalized = value.replace(',', '.').trim();
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function findAsset(assets: ConvertAssetOption[], id: string | null) {
  return id ? assets.find((asset) => asset.id === id) ?? null : null;
}

function InfoRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: accent ?? colors.text }]}>{value}</Text>
    </View>
  );
}

function SuggestionChip({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.suggestionChip,
        {
          backgroundColor: withOpacity(colors.surfaceElevated, 0.92),
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.suggestionLabel, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

function ConversionRow({
  label,
  body,
}: {
  label: string;
  body: string;
}) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.recentRow,
        {
          backgroundColor: withOpacity(colors.surfaceElevated, 0.92),
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.recentLabel, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.recentBody, { color: colors.textMuted }]} numberOfLines={1}>
        {body}
      </Text>
    </View>
  );
}

export default function ConvertScreen() {
  const { colors } = useAppTheme();
  const { markets, loading: marketLoading } = useMarketData('markets');
  const spotBalances = useWalletStore((state) => state.spotBalances);
  const depositToSpot = useWalletStore((state) => state.depositToSpot);
  const withdrawFromSpot = useWalletStore((state) => state.withdrawFromSpot);
  const favoriteSymbols = useConvertStore((state) => state.favoriteSymbols);
  const recentConversions = useConvertStore((state) => state.recentConversions);
  const toggleFavoriteSymbol = useConvertStore((state) => state.toggleFavoriteSymbol);
  const recordConversion = useConvertStore((state) => state.recordConversion);
  const showToast = useUiStore((state) => state.showToast);
  const { language, openAstra } = useAstra();
  const rememberAstraContext = useAstraStore((state) => state.rememberContext);
  const recordAstraError = useAstraStore((state) => state.recordError);
  const copy = useMemo(() => getConvertCopy(language), [language]);
  const regionCode = useMemo(() => detectDeviceCountryCode(), []);
  const swapRotation = useRef(new Animated.Value(0)).current;

  const assets = useMemo(
    () =>
      buildConvertAssetOptions({
        markets,
        spotBalances,
        favoriteSymbols,
        regionCode,
      }),
    [favoriteSymbols, markets, regionCode, spotBalances],
  );

  const defaults = useMemo(() => getDefaultConvertSelection(assets), [assets]);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [selectorMode, setSelectorMode] = useState<'source' | 'target' | null>(null);
  const [quote, setQuote] = useState<ConvertQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    if (!sourceId || !findAsset(assets, sourceId)) {
      setSourceId(defaults.sourceId);
    }
    if (!targetId || !findAsset(assets, targetId) || targetId === defaults.sourceId) {
      const nextTarget =
        defaults.targetId && defaults.targetId !== defaults.sourceId ? defaults.targetId : null;
      setTargetId(nextTarget);
    }
  }, [assets, defaults.sourceId, defaults.targetId, sourceId, targetId]);

  const sourceAsset = useMemo(() => findAsset(assets, sourceId), [assets, sourceId]);
  const targetAsset = useMemo(() => findAsset(assets, targetId), [assets, targetId]);
  const parsedAmount = useMemo(() => parseAmount(amountInput), [amountInput]);
  const estimatedBalanceAfter = useMemo(() => {
    if (!targetAsset || !quote?.estimatedToAmount) {
      return targetAsset?.balance ?? 0;
    }
    return targetAsset.balance + quote.estimatedToAmount;
  }, [quote?.estimatedToAmount, targetAsset]);
  const activeSuggestions = useMemo(
    () =>
      assets
        .filter((asset) => asset.favorite || asset.frequent)
        .slice(0, 6)
        .map((asset) => asset.symbol),
    [assets],
  );
  const astraConvertContext = useMemo(
    () => ({
      surface: 'ramp' as const,
      path: '/convert',
      language,
      screenName: copy.headerTitle,
      surfaceTitle: copy.headerTitle,
      summary:
        sourceAsset && targetAsset
          ? `${sourceAsset.symbol} -> ${targetAsset.symbol}. ${quote?.message ?? copy.headerBody}`
          : copy.headerBody,
      currentTask:
        quote?.status === 'ready'
          ? 'convert_review_quote'
          : quote?.status === 'error' || quote?.status === 'unavailable'
            ? 'convert_issue'
            : 'convert_setup',
      currentPairSymbol:
        sourceAsset && targetAsset ? `${sourceAsset.symbol}/${targetAsset.symbol}` : undefined,
      currentPriceLabel:
        parsedAmount > 0 ? formatConvertAmount(language, parsedAmount, sourceAsset?.symbol) : undefined,
      selectedEntity:
        sourceAsset && targetAsset
          ? {
              type: 'conversion_pair',
              pair: `${sourceAsset.symbol}/${targetAsset.symbol}`,
              symbol: sourceAsset.symbol,
              provider: quote?.providerLabel ?? undefined,
            }
          : undefined,
      uiState: {
        convertStatus: quote?.status ?? 'idle',
        quoteLoading,
        providerLabel: quote?.providerLabel ?? null,
        sourceAssetId: sourceAsset?.id ?? null,
        targetAssetId: targetAsset?.id ?? null,
        estimatedBalanceAfter,
      },
      labels: {
        providerLabel: quote?.providerLabel,
        sourceAssetLabel: sourceAsset?.symbol,
        targetAssetLabel: targetAsset?.symbol,
        amountLabel:
          parsedAmount > 0 ? formatConvertAmount(language, parsedAmount, sourceAsset?.symbol) : undefined,
      },
      rampMode: copy.headerTitle,
      rampProviderLabel: quote?.providerLabel,
      errorBody:
        quote?.status === 'error' || quote?.status === 'unavailable' ? quote.message : undefined,
    }),
    [
      copy.headerBody,
      copy.headerTitle,
      estimatedBalanceAfter,
      language,
      parsedAmount,
      quote?.message,
      quote?.providerLabel,
      quote?.status,
      quoteLoading,
      sourceAsset,
      targetAsset,
    ],
  );

  useEffect(() => {
    rememberAstraContext(astraConvertContext);
  }, [astraConvertContext, rememberAstraContext]);

  useEffect(() => {
    if (!quote?.message || (quote.status !== 'error' && quote.status !== 'unavailable')) {
      return;
    }

    recordAstraError({
      surface: 'ramp',
      title: copy.noPairTitle,
      body: quote.message,
      linkedGuideId: 'sell_crypto',
    });
  }, [copy.noPairTitle, quote?.message, quote?.status, recordAstraError]);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = setTimeout(() => {
      setQuoteLoading(Boolean(sourceAsset && targetAsset && parsedAmount > 0));
      void getConvertQuote(sourceAsset, targetAsset, parsedAmount, language, regionCode)
        .then((nextQuote) => {
          if (!cancelled) {
            setQuote(nextQuote);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setQuoteLoading(false);
          }
        });
    }, 220);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [language, parsedAmount, regionCode, sourceAsset, targetAsset]);

  const handleOpenAstra = () => {
    openAstra({
      ...astraConvertContext,
    });
  };

  const handleMax = () => {
    if (!sourceAsset) {
      showToast(copy.sourceRequired, 'info');
      return;
    }

    if (!sourceAsset.balance) {
      showToast(copy.notEnoughBalance, 'error');
      return;
    }

    setSuccessId(null);
    setAmountInput(String(sourceAsset.balance));
    showToast(`${copy.maxLabel} ${sourceAsset.symbol}`, 'info');
  };

  const handleAmountChange = (value: string) => {
    if (successId) {
      setSuccessId(null);
    }
    setAmountInput(value);
  };

  const handleSwap = () => {
    if (!sourceAsset || !targetAsset) {
      return;
    }

    if (sourceAsset.kind === 'fiat' || targetAsset.kind === 'fiat') {
      showToast(copy.swapOnlyCrypto, 'info');
      return;
    }

    setSuccessId(null);
    Animated.spring(swapRotation, {
      toValue: 1,
      useNativeDriver: true,
      friction: 7,
      tension: 120,
    }).start(() => {
      swapRotation.setValue(0);
    });

    setSourceId(targetAsset.id);
    setTargetId(sourceAsset.id);
  };

  const handleSelectAsset = (asset: ConvertAssetOption) => {
    setSuccessId(null);

    if (selectorMode === 'source') {
      if (!asset.availableAsSource) {
        showToast(copy.notEnoughBalance, 'error');
        return;
      }

      setSourceId(asset.id);
      if (asset.symbol === targetAsset?.symbol) {
        const nextTarget = assets.find(
          (item) => item.symbol !== asset.symbol && item.availableAsDestination,
        );
        setTargetId(nextTarget?.id ?? null);
      }
    } else {
      if (!asset.availableAsDestination) {
        showToast(asset.availabilityLabel || copy.unavailableGeneric, 'error');
        return;
      }

      setTargetId(asset.id);
      if (asset.symbol === sourceAsset?.symbol) {
        const nextSource = assets.find(
          (item) => item.symbol !== asset.symbol && item.availableAsSource,
        );
        setSourceId(nextSource?.id ?? null);
      }
    }

    setSelectorMode(null);
  };

  const handlePreview = () => {
    if (!sourceAsset) {
      showToast(copy.sourceRequired, 'info');
      return;
    }
    if (!parsedAmount) {
      showToast(copy.amountRequired, 'info');
      return;
    }
    if (!quote?.canProceed) {
      showToast(quote?.message || copy.unavailableGeneric, 'error');
      return;
    }
    setConfirmVisible(true);
  };

  const handleConfirmConversion = () => {
    if (!quote || !sourceAsset || !targetAsset) {
      return;
    }

    if (quote.executionKind === 'provider') {
      recordConversion({
        fromSymbol: sourceAsset.symbol,
        toSymbol: targetAsset.symbol,
        fromAmount: parsedAmount,
        toAmount: quote.estimatedToAmount,
        fiatValueUsd: Number(((sourceAsset.priceUsd ?? 0) * parsedAmount).toFixed(2)),
        providerLabel: quote.providerLabel,
        executionKind: quote.executionKind,
        status: 'redirected',
      });
      setConfirmVisible(false);
      router.push({
        pathname: '/ramp/summary',
        params: {
          mode: quote.routeMode ?? 'convert',
          providerId: quote.providerId,
          cryptoCurrency: sourceAsset.symbol,
          fiatCurrency: targetAsset.symbol,
          network: sourceAsset.networkLabel ?? 'ethereum',
          fiatAmount: String(
            quote.estimatedToAmount ??
              Number(((sourceAsset.priceUsd ?? 0) * parsedAmount).toFixed(2)),
          ),
          countryCode: regionCode,
        },
      });
      return;
    }

    if (!quote.estimatedToAmount) {
      showToast(copy.unavailableGeneric, 'error');
      return;
    }

    setExecuting(true);
    try {
      const debited = withdrawFromSpot(sourceAsset.symbol, parsedAmount);
      if (!debited) {
        showToast(copy.notEnoughBalance, 'error');
        return;
      }

      depositToSpot(targetAsset.symbol, quote.estimatedToAmount);
      recordConversion({
        fromSymbol: sourceAsset.symbol,
        toSymbol: targetAsset.symbol,
        fromAmount: parsedAmount,
        toAmount: quote.estimatedToAmount,
        fiatValueUsd: Number(((sourceAsset.priceUsd ?? 0) * parsedAmount).toFixed(2)),
        providerLabel: quote.providerLabel,
        executionKind: quote.executionKind,
        status: 'completed',
      });
      setSuccessId(`${sourceAsset.symbol}-${targetAsset.symbol}-${Date.now()}`);
      setAmountInput('');
      setConfirmVisible(false);
      showToast(copy.successTitle, 'success');
    } finally {
      setExecuting(false);
    }
  };

  const swapRotationStyle = {
    transform: [
      {
        rotate: swapRotation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };

  if (marketLoading && !assets.length) {
    return (
      <ScreenContainer>
        <EmptyState title={copy.loadingQuote} body={copy.headerBody} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.iconButton,
            {
              backgroundColor: withOpacity(colors.surfaceElevated, 0.92),
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="chevron-back" size={18} color={colors.text} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{copy.headerTitle}</Text>
          <Text style={[styles.headerBody, { color: colors.textMuted }]}>{copy.headerBody}</Text>
        </View>
        <AstraEntryPoint onPress={handleOpenAstra} size={42} accessibilityLabel="Abrir Astra en convertir" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={[withOpacity(colors.primary, 0.18), withOpacity(colors.card, 0.98)]}
          style={[styles.convertCard, { borderColor: withOpacity(colors.primary, 0.18) }]}
        >
          <View
            style={[
              styles.assetBlock,
              {
                backgroundColor: withOpacity(colors.surfaceElevated, 0.92),
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.blockHeader}>
              <Text style={[styles.blockLabel, { color: colors.textMuted }]}>{copy.fromLabel}</Text>
              <View style={styles.balanceHeader}>
                <Text style={[styles.blockMeta, { color: colors.textMuted }]}>{copy.sourceBalance}</Text>
                <Text style={[styles.blockMetaStrong, { color: colors.text }]}>
                  {sourceAsset
                    ? formatConvertAmount(language, sourceAsset.balance, sourceAsset.symbol, 6)
                    : '--'}
                </Text>
              </View>
            </View>

            <View style={styles.assetRow}>
              <Pressable
                onPress={() => setSelectorMode('source')}
                style={[
                  styles.assetSelector,
                  {
                    backgroundColor: withOpacity(colors.fieldBackground, 0.96),
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.assetSelectorSymbol, { color: colors.text }]}>
                  {sourceAsset?.symbol ?? '--'}
                </Text>
                <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
              </Pressable>

              <TextInput
                value={amountInput}
                onChangeText={handleAmountChange}
                placeholder={copy.amountPlaceholder}
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                style={[styles.amountInput, { color: colors.text }]}
              />
            </View>

            <View style={styles.blockFooter}>
              <Text style={[styles.blockHint, { color: colors.textMuted }]} numberOfLines={1}>
                {sourceAsset?.name ?? copy.emptyStateTitle}
              </Text>
              <Pressable
                onPress={handleMax}
                style={[
                  styles.maxChip,
                  {
                    backgroundColor: withOpacity(colors.primary, 0.12),
                    borderColor: withOpacity(colors.primary, 0.24),
                  },
                ]}
              >
                <Text style={[styles.maxChipLabel, { color: colors.primary }]}>{copy.maxLabel}</Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={handleSwap}
            style={[
              styles.swapButton,
              {
                backgroundColor: withOpacity(colors.background, 0.98),
                borderColor: withOpacity(colors.primary, 0.24),
              },
            ]}
          >
            <Animated.View style={swapRotationStyle}>
              <Ionicons name="swap-vertical" size={18} color={colors.primary} />
            </Animated.View>
          </Pressable>

          <View
            style={[
              styles.assetBlock,
              {
                backgroundColor: withOpacity(colors.surfaceElevated, 0.92),
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.blockHeader}>
              <Text style={[styles.blockLabel, { color: colors.textMuted }]}>{copy.toLabel}</Text>
              <View style={styles.balanceHeader}>
                <Text style={[styles.blockMeta, { color: colors.textMuted }]}>{copy.estimatedBalance}</Text>
                <Text style={[styles.blockMetaStrong, { color: colors.text }]}>
                  {targetAsset
                    ? formatConvertAmount(language, estimatedBalanceAfter, targetAsset.symbol, 6)
                    : '--'}
                </Text>
              </View>
            </View>

            <View style={styles.assetRow}>
              <Pressable
                onPress={() => setSelectorMode('target')}
                style={[
                  styles.assetSelector,
                  {
                    backgroundColor: withOpacity(colors.fieldBackground, 0.96),
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.assetSelectorSymbol, { color: colors.text }]}>
                  {targetAsset?.symbol ?? '--'}
                </Text>
                <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
              </Pressable>

              <View style={styles.estimateWrap}>
                <Text style={[styles.estimateValue, { color: colors.text }]}>
                  {quoteLoading
                    ? '--'
                    : quote?.estimatedToAmount
                      ? formatConvertAmount(language, quote.estimatedToAmount, targetAsset?.symbol, 6)
                      : copy.destinationPlaceholder}
                </Text>
              </View>
            </View>

            <Text style={[styles.blockHint, { color: colors.textMuted }]} numberOfLines={1}>
              {targetAsset?.kind === 'fiat'
                ? copy.providerManagedBody
                : targetAsset?.name ?? copy.instantBody}
            </Text>
          </View>
        </LinearGradient>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: withOpacity(colors.surfaceElevated, 0.92),
              borderColor: colors.border,
            },
          ]}
        >
          <SectionHeader title={copy.quoteTitle} subtitle={quote?.message ?? copy.instantBody} />

          {quoteLoading ? (
            <View style={styles.loadingStack}>
              <View style={[styles.loadingBar, { backgroundColor: withOpacity(colors.border, 0.9) }]} />
              <View style={[styles.loadingBarShort, { backgroundColor: withOpacity(colors.border, 0.7) }]} />
            </View>
          ) : quote?.status === 'error' || quote?.status === 'unavailable' ? (
            <View
              style={[
                styles.warningCard,
                {
                  backgroundColor: withOpacity(colors.warning, 0.1),
                  borderColor: withOpacity(colors.warning, 0.22),
                },
              ]}
            >
              <Text style={[styles.warningTitle, { color: colors.text }]}>
                {quote.message || copy.noPairTitle}
              </Text>
              <Text style={[styles.warningBody, { color: colors.textSoft }]}>
                {quote.warningLabel || copy.noPairBody}
              </Text>
              <View style={styles.warningActions}>
                <PrimaryButton
                  label={copy.askAstra}
                  tone="secondary"
                  onPress={handleOpenAstra}
                  style={styles.warningButton}
                />
                <PrimaryButton
                  label={copy.selectorTitleTarget}
                  tone="ghost"
                  onPress={() => setSelectorMode('target')}
                  style={styles.warningButton}
                />
              </View>
            </View>
          ) : (
            <>
              <InfoRow
                label={copy.rateLabel}
                value={
                  quote?.estimatedRate && sourceAsset && targetAsset
                    ? `1 ${sourceAsset.symbol} = ${formatConvertAmount(language, quote.estimatedRate, targetAsset.symbol, 6)}`
                    : '--'
                }
              />
              <InfoRow
                label={copy.feeLabel}
                value={formatConvertMoney(language, (quote?.feeAmountUsd ?? 0) + (quote?.spreadAmountUsd ?? 0))}
              />
              <InfoRow
                label={copy.spreadLabel}
                value={quote ? `${quote.spreadPct.toFixed(2)}%` : '--'}
              />
              <InfoRow label={copy.providerLabel} value={quote?.providerLabel ?? '--'} />
              <InfoRow
                label={copy.etaLabel}
                value={
                  quote
                    ? quote.estimatedSeconds >= 60
                      ? `${Math.ceil(quote.estimatedSeconds / 60)} min`
                      : `${quote.estimatedSeconds}s`
                    : '--'
                }
              />
              <InfoRow
                label={copy.regionLabel}
                value={quote?.regionAllowed ? regionCode : quote?.regionLabel || copy.unavailableRegion}
                accent={quote?.regionAllowed ? colors.profit : colors.warning}
              />
              {quote?.minimumSourceAmount ? (
                <InfoRow
                  label={copy.minimumLabel}
                  value={formatConvertAmount(language, quote.minimumSourceAmount, sourceAsset?.symbol, 6)}
                />
              ) : null}
              {quote?.warningLabel ? (
                <Text style={[styles.microCopy, { color: colors.warning }]}>{quote.warningLabel}</Text>
              ) : null}
            </>
          )}
        </View>

        {successId ? (
          <View
            style={[
              styles.successCard,
              {
                backgroundColor: withOpacity(colors.profit, 0.1),
                borderColor: withOpacity(colors.profit, 0.2),
              },
            ]}
          >
            <Text style={[styles.successTitle, { color: colors.text }]}>{copy.successTitle}</Text>
            <Text style={[styles.successBody, { color: colors.textSoft }]}>{copy.successBody}</Text>
            <View style={styles.successActions}>
              <PrimaryButton
                label={copy.walletCta}
                tone="secondary"
                onPress={() => router.push('/(tabs)/wallet')}
                style={styles.successButton}
              />
              <PrimaryButton
                label={copy.historyCta}
                onPress={() => router.push('/history')}
                style={styles.successButton}
              />
            </View>
          </View>
        ) : null}

        <View
          style={[
            styles.secondaryCard,
            {
              backgroundColor: withOpacity(colors.surface, 0.94),
              borderColor: colors.border,
            },
          ]}
        >
          <SectionHeader
            title={copy.recentTitle}
            subtitle={copy.frequentTitle}
          />

          <View style={styles.suggestionsRow}>
            {activeSuggestions.length ? (
              activeSuggestions.map((symbol) => (
                <SuggestionChip
                  key={symbol}
                  label={symbol}
                  onPress={() => {
                    const nextTarget = assets.find(
                      (asset) => asset.symbol === symbol && asset.symbol !== sourceAsset?.symbol,
                    );
                    if (nextTarget) {
                      setTargetId(nextTarget.id);
                    }
                  }}
                />
              ))
            ) : (
              <Text style={[styles.microCopy, { color: colors.textMuted }]}>{copy.emptyStateBody}</Text>
            )}
          </View>

          <View style={styles.recentStack}>
            {recentConversions.length ? (
              recentConversions.slice(0, 3).map((item) => (
                <ConversionRow
                  key={item.id}
                  label={`${item.fromSymbol} -> ${item.toSymbol}`}
                  body={`${formatConvertAmount(language, item.fromAmount, item.fromSymbol, 4)} · ${item.providerLabel}`}
                />
              ))
            ) : (
              <EmptyState title={copy.recentTitle} body={copy.emptyStateBody} />
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={
            quote?.executionKind === 'provider'
              ? copy.continueWithProvider
              : copy.previewLabel
          }
          onPress={handlePreview}
          disabled={!quote?.canProceed || quoteLoading || executing}
          style={styles.primaryButton}
        />
      </View>

      <ConvertAssetSelectorSheet
        visible={Boolean(selectorMode)}
        title={selectorMode === 'source' ? copy.selectorTitleSource : copy.selectorTitleTarget}
        assets={assets.filter((asset) =>
          selectorMode === 'source' ? asset.availableAsSource : asset.availableAsDestination,
        )}
        copy={copy}
        activeSymbol={selectorMode === 'source' ? sourceAsset?.symbol : targetAsset?.symbol}
        onClose={() => setSelectorMode(null)}
        onSelect={handleSelectAsset}
        onToggleFavorite={toggleFavoriteSymbol}
      />

      <ConvertConfirmSheet
        visible={confirmVisible}
        quote={quote}
        copy={copy}
        onClose={() => setConfirmVisible(false)}
        onConfirm={handleConfirmConversion}
        loading={executing}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 3,
    paddingTop: 2,
  },
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: 28,
  },
  headerBody: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 16,
  },
  convertCard: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 16,
    gap: 10,
  },
  assetBlock: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  balanceHeader: {
    alignItems: 'flex-end',
    gap: 2,
  },
  blockLabel: {
    fontFamily: FONT.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  blockMeta: {
    fontFamily: FONT.regular,
    fontSize: 10,
  },
  blockMetaStrong: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  assetSelector: {
    minWidth: 104,
    minHeight: 46,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  assetSelectorSymbol: {
    fontFamily: FONT.bold,
    fontSize: 16,
  },
  amountInput: {
    flex: 1,
    minHeight: 56,
    fontFamily: FONT.bold,
    fontSize: 28,
    textAlign: 'right',
  },
  estimateWrap: {
    flex: 1,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  estimateValue: {
    fontFamily: FONT.bold,
    fontSize: 24,
    textAlign: 'right',
  },
  blockFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  blockHint: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  maxChip: {
    borderWidth: 1,
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  maxChipLabel: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  swapButton: {
    alignSelf: 'center',
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -2,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: RADII.lg,
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoLabel: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  infoValue: {
    flex: 1,
    textAlign: 'right',
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  loadingStack: {
    gap: 10,
    paddingTop: 2,
  },
  loadingBar: {
    height: 14,
    borderRadius: 999,
    width: '72%',
  },
  loadingBarShort: {
    height: 14,
    borderRadius: 999,
    width: '44%',
  },
  warningCard: {
    borderWidth: 1,
    borderRadius: RADII.md,
    padding: 14,
    gap: 8,
  },
  warningTitle: {
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  warningBody: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  warningActions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 4,
  },
  warningButton: {
    flex: 1,
  },
  microCopy: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  successCard: {
    borderWidth: 1,
    borderRadius: RADII.lg,
    padding: 16,
    gap: 8,
  },
  successTitle: {
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  successBody: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  successActions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 4,
  },
  successButton: {
    flex: 1,
  },
  secondaryCard: {
    borderWidth: 1,
    borderRadius: RADII.lg,
    padding: 16,
    gap: 14,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    minHeight: 36,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionLabel: {
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  recentStack: {
    gap: 10,
  },
  recentRow: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  recentLabel: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  recentBody: {
    fontFamily: FONT.regular,
    fontSize: 11,
  },
  footer: {
    flexDirection: 'row',
    paddingBottom: SPACING.xs,
  },
  primaryButton: {
    flex: 1,
  },
});
