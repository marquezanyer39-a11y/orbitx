import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../../constants/theme';

interface AstraProfileInsightProps {
  text: string;
  onPress: () => void;
}

export function AstraProfileInsight({ text, onPress }: AstraProfileInsightProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
      <BlurView intensity={20} tint="dark" style={styles.card}>
        <View style={styles.glow} />
        <View style={styles.iconWrap}>
          <Ionicons name="sparkles" size={18} color="#7FFF93" />
        </View>
        <View style={styles.copy}>
          <Text style={styles.label}>ASTRA INTELLIGENCE</Text>
          <Text style={styles.text}>{text}</Text>
        </View>
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  card: {
    minHeight: 118,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(20,21,24,0.58)',
    borderWidth: 1,
    borderColor: withOpacity('#3FE56C', 0.14),
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  glow: {
    position: 'absolute',
    left: -24,
    top: 10,
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(0,200,83,0.14)',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#00C853', 0.12),
  },
  copy: {
    flex: 1,
    gap: 6,
  },
  label: {
    color: '#7FFF93',
    fontFamily: FONT.bold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  text: {
    color: '#FAFAFA',
    fontFamily: FONT.regular,
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.985 }],
  },
});
