import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import type {
  MarketRealtimeStatus,
  OrderBookRow,
  RecentTradeRow,
  TradePriceAlert,
  TradePriceAlertDirection,
} from '../../types';

export type FullscreenChartPanelTab = 'book' | 'trades' | 'info';

const PANEL_TABS: Array<{ key: FullscreenChartPanelTab; label: string }> = [
  { key: 'book', label: 'Libro' },
  { key: 'trades', label: 'Trades' },
  { key: 'info', label: 'Info' },
];

interface Props {
  tab: FullscreenChartPanelTab;
  onChangeTab: (tab: FullscreenChartPanelTab) => void;
  orderBookRows: OrderBookRow[];
  orderBookStatus: MarketRealtimeStatus;
  orderBookError: string | null;
  recentTrades: RecentTradeRow[];
  sourceLabel: string;
  chartSourceLabel: string;
  currentPrice: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  alertValue: string;
  onChangeAlertValue: (value: string) => void;
  onCreateAlert: (direction: TradePriceAlertDirection) => void;
  alerts: TradePriceAlert[];
  onRemoveAlert: (alertId: string) => void;
  onPickPrice: (price: number) => void;
}

function formatQuotePrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: price >= 1 ? 2 : 4,
    maximumFractionDigits: price >= 1 ? 2 : 6,
  }).format(price);
}

function formatCompactVolume(value: number) {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)} B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)} M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)} K`;
  return `$${value.toFixed(2)}`;
}

function getBestPrices(rows: OrderBookRow[]) {
  const asks = rows.filter((row) => row.side === 'sell');
  const bids = rows.filter((row) => row.side === 'buy');
  const bestAsk = asks.at(-1) ?? null;
  const bestBid = bids[0] ?? null;
  const spread = bestAsk && bestBid ? Math.max(bestAsk.price - bestBid.price, 0) : 0;
  return { asks, bids, bestAsk, spread };
}

export function FullscreenChartPanel({
  tab,
  onChangeTab,
  orderBookRows,
  orderBookStatus,
  orderBookError,
  recentTrades,
  sourceLabel,
  chartSourceLabel,
  currentPrice,
  high24h,
  low24h,
  volume24h,
  alertValue,
  onChangeAlertValue,
  onCreateAlert,
  alerts,
  onRemoveAlert,
  onPickPrice,
}: Props) {
  const { colors } = useAppTheme();
  const { asks, bids, bestAsk, spread } = getBestPrices(orderBookRows);

  return (
    <>
      <View style={styles.tabRow}>
        {PANEL_TABS.map((item) => {
          const active = tab === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => onChangeTab(item.key)}
              style={[
                styles.tabButton,
                {
                  backgroundColor: active ? withOpacity(colors.primary, 0.12) : 'transparent',
                  borderBottomColor: active ? colors.primary : 'transparent',
                },
              ]}
            >
              <Text style={[styles.tabLabel, { color: active ? colors.text : colors.textMuted }]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: withOpacity(colors.backgroundAlt, 0.72),
            borderColor: withOpacity(colors.border, 0.72),
          },
        ]}
      >
        {tab === 'book' ? (
          <View style={styles.section}>
            <View style={styles.headerRow}>
              <Text style={[styles.headerText, { color: colors.textMuted }]}>Precio</Text>
              <Text style={[styles.headerText, { color: colors.textMuted }]}>Amount</Text>
              <Text style={[styles.headerText, { color: colors.textMuted }]}>Total</Text>
            </View>

            {orderBookRows.length ? (
              <>
                {asks.slice(0, 5).map((row) => (
                  <Pressable key={row.id} onPress={() => onPickPrice(row.price)} style={styles.row}>
                    <Text style={[styles.priceSell, { color: colors.loss }]}>{formatQuotePrice(row.price)}</Text>
                    <Text style={[styles.amount, { color: colors.textSoft }]}>{row.quantity.toFixed(3)}</Text>
                    <Text style={[styles.amount, { color: colors.textMuted }]}>{row.total.toFixed(0)}</Text>
                  </Pressable>
                ))}

                <View
                  style={[
                    styles.midline,
                    {
                      borderTopColor: withOpacity(colors.border, 0.68),
                      borderBottomColor: withOpacity(colors.border, 0.68),
                    },
                  ]}
                >
                  <Text style={[styles.midPrice, { color: colors.text }]}>{formatQuotePrice(currentPrice)}</Text>
                  <Text style={[styles.midSpread, { color: colors.textMuted }]}>
                    Spread {spread ? formatQuotePrice(spread) : '--'}
                  </Text>
                  <Text style={[styles.midPrice, { color: colors.textSoft }]}>{bestAsk ? formatQuotePrice(bestAsk.price) : '--'}</Text>
                </View>

                {bids.slice(0, 5).map((row) => (
                  <Pressable key={row.id} onPress={() => onPickPrice(row.price)} style={styles.row}>
                    <Text style={[styles.priceBuy, { color: colors.profit }]}>{formatQuotePrice(row.price)}</Text>
                    <Text style={[styles.amount, { color: colors.textSoft }]}>{row.quantity.toFixed(3)}</Text>
                    <Text style={[styles.amount, { color: colors.textMuted }]}>{row.total.toFixed(0)}</Text>
                  </Pressable>
                ))}
              </>
            ) : (
              <View style={styles.emptyShell}>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Libro sin profundidad</Text>
                <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
                  {orderBookStatus === 'unsupported'
                    ? 'Este par todavia no tiene profundidad en vivo con la fuente actual.'
                    : orderBookError || 'Estamos reconectando el libro del mercado.'}
                </Text>
              </View>
            )}
          </View>
        ) : null}

        {tab === 'trades' ? (
          <View style={styles.section}>
            <View style={styles.headerRow}>
              <Text style={[styles.headerText, { color: colors.textMuted }]}>Precio</Text>
              <Text style={[styles.headerText, { color: colors.textMuted }]}>Cantidad</Text>
              <Text style={[styles.headerText, { color: colors.textMuted }]}>Hora</Text>
            </View>

            {recentTrades.length ? (
              recentTrades.slice(0, 10).map((trade) => (
                <View key={trade.id} style={styles.row}>
                  <Text style={[styles.priceBuy, { color: trade.side === 'buy' ? colors.profit : colors.loss }]}>
                    {formatQuotePrice(trade.price)}
                  </Text>
                  <Text style={[styles.amount, { color: colors.textSoft }]}>{trade.quantity.toFixed(4)}</Text>
                  <Text style={[styles.amount, { color: colors.textMuted }]}>
                    {new Date(trade.time).toLocaleTimeString('es-PE', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyShell}>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Sin trades visibles</Text>
                <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
                  {orderBookStatus === 'unsupported'
                    ? 'Este par todavia no tiene trades en vivo con la fuente actual.'
                    : orderBookError || 'Estamos reconectando la cinta de operaciones.'}
                </Text>
              </View>
            )}
          </View>
        ) : null}

        {tab === 'info' ? (
          <View style={styles.section}>
            <View style={styles.infoGrid}>
              <View style={styles.infoCell}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Min 24h</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{formatQuotePrice(low24h)}</Text>
              </View>
              <View style={styles.infoCell}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Max 24h</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{formatQuotePrice(high24h)}</Text>
              </View>
              <View style={styles.infoCell}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Volumen</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{formatCompactVolume(volume24h)}</Text>
              </View>
              <View style={styles.infoCell}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Fuente</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{sourceLabel} / {chartSourceLabel}</Text>
              </View>
            </View>

            <View
              style={[
                styles.alertComposer,
                {
                  backgroundColor: withOpacity(colors.fieldBackground, 0.82),
                  borderColor: withOpacity(colors.border, 0.76),
                },
              ]}
            >
              <Text style={[styles.alertTitle, { color: colors.text }]}>Alertas de precio</Text>
              <Text style={[styles.alertSubtitle, { color: colors.textMuted }]}>
                Guarda un nivel y OrbitX disparara la alerta cuando el precio lo cruce.
              </Text>

              <TextInput
                value={alertValue}
                onChangeText={onChangeAlertValue}
                keyboardType="decimal-pad"
                placeholder="Ej: 68450"
                placeholderTextColor={withOpacity(colors.textMuted, 0.75)}
                style={[
                  styles.alertInput,
                  {
                    color: colors.text,
                    backgroundColor: withOpacity(colors.backgroundAlt, 0.86),
                    borderColor: withOpacity(colors.border, 0.72),
                  },
                ]}
              />

              <View style={styles.alertActionRow}>
                <Pressable
                  onPress={() => onCreateAlert('above_or_equal')}
                  style={[styles.alertButton, { borderColor: withOpacity(colors.profit, 0.3) }]}
                >
                  <Text style={[styles.alertButtonLabel, { color: colors.text }]}>Mayor o igual</Text>
                </Pressable>
                <Pressable
                  onPress={() => onCreateAlert('below_or_equal')}
                  style={[styles.alertButton, { borderColor: withOpacity(colors.loss, 0.3) }]}
                >
                  <Text style={[styles.alertButtonLabel, { color: colors.text }]}>Menor o igual</Text>
                </Pressable>
              </View>
            </View>

            {alerts.length ? (
              <View style={styles.alertList}>
                {alerts.slice(0, 4).map((alert) => (
                  <View
                    key={alert.id}
                    style={[
                      styles.alertRow,
                      {
                        borderColor: withOpacity(colors.border, 0.72),
                        backgroundColor: withOpacity(colors.backgroundAlt, 0.76),
                      },
                    ]}
                  >
                    <View style={styles.alertCopy}>
                      <Text style={[styles.alertRowTitle, { color: colors.text }]}>
                        {alert.direction === 'above_or_equal' ? '>= ' : '<= '}
                        {formatQuotePrice(alert.targetPrice)}
                      </Text>
                      <Text style={[styles.alertRowMeta, { color: colors.textMuted }]}>
                        {alert.triggeredAt
                          ? `Activada ${new Date(alert.triggeredAt).toLocaleTimeString('es-PE', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}`
                          : 'Activa y escuchando precio real'}
                      </Text>
                    </View>
                    <Pressable onPress={() => onRemoveAlert(alert.id)} style={styles.alertRemoveButton}>
                      <Ionicons name="close" size={16} color={colors.textMuted} />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  tabRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tabButton: { flex: 1, minHeight: 34, borderBottomWidth: 2, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontFamily: FONT.semibold, fontSize: 12 },
  card: { minHeight: 190, borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12, gap: 10 },
  section: { gap: 8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  headerText: { flex: 1, fontFamily: FONT.medium, fontSize: 10, textAlign: 'left' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, minHeight: 22 },
  priceSell: { flex: 1, fontFamily: FONT.semibold, fontSize: 12 },
  priceBuy: { flex: 1, fontFamily: FONT.semibold, fontSize: 12 },
  amount: { flex: 1, textAlign: 'center', fontFamily: FONT.medium, fontSize: 11 },
  midline: { minHeight: 34, borderTopWidth: 1, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginVertical: 2 },
  midPrice: { flex: 1, fontFamily: FONT.bold, fontSize: 13 },
  midSpread: { flex: 1, textAlign: 'center', fontFamily: FONT.medium, fontSize: 11 },
  emptyShell: { minHeight: 140, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 12 },
  emptyTitle: { fontFamily: FONT.semibold, fontSize: 13 },
  emptyBody: { fontFamily: FONT.regular, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  infoCell: { width: '47%', gap: 4 },
  infoLabel: { fontFamily: FONT.medium, fontSize: 10 },
  infoValue: { fontFamily: FONT.semibold, fontSize: 12 },
  alertComposer: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 12, gap: 10 },
  alertTitle: { fontFamily: FONT.semibold, fontSize: 13 },
  alertSubtitle: { fontFamily: FONT.regular, fontSize: 11, lineHeight: 17 },
  alertInput: { minHeight: 42, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, fontFamily: FONT.medium, fontSize: 14 },
  alertActionRow: { flexDirection: 'row', gap: 10 },
  alertButton: { flex: 1, minHeight: 38, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  alertButtonLabel: { fontFamily: FONT.semibold, fontSize: 12 },
  alertList: { gap: 8 },
  alertRow: { minHeight: 52, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  alertCopy: { flex: 1, gap: 3 },
  alertRowTitle: { fontFamily: FONT.semibold, fontSize: 12 },
  alertRowMeta: { fontFamily: FONT.regular, fontSize: 10 },
  alertRemoveButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
});
