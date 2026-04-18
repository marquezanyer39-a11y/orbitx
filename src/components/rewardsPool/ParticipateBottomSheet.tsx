import { Ionicons } from '@expo/vector-icons';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMemo, useState } from 'react';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { formatUsdCents } from '../../services/rewardsPool/poolCopy';
import type {
  RewardsPoolAssetOption,
  RewardsPoolCopy,
  RewardsPoolLeaderboardRow,
  RewardsPoolQuotePreview,
  RewardsPoolResult,
  RewardsPoolStatus,
} from '../../types/rewardsPool';
import { PrimaryButton } from '../common/PrimaryButton';

interface Props {
  visible: boolean;
  copy: RewardsPoolCopy;
  language: RewardsPoolCopy['language'];
  assets: RewardsPoolAssetOption[];
  selectedAsset: RewardsPoolAssetOption | null;
  amountInput: string;
  preview: RewardsPoolQuotePreview;
  estimatedRow: RewardsPoolLeaderboardRow | null;
  estimatedResult: RewardsPoolResult | null;
  status: RewardsPoolStatus;
  locked: boolean;
  submitting: boolean;
  onClose: () => void;
  onChangeAsset: (symbol: RewardsPoolAssetOption['symbol']) => void;
  onChangeAmount: (value: string) => void;
  onMax: () => void;
  onConfirm: () => void;
}

function PreviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.previewRow}>
      <Text style={styles.previewLabel}>{label}</Text>
      <Text style={styles.previewValue}>{value}</Text>
    </View>
  );
}

function buildErrorMessage(copy: RewardsPoolCopy, status: RewardsPoolStatus, preview: RewardsPoolQuotePreview) {
  if (status !== 'open') {
    return copy.poolClosedError;
  }

  switch (preview.errorCode) {
    case 'below_minimum':
      return copy.belowMinimumError;
    case 'above_maximum':
      return copy.aboveMaximumError;
    case 'insufficient_balance':
      return copy.noBalanceError;
    default:
      return copy.invalidAmountError;
  }
}

export function ParticipateBottomSheet({
  visible,
  copy,
  language,
  assets,
  selectedAsset,
  amountInput,
  preview,
  estimatedRow,
  estimatedResult,
  status,
  locked,
  submitting,
  onClose,
  onChangeAsset,
  onChangeAmount,
  onMax,
  onConfirm,
}: Props) {
  const { colors } = useAppTheme();
  const [showSelector, setShowSelector] = useState(false);
  const [query, setQuery] = useState('');

  const filteredAssets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const candidates = !normalized
      ? assets
      : assets.filter((asset) => {
          const haystack = `${asset.symbol} ${asset.name}`.toLowerCase();
          return haystack.includes(normalized);
        });

    return [...candidates].sort((left, right) => right.usdBalanceCents - left.usdBalanceCents);
  }, [assets, query]);

  const favorites = filteredAssets.filter((asset) => ['USDT', 'USDC'].includes(asset.symbol));
  const others = filteredAssets.filter((asset) => !['USDT', 'USDC'].includes(asset.symbol));
  const lockedButton = locked || status !== 'open' || !preview.isValid;
  const helperMessage =
    locked
      ? copy.duplicateError
      : lockedButton
        ? buildErrorMessage(copy, status, preview)
        : copy.rankingNote;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: withOpacity(colors.background, 0.99),
              borderColor: withOpacity('#22E8FF', 0.18),
            },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: colors.text }]}>{copy.modalTitle}</Text>
              <Text style={[styles.body, { color: colors.textMuted }]}>{copy.modalBody}</Text>
            </View>

            <Pressable
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  backgroundColor: withOpacity(colors.surfaceElevated, 0.92),
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="close" size={16} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View
              style={[
                styles.mainCard,
                {
                  backgroundColor: withOpacity(colors.surfaceElevated, 0.94),
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
                {copy.assetSelectorLabel}
              </Text>

              <Pressable
                onPress={() => setShowSelector((current) => !current)}
                style={[
                  styles.assetTrigger,
                  {
                    backgroundColor: withOpacity(colors.fieldBackground, 0.96),
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.assetTriggerLeft}>
                  {selectedAsset?.logoUri ? (
                    <Image source={{ uri: selectedAsset.logoUri }} style={styles.logo} />
                  ) : (
                    <View
                      style={[
                        styles.logo,
                        {
                          backgroundColor: withOpacity('#22E8FF', 0.18),
                        },
                      ]}
                    >
                      <Text style={styles.logoLabel}>{selectedAsset?.symbol.slice(0, 1) ?? '?'}</Text>
                    </View>
                  )}
                  <View style={styles.assetTriggerCopy}>
                    <Text style={[styles.assetSymbol, { color: colors.text }]}>
                      {selectedAsset?.symbol ?? '--'}
                    </Text>
                    <Text style={[styles.assetMeta, { color: colors.textMuted }]}>
                      {selectedAsset?.networkLabel ?? copy.unavailablePair}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name={showSelector ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.textMuted}
                />
              </Pressable>

              {showSelector ? (
                <View
                  style={[
                    styles.selectorCard,
                    {
                      backgroundColor: withOpacity(colors.backgroundAlt, 0.98),
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder={copy.searchPlaceholder}
                    placeholderTextColor={colors.textMuted}
                    style={[
                      styles.searchInput,
                      {
                        color: colors.text,
                        backgroundColor: withOpacity(colors.fieldBackground, 0.96),
                        borderColor: colors.border,
                      },
                    ]}
                  />

                  <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
                    {copy.favoritesTitle}
                  </Text>
                  <View style={styles.assetList}>
                    {favorites.map((asset) => (
                      <Pressable
                        key={asset.symbol}
                        onPress={() => {
                          onChangeAsset(asset.symbol);
                          setShowSelector(false);
                        }}
                        style={[
                          styles.assetRow,
                          {
                            backgroundColor:
                              selectedAsset?.symbol === asset.symbol
                                ? withOpacity('#22E8FF', 0.12)
                                : withOpacity(colors.surfaceElevated, 0.96),
                            borderColor:
                              selectedAsset?.symbol === asset.symbol
                                ? withOpacity('#22E8FF', 0.3)
                                : colors.border,
                          },
                        ]}
                      >
                        <Text style={[styles.assetRowSymbol, { color: colors.text }]}>
                          {asset.symbol}
                        </Text>
                        <Text style={[styles.assetRowMeta, { color: colors.textMuted }]}>
                          {formatUsdCents(language, asset.usdBalanceCents)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
                    {copy.recentTitle}
                  </Text>
                  <View style={styles.assetList}>
                    {others.map((asset) => (
                      <Pressable
                        key={asset.symbol}
                        onPress={() => {
                          onChangeAsset(asset.symbol);
                          setShowSelector(false);
                        }}
                        style={[
                          styles.assetRow,
                          {
                            backgroundColor:
                              selectedAsset?.symbol === asset.symbol
                                ? withOpacity('#22E8FF', 0.12)
                                : withOpacity(colors.surfaceElevated, 0.96),
                            borderColor:
                              selectedAsset?.symbol === asset.symbol
                                ? withOpacity('#22E8FF', 0.3)
                                : colors.border,
                          },
                        ]}
                      >
                        <View style={styles.assetRowLeft}>
                          <Text style={[styles.assetRowSymbol, { color: colors.text }]}>
                            {asset.symbol}
                          </Text>
                          <Text style={[styles.assetRowMeta, { color: colors.textMuted }]}>
                            {asset.networkLabel}
                          </Text>
                        </View>
                        <Text style={[styles.assetRowMeta, { color: colors.textMuted }]}>
                          {formatUsdCents(language, asset.usdBalanceCents)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
                {copy.amountLabel}
              </Text>

              <View style={styles.amountRow}>
                <TextInput
                  value={amountInput}
                  onChangeText={onChangeAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.amountInput, { color: colors.text }]}
                />

                <Pressable
                  onPress={onMax}
                  style={[
                    styles.maxButton,
                    {
                      backgroundColor: withOpacity('#22E8FF', 0.14),
                      borderColor: withOpacity('#22E8FF', 0.24),
                    },
                  ]}
                >
                  <Text style={styles.maxLabel}>{copy.maxLabel}</Text>
                </Pressable>
              </View>

              <Text style={[styles.usdEquivalent, { color: colors.textSoft }]}>
                {copy.usdEquivalent}: {formatUsdCents(language, preview.aporteUsdCents)}
              </Text>

              <View style={styles.previewWrap}>
                <PreviewRow
                  label={copy.realContribution}
                  value={formatUsdCents(language, preview.aporteUsdCents)}
                />
                <PreviewRow
                  label={copy.rankingContribution}
                  value={formatUsdCents(language, preview.aporteRankingUsdCents)}
                />
                <PreviewRow
                  label={copy.estimatedPosition}
                  value={estimatedRow ? `#${estimatedRow.position}` : '--'}
                />
                <PreviewRow
                  label={copy.estimatedReward}
                  value={
                    estimatedResult
                      ? formatUsdCents(language, estimatedResult.totalRewardCents)
                      : '--'
                  }
                />
              </View>

              <Text
                style={[
                  styles.helper,
                  {
                    color:
                      lockedButton && !locked ? '#FF8A80' : colors.textMuted,
                  },
                ]}
              >
                {helperMessage}
              </Text>
            </View>
          </ScrollView>

          <PrimaryButton
            label={submitting ? copy.txPending : copy.confirmLabel}
            onPress={onConfirm}
            disabled={lockedButton || submitting}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(2, 6, 12, 0.64)',
  },
  sheet: {
    maxHeight: '92%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 24,
    gap: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 22,
  },
  body: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 8,
  },
  mainCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },
  fieldLabel: {
    fontFamily: FONT.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  assetTrigger: {
    minHeight: 58,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  assetTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  assetTriggerCopy: {
    gap: 2,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLabel: {
    color: '#E7FDFF',
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  assetSymbol: {
    fontFamily: FONT.bold,
    fontSize: 16,
  },
  assetMeta: {
    fontFamily: FONT.regular,
    fontSize: 11,
  },
  selectorCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    gap: 10,
  },
  searchInput: {
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontFamily: FONT.medium,
    fontSize: 13,
  },
  sectionTitle: {
    fontFamily: FONT.semibold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  assetList: {
    gap: 8,
  },
  assetRow: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  assetRowLeft: {
    gap: 2,
  },
  assetRowSymbol: {
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  assetRowMeta: {
    fontFamily: FONT.regular,
    fontSize: 11,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  amountInput: {
    flex: 1,
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 14,
    fontFamily: FONT.bold,
    fontSize: 26,
  },
  maxButton: {
    minHeight: 42,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  maxLabel: {
    color: '#22E8FF',
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  usdEquivalent: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  previewWrap: {
    gap: 10,
    paddingTop: 4,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  previewLabel: {
    color: '#97A5B7',
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  previewValue: {
    color: '#FFFFFF',
    fontFamily: FONT.semibold,
    fontSize: 12,
    textAlign: 'right',
  },
  helper: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 17,
  },
});
