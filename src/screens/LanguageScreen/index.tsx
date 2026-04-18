import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { detectDeviceLanguage, languageOptions } from '../../../constants/i18n';
import { FONT, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useI18n } from '../../../hooks/useI18n';
import { ScreenContainer } from '../../components/common/ScreenContainer';

export default function LanguageScreen() {
  const { colors } = useAppTheme();
  const { language, setLanguage, t } = useI18n();
  const detectedLanguage = detectDeviceLanguage();

  return (
    <ScreenContainer contentContainerStyle={styles.content} backgroundMode="default">
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.circle,
            {
              backgroundColor: withOpacity(colors.primary, 0.08),
              borderColor: withOpacity(colors.primary, 0.16),
            },
          ]}
        >
          <Ionicons name="chevron-back" size={18} color={colors.text} />
        </Pressable>

        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: colors.text }]}>{t('settings.languageTitle')}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {t('settings.languageSubtitle')}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.detectedCard,
          {
            backgroundColor: withOpacity(colors.surfaceElevated, 0.84),
            borderColor: withOpacity(colors.primary, 0.18),
          },
        ]}
      >
        <Text style={[styles.detectedLabel, { color: colors.textMuted }]}>
          {t('settings.languageDetected')}
        </Text>
        <Text style={[styles.detectedValue, { color: colors.text }]}>
          {languageOptions.find((option) => option.value === detectedLanguage)?.nativeLabel ?? detectedLanguage}
        </Text>
        <Text style={[styles.detectedHint, { color: colors.textSoft }]}>
          {t('settings.languageHotSwitch')}
        </Text>
      </View>

      <View style={styles.list}>
        {languageOptions.map((option) => {
          const active = option.value === language;

          return (
            <Pressable
              key={option.value}
              onPress={() => setLanguage(option.value)}
              style={[
                styles.row,
                {
                  backgroundColor: withOpacity(colors.surfaceElevated, 0.84),
                  borderColor: active
                    ? withOpacity(colors.primary, 0.42)
                    : colors.border,
                },
              ]}
            >
              <View style={styles.rowCopy}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>
                  {option.nativeLabel}
                </Text>
                <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
                  {option.label}
                </Text>
              </View>

              <View style={styles.rowMeta}>
                {active ? (
                  <Text style={[styles.currentLabel, { color: colors.primary }]}>
                    {t('settings.languageCurrent')}
                  </Text>
                ) : null}
                <Ionicons
                  name={active ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={active ? colors.primary : colors.textMuted}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  circle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    gap: 3,
    paddingTop: 2,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 28,
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  detectedCard: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 4,
  },
  detectedLabel: {
    fontFamily: FONT.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  detectedValue: {
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  detectedHint: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  list: {
    gap: 10,
  },
  row: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontFamily: FONT.semibold,
    fontSize: 15,
  },
  rowSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 12,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentLabel: {
    fontFamily: FONT.medium,
    fontSize: 11,
  },
});
