import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../../../constants/theme';
import type { SocialTabItem } from '../../types';

interface SocialTabsProps {
  tabs: SocialTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

export const SocialTabs = memo(function SocialTabs({
  tabs,
  activeKey,
  onChange,
}: SocialTabsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <Pressable key={tab.key} onPress={() => onChange(tab.key)} style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
            <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>{tab.label}</Text>
            <View style={[styles.underline, active && styles.underlineActive]} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  content: {
    gap: 22,
  },
  tab: {
    minHeight: 42,
    justifyContent: 'flex-start',
    gap: 8,
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: 15,
  },
  labelActive: {
    color: '#FAFAFA',
  },
  labelInactive: {
    color: '#A1A1AA',
  },
  underline: {
    height: 2,
    borderRadius: 1,
    backgroundColor: 'transparent',
  },
  underlineActive: {
    backgroundColor: '#3FE56C',
  },
  pressed: {
    opacity: 0.84,
  },
});
