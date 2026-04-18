import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { formatConvertAmount, formatConvertMoney } from '../../services/convert/convertCopy';
import type { ConvertCopy, ConvertQuote } from '../../types/convert';
import { PrimaryButton } from '../common/PrimaryButton';

interface Props {
  visible: boolean;
  quote: ConvertQuote | null;
  copy: ConvertCopy;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

function DetailRow({
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
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: accent ?? colors.text }]}>{value}</Text>
    </View>
  );
}

export function ConvertConfirmSheet({
  visible,
  quote,
  copy,
  onClose,
  onConfirm,
  loading = false,
}: Props) {
  const { colors } = useAppTheme();

  if (!quote) {
    return null;
  }

  const feeLabel =
    quote.spreadPct > 0
      ? `${quote.feePct.toFixed(2)}% + ${quote.spreadPct.toFixed(2)}%`
      : `${quote.feePct.toFixed(2)}%`;

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.card,
            {
              backgroundColor: withOpacity(colors.background, 0.985),
              borderColor: withOpacity(colors.primary, 0.18),
            },
          ]}
        >
          <LinearGradient
            colors={[withOpacity(colors.primary, 0.18), withOpacity(colors.card, 0.98)]}
            style={[styles.hero, { borderColor: withOpacity(colors.primary, 0.16) }]}
          >
            <Text style={[styles.heroTitle, { color: colors.text }]}>{copy.confirmTitle}</Text>
            <Text style={[styles.heroBody, { color: colors.textSoft }]}>{copy.confirmBody}</Text>
          </LinearGradient>

          <View
            style={[
              styles.stackCard,
              {
                backgroundColor: withOpacity(colors.surfaceElevated, 0.92),
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.amountRow}>
              <View style={styles.amountBlock}>
                <Text style={[styles.amountLabel, { color: colors.textMuted }]}>{copy.fromLabel}</Text>
                <Text style={[styles.amountValue, { color: colors.text }]}>
                  {formatConvertAmount(copy.language, quote.fromAmount, quote.fromAsset.symbol, 6)}
                </Text>
              </View>
              <View
                style={[
                  styles.swapBadge,
                  {
                    backgroundColor: withOpacity(colors.primary, 0.12),
                    borderColor: withOpacity(colors.primary, 0.22),
                  },
                ]}
              >
                <Ionicons name="swap-vertical" size={16} color={colors.primary} />
              </View>
              <View style={styles.amountBlock}>
                <Text style={[styles.amountLabel, { color: colors.textMuted }]}>{copy.toLabel}</Text>
                <Text style={[styles.amountValue, { color: colors.text }]}>
                  {quote.estimatedToAmount
                    ? formatConvertAmount(copy.language, quote.estimatedToAmount, quote.toAsset.symbol, 6)
                    : quote.toAsset.symbol}
                </Text>
              </View>
            </View>

            <DetailRow
              label={copy.rateLabel}
              value={
                quote.estimatedRate
                  ? `1 ${quote.fromAsset.symbol} = ${formatConvertAmount(copy.language, quote.estimatedRate, quote.toAsset.symbol, 6)}`
                  : '--'
              }
            />
            <DetailRow
              label={copy.feeLabel}
              value={`${feeLabel} · ${formatConvertMoney(copy.language, quote.feeAmountUsd + quote.spreadAmountUsd)}`}
            />
            <DetailRow label={copy.providerLabel} value={quote.providerLabel} />
            <DetailRow
              label={copy.etaLabel}
              value={
                quote.estimatedSeconds >= 60
                  ? `${Math.ceil(quote.estimatedSeconds / 60)} min`
                  : `${quote.estimatedSeconds}s`
              }
            />
          </View>

          {quote.disclaimer ? (
            <Text style={[styles.disclaimer, { color: colors.textMuted }]}>{quote.disclaimer}</Text>
          ) : null}

          <View style={styles.footer}>
            <PrimaryButton
              label={copy.cancelAction}
              tone="secondary"
              onPress={onClose}
              style={styles.footerButton}
            />
            <PrimaryButton
              label={
                quote.executionKind === 'provider'
                  ? copy.continueWithProvider
                  : copy.confirmAction
              }
              onPress={onConfirm}
              disabled={!quote.canProceed || loading}
              style={styles.footerButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(3, 4, 8, 0.66)',
    padding: 18,
  },
  card: {
    width: '100%',
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  hero: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  heroTitle: {
    fontFamily: FONT.bold,
    fontSize: 22,
  },
  heroBody: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  stackCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  amountBlock: {
    flex: 1,
    gap: 4,
  },
  amountLabel: {
    fontFamily: FONT.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  amountValue: {
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  swapBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailLabel: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  disclaimer: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 17,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
  },
  footerButton: {
    flex: 1,
  },
});
