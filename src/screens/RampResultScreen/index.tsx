import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, SPACING, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { useAstra } from '../../hooks/useAstra';
import { getRampCopy, getRampProviderLabel } from '../../services/ramp/rampCopy';
import type { RampProviderId } from '../../types/ramp';

function normalizeStatus(raw?: string | string[]) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === 'completed' || value === 'cancelled' || value === 'failed') {
    return value;
  }
  return 'failed' as const;
}

function normalizeProvider(raw?: string | string[]): RampProviderId {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === 'moonpay' ? 'moonpay' : 'transak';
}

export default function RampResultScreen() {
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{
    status?: string;
    providerId?: string;
    message?: string;
    transactionId?: string;
    orderId?: string;
  }>();
  const { openAstra, language } = useAstra();
  const copy = getRampCopy(language);
  const status = normalizeStatus(params.status);
  const providerId = normalizeProvider(params.providerId);
  const providerLabel = getRampProviderLabel(providerId);
  const title = copy.resultTitle(status);
  const body = params.message || copy.resultBody(status, providerLabel);
  const toneColor =
    status === 'completed'
      ? colors.profit
      : status === 'cancelled'
        ? colors.warning
        : colors.loss;
  const icon =
    status === 'completed'
      ? 'checkmark-circle-outline'
      : status === 'cancelled'
        ? 'pause-circle-outline'
        : 'alert-circle-outline';

  return (
    <ScreenContainer contentContainerStyle={styles.content} scrollable={false}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.replace('/(tabs)/wallet')}
          style={[
            styles.iconButton,
            {
              backgroundColor: withOpacity(colors.surfaceElevated, 0.9),
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="chevron-back" size={18} color={colors.text} />
        </Pressable>
      </View>

      <LinearGradient
        colors={[withOpacity(toneColor, 0.14), withOpacity(colors.card, 0.98)]}
        style={[styles.heroCard, { borderColor: withOpacity(toneColor, 0.22) }]}
      >
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: withOpacity(toneColor, 0.14), borderColor: withOpacity(toneColor, 0.22) },
          ]}
        >
          <Ionicons name={icon} size={26} color={toneColor} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.body, { color: colors.textSoft }]}>{body}</Text>
        <Text style={[styles.helper, { color: colors.textMuted }]}>
          {copy.liveProviderNotice(providerLabel)}
        </Text>
      </LinearGradient>

      <View
        style={[
          styles.detailCard,
          {
            backgroundColor: withOpacity(colors.surfaceElevated, 0.92),
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{copy.provider}</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>{providerLabel}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{copy.statusLabel}</Text>
          <Text style={[styles.detailValue, { color: toneColor }]}>{title}</Text>
        </View>
        {params.transactionId ? (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Transaction</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{params.transactionId}</Text>
          </View>
        ) : null}
        {params.orderId ? (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Order</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{params.orderId}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label={copy.askAstra}
          tone="secondary"
          onPress={() =>
            openAstra({
              surface: status === 'completed' ? 'ramp' : 'error',
              surfaceTitle: providerLabel,
              summary: copy.liveProviderNotice(providerLabel),
              errorTitle: status === 'completed' ? undefined : title,
              errorBody: status === 'completed' ? undefined : body,
              rampProviderLabel: providerLabel,
            })
          }
          style={styles.button}
        />
        <PrimaryButton
          label={copy.backToWallet}
          onPress={() => router.replace('/(tabs)/wallet')}
          style={styles.button}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 22,
    gap: 12,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 28,
  },
  body: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  helper: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 17,
  },
  detailCard: {
    borderWidth: 1,
    borderRadius: RADII.lg,
    padding: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
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
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: SPACING.xs,
  },
  button: {
    flex: 1,
  },
});
