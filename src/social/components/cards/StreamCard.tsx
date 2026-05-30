import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../../constants/theme';
import type { Stream } from '../../types';

interface StreamCardProps {
  stream: Stream;
  onPress: (stream: Stream) => void;
}

export const StreamCard = memo(function StreamCard({ stream, onPress }: StreamCardProps) {
  return (
    <Pressable onPress={() => onPress(stream)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <Image source={{ uri: stream.coverUri }} style={styles.image} resizeMode="cover" />
      <View style={styles.overlay} />
      <View style={styles.copy}>
        <Text style={styles.badge}>LIVE DEMO</Text>
        <Text style={styles.title} numberOfLines={2}>
          {stream.title}
        </Text>
        <Text style={styles.meta}>{stream.viewerCount.toLocaleString()} viewers demo</Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 220,
    height: 140,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: withOpacity('#192219', 0.7),
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  copy: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
    gap: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    color: '#003912',
    fontFamily: FONT.bold,
    fontSize: 9,
    letterSpacing: 0.8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#3FE56C',
  },
  title: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  meta: {
    color: '#DCE5D7',
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.985 }],
  },
});
