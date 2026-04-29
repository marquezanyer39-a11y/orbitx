import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import type { ExternalWalletNetworkBalanceState } from '../../src/services/wallet/externalWalletBalances';

export type Web3NetworkFilterValue = 'all' | number;

interface Web3NetworkFilterProps {
  value: Web3NetworkFilterValue;
  networks: ExternalWalletNetworkBalanceState[];
  onChange: (value: Web3NetworkFilterValue) => void;
}

function getNetworkTone(
  status: ExternalWalletNetworkBalanceState['status'] | 'success',
  colors: ReturnType<typeof useAppTheme>['colors'],
) {
  if (status === 'error' || status === 'unsupported') {
    return colors.loss;
  }

  if (status === 'partial') {
    return colors.warning;
  }

  return colors.profit;
}

export function Web3NetworkFilter({ value, networks, onChange }: Web3NetworkFilterProps) {
  const { colors } = useAppTheme();
  const items = [
    {
      key: 'all' as const,
      label: 'Todas',
      status: networks.some((network) => network.status === 'error')
        ? 'partial' as const
        : 'success' as const,
    },
    ...networks.map((network) => ({
      key: network.chainId,
      label: network.chainLabel === 'BNB Chain' ? 'BNB' : network.chainLabel,
      status: network.status,
    })),
  ];

  return (
    <View style={styles.row}>
      {items.map((item) => {
        const active = value === item.key;
        const tone = getNetworkTone(item.status, colors);

        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            style={[
              styles.chip,
              {
                backgroundColor: active
                  ? withOpacity(colors.primary, 0.16)
                  : withOpacity(colors.fieldBackground, 0.2),
                borderColor: active
                  ? withOpacity(colors.primary, 0.36)
                  : withOpacity(colors.border, 0.48),
              },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: tone }]} />
            <Text style={[styles.label, { color: active ? colors.text : colors.textMuted }]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 32,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
});
