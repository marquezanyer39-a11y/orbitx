import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, SPACING } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { SkeletonBlock } from './SkeletonBlock';

export function LoadingState({
  title = 'Actualizando',
  body = 'QVEX esta sincronizando la informacion.',
  variant = 'spinner',
  rows = 3,
  showCard = false,
}: {
  title?: string;
  body?: string;
  variant?: 'spinner' | 'skeleton';
  rows?: number;
  showCard?: boolean;
}) {
  const { colors } = useAppTheme();

  if (variant === 'skeleton') {
    return (
      <View
        style={[
          styles.skeletonContainer,
          showCard && [styles.card, { backgroundColor: colors.fieldBackground, borderColor: colors.border }],
        ]}
      >
        {Array.from({ length: rows }).map((_, i) => (
          <View key={i} style={styles.skeletonRow}>
            <SkeletonBlock width={40} height={40} radius={20} />
            <View style={styles.skeletonLines}>
              <SkeletonBlock width={`${60 + (i % 3) * 10}%`} height={12} radius={6} />
              <SkeletonBlock width={`${40 + (i % 2) * 15}%`} height={10} radius={5} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 140,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  body: {
    fontFamily: FONT.regular,
    fontSize: 12,
    textAlign: 'center',
  },
  skeletonContainer: {
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  skeletonLines: {
    flex: 1,
    gap: 6,
  },
  card: {
    borderWidth: 1,
    borderRadius: RADII.md,
    padding: SPACING.md,
  },
});
