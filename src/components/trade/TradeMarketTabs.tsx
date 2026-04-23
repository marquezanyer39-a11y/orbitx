import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';

const ACCENT = '#7B3FE4';
const TEXT = '#FFFFFF';
const TEXT_MUTED = '#8E8EA0';

export interface TradeMarketTabItem<T extends string> {
  key: T;
  label: string;
}

interface Props<T extends string> {
  value: T;
  tabs: Array<TradeMarketTabItem<T>>;
  onChange: (value: T) => void;
}

export function TradeMarketTabs<T extends string>({ value, tabs, onChange }: Props<T>) {
  return (
    <View style={styles.row}>
      {tabs.map((tab) => {
        const active = value === tab.key;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[
              styles.tab,
              active ? styles.tabActive : null,
              {
                backgroundColor: active ? withOpacity(ACCENT, 0.16) : 'transparent',
                borderColor: active ? withOpacity(ACCENT, 0.42) : 'transparent',
              },
            ]}
          >
            <Text style={[styles.label, { color: active ? TEXT : TEXT_MUTED }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tab: {
    minHeight: 36,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    shadowColor: ACCENT,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: 12,
    lineHeight: 16,
  },
});
