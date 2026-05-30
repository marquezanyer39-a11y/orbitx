import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../constants/theme';

interface AstraLiveInsightProps {
  insight: string;
  onPress: () => void;
}

export function AstraLiveInsight({ insight, onPress }: AstraLiveInsightProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
      <BlurView intensity={20} tint="dark" style={styles.blur}>
        <View style={styles.glow} />
        <View style={styles.header}>
          <Ionicons name="sparkles" size={14} color="#3FE56C" />
          <Text style={styles.label}>Astra Live Signal</Text>
        </View>
        <Text style={styles.body} numberOfLines={3}>
          {insight}
        </Text>
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 18,
    overflow: 'hidden',
    maxWidth: 292,
  },
  blur: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: withOpacity('#081008', 0.34),
    borderWidth: 1,
    borderColor: withOpacity('#3FE56C', 0.16),
  },
  glow: {
    position: 'absolute',
    left: -26,
    top: -18,
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: withOpacity('#00C853', 0.14),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  label: {
    color: '#9CFFC0',
    fontFamily: FONT.bold,
    fontSize: 10,
    letterSpacing: 1.1,
  },
  body: {
    color: '#F4FFF7',
    fontFamily: FONT.semibold,
    fontSize: 13,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});
