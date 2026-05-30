import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../constants/theme';

interface AstraInsightOverlayProps {
  insight: string;
  onPress: () => void;
}

export function AstraInsightOverlay({ insight, onPress }: AstraInsightOverlayProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.shell, pressed && styles.pressed]}>
      <LinearGradient
        colors={[withOpacity('#00C853', 0.16), withOpacity('#081008', 0.62)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Ionicons name="flash" size={15} color="#3FE56C" />
          <Text style={styles.label}>ASTRA SIGNAL</Text>
        </View>
        <Text style={styles.copy} numberOfLines={3}>
          “{insight}”
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: '100%',
    maxWidth: 306,
    borderRadius: 19,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: withOpacity('#3FE56C', 0.24),
    shadowColor: '#00C853',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  gradient: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: withOpacity('#081008', 0.74),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 7,
  },
  label: {
    color: '#3FE56C',
    fontFamily: FONT.bold,
    fontSize: 11,
    letterSpacing: 2.2,
  },
  copy: {
    color: '#F4FFF7',
    fontFamily: FONT.semibold,
    fontSize: 14.5,
    lineHeight: 21,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0,0,0,0.38)',
    textShadowRadius: 8,
  },
});
