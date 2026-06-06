import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../../constants/theme';
import { POOL_THEME } from './poolVisualTheme';

interface Props {
  title: string;
  backLabel: string;
  astraLabel: string;
  onBack: () => void;
  onAstra: () => void;
}

export function PoolHeader({ title, backLabel, astraLabel, onBack, onAstra }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onBack}
        accessibilityLabel={backLabel}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color={POOL_THEME.colors.primary} />
      </Pressable>

      <Text style={styles.title}>{title}</Text>

      <Pressable
        onPress={onAstra}
        accessibilityLabel={astraLabel}
        style={styles.actionButton}
      >
        <Ionicons name="ellipsis-vertical" size={22} color={POOL_THEME.colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingHorizontal: POOL_THEME.spacing.screenH,
    backgroundColor: POOL_THEME.colors.header,
    borderBottomWidth: 1,
    borderBottomColor: POOL_THEME.colors.border,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: POOL_THEME.colors.primary,
    fontFamily: FONT.semibold,
    fontSize: 24,
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
