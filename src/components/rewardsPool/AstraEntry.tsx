import { Pressable, StyleSheet, Text } from 'react-native';

import { FONT } from '../../../constants/theme';

interface Props {
  label: string;
  onPress: () => void;
}

export function AstraEntry({ label, onPress }: Props) {
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityLabel={label} style={styles.trigger}>
      <Text style={[styles.label, { color: '#6FAEFF' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  trigger: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minHeight: 24,
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: 15,
    letterSpacing: 0.1,
  },
});
