import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useI18n } from '../../../hooks/useI18n';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { useAstraStore } from '../../store/astraStore';

function Row({
  icon,
  label,
  value,
  onPress,
  highlight,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress: () => void;
  highlight?: string;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.row,
        {
          backgroundColor: withOpacity(colors.surfaceElevated, 0.82),
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.rowLeft}>
        <View
          style={[
            styles.rowIcon,
            {
              backgroundColor: withOpacity(colors.primary, 0.1),
              borderColor: withOpacity(colors.primary, 0.18),
            },
          ]}
        >
          <Ionicons name={icon} size={15} color={colors.text} />
        </View>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      </View>

      <View style={styles.rowRight}>
        <Text style={[styles.rowValue, { color: highlight ?? colors.textSoft }]} numberOfLines={1}>
          {value}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

function getMotionThemeLabel(motion: string, isSpanish: boolean) {
  const labels = {
    bull: { es: 'Toro OrbitX', en: 'OrbitX Bull' },
    bear: { es: 'Oso OrbitX', en: 'OrbitX Bear' },
    battle: { es: 'Batalla OrbitX', en: 'OrbitX Battle' },
  } as const;

  const entry = labels[motion as keyof typeof labels];
  return entry ? (isSpanish ? entry.es : entry.en) : motion;
}

function getMotionThemeDescription(motion: string, isSpanish: boolean) {
  const descriptions = {
    bull: {
      es: 'Video cyber bull premium visible solo en Home y Perfil',
      en: 'Premium cyber bull video visible only in Home and Profile',
    },
    bear: {
      es: 'Video cyber bear premium para el lado bajista del mercado',
      en: 'Premium cyber bear video for the bearish side of the market',
    },
    battle: {
      es: 'Choque epico entre toro y oso con energia de mercado',
      en: 'Epic clash between bull and bear with market energy',
    },
  } as const;

  const entry = descriptions[motion as keyof typeof descriptions];
  return entry ? (isSpanish ? entry.es : entry.en) : motion;
}

export default function PersonalizationScreen() {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const voicePreferences = useAstraStore((state) => state.voicePreferences);
  const setVoiceOutputEnabled = useAstraStore((state) => state.setVoiceOutputEnabled);
  const {
    settings,
    labels,
    themePresets,
    motionThemePresets,
    cycleAppearance,
    cycleAccent,
    toggleMotion,
    toggleUsageMode,
    toggleDensity,
    toggleLayoutMode,
    applyOrbitThemePreset,
    setMotionPreset,
  } = useUserPreferences();
  const isSpanish = settings.language === 'es';
  const astraVoiceTitle = isSpanish ? 'Voz de Astra' : 'Astra voice';
  const astraVoiceBody = isSpanish
    ? 'Astra usa una voz oficial unificada dentro de OrbitX. Aqui solo controlas si responde con voz.'
    : 'Astra uses one unified official voice across OrbitX. You only control whether voice replies stay enabled here.';
  const astraVoiceModeLabel = isSpanish ? 'Respuesta por voz' : 'Voice replies';
  const astraVoiceModeValue =
    voicePreferences.voiceOutputEnabled ? t('common.on') : t('common.off');

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
            <Text style={[styles.title, { color: colors.text }]}>
              {t('settings.personalizationTitle')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {t('settings.personalizationSubtitle')}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('settings.baseSectionTitle')}
          </Text>
          <Row icon="color-palette-outline" label={t('settings.appearance')} value={labels.appearance} onPress={cycleAppearance} highlight={colors.primary} />
          <Row icon="color-filter-outline" label={t('settings.colors')} value={labels.accent} onPress={cycleAccent} highlight={colors.primary} />
          <Row icon="options-outline" label={t('settings.usageMode')} value={labels.usageMode} onPress={toggleUsageMode} highlight={colors.primary} />
          <Row icon="albums-outline" label={t('settings.uiDensity')} value={labels.density} onPress={toggleDensity} />
          <Row icon="language-outline" label={t('settings.languageTitle')} value={labels.language} onPress={() => router.push('/language')} />
          <Row icon="grid-outline" label={t('settings.appLayout')} value={labels.layout} onPress={toggleLayoutMode} highlight={settings.appLayoutMode === 'reordered' ? colors.primary : undefined} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('settings.themesSectionTitle')}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRow}>
            {themePresets.map((theme) => {
              const active =
                settings.orbitAccentPreset === theme.accent &&
                settings.orbitTextPreset === theme.text;

              return (
                <Pressable
                  key={theme.label}
                  onPress={() => applyOrbitThemePreset(theme.accent, theme.text, settings.orbitMotionPreset)}
                  style={[
                    styles.themeCard,
                    {
                      backgroundColor: withOpacity(colors.surfaceElevated, 0.92),
                      borderColor: active ? withOpacity(colors.primary, 0.42) : withOpacity(colors.primary, 0.18),
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[withOpacity(theme.colors[0], 0.96), withOpacity(theme.colors[1], 0.78)]}
                    style={styles.themePreview}
                  />
                  <Text style={[styles.themeTitle, { color: colors.text }]}>{theme.label}</Text>
                  <Text style={[styles.themeBody, { color: colors.textMuted }]}>
                    {theme.label === 'Nebula'
                      ? t('settings.themeNebulaBody')
                      : theme.label === 'Aurora'
                        ? t('settings.themeAuroraBody')
                        : theme.label === 'Volt'
                          ? t('settings.themeVoltBody')
                          : t('settings.themeEmberBody')}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{astraVoiceTitle}</Text>
            <Pressable
              onPress={() => setVoiceOutputEnabled(!voicePreferences.voiceOutputEnabled)}
              style={[
                styles.motionToggle,
                {
                  backgroundColor: voicePreferences.voiceOutputEnabled
                    ? withOpacity(colors.primary, 0.18)
                    : withOpacity(colors.surfaceElevated, 0.84),
                  borderColor: voicePreferences.voiceOutputEnabled
                    ? withOpacity(colors.primary, 0.32)
                    : colors.border,
                },
              ]}
            >
              <Text style={[styles.motionToggleLabel, { color: colors.text }]}>
                {astraVoiceModeValue}
              </Text>
            </Pressable>
          </View>
          <Text style={[styles.helper, { color: colors.textMuted }]}>{astraVoiceBody}</Text>
          <Row
            icon="volume-high-outline"
            label={astraVoiceModeLabel}
            value={astraVoiceModeValue}
            onPress={() => setVoiceOutputEnabled(!voicePreferences.voiceOutputEnabled)}
            highlight={voicePreferences.voiceOutputEnabled ? colors.primary : undefined}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('settings.motionSectionTitle')}
            </Text>
            <Pressable
              onPress={toggleMotion}
              style={[
                styles.motionToggle,
                {
                  backgroundColor: settings.orbitMotionEnabled
                    ? withOpacity(colors.primary, 0.18)
                    : withOpacity(colors.surfaceElevated, 0.84),
                  borderColor: settings.orbitMotionEnabled
                    ? withOpacity(colors.primary, 0.32)
                    : colors.border,
                },
              ]}
            >
              <Text style={[styles.motionToggleLabel, { color: colors.text }]}>
                {settings.orbitMotionEnabled ? t('settings.motionActive') : t('settings.motionPaused')}
              </Text>
            </Pressable>
          </View>
          <Text style={[styles.helper, { color: colors.textMuted }]}>
            {t('settings.motionHint')}
          </Text>

          {settings.orbitMotionEnabled ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRow}>
              {motionThemePresets.map((theme) => {
                const active = settings.orbitMotionPreset === theme.motion;
                return (
                  <Pressable
                    key={theme.motion}
                    onPress={() => setMotionPreset(theme.motion)}
                    style={[
                      styles.motionCard,
                      {
                        backgroundColor: withOpacity(colors.surfaceElevated, 0.92),
                        borderColor: active ? withOpacity(colors.primary, 0.42) : withOpacity(colors.primary, 0.18),
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={[withOpacity(theme.colors[0], 0.92), withOpacity(theme.colors[1], 0.48)]}
                      start={{ x: 0.1, y: 0 }}
                      end={{ x: 0.9, y: 1 }}
                      style={styles.motionPreview}
                    >
                      <View style={[styles.motionPreviewGlow, { backgroundColor: withOpacity(theme.colors[0], 0.22) }]} />
                      {theme.motion === 'battle' ? (
                        <View style={styles.battleMarkWrap}>
                          <View style={[styles.bullHornLeft, { borderTopColor: '#16F0A0', left: 20 }]} />
                          <View style={[styles.bullHornRight, { borderTopColor: '#16F0A0', right: 44 }]} />
                          <View style={[styles.bullHead, { borderColor: withOpacity('#16F0A0', 0.82), left: 18 }]} />
                          <View style={[styles.bearHead, { borderColor: withOpacity('#FF3D57', 0.82), marginTop: 0, position: 'absolute', right: 18, top: 22 }]} />
                          <View style={[styles.bearEarLeft, { borderColor: withOpacity('#FF3D57', 0.82), left: undefined, right: 46, top: 18 }]} />
                          <View style={[styles.bearEarRight, { borderColor: withOpacity('#FF3D57', 0.82), right: 20, top: 18 }]} />
                          <View style={[styles.battleSpark, { backgroundColor: withOpacity('#16F0A0', 0.52) }]} />
                          <View style={[styles.battleSparkCore, { backgroundColor: withOpacity('#FF3D57', 0.88) }]} />
                        </View>
                      ) : theme.motion === 'bear' ? (
                        <View style={styles.bearMarkWrap}>
                          <View style={[styles.bearHead, { borderColor: withOpacity('#FF3D57', 0.82) }]} />
                          <View style={[styles.bearEarLeft, { borderColor: withOpacity('#FF3D57', 0.82) }]} />
                          <View style={[styles.bearEarRight, { borderColor: withOpacity('#FF3D57', 0.82) }]} />
                        </View>
                      ) : (
                        <View style={styles.bullMarkWrap}>
                          <View style={[styles.bullHornLeft, { borderTopColor: '#16F0A0' }]} />
                          <View style={[styles.bullHornRight, { borderTopColor: '#16F0A0' }]} />
                          <View style={[styles.bullHead, { borderColor: withOpacity('#16F0A0', 0.82) }]} />
                          <View style={[styles.bullEyeLeft, { backgroundColor: '#16F0A0' }]} />
                          <View style={[styles.bullEyeRight, { backgroundColor: '#16F0A0' }]} />
                        </View>
                      )}
                    </LinearGradient>
                    <Text style={[styles.themeTitle, { color: colors.text }]}>
                      {getMotionThemeLabel(theme.motion, isSpanish)}
                    </Text>
                    <Text style={[styles.themeBody, { color: colors.textMuted }]}>
                      {getMotionThemeDescription(theme.motion, isSpanish)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : (
            <View
              style={[
                styles.pausedCard,
                {
                  backgroundColor: withOpacity(colors.surfaceElevated, 0.82),
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="pause-circle-outline" size={18} color={colors.textMuted} />
              <Text style={[styles.pausedText, { color: colors.textMuted }]}>
                {t('settings.motionPausedHint')}
              </Text>
            </View>
          )}
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
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  helper: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  row: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '52%',
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontFamily: FONT.medium,
    fontSize: 13,
  },
  rowValue: {
    fontFamily: FONT.medium,
    fontSize: 12,
    textAlign: 'right',
  },
  cardRow: {
    gap: 10,
    paddingRight: 10,
  },
  themeCard: {
    width: 154,
    borderWidth: 1,
    borderRadius: 22,
    padding: 10,
    gap: 10,
  },
  motionCard: {
    width: 164,
    borderWidth: 1,
    borderRadius: 22,
    padding: 10,
    gap: 10,
  },
  voiceCard: {
    width: 164,
    borderWidth: 1,
    borderRadius: 22,
    padding: 12,
    gap: 10,
  },
  voiceBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themePreview: {
    height: 76,
    borderRadius: 16,
  },
  motionPreview: {
    height: 92,
    borderRadius: 18,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  motionPreviewGlow: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 999,
  },
  themeTitle: {
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  themeBody: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  motionToggle: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  motionToggleLabel: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  pausedCard: {
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pausedText: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  motionBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  motionBar: {
    width: 18,
    borderRadius: 999,
  },
  bullMarkWrap: {
    width: 86,
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bullHead: {
    position: 'absolute',
    top: 20,
    width: 40,
    height: 30,
    borderRadius: 14,
    borderWidth: 1.4,
  },
  bullHornLeft: {
    position: 'absolute',
    top: 8,
    left: 18,
    width: 24,
    height: 12,
    borderTopWidth: 6,
    borderRadius: 999,
    transform: [{ rotate: '-28deg' }],
  },
  bullHornRight: {
    position: 'absolute',
    top: 8,
    right: 18,
    width: 24,
    height: 12,
    borderTopWidth: 6,
    borderRadius: 999,
    transform: [{ rotate: '28deg' }],
  },
  bullEyeLeft: {
    position: 'absolute',
    top: 30,
    left: 32,
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  bullEyeRight: {
    position: 'absolute',
    top: 30,
    right: 32,
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  bearMarkWrap: {
    width: 88,
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
  },
  battleMarkWrap: {
    width: 110,
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bearHead: {
    width: 44,
    height: 34,
    borderRadius: 16,
    borderWidth: 1.4,
    marginTop: 10,
  },
  bearEarLeft: {
    position: 'absolute',
    top: 16,
    left: 22,
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 1.2,
  },
  bearEarRight: {
    position: 'absolute',
    top: 16,
    right: 22,
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 1.2,
  },
  battleSpark: {
    position: 'absolute',
    top: 28,
    left: '50%',
    width: 26,
    height: 26,
    marginLeft: -13,
    borderRadius: 13,
  },
  battleSparkCore: {
    position: 'absolute',
    top: 35,
    left: '50%',
    width: 12,
    height: 12,
    marginLeft: -6,
    borderRadius: 6,
  },
});
