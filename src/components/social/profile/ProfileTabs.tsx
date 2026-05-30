import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../../../constants/theme';

export interface ProfileTabItem {
  key: string;
  label: string;
}

interface ProfileTabsProps {
  tabs: ProfileTabItem[];
  activeTab: string;
  onChange: (key: string) => void;
}

export const ProfileTabs = memo(function ProfileTabs({
  tabs,
  activeTab,
  onChange,
}: ProfileTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={styles.wrap}
    >
      {tabs.map((tab) => {
        const active = tab.key === activeTab;

        return (
          <Pressable key={tab.key} onPress={() => onChange(tab.key)} style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
            <Text style={[styles.tabLabel, active ? styles.tabLabelActive : styles.tabLabelInactive]}>
              {tab.label}
            </Text>
            <View style={[styles.underline, active && styles.underlineActive]} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: -24,
  },
  content: {
    paddingHorizontal: 24,
    gap: 24,
  },
  tab: {
    minHeight: 46,
    justifyContent: 'flex-start',
    gap: 10,
  },
  tabLabel: {
    fontFamily: FONT.semibold,
    fontSize: 15,
  },
  tabLabelActive: {
    color: '#FAFAFA',
  },
  tabLabelInactive: {
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
    opacity: 0.82,
  },
});
