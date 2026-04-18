import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { PriorityActionTile } from './PriorityActionTile';

interface ActionItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  badgeLabel?: string;
}

interface Props {
  topAction: ActionItem;
  middleActions: ActionItem[];
  bottomActions: ActionItem[];
}

export function PriorityActionGrid({
  topAction,
  middleActions,
  bottomActions,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.title, { color: colors.text }]}>Priority Action Grid</Text>

      <PriorityActionTile
        label={topAction.label}
        icon={topAction.icon}
        onPress={topAction.onPress}
        featured
        badgeLabel={topAction.badgeLabel}
      />

      <View style={styles.middleRow}>
        {middleActions.map((action) => (
          <View key={action.label} style={styles.middleCell}>
            <PriorityActionTile
              label={action.label}
              icon={action.icon}
              onPress={action.onPress}
            />
          </View>
        ))}
      </View>

      <View style={styles.bottomRow}>
        {bottomActions.map((action) => (
          <View key={action.label} style={styles.bottomCell}>
            <PriorityActionTile
              label={action.label}
              icon={action.icon}
              onPress={action.onPress}
              compact
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 16,
    lineHeight: 20,
  },
  middleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  middleCell: {
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 6,
  },
  bottomCell: {
    flex: 1,
  },
});
