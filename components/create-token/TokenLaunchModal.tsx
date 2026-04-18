import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { DexLaunchNetwork, MarketToken } from '../../types';
import { ACTIVE_LAUNCH_CHAINS, getDexChainConfig } from '../../constants/networks';
import { FONT, RADII, SPACING, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import {
  ORBITX_LOCK_DURATION_OPTIONS,
} from '../../services/listing/liquidityLock';
import {
  getLiquidityPairOptions,
  supportsRealLiquidityCreation,
  type LiquidityPairKind,
} from '../../services/liquidity/evmLiquidity';
import { maskAddress } from '../../utils/wallet';
import { GlassCard } from '../common/GlassCard';
import { PrimaryButton } from '../common/PrimaryButton';
import { SegmentedControl } from '../common/SegmentedControl';

type LaunchChoice = 'orbitx' | 'dex';

export interface TokenLaunchDecision {
  listingType: 'external' | 'orbitx_protected';
  dexNetwork?: DexLaunchNetwork;
  pairKind: LiquidityPairKind;
  tokenLiquidityAmount: number;
  quoteLiquidityAmount: number;
  lockDurationDays: number;
}

interface TokenLaunchModalProps {
  visible: boolean;
  token: MarketToken | null;
  defaultLiquidityUsd: number;
  initialChoice?: LaunchChoice;
  estimatedOnchainFeeUsd?: number;
  pairKind: LiquidityPairKind;
  onPairKindChange: (value: LiquidityPairKind) => void;
  tokenAmountValue: string;
  onTokenAmountChange: (value: string) => void;
  dexNetwork: DexLaunchNetwork;
  onDexNetworkChange: (value: DexLaunchNetwork) => void;
  liquidityValue: string;
  onLiquidityChange: (value: string) => void;
  onClose: () => void;
  onConfirm: (payload: TokenLaunchDecision) => void;
}

export function TokenLaunchModal({
  visible,
  token,
  defaultLiquidityUsd,
  initialChoice = 'orbitx',
  estimatedOnchainFeeUsd = 0,
  pairKind,
  onPairKindChange,
  tokenAmountValue,
  onTokenAmountChange,
  dexNetwork,
  onDexNetworkChange,
  liquidityValue,
  onLiquidityChange,
  onClose,
  onConfirm,
}: TokenLaunchModalProps) {
  const { colors } = useAppTheme();
  const [choice, setChoice] = useState<LaunchChoice>('orbitx');
  const [lockDurationDays, setLockDurationDays] = useState('365');

  const tokenLiquidityAmount = Math.max(Number(tokenAmountValue) || 0, 0);
  const quoteLiquidityAmount = Math.max(Number(liquidityValue) || defaultLiquidityUsd, 0);
  const pairOptions = useMemo(
    () => (token?.chain ? getLiquidityPairOptions(token.chain) : []),
    [token?.chain],
  );
  const activePair = pairOptions.find((item) => item.id === pairKind) ?? pairOptions[0] ?? null;
  const realLiquidityReady = Boolean(token?.chain && supportsRealLiquidityCreation(token.chain));
  const dexConfig = dexNetwork ? getDexChainConfig(dexNetwork) : null;
  const networkOptions = useMemo(() => {
    if (!token?.chain) {
      return [];
    }

    return ACTIVE_LAUNCH_CHAINS.filter((network) => network.launchChain === token.chain).map(
      (network) => ({
        label: network.shortLabel,
        value: network.dexNetwork,
      }),
    );
  }, [token?.chain]);

  useEffect(() => {
    if (!visible) {
      setChoice('orbitx');
      setLockDurationDays('365');
      return;
    }

    setChoice(initialChoice);
  }, [initialChoice, visible]);

  useEffect(() => {
    if (!token?.chain) {
      return;
    }

    const defaultNetwork =
      token.chain === 'ethereum'
        ? 'ethereum'
        : token.chain === 'bnb'
          ? 'bnb'
          : token.chain === 'solana'
            ? 'solana'
            : 'base';

    if (dexNetwork !== defaultNetwork) {
      onDexNetworkChange(defaultNetwork);
    }
  }, [dexNetwork, onDexNetworkChange, token?.chain]);

  if (!token) {
    return null;
  }

  const confirmDisabled =
    !realLiquidityReady || !tokenLiquidityAmount || !quoteLiquidityAmount;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.centerWrap}>
          <GlassCard style={styles.card}>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={[styles.eyebrow, { color: colors.textMuted }]}>
                  Decision
                </Text>
                <Text style={[styles.title, { color: colors.text }]}>
                  Token created successfully
                </Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  Choose between an external DEX route or OrbitX protected listing.
                </Text>
              </View>

              <Pressable
                onPress={onClose}
                style={[styles.closeButton, { backgroundColor: colors.fieldBackground }]}
              >
                <Text style={[styles.closeButtonLabel, { color: colors.text }]}>X</Text>
              </Pressable>
            </View>

            <View
              style={[
                styles.summaryCard,
                { backgroundColor: colors.fieldBackground, borderColor: colors.border },
              ]}
            >
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Token</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {token.name} ({token.symbol})
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Network</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {token.chain?.toUpperCase() ?? 'EVM'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Contract</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {maskAddress(token.contractAddress ?? 'Pending')}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Tx hash</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {maskAddress(token.deploymentTxHash ?? 'Pending')}
                </Text>
              </View>
            </View>

            <View style={styles.choiceList}>
              <Pressable
                onPress={() => setChoice('dex')}
                style={[
                  styles.choiceCard,
                  {
                    backgroundColor: colors.fieldBackground,
                    borderColor: choice === 'dex' ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.choiceTitle, { color: colors.text }]}>
                  List on external DEX
                </Text>
                <Text style={[styles.choiceBody, { color: colors.textMuted }]}>
                  This token will be listed outside OrbitX&apos;s internal protection system.
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setChoice('orbitx')}
                style={[
                  styles.choiceCard,
                  {
                    backgroundColor: colors.fieldBackground,
                    borderColor: choice === 'orbitx' ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.choiceTitle, { color: colors.text }]}>
                  List on OrbitX protected market
                </Text>
                <Text style={[styles.choiceBody, { color: colors.textMuted }]}>
                  Requires automated checks, real pre-listing validation, real liquidity creation,
                  and a confirmed liquidity lock.
                </Text>
              </Pressable>
            </View>

            {choice === 'dex' ? (
              <View
                style={[
                  styles.noticeCard,
                  {
                    backgroundColor: withOpacity(colors.warning, 0.08),
                    borderColor: withOpacity(colors.warning, 0.18),
                  },
                ]}
              >
                <Text style={[styles.noticeTitle, { color: colors.warning }]}>
                  External listing warning
                </Text>
                <Text style={[styles.noticeBody, { color: colors.textSoft }]}>
                  OrbitX will not mark this token as protected. Users will only see it as an
                  external listing.
                </Text>
              </View>
            ) : (
              <View
                style={[
                  styles.noticeCard,
                  {
                    backgroundColor: withOpacity(colors.primary, 0.08),
                    borderColor: withOpacity(colors.primary, 0.18),
                  },
                ]}
              >
                <Text style={[styles.noticeTitle, { color: colors.primary }]}>
                  OrbitX protected listing
                </Text>
                <Text style={[styles.noticeBody, { color: colors.textSoft }]}>
                  OrbitX protected listings reduce risk and improve transparency, but do not
                  eliminate all possible risk.
                </Text>
              </View>
            )}

            {choice === 'dex' && realLiquidityReady && networkOptions.length ? (
              <View
                style={[
                  styles.configCard,
                  { backgroundColor: colors.fieldBackground, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Supported DEX route
                </Text>
                <SegmentedControl<DexLaunchNetwork>
                  options={networkOptions}
                  value={dexNetwork}
                  onChange={onDexNetworkChange}
                />
                <Text style={[styles.routerHint, { color: colors.textMuted }]}>
                  Venue: {dexConfig?.dexVenue ?? 'Supported DEX'} · Router:{' '}
                  {dexConfig?.tradeRouter ?? 'OrbitX'}
                </Text>
              </View>
            ) : null}

            {realLiquidityReady && pairOptions.length ? (
              <View
                style={[
                  styles.configCard,
                  { backgroundColor: colors.fieldBackground, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Real liquidity
                </Text>

                <SegmentedControl<LiquidityPairKind>
                  options={pairOptions.map((option) => ({
                    label: option.label,
                    value: option.id,
                  }))}
                  value={pairKind}
                  onChange={onPairKindChange}
                />

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                    Token amount
                  </Text>
                  <View
                    style={[
                      styles.inputShell,
                      { backgroundColor: colors.backgroundAlt, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.inputPrefix, { color: colors.textMuted }]}>
                      {token.symbol}
                    </Text>
                    <TextInput
                      value={tokenAmountValue}
                      onChangeText={onTokenAmountChange}
                      keyboardType="numeric"
                      style={[styles.inputValue, { color: colors.text }]}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                    Quote amount
                  </Text>
                  <View
                    style={[
                      styles.inputShell,
                      { backgroundColor: colors.backgroundAlt, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.inputPrefix, { color: colors.textMuted }]}>
                      {activePair?.quoteLabel ?? 'USD'}
                    </Text>
                    <TextInput
                      value={liquidityValue}
                      onChangeText={onLiquidityChange}
                      keyboardType="numeric"
                      style={[styles.inputValue, { color: colors.text }]}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                </View>

                <View style={styles.quickRow}>
                  {[500, 1500, 3000].map((value) => (
                    <Pressable
                      key={value}
                      onPress={() => onLiquidityChange(String(value))}
                      style={[
                        styles.quickChip,
                        { backgroundColor: colors.backgroundAlt, borderColor: colors.border },
                      ]}
                    >
                      <Text style={[styles.quickChipLabel, { color: colors.text }]}>
                        ${value}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                    Estimated fee
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    ${estimatedOnchainFeeUsd.toFixed(2)}
                  </Text>
                </View>
              </View>
            ) : (
              <View
                style={[
                  styles.noticeCard,
                  {
                    backgroundColor: withOpacity(colors.loss, 0.08),
                    borderColor: withOpacity(colors.loss, 0.18),
                  },
                ]}
              >
                <Text style={[styles.noticeTitle, { color: colors.loss }]}>
                  Unsupported listing path
                </Text>
                <Text style={[styles.noticeBody, { color: colors.textSoft }]}>
                  Real liquidity and listing are active first on Ethereum and BNB Chain. This
                  token stays visible, but OrbitX will not fake a listing flow on unsupported
                  networks.
                </Text>
              </View>
            )}

            {choice === 'orbitx' ? (
              <View
                style={[
                  styles.configCard,
                  { backgroundColor: colors.fieldBackground, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Mandatory liquidity lock
                </Text>
                <SegmentedControl<string>
                  options={ORBITX_LOCK_DURATION_OPTIONS.map((option) => ({
                    label: option.label,
                    value: String(option.days),
                  }))}
                  value={lockDurationDays}
                  onChange={setLockDurationDays}
                />
                <Text style={[styles.routerHint, { color: colors.textMuted }]}>
                  No lock means no OrbitX protected listing.
                </Text>
              </View>
            ) : null}

            <View
              style={[
                styles.noticeCard,
                {
                  backgroundColor: withOpacity(colors.loss, 0.08),
                  borderColor: withOpacity(colors.loss, 0.18),
                },
              ]}
            >
              <Text style={[styles.noticeTitle, { color: colors.loss }]}>Important</Text>
              <Text style={[styles.noticeBody, { color: colors.textSoft }]}>
                This uses real money, real signatures, and real on-chain transactions. OrbitX will
                only show success after confirmation.
              </Text>
            </View>

            <View style={styles.actions}>
              <PrimaryButton
                label="Save for later"
                variant="secondary"
                onPress={onClose}
                style={styles.flexButton}
              />
              <PrimaryButton
                label={
                  choice === 'orbitx'
                    ? 'Continue protected listing'
                    : 'Continue external listing'
                }
                disabled={confirmDisabled}
                onPress={() =>
                  onConfirm({
                    listingType: choice === 'orbitx' ? 'orbitx_protected' : 'external',
                    dexNetwork: choice === 'dex' ? dexNetwork : undefined,
                    pairKind,
                    tokenLiquidityAmount,
                    quoteLiquidityAmount,
                    lockDurationDays: Number(lockDurationDays),
                  })
                }
                style={styles.flexButton}
              />
            </View>
          </GlassCard>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  centerWrap: {
    width: '100%',
    maxWidth: 460,
  },
  card: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    fontFamily: FONT.medium,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 19,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 15,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonLabel: {
    fontFamily: FONT.bold,
    fontSize: 11,
  },
  summaryCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 10,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  summaryLabel: {
    fontFamily: FONT.regular,
    fontSize: 11,
  },
  summaryValue: {
    flex: 1,
    textAlign: 'right',
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  choiceList: {
    gap: 8,
  },
  choiceCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 10,
    gap: 4,
  },
  choiceTitle: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  choiceBody: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 15,
  },
  configCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 10,
    gap: 10,
  },
  sectionTitle: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  routerHint: {
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  infoLabel: {
    fontFamily: FONT.regular,
    fontSize: 11,
  },
  inputShell: {
    minHeight: 34,
    minWidth: 116,
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  inputPrefix: {
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  inputValue: {
    minWidth: 56,
    fontFamily: FONT.semibold,
    fontSize: 12,
    textAlign: 'right',
    paddingVertical: 0,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickChip: {
    minHeight: 28,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickChipLabel: {
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  noticeCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 10,
    gap: 4,
  },
  noticeTitle: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  noticeBody: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 15,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  flexButton: {
    flex: 1,
  },
});
