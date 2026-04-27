import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../constants/theme';

interface AstraRadarStripProps {
  insight: string;
  onPress: () => void;
}

export function AstraRadarStrip({ insight, onPress }: AstraRadarStripProps) {
  return (
    <Pressable onPress={onPress} style={styles.root}>
      <View style={styles.leftRow}>
        <View style={styles.iconWrap}>
          <Ionicons name="sparkles-outline" size={16} color="#1EDC8B" />
        </View>
        <View style={styles.copyColumn}>
          <Text style={styles.eyebrow}>Radar Astra</Text>
          <Text style={styles.insight}>{insight}</Text>
        </View>
      </View>

      <View style={styles.rightRow}>
        <Text style={styles.cta}>Ver mas</Text>
        <Ionicons name="chevron-forward" size={15} color="#1EDC8B" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 68,
    borderRadius: 18,
    backgroundColor: '#11131A',
    borderWidth: 1,
    borderColor: '#232634',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  leftRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADII.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: withOpacity('#1EDC8B', 0.18),
    backgroundColor: withOpacity('#1EDC8B', 0.08),
  },
  copyColumn: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: '#1EDC8B',
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  insight: {
    color: '#F5F7FA',
    fontFamily: FONT.medium,
    fontSize: 15,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cta: {
    color: '#1EDC8B',
    fontFamily: FONT.medium,
    fontSize: 13,
  },
});
