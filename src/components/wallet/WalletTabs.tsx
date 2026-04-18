import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  value: 'spot' | 'web3';
  onChange: (value: 'spot' | 'web3') => void;
}

export function WalletTabs({ value, onChange }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}>
      {[
        { key: 'spot' as const, label: 'Spot' },
        { key: 'web3' as const, label: 'Web3' },
      ].map((item) => {
        const active = value === item.key;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            style={[
              styles.tab,
              {
                backgroundColor: active ? withOpacity(colors.primary, 0.26) : 'transparent',
                borderColor: active ? withOpacity(colors.primary, 0.32) : 'transparent',
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: active ? colors.text : withOpacity(colors.text, 0.58) },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: RADII.pill,
    minHeight: 58,
    padding: 6,
    gap: 6,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    borderRadius: RADII.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
});
