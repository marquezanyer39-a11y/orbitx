import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../../constants/theme';

interface SocialHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
}

export const SocialHeader = memo(function SocialHeader({
  title,
  subtitle,
  onBack,
  rightIcon = 'ellipsis-horizontal',
  onRightPress,
}: SocialHeaderProps) {
  return (
    <View style={styles.wrap}>
      <Pressable onPress={onBack} style={({ pressed }) => [styles.sideButton, pressed && styles.pressed]}>
        <Ionicons name="arrow-back" size={18} color="#7FFF93" />
      </Pressable>

      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <Pressable onPress={onRightPress} style={({ pressed }) => [styles.sideButton, pressed && styles.pressed]}>
        <Ionicons name={rightIcon} size={18} color="#7FFF93" />
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sideButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#192219', 0.72),
  },
  center: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  subtitle: {
    color: '#A1A1AA',
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  pressed: {
    opacity: 0.82,
  },
});
