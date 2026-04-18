import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useOrbitStore } from '../../../store/useOrbitStore';
import { EmptyState } from '../../components/common/EmptyState';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { SectionHeader } from '../../components/common/SectionHeader';
import { useTradeStore } from '../../store/tradeStore';
import { useWalletStore } from '../../store/walletStore';

interface HistoryItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  accent: 'default' | 'success' | 'warning';
}

export default function HistoryScreen() {
  const { colors } = useAppTheme();
  const activity = useOrbitStore((state) => state.activity);
  const walletHistory = useWalletStore((state) => state.history);
  const openOrders = useTradeStore((state) => state.openOrders);
  const recentOrders = useTradeStore((state) => state.recentOrders);

  const items = useMemo<HistoryItem[]>(() => {
    const normalized = [
      ...walletHistory.map((item) => ({
        id: item.id,
        title: item.title,
        body: item.body,
        timestamp: item.createdAt,
        accent: 'success' as const,
      })),
      ...recentOrders.map((item) => ({
        id: item.id,
        title: `Operacion ${item.side === 'buy' ? 'de compra' : 'de venta'}`,
        body: `${item.quantity} a ${item.price}`,
        timestamp: item.time,
        accent: item.side === 'buy' ? 'success' as const : 'warning' as const,
      })),
      ...openOrders.map((item) => ({
        id: item.id,
        title: `Orden ${item.type} abierta`,
        body: `${item.side === 'buy' ? 'Compra' : 'Venta'} ${item.quantity} ${item.pairId.toUpperCase()}`,
        timestamp: item.createdAt,
        accent: 'default' as const,
      })),
      ...activity.map((item) => ({
        id: item.id,
        title: item.title,
        body: item.description,
        timestamp: item.timestamp,
        accent: 'default' as const,
      })),
    ];

    return normalized
      .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
      .slice(0, 40);
  }, [activity, openOrders, recentOrders, walletHistory]);

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <SectionHeader
        title="Historial"
        subtitle="Actividad reciente de cuenta, billetera y operacion."
      />

      {items.length ? (
        <View style={styles.list}>
          {items.map((item) => {
            const color =
              item.accent === 'success'
                ? colors.profit
                : item.accent === 'warning'
                  ? colors.warning
                  : colors.text;

            return (
              <View
                key={item.id}
                style={[
                  styles.card,
                  { backgroundColor: colors.fieldBackground, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.title, { color }]}>{item.title}</Text>
                <Text style={[styles.body, { color: colors.textMuted }]}>{item.body}</Text>
                <Text style={[styles.time, { color: colors.textSoft }]}>
                  {new Date(item.timestamp).toLocaleString('es-PE')}
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <EmptyState
          title="Aun no tienes movimientos"
          body="Cuando operes, muevas fondos o ajustes tu cuenta, todo aparecera aqui."
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
  },
  list: {
    gap: 10,
  },
  card: {
    borderWidth: 1,
    borderRadius: RADII.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  body: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  time: {
    fontFamily: FONT.medium,
    fontSize: 10,
  },
});
