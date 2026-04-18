import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useI18n } from '../../../hooks/useI18n';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface ExploreEntryCardProps {
  onPress: () => void;
}

function Tag({
  label,
}: {
  label: string;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.tag,
        {
          backgroundColor: withOpacity(colors.text, 0.055),
          borderColor: withOpacity(colors.text, 0.08),
        },
      ]}
    >
      <Text style={[styles.tagLabel, { color: colors.textSoft }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function ExploreEntryCard({ onPress }: ExploreEntryCardProps) {
  const { colors } = useAppTheme();
  const { t } = useI18n();

  return (
    <Pressable onPress={onPress} style={styles.shell}>
      <LinearGradient
        colors={[
          '#0B0E13',
          withOpacity('#12D6C7', 0.08),
          withOpacity('#7B3FE4', 0.1),
        ]}
        start={{ x: 0, y: 0.2 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            borderColor: withOpacity('#12D6C7', 0.12),
            shadowColor: '#12D6C7',
          },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.copy}>
            <Text style={[styles.title, { color: colors.text }]}>{t('social.exploreTitle')}</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {t('social.exploreSubtitle')}
            </Text>

            <View style={styles.liveRow}>
              <View style={[styles.liveDot, { backgroundColor: colors.profit }]} />
              <Text style={[styles.liveText, { color: colors.text }]}>
                {t('social.exploreLiveNow', { count: '12.4K' })}
              </Text>
            </View>

            <Text style={[styles.creatorText, { color: colors.textSoft }]}>
              {t('social.exploreTopCreator', { handle: '@CryptoAlpha' })}
            </Text>
          </View>

          <View
            style={[
              styles.preview,
              {
                backgroundColor: withOpacity(colors.surfaceElevated, 0.82),
                borderColor: withOpacity(colors.borderStrong, 0.18),
              },
            ]}
          >
            <LinearGradient
              colors={[withOpacity('#12D6C7', 0.06), withOpacity('#7B3FE4', 0.08), 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={[styles.previewGrid, { borderColor: withOpacity(colors.text, 0.06) }]} />
            <View style={[styles.bar, styles.barOne, { backgroundColor: withOpacity('#12D6C7', 0.22) }]} />
            <View style={[styles.bar, styles.barTwo, { backgroundColor: withOpacity('#7B3FE4', 0.24) }]} />
            <View style={[styles.bar, styles.barThree, { backgroundColor: withOpacity('#12D6C7', 0.18) }]} />
            <View style={[styles.sparkLine, { borderColor: withOpacity('#C8B3FF', 0.95) }]} />
            <View style={[styles.playShell, { backgroundColor: withOpacity('#FFFFFF', 0.1), borderColor: withOpacity('#FFFFFF', 0.14) }]}>
              <Ionicons name="play" size={12} color="#FFFFFF" />
            </View>
          </View>
        </View>

        <View style={styles.tagsRow}>
          <Tag label={t('social.exploreTagBtc')} />
          <Tag label={t('social.exploreTagPepe')} />
          <Tag label={t('social.exploreTagMemes')} />
        </View>

        <View
          style={[
          styles.iconShell,
          {
            backgroundColor: withOpacity('#FFFFFF', 0.04),
            borderColor: withOpacity(colors.borderStrong, 0.16),
          },
        ]}
      >
          <Ionicons name="sparkles-outline" size={15} color={withOpacity('#DCEAFE', 0.9)} />
      </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: '100%',
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 9,
    overflow: 'hidden',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    paddingRight: 32,
  },
  copy: {
    flex: 1,
    gap: 3,
    paddingRight: 4,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 17,
    lineHeight: 20,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 10,
    lineHeight: 13,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  liveText: {
    fontFamily: FONT.semibold,
    fontSize: 10,
    lineHeight: 14,
  },
  creatorText: {
    fontFamily: FONT.medium,
    fontSize: 9,
    lineHeight: 13,
    marginTop: 1,
  },
  creatorHandle: {
    fontFamily: FONT.semibold,
  },
  preview: {
    width: 90,
    height: 58,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 1,
  },
  previewGrid: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 0.5,
    opacity: 0.35,
  },
  bar: {
    position: 'absolute',
    bottom: 8,
    width: 8,
    borderRadius: 4,
  },
  barOne: {
    left: 14,
    height: 16,
  },
  barTwo: {
    left: 27,
    height: 24,
  },
  barThree: {
    left: 40,
    height: 12,
  },
  sparkLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 27,
    height: 18,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5,
    transform: [{ skewY: '-16deg' }],
    borderTopRightRadius: 10,
  },
  playShell: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 8,
  },
  tag: {
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    maxWidth: '34%',
  },
  tagLabel: {
    fontFamily: FONT.medium,
    fontSize: 8,
    lineHeight: 11,
  },
  iconShell: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
