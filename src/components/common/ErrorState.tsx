import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../../constants/theme';
import { useI18n } from '../../../hooks/useI18n';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useAstra } from '../../hooks/useAstra';
import { useAstraStore } from '../../store/astraStore';
import { PrimaryButton } from './PrimaryButton';

interface Props {
  title?: string;
  body: string;
  onRetry?: () => void;
}

export function ErrorState({ title, body, onRetry }: Props) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { openAstra } = useAstra();
  const resolvedTitle = title || t('errors.viewLoadTitle');
  const recordError = useAstraStore((state) => state.recordError);

  useEffect(() => {
    recordError({
      surface: 'error',
      title: resolvedTitle,
      body,
      linkedGuideId: 'resolve_error',
    });
  }, [body, recordError, resolvedTitle]);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{resolvedTitle}</Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>{body}</Text>
      <View style={styles.actions}>
        {onRetry ? <PrimaryButton label={t('errors.retry')} tone="secondary" onPress={onRetry} /> : null}
        <PrimaryButton
          label={t('errors.askAstra')}
          tone="ghost"
          onPress={() =>
            openAstra({
              surface: 'error',
              surfaceTitle: resolvedTitle,
              summary: t('errors.astraSummary'),
              errorTitle: resolvedTitle,
              errorBody: body,
            })
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
});
