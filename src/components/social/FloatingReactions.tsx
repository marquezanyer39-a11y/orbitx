import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { withOpacity } from '../../../constants/theme';

export interface FloatingReactionItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  right: number;
  bottom: number;
  size?: number;
}

interface FloatingReactionsProps {
  items: FloatingReactionItem[];
  onDone: (id: string) => void;
}

export function FloatingReactions({ items, onDone }: FloatingReactionsProps) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {items.map((item) => (
        <ReactionBubble key={item.id} item={item} onDone={onDone} />
      ))}
    </View>
  );
}

function ReactionBubble({
  item,
  onDone,
}: {
  item: FloatingReactionItem;
  onDone: (id: string) => void;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.82)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 70,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -138,
        duration: 2400,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: (Math.random() > 0.5 ? 1 : -1) * (14 + Math.random() * 24),
        duration: 2400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start(() => onDone(item.id));
    });
  }, [item.id, onDone, opacity, scale, translateX, translateY]);

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          right: item.right,
          bottom: item.bottom,
          opacity,
          transform: [{ translateY }, { translateX }, { scale }],
          backgroundColor: withOpacity(item.color, 0.16),
          borderColor: withOpacity(item.color, 0.26),
        },
      ]}
    >
      <Ionicons name={item.icon} size={item.size ?? 18} color={item.color} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
