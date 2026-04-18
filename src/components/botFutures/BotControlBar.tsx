import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '../common/PrimaryButton';

interface Props {
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
}

export function BotControlBar({
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
}: Props) {
  return (
    <View style={styles.container}>
      {secondaryLabel && onSecondary ? (
        <PrimaryButton
          label={secondaryLabel}
          onPress={onSecondary}
          tone="secondary"
          style={styles.secondary}
        />
      ) : null}

      <PrimaryButton
        label={primaryLabel}
        onPress={onPrimary}
        tone="primary"
        style={styles.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  primary: {
    flex: 1.2,
  },
  secondary: {
    flex: 1,
  },
});
