import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../../constants/theme';

export type CommentsFilterKey = 'top' | 'recent' | 'creators';

interface CommentsHeaderProps {
  countLabel: string;
  activeFilter: CommentsFilterKey;
  onChangeFilter: (filter: CommentsFilterKey) => void;
  onClose: () => void;
}

const FILTERS: Array<{ key: CommentsFilterKey; label: string }> = [
  { key: 'top', label: 'Top' },
  { key: 'recent', label: 'Recientes' },
  { key: 'creators', label: 'Creadores' },
];

export const CommentsHeader = memo(function CommentsHeader({
  countLabel,
  activeFilter,
  onChangeFilter,
  onClose,
}: CommentsHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.title}>Comentarios</Text>
          <Text style={styles.count}>{countLabel}</Text>
        </View>

        <Pressable onPress={onClose} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
          <Ionicons name="close" size={20} color="#DCE5D7" />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
        {FILTERS.map((filter) => {
          const active = filter.key === activeFilter;
          return (
            <Pressable
              key={filter.key}
              onPress={() => onChangeFilter(filter.key)}
              style={({ pressed }) => [styles.filterChip, active && styles.filterChipActive, pressed && styles.pressed]}
            >
              <Text style={[styles.filterLabel, active ? styles.filterLabelActive : styles.filterLabelInactive]}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  title: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 21,
  },
  count: {
    color: '#A1A1AA',
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#192219', 0.72),
  },
  filtersRow: {
    gap: 8,
  },
  filterChip: {
    minHeight: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor: withOpacity('#151E15', 0.92),
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#3FE56C',
    shadowColor: '#3FE56C',
    shadowOpacity: 0.24,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  filterLabel: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  filterLabelActive: {
    color: '#003912',
  },
  filterLabelInactive: {
    color: '#C7D2CC',
  },
  pressed: {
    opacity: 0.82,
  },
});
