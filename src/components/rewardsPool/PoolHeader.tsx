import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../../constants/theme';
import { AstraEntry } from './AstraEntry';

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
        <Ionicons name="chevron-back" size={18} color="#EAF2FF" />
      </Pressable>

      <Text style={styles.title}>{title}</Text>

      <AstraEntry label={astraLabel} onPress={onAstra} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 30,
  },
  backButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  title: {
    flex: 1,
    color: '#F3F7FF',
    fontFamily: FONT.semibold,
    fontSize: 17,
    letterSpacing: 0.1,
  },
});
