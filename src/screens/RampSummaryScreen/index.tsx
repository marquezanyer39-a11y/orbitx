import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { FONT, RADII, SPACING, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { AstraEntryPoint } from '../../components/astra/AstraEntryPoint';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { useAstra } from '../../hooks/useAstra';
import { getRampConfig } from '../../services/ramp/rampConfig';
import {
  formatRampMoney,
  getRampCopy,
  getRampProviderLabel,
} from '../../services/ramp/rampCopy';
import {
  getRampAssets,
  getRampAvailability,
  getRampDefaultRequest,
  getRampProviderSummary,
  getRampQuote,
} from '../../services/ramp/rampService';
import { useRampStore } from '../../store/rampStore';
import { useWalletStore } from '../../store/walletStore';
import type { RampAssetOption, RampFlowRequest, RampMode, RampQuote } from '../../types/ramp';

const FALLBACK_MODE: RampMode = 'buy';

function normalizeMode(raw?: string | string[]): RampMode {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === 'sell' || value === 'convert' || value === 'pay') {
    return value;
  }
  return FALLBACK_MODE;
}

function normalizeProvider(raw?: string | string[]) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === 'moonpay' ? 'moonpay' : 'transak';
}

function SummaryRow({
  label,
  value,
  tone = 'default',
  helper,
  emphasized = false,
}: {
  label: string;
  value: string;
  tone?: 'default' | 'accent' | 'positive';
  helper?: string;
  emphasized?: boolean;
}) {
  const { colors } = useAppTheme();
  const valueColor =
    tone === 'positive'
      ? colors.profit
      : tone === 'accent'
        ? colors.primary
        : colors.text;

  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryCopy}>
        <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{label}</Text>
        {helper ? (
          <Text style={[styles.summaryHelper, { color: colors.textMuted }]}>{helper}</Text>
        ) : null}
      </View>

      <Text
        style={[
          emphasized ? styles.summaryValueStrong : styles.summaryValue,
          { color: valueColor },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function SelectChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active
            ? withOpacity(colors.primary, 0.12)
            : withOpacity(colors.fieldBackground, 0.9),
          borderColor: active
            ? withOpacity(colors.primary, 0.24)
            : withOpacity(colors.borderStrong, 0.72),
        },
      ]}
    >
      <Text
        style={[
          styles.chipLabel,
          { color: active ? colors.text : colors.textSoft },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ActionButton({
  label,
  onPress,
  disabled,
  tone = 'primary',
  icon,
  flex = 1,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'primary' | 'secondary';
  icon?: keyof typeof Ionicons.glyphMap;
  flex?: number;
}) {
  const { colors } = useAppTheme();
  const primary = tone === 'primary';

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.actionButton,
        {
          flex,
          opacity: disabled ? 0.55 : 1,
          backgroundColor: primary
            ? withOpacity(colors.primary, 0.96)
            : withOpacity(colors.surfaceElevated, 0.96),
          borderColor: primary
            ? withOpacity(colors.primary, 0.42)
            : withOpacity(colors.borderStrong, 0.82),
        },
      ]}
    >
      <View style={styles.actionContent}>
        {icon ? (
          <Ionicons
            name={icon}
            size={16}
            color={primary ? colors.background : colors.text}
          />
        ) : null}
        <Text
          style={[
            styles.actionLabel,
            { color: primary ? colors.background : colors.text },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export default function RampSummaryScreen() {
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{
    mode?: string;
    providerId?: string;
    fiatCurrency?: string;
    cryptoCurrency?: string;
    network?: string;
    fiatAmount?: string;
    countryCode?: string;
    paymentMethod?: string;
  }>();
  const mode = normalizeMode(params.mode);
  const walletAddress = useWalletStore((state) => state.walletAddress);
  const selectedNetwork = useWalletStore((state) => state.selectedNetwork);
  const { language, openAstra } = useAstra();
  const beginFlow = useRampStore((state) => state.beginFlow);
  const rememberQuote = useRampStore((state) => state.setQuote);
  const copy = getRampCopy(language);
  const config = getRampConfig();
  const assets = getRampAssets();
  const initialRequest = useMemo(() => {
    const next = getRampDefaultRequest(mode, language, walletAddress || undefined);
    return {
      ...next,
      providerId: normalizeProvider(params.providerId) ?? next.providerId,
      fiatCurrency: params.fiatCurrency || next.fiatCurrency,
      cryptoCurrency: params.cryptoCurrency || next.cryptoCurrency,
      network:
        params.network || (selectedNetwork && mode === 'buy' ? selectedNetwork : next.network),
      fiatAmount:
        Number.parseFloat(params.fiatAmount || '') > 0
          ? Number.parseFloat(params.fiatAmount || '')
          : next.fiatAmount,
      countryCode: params.countryCode || next.countryCode,
      paymentMethod: params.paymentMethod || next.paymentMethod,
    } satisfies RampFlowRequest;
  }, [
    language,
    mode,
    params.countryCode,
    params.cryptoCurrency,
    params.fiatAmount,
    params.fiatCurrency,
    params.network,
    params.paymentMethod,
    params.providerId,
    selectedNetwork,
    walletAddress,
  ]);
  const [request, setRequest] = useState<RampFlowRequest>(initialRequest);
  const [quote, setQuote] = useState<RampQuote | null>(null);
  const [availabilityReason, setAvailabilityReason] = useState('');
  const [loadingQuote, setLoadingQuote] = useState(true);

  useEffect(() => {
    setRequest(initialRequest);
  }, [initialRequest]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadingQuote(true);
      try {
        const availability = await getRampAvailability(request);
        if (cancelled) {
          return;
        }

        if (!availability.available) {
          setAvailabilityReason(availability.reasonLabel ?? copy.providerUnavailable);
          setQuote(null);
          setLoadingQuote(false);
          return;
        }

        const nextQuote = await getRampQuote(request);
        if (cancelled) {
          return;
        }

        setAvailabilityReason('');
        setQuote(nextQuote);
      } catch (error) {
        if (cancelled) {
          return;
        }
        setAvailabilityReason(
          error instanceof Error ? error.message : copy.providerUnavailable,
        );
        setQuote(null);
      } finally {
        if (!cancelled) {
          setLoadingQuote(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [copy.providerUnavailable, request]);

  const providerSummary = getRampProviderSummary(request.providerId);
  const providerLabel = getRampProviderLabel(request.providerId);
  const providerSessionEndpoint =
    request.providerId === 'moonpay'
      ? config.moonpay.sessionEndpoint
      : config.transak.sessionEndpoint;
  const currentAsset = assets.find(
    (asset) =>
      asset.symbol === request.cryptoCurrency && asset.network === request.network,
  );
  const partnerFeeAmount =
    quote?.partnerFeeAmount ??
    Number(((request.fiatAmount * config.partnerFeePct) / 100).toFixed(2));
  const providerFeesAmount =
    (quote?.providerFeeAmount ?? 0) + (quote?.networkFeeAmount ?? 0);
  const totalEstimated =
    quote?.totalPayableAmount ??
    Number((request.fiatAmount + partnerFeeAmount + providerFeesAmount).toFixed(2));
  const canContinue =
    !loadingQuote && !availabilityReason && Boolean(providerSessionEndpoint);
  const formattedPartnerFee = `${config.partnerFeePct.toFixed(1)}% · ${formatRampMoney(
    language,
    partnerFeeAmount,
    request.fiatCurrency,
  )}`;
  const formattedProviderFee =
    loadingQuote
      ? copy.providerPendingQuote
      : providerFeesAmount > 0
        ? formatRampMoney(language, providerFeesAmount, request.fiatCurrency)
        : copy.providerFeePending;

  const updateAsset = (asset: RampAssetOption) => {
    setRequest((current) => ({
      ...current,
      cryptoCurrency: asset.symbol,
      network: asset.network,
      fiatCurrency: asset.defaultFiatCurrency,
    }));
  };

  const handleContinue = () => {
    beginFlow(request);
    rememberQuote(quote);
    router.push({
      pathname: '/ramp/flow',
      params: {
        mode: request.mode,
        providerId: request.providerId,
        fiatCurrency: request.fiatCurrency,
        cryptoCurrency: request.cryptoCurrency,
        network: request.network,
        fiatAmount: String(request.fiatAmount),
        countryCode: request.countryCode,
        paymentMethod: request.paymentMethod,
      },
    });
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.iconButton,
            {
              backgroundColor: withOpacity(colors.surfaceElevated, 0.94),
              borderColor: withOpacity(colors.borderStrong, 0.72),
            },
          ]}
        >
          <Ionicons name="chevron-back" size={18} color={colors.text} />
        </Pressable>

        <View style={styles.headerCopy}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {copy.modeLabel(mode)}
          </Text>
          <Text style={[styles.headerBody, { color: colors.textMuted }]}>
            {copy.summarySubtitle}
          </Text>
        </View>

        <AstraEntryPoint
          onPress={() =>
            openAstra({
              surface: 'ramp',
              surfaceTitle: copy.modeLabel(mode),
              summary: `${copy.liveProviderNotice(providerLabel)} ${copy.providerDepends}`,
              rampMode: copy.modeLabel(mode),
              rampProviderLabel: providerLabel,
            })
          }
          size={42}
          accessibilityLabel="Abrir Astra en proveedor"
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <LinearGradient
          colors={[
            withOpacity(colors.primary, 0.12),
            withOpacity(colors.card, 0.98),
            withOpacity(colors.card, 1),
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.heroCard,
            {
              borderColor: withOpacity(colors.borderStrong, 0.62),
            },
          ]}
        >
          <Text style={[styles.heroLabel, { color: colors.textMuted }]}>
            {copy.sectionTitle}
          </Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            {copy.modeLabel(mode)}
          </Text>
          <Text style={[styles.heroBody, { color: colors.textSoft }]}>
            {copy.modeBody(mode)}
          </Text>
          <Text style={[styles.heroFootnote, { color: colors.textMuted }]}>
            {copy.liveProviderNotice(providerLabel)}
          </Text>
        </LinearGradient>

        <View
          style={[
            styles.card,
            {
              backgroundColor: withOpacity(colors.surfaceElevated, 0.94),
              borderColor: withOpacity(colors.borderStrong, 0.72),
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderCopy}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {copy.summaryTitle}
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
                {copy.summarySubtitle}
              </Text>
            </View>

            <View
              style={[
                styles.providerBadge,
                {
                  backgroundColor: withOpacity(colors.fieldBackground, 0.96),
                  borderColor: withOpacity(colors.borderStrong, 0.68),
                },
              ]}
            >
              <Text style={[styles.providerBadgeText, { color: colors.text }]}>
                {providerLabel} · {providerSummary.environment}
              </Text>
            </View>
          </View>

          <View style={styles.amountSection}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
              {copy.amount}
            </Text>
            <TextInput
              value={String(request.fiatAmount)}
              onChangeText={(value) =>
                setRequest((current) => ({
                  ...current,
                  fiatAmount: Number.parseFloat(value) > 0 ? Number.parseFloat(value) : 0,
                }))
              }
              keyboardType="decimal-pad"
              placeholder="100"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.amountInput,
                {
                  color: colors.text,
                  backgroundColor: withOpacity(colors.backgroundAlt, 0.96),
                  borderColor: withOpacity(colors.borderStrong, 0.76),
                },
              ]}
            />
          </View>

          <View style={styles.assetSection}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Crypto</Text>
            <View style={styles.chipRow}>
              {assets.map((asset) => (
                <SelectChip
                  key={`${asset.symbol}-${asset.network}`}
                  label={`${asset.symbol} · ${asset.network}`}
                  active={
                    asset.symbol === request.cryptoCurrency &&
                    asset.network === request.network
                  }
                  onPress={() => updateAsset(asset)}
                />
              ))}
            </View>
          </View>

          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: withOpacity(colors.backgroundAlt, 0.86),
                borderColor: withOpacity(colors.borderStrong, 0.56),
              },
            ]}
          >
            <View style={styles.summaryHeader}>
              <View style={styles.summaryHeaderCopy}>
                <Text style={[styles.summaryHeaderTitle, { color: colors.text }]}>
                  {copy.providerRecommended}
                </Text>
                <Text style={[styles.summaryHeaderValue, { color: colors.textSoft }]}>
                  {providerLabel} · {providerSummary.environment}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.summaryBlock,
                { borderBottomColor: withOpacity(colors.borderStrong, 0.42) },
              ]}
            >
              <SummaryRow label={copy.network} value={request.network.toUpperCase()} />
              <SummaryRow label={copy.country} value={request.countryCode ?? '--'} />
              <SummaryRow label={copy.method} value={request.paymentMethod ?? '--'} />
            </View>

            <View
              style={[
                styles.summaryBlock,
                { borderBottomColor: withOpacity(colors.borderStrong, 0.42) },
              ]}
            >
              <SummaryRow
                label={copy.partnerFee}
                value={formattedPartnerFee}
                tone="accent"
              />
              <SummaryRow
                label={copy.providerFee}
                value={formattedProviderFee}
                helper={
                  loadingQuote || providerFeesAmount <= 0
                    ? copy.providerFeePending
                    : undefined
                }
              />
            </View>

            <View style={styles.totalSection}>
              <View style={styles.totalCopy}>
                <Text style={[styles.totalLabel, { color: colors.textMuted }]}>
                  {copy.totalEstimated}
                </Text>
                <Text style={[styles.totalHint, { color: colors.textMuted }]}>
                  {copy.liveProviderNotice(providerLabel)}
                </Text>
              </View>
              <Text style={[styles.totalValue, { color: colors.profit }]}>
                {formatRampMoney(language, totalEstimated, request.fiatCurrency)}
              </Text>
            </View>

            <Text style={[styles.quoteNote, { color: colors.textSoft }]}>
              {quote?.cryptoAmount
                ? `${request.cryptoCurrency} ${quote.cryptoAmount.toFixed(6)}`
                : copy.pendingQuoteHint}
            </Text>
          </View>
        </View>

        {!providerSessionEndpoint || availabilityReason ? (
          <View
            style={[
              styles.warningCard,
              {
                backgroundColor: withOpacity(colors.warning, 0.08),
                borderColor: withOpacity(colors.warning, 0.18),
              },
            ]}
          >
            <View style={styles.warningTopRow}>
              <View
                style={[
                  styles.warningIconWrap,
                  { backgroundColor: withOpacity(colors.warning, 0.14) },
                ]}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={16}
                  color={colors.warning}
                />
              </View>
              <Text style={[styles.warningTitle, { color: colors.text }]}>
                {copy.configMissingTitle}
              </Text>
            </View>

            <Text style={[styles.warningBody, { color: colors.textSoft }]}>
              {availabilityReason || copy.configMissingBody(providerLabel)}
            </Text>
            <Text style={[styles.warningHint, { color: colors.textMuted }]}>
              {copy.continueDisabled}
            </Text>
          </View>
        ) : null}

        <View
          style={[
            styles.metricsCard,
            {
              backgroundColor: withOpacity(colors.surface, 0.96),
              borderColor: withOpacity(colors.borderStrong, 0.68),
            },
          ]}
        >
          <Text style={[styles.metricTitle, { color: colors.text }]}>
            {copy.revenueHint}
          </Text>
          <Text style={[styles.metricValue, { color: colors.profit }]}>
            {formatRampMoney(
              language,
              Number(
                (((partnerFeeAmount * (config.revenueSharePct ?? 0)) / 100) || 0).toFixed(2),
              ),
              request.fiatCurrency,
            )}
          </Text>
          <Text style={[styles.metricBody, { color: colors.textMuted }]}>
            {currentAsset?.name ?? request.cryptoCurrency}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton
          label={copy.startFlowLabel}
          onPress={handleContinue}
          disabled={!canContinue}
          icon="open-outline"
          tone="primary"
          flex={1}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
    paddingTop: 2,
  },
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: 30,
    lineHeight: 34,
  },
  headerBody: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 19,
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
    gap: 16,
    paddingBottom: 18,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 20,
    gap: 8,
  },
  heroLabel: {
    fontFamily: FONT.medium,
    fontSize: 11,
    letterSpacing: 0.85,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: FONT.bold,
    fontSize: 25,
    lineHeight: 30,
  },
  heroBody: {
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  heroFootnote: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 2,
  },
  card: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 18,
    gap: 18,
  },
  cardHeader: {
    gap: 12,
  },
  cardHeaderCopy: {
    gap: 5,
  },
  cardTitle: {
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  cardSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  providerBadge: {
    alignSelf: 'flex-start',
    minHeight: 30,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerBadgeText: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  amountSection: {
    gap: 8,
  },
  assetSection: {
    gap: 10,
  },
  fieldLabel: {
    fontFamily: FONT.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.78,
  },
  amountInput: {
    minHeight: 58,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontFamily: FONT.bold,
    fontSize: 28,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    minHeight: 40,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 14,
  },
  summaryHeader: {
    gap: 4,
  },
  summaryHeaderCopy: {
    gap: 4,
  },
  summaryHeaderTitle: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  summaryHeaderValue: {
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  summaryBlock: {
    gap: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
  },
  summaryCopy: {
    flex: 1,
    gap: 3,
  },
  summaryLabel: {
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 17,
  },
  summaryHelper: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  summaryValue: {
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: FONT.semibold,
    fontSize: 13,
    lineHeight: 18,
  },
  summaryValueStrong: {
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: FONT.bold,
    fontSize: 15,
    lineHeight: 20,
  },
  totalSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  totalCopy: {
    flex: 1,
    gap: 4,
  },
  totalLabel: {
    fontFamily: FONT.semibold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.76,
  },
  totalHint: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  totalValue: {
    fontFamily: FONT.bold,
    fontSize: 34,
    lineHeight: 38,
    textAlign: 'right',
  },
  quoteNote: {
    fontFamily: FONT.medium,
    fontSize: 11,
    lineHeight: 16,
  },
  warningCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 10,
  },
  warningTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  warningIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningTitle: {
    flex: 1,
    fontFamily: FONT.semibold,
    fontSize: 15,
  },
  warningBody: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  warningHint: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  metricsCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 6,
  },
  metricTitle: {
    fontFamily: FONT.semibold,
    fontSize: 15,
  },
  metricValue: {
    fontFamily: FONT.bold,
    fontSize: 30,
    lineHeight: 34,
  },
  metricBody: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: SPACING.xs,
  },
  actionButton: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionLabel: {
    fontFamily: FONT.bold,
    fontSize: 14,
  },
});
