import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import type { OrderType } from '../../types';

const BUY = '#00FFA3';
const SELL = '#FF4D4D';
const ACCENT = '#7B3FE4';
const TEXT = '#FFFFFF';
const TEXT_MUTED = '#8E8EA0';
const CARD = '#111218';
const BORDER = 'rgba(255,255,255,0.08)';

const ORDER_TYPES: OrderType[] = ['market', 'limit', 'stop'];
const QUICK_PERCENTS = [25, 50, 75, 100] as const;

interface Props {
  orderType: OrderType;
  price: string;
  quantity: string;
  total: string;
  stopPrice?: string;
  quickPercent: number | null;
  feeEstimate: number;
  availableQuote: number;
  availableBase: number;
  baseSymbol: string;
  quoteSymbol: string;
  currentPriceLabel: string;
  onChangeOrderType: (value: OrderType) => void;
  onChangePrice: (value: string) => void;
  onChangeQuantity: (value: string) => void;
  onChangeTotal: (value: string) => void;
  onChangeStopPrice?: (value: string) => void;
  onPercent: (value: number) => void;
  onSubmitSide: (side: 'buy' | 'sell') => void;
}

function formatBalance(value: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: value >= 10 ? 2 : 4,
    maximumFractionDigits: value >= 10 ? 2 : 4,
  }).format(value);
}

function formatFee(value: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: value >= 1 ? 2 : 4,
    maximumFractionDigits: value >= 1 ? 2 : 4,
  }).format(value);
}

function InputField({
  label,
  value,
  suffix,
  placeholder,
  onChangeText,
}: {
  label: string;
  value: string;
  suffix?: string;
  placeholder: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.inputCell}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputShell}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          placeholder={placeholder}
          placeholderTextColor={withOpacity(TEXT_MUTED, 0.75)}
          style={styles.input}
        />
        {suffix ? <Text style={styles.inputSuffix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

export function TradeActionPanel({
  orderType,
  price,
  quantity,
  total,
  stopPrice = '',
  quickPercent,
  feeEstimate,
  availableQuote,
  availableBase,
  baseSymbol,
  quoteSymbol,
  currentPriceLabel,
  onChangeOrderType,
  onChangePrice,
  onChangeQuantity,
  onChangeTotal,
  onChangeStopPrice,
  onPercent,
  onSubmitSide,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Accion rapida</Text>
          <Text style={styles.subtitle}>
            Ajusta la orden y ejecuta desde esta misma vista sin perder el chart.
          </Text>
        </View>
        <View style={styles.livePill}>
          <Text style={styles.livePillLabel}>{currentPriceLabel}</Text>
        </View>
      </View>

      <View style={styles.orderTypeRow}>
        {ORDER_TYPES.map((type) => {
          const active = orderType === type;
          return (
            <Pressable
              key={type}
              onPress={() => onChangeOrderType(type)}
              style={[
                styles.orderTypeChip,
                {
                  backgroundColor: active ? withOpacity(ACCENT, 0.18) : 'transparent',
                  borderColor: active ? withOpacity(ACCENT, 0.42) : 'rgba(255,255,255,0.08)',
                },
              ]}
            >
              <Text style={[styles.orderTypeLabel, { color: active ? TEXT : TEXT_MUTED }]}>
                {type === 'market' ? 'Market' : type === 'limit' ? 'Limit' : 'Stop'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.inputGrid}>
        <InputField
          label="Precio"
          value={price}
          suffix={quoteSymbol}
          placeholder="0.00"
          onChangeText={onChangePrice}
        />
        <InputField
          label="Cantidad"
          value={quantity}
          suffix={baseSymbol}
          placeholder="0.00"
          onChangeText={onChangeQuantity}
        />
        <InputField
          label="Total"
          value={total}
          suffix={quoteSymbol}
          placeholder="0.00"
          onChangeText={onChangeTotal}
        />
      </View>

      {orderType === 'stop' && onChangeStopPrice ? (
        <InputField
          label="Trigger"
          value={stopPrice}
          suffix={quoteSymbol}
          placeholder="Precio de activacion"
          onChangeText={onChangeStopPrice}
        />
      ) : null}

      <View style={styles.percentRow}>
        {QUICK_PERCENTS.map((percent) => {
          const active = quickPercent === percent;
          return (
            <Pressable
              key={percent}
              onPress={() => onPercent(percent)}
              style={[
                styles.percentChip,
                {
                  backgroundColor: active ? withOpacity(ACCENT, 0.16) : 'rgba(255,255,255,0.03)',
                  borderColor: active ? withOpacity(ACCENT, 0.34) : 'rgba(255,255,255,0.07)',
                },
              ]}
            >
              <Text style={[styles.percentLabel, { color: active ? TEXT : TEXT_MUTED }]}>
                {percent}%
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaCell}>
          <Text style={styles.metaLabel}>Disponible {quoteSymbol}</Text>
          <Text style={styles.metaValue}>{formatBalance(availableQuote)}</Text>
        </View>
        <View style={styles.metaCell}>
          <Text style={styles.metaLabel}>Disponible {baseSymbol}</Text>
          <Text style={styles.metaValue}>{formatBalance(availableBase)}</Text>
        </View>
        <View style={styles.metaCell}>
          <Text style={styles.metaLabel}>Fee estimada</Text>
          <Text style={styles.metaValue}>{formatFee(feeEstimate)}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable onPress={() => onSubmitSide('buy')} style={styles.actionButton}>
          <LinearGradient
            colors={[withOpacity(BUY, 0.96), withOpacity(BUY, 0.76)]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.actionTextDark}>Comprar</Text>
        </Pressable>

        <Pressable onPress={() => onSubmitSide('sell')} style={styles.actionButton}>
          <LinearGradient
            colors={[withOpacity(SELL, 0.96), withOpacity(SELL, 0.78)]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.actionTextLight}>Vender</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: TEXT,
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  subtitle: {
    color: TEXT_MUTED,
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  livePill: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: withOpacity(ACCENT, 0.28),
    backgroundColor: withOpacity(ACCENT, 0.14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  livePillLabel: {
    color: TEXT,
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  orderTypeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  orderTypeChip: {
    minHeight: 34,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderTypeLabel: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  inputGrid: {
    gap: 10,
  },
  inputCell: {
    gap: 6,
  },
  inputLabel: {
    color: TEXT_MUTED,
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  inputShell: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    color: TEXT,
    fontFamily: FONT.semibold,
    fontSize: 15,
    paddingVertical: 0,
  },
  inputSuffix: {
    color: TEXT_MUTED,
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  percentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  percentChip: {
    flex: 1,
    minHeight: 34,
    borderRadius: RADII.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentLabel: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaCell: {
    minWidth: 92,
    flex: 1,
    gap: 4,
  },
  metaLabel: {
    color: TEXT_MUTED,
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  metaValue: {
    color: TEXT,
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  actionTextDark: {
    color: '#06110D',
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  actionTextLight: {
    color: TEXT,
    fontFamily: FONT.bold,
    fontSize: 14,
  },
});
