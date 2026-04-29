import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { formatCurrency } from '../../src/utils/formatCurrency';

interface Web3WalletSummaryProps {
  address: string;
  chainLabel: string;
  totalUsdEstimate: number;
  isLoading: boolean;
  message?: string;
  onManage: () => void;
  onRefresh: () => void;
}

function maskAddress(address: string) {
  if (!address) {
    return '';
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function Web3WalletSummary({
  address,
  chainLabel,
  totalUsdEstimate,
  isLoading,
  message,
  onManage,
  onRefresh,
}: Web3WalletSummaryProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(colors.surfaceElevated, 0.24),
          borderColor: withOpacity(colors.border, 0.42),
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.copy}>
          <Text style={[styles.eyebrow, { color: colors.textMuted }]}>Wallet externa</Text>
          <Text style={[styles.total, { color: colors.text }]}>
            {isLoading && totalUsdEstimate === 0 ? 'Actualizando...' : formatCurrency(totalUsdEstimate)}
          </Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            {maskAddress(address)} · Red actual: {chainLabel}
          </Text>
        </View>

        <Pressable
          onPress={onManage}
          style={[
            styles.manageButton,
            {
              backgroundColor: withOpacity(colors.primary, 0.14),
              borderColor: withOpacity(colors.primary, 0.32),
            },
          ]}
        >
          <Text style={[styles.manageText, { color: colors.primary }]}>Gestionar</Text>
        </Pressable>
      </View>

      {message ? (
        <Text style={[styles.message, { color: colors.warning }]}>{message}</Text>
      ) : (
        <Text style={[styles.message, { color: colors.textMuted }]}>
          Consultando Ethereum, BNB Chain, Polygon y Base con tu address publica.
        </Text>
      )}

      <View style={styles.actionRow}>
        <Pressable style={[styles.action, { borderColor: withOpacity(colors.border, 0.5) }]}>
          <Ionicons name="arrow-up-outline" size={16} color={colors.textMuted} />
          <Text style={[styles.actionLabel, { color: colors.text }]}>Enviar</Text>
        </Pressable>
        <Pressable style={[styles.action, { borderColor: withOpacity(colors.border, 0.5) }]}>
          <Ionicons name="arrow-down-outline" size={16} color={colors.textMuted} />
          <Text style={[styles.actionLabel, { color: colors.text }]}>Recibir</Text>
        </Pressable>
        <Pressable style={[styles.action, { borderColor: withOpacity(colors.border, 0.5) }]}>
          <Ionicons name="swap-horizontal-outline" size={16} color={colors.textMuted} />
          <Text style={[styles.actionLabel, { color: colors.text }]}>Operar</Text>
        </Pressable>
        <Pressable
          onPress={onRefresh}
          disabled={isLoading}
          style={[
            styles.action,
            {
              borderColor: withOpacity(colors.border, 0.5),
              opacity: isLoading ? 0.55 : 1,
            },
          ]}
        >
          <Ionicons name="refresh-outline" size={16} color={colors.textMuted} />
          <Text style={[styles.actionLabel, { color: colors.text }]}>Actualizar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  eyebrow: {
    fontFamily: FONT.medium,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  total: {
    fontFamily: FONT.bold,
    fontSize: 28,
    lineHeight: 33,
  },
  meta: {
    fontFamily: FONT.regular,
    fontSize: 11,
  },
  manageButton: {
    minHeight: 32,
    borderRadius: RADII.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  manageText: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  message: {
    fontFamily: FONT.regular,
    fontSize: 10,
    lineHeight: 15,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 7,
  },
  action: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  actionLabel: {
    fontFamily: FONT.semibold,
    fontSize: 9,
  },
});
