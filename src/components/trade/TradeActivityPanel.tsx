import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import type { OpenOrder, RecentTradeRow } from '../../types';

type ActivityTab = 'open' | 'positions' | 'history' | 'balance';

interface Props {
  openOrders: OpenOrder[];
  recentTrades: RecentTradeRow[];
  baseSymbol: string;
  quoteSymbol: string;
  baseBalance: number;
  quoteBalance: number;
  onOpenChart?: () => void;
}

const TAB_ITEMS: Array<{ key: ActivityTab; label: string }> = [
  { key: 'open', label: 'Abiertas' },
  { key: 'positions', label: 'Posiciones' },
  { key: 'history', label: 'Historial' },
  { key: 'balance', label: 'Balance' },
];

export function TradeActivityPanel({
  openOrders,
  recentTrades,
  baseSymbol,
  quoteSymbol,
  baseBalance,
  quoteBalance,
  onOpenChart,
}: Props) {
  const { colors } = useAppTheme();
  const [tab, setTab] = useState<ActivityTab>('open');

  const filteredOrders = useMemo(
    () => openOrders.filter((order) => order.pairId.startsWith(baseSymbol.toLowerCase())),
    [baseSymbol, openOrders],
  );

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.tabRow}>
        {TAB_ITEMS.map((item) => {
          const active = item.key === tab;
          return (
            <Pressable key={item.key} onPress={() => setTab(item.key)} style={styles.tabButton}>
              <Text style={[styles.tabLabel, { color: active ? colors.text : colors.textMuted }]}>
                {item.label}
              </Text>
              {active ? (
                <View
                  style={[
                    styles.tabUnderline,
                    { backgroundColor: item.key === 'open' ? colors.primary : colors.primary },
                  ]}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {tab === 'open' ? (
        <>
          <Pressable style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSoft }]}>
              Todas las abiertas ({filteredOrders.length})
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
          </Pressable>

          <View
            style={[
              styles.balanceShell,
              { backgroundColor: withOpacity(colors.fieldBackground, 0.88), borderColor: colors.border },
            ]}
          >
            <View style={styles.balanceBlock}>
              <Text style={[styles.balanceLabel, { color: colors.textMuted }]}>{quoteSymbol}</Text>
              <Text style={[styles.balanceValue, { color: colors.text }]}>{quoteBalance.toFixed(0)} {quoteSymbol}</Text>
            </View>
            <View style={styles.balanceBlock}>
              <Text style={[styles.balanceLabel, { color: colors.textMuted }]}>{baseSymbol}</Text>
              <Text style={[styles.balanceValue, { color: colors.text }]}>{baseBalance.toFixed(4)} {baseSymbol}</Text>
            </View>
          </View>

          {onOpenChart ? (
            <View style={styles.bottomActionRow}>
              <Pressable
                onPress={onOpenChart}
                style={[
                  styles.graphButton,
                  {
                    backgroundColor: withOpacity(colors.primary, 0.08),
                    borderColor: withOpacity(colors.primary, 0.2),
                  },
                ]}
              >
                <Ionicons name="stats-chart" size={11} color={colors.profit} />
                <Text style={[styles.graphButtonLabel, { color: colors.textSoft }]}>Ver grafico</Text>
              </Pressable>
            </View>
          ) : null}
        </>
      ) : null}

      {tab === 'positions' ? (
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          No hay posiciones activas en este momento.
        </Text>
      ) : null}

      {tab === 'history' ? (
        recentTrades.length ? (
          <View style={styles.historyList}>
            {recentTrades.slice(0, 4).map((row, index) => (
              <View
                key={row.id}
                style={[
                  styles.historyRow,
                  {
                    borderBottomColor:
                      index === Math.min(recentTrades.length, 4) - 1
                        ? 'transparent'
                        : withOpacity(colors.border, 0.55),
                  },
                ]}
              >
                <Text
                  style={[
                    styles.historyPrice,
                    { color: row.side === 'buy' ? colors.profit : colors.loss },
                  ]}
                >
                  {row.price.toFixed(0)}
                </Text>
                <Text style={[styles.historyQty, { color: colors.textSoft }]}>
                  {row.quantity.toFixed(4)} {baseSymbol}
                </Text>
                <Text style={[styles.historyTime, { color: colors.textMuted }]}>
                  {new Date(row.time).toLocaleTimeString('es-PE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            No hay operaciones recientes todavia.
          </Text>
        )
      ) : null}

      {tab === 'balance' ? (
        <View
          style={[
            styles.balanceShell,
            { backgroundColor: withOpacity(colors.fieldBackground, 0.88), borderColor: colors.border },
          ]}
        >
          <View style={styles.balanceBlock}>
            <Text style={[styles.balanceLabel, { color: colors.textMuted }]}>{quoteSymbol}</Text>
            <Text style={[styles.balanceValue, { color: colors.text }]}>{quoteBalance.toFixed(2)} {quoteSymbol}</Text>
          </View>
          <View style={styles.balanceBlock}>
            <Text style={[styles.balanceLabel, { color: colors.textMuted }]}>{baseSymbol}</Text>
            <Text style={[styles.balanceValue, { color: colors.text }]}>{baseBalance.toFixed(6)} {baseSymbol}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 12,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 18,
  },
  tabButton: {
    gap: 7,
    paddingBottom: 2,
  },
  tabLabel: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  tabUnderline: {
    height: 2,
    borderRadius: 999,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  balanceShell: {
    minHeight: 88,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  balanceBlock: {
    flex: 1,
    gap: 6,
  },
  balanceLabel: {
    fontFamily: FONT.medium,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  balanceValue: {
    fontFamily: FONT.bold,
    fontSize: 18,
    lineHeight: 20,
  },
  bottomActionRow: {
    alignItems: 'flex-end',
  },
  graphButton: {
    minHeight: 26,
    borderRadius: 9,
    borderWidth: 1,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  graphButtonLabel: {
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  emptyText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  historyList: {
    gap: 2,
  },
  historyRow: {
    minHeight: 34,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  historyPrice: {
    width: 72,
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  historyQty: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  historyTime: {
    width: 54,
    textAlign: 'right',
    fontFamily: FONT.medium,
    fontSize: 10,
  },
});
