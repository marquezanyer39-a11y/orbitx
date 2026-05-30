import { BlurView } from 'expo-blur';
import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../../constants/theme';

export interface SupporterItem {
  id: string;
  name: string;
  avatarUri: string;
  valueLabel: string;
  badge: string;
}

interface TopSupportersProps {
  supporters: SupporterItem[];
  onOpenSupporters: () => void;
}

export const TopSupporters = memo(function TopSupporters({
  supporters,
  onOpenSupporters,
}: TopSupportersProps) {
  return (
    <BlurView intensity={18} tint="dark" style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>TOP SUPPORTERS DEMO</Text>
      </View>

      <View style={styles.list}>
        {supporters.map((supporter, index) => (
          <View key={supporter.id} style={styles.row}>
            <View style={styles.leftCluster}>
              <Text style={styles.rank}>#{index + 1}</Text>
              <View style={styles.avatarRing}>
                <Image source={{ uri: supporter.avatarUri }} style={styles.avatar} resizeMode="cover" />
              </View>
              <View style={styles.copy}>
                <Text style={styles.name}>{supporter.name}</Text>
                <Text style={styles.badge}>{supporter.badge}</Text>
              </View>
            </View>
            <Text style={styles.value}>{supporter.valueLabel} demo</Text>
          </View>
        ))}
      </View>

      <Pressable onPress={onOpenSupporters} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonLabel}>Ver supporters demo</Text>
      </Pressable>
    </BlurView>
  );
});

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(20,21,24,0.54)',
    borderWidth: 1,
    borderColor: withOpacity('#3C4A3C', 0.22),
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#DCE5D7',
    fontFamily: FONT.bold,
    fontSize: 12,
    letterSpacing: 1.1,
  },
  list: {
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  leftCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  rank: {
    color: '#7FFF93',
    fontFamily: FONT.bold,
    fontSize: 12,
    width: 18,
  },
  avatarRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: withOpacity('#3FE56C', 0.28),
    padding: 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 17,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: '#FAFAFA',
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  badge: {
    color: '#A1A1AA',
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  value: {
    color: '#7FFF93',
    fontFamily: FONT.bold,
    fontSize: 15,
  },
  button: {
    marginTop: 4,
    minHeight: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#2E372E', 0.64),
  },
  buttonLabel: {
    color: '#DCE5D7',
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
});
