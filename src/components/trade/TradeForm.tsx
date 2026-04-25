import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { formatCurrency } from '../../utils/formatCurrency';
import { PrimaryButton } from '../common/PrimaryButton';
import { BuySellToggle } from './BuySellToggle';
import { OrderTypeTabs } from './OrderTypeTabs';
import { QuickPercentBar } from './QuickPercentBar';

interface Props {
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop';
  price: string;
  quantity: string;
  total: string;
  stopPrice: string;
  feeEstimate: number;
  availableQuote: number;
  availableBase: number;
  baseSymbol: string;
  quoteSymbol: string;
  quickPercent: number | null;
  onChangeSide: (value: 'buy' | 'sell') => void;
  onChangeOrderType: (value: 'market' | 'limit' | 'stop') => void;
  onChangePrice: (value: string) => void;
  onChangeQuantity: (value: string) => void;
  onChangeTotal: (value: string) => void;
  onChangeStopPrice: (value: string) => void;
  onPercent: (value: number) => void;
  onSubmit: () => void;
}

interface FieldRowProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  suffix: string;
  placeholder?: string;
  disabled?: boolean;
}

function FieldRow({ label, value, onChangeText, suffix, placeholder, disabled }: FieldRowProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.fieldRow,
        {
          backgroundColor: withOpacity(colors.fieldBackground, 0.36),
          borderColor: withOpacity(colors.border, 0.5),
        },
      ]}
    >
      <Text style={[styles.fieldLabel, { color: colors.textSoft }]}>{label}</Text>
      <View style={styles.fieldValueWrap}>
        {disabled ? (
          <Text style={[styles.disabledValue, { color: colors.textMuted }]}>
            {value || placeholder || 'Market'}
          </Text>
        ) : (
          <TextInput
            value={value}
            onChangeText={onChangeText}
            keyboardType="decimal-pad"
            placeholder={placeholder || '0.00'}
            placeholderTextColor={colors.textMuted}
            style={[styles.fieldInput, { color: colors.text }]}
          />
        )}
        {suffix ? <Text style={[styles.fieldSuffix, { color: colors.textMuted }]}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

function TogglePill({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={[
        styles.toggleTrack,
        {
          backgroundColor: value ? withOpacity(colors.profit, 0.4) : colors.fieldBackground,
          borderColor: value ? withOpacity(colors.profit, 0.5) : colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.toggleThumb,
          {
            backgroundColor: value ? colors.text : colors.textSoft,
            transform: [{ translateX: value ? 14 : 0 }],
          },
        ]}
      />
    </Pressable>
  );
}

export function TradeForm(props: Props) {
  const { colors } = useAppTheme();
  const [tpSlEnabled, setTpSlEnabled] = useState(false);
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const actionLabel = props.side === 'buy' ? `Comprar ${props.baseSymbol}` : `Vender ${props.baseSymbol}`;
  const totalValue = Number(props.total || 0);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.buySellWrap}>
          <BuySellToggle value={props.side} onChange={props.onChangeSide} />
        </View>
        <Pressable
          style={[
            styles.quoteButton,
            {
              backgroundColor: withOpacity(colors.fieldBackground, 0.3),
              borderColor: withOpacity(colors.border, 0.5),
            },
          ]}
        >
          <Text style={[styles.quoteText, { color: colors.text }]}>{props.quoteSymbol}</Text>
          <Text style={[styles.quoteArrow, { color: colors.textMuted }]}>v</Text>
        </Pressable>
      </View>

      <OrderTypeTabs value={props.orderType} onChange={props.onChangeOrderType} />

      <FieldRow
        label="Precio"
        value={props.orderType === 'market' ? 'Market' : props.price}
        onChangeText={props.onChangePrice}
        suffix=""
        placeholder="Market"
        disabled={props.orderType === 'market'}
      />

      {props.orderType === 'stop' ? (
        <FieldRow
          label="Stop"
          value={props.stopPrice}
          onChangeText={props.onChangeStopPrice}
          suffix={props.quoteSymbol}
        />
      ) : null}

      <FieldRow
        label={`Cantidad ${props.baseSymbol}`}
        value={props.quantity}
        onChangeText={props.onChangeQuantity}
        suffix=""
      />

      <FieldRow label="Total" value={props.total} onChangeText={props.onChangeTotal} suffix={props.quoteSymbol} />

      <QuickPercentBar value={props.quickPercent} onSelect={props.onPercent} />

      <View style={styles.metaRow}>
        <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Saldo disponible</Text>
        <Text style={[styles.metaValue, { color: colors.text }]}>
          {props.side === 'buy'
            ? `${props.availableQuote.toFixed(4)} ${props.quoteSymbol}`
            : `${props.availableBase.toFixed(6)} ${props.baseSymbol}`}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Comision estimada</Text>
        <Text style={[styles.metaValue, { color: colors.text }]}>{formatCurrency(props.feeEstimate)}</Text>
      </View>

      <PrimaryButton
        label={actionLabel}
        tone={props.side === 'buy' ? 'buy' : 'sell'}
        onPress={props.onSubmit}
        style={styles.actionButton}
      />

      <View style={styles.metaRow}>
        <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Total estimado</Text>
        <Text style={[styles.metaValue, { color: colors.text }]}>{formatCurrency(totalValue)}</Text>
      </View>

      <View style={styles.tpSlHeader}>
        <Text style={[styles.tpSlTitle, { color: colors.text }]}>TP/SL</Text>
        <TogglePill value={tpSlEnabled} onChange={setTpSlEnabled} />
      </View>

      <View style={styles.tpSlFields}>
        <FieldRow
          label="Take Profit"
          value={takeProfit}
          onChangeText={setTakeProfit}
          suffix={props.quoteSymbol}
          disabled={!tpSlEnabled}
          placeholder={props.quoteSymbol}
        />
        <FieldRow
          label="Stop Loss"
          value={stopLoss}
          onChangeText={setStopLoss}
          suffix={props.quoteSymbol}
          disabled={!tpSlEnabled}
          placeholder={props.quoteSymbol}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buySellWrap: {
    flex: 1,
  },
  quoteButton: {
    minWidth: 86,
    minHeight: 34,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  quoteText: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  quoteArrow: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  fieldRow: {
    minHeight: 38,
    borderRadius: 9,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  fieldLabel: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  fieldValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    flex: 1,
  },
  fieldInput: {
    minWidth: 42,
    flex: 1,
    textAlign: 'right',
    fontFamily: FONT.semibold,
    fontSize: 12,
    paddingVertical: 0,
  },
  disabledValue: {
    flex: 1,
    textAlign: 'right',
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  fieldSuffix: {
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  metaLabel: {
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  metaValue: {
    fontFamily: FONT.semibold,
    fontSize: 10,
  },
  actionButton: {
    minHeight: 42,
    borderRadius: 12,
  },
  tpSlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 2,
  },
  tpSlTitle: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  tpSlFields: {
    gap: 8,
  },
  toggleTrack: {
    width: 42,
    height: 24,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 3,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 999,
  },
});
