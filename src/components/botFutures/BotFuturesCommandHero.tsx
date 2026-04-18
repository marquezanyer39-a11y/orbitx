import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

type Tone = 'paused' | 'active' | 'neutral';

interface HeroStat {
  label: string;
  value: string;
  subvalue?: string;
}

interface Props {
  stats: HeroStat[];
  pnlLabel: string;
  startLabel: string;
  startDisabled?: boolean;
  pauseDisabled?: boolean;
  closeDisabled?: boolean;
  statusTone?: Tone;
  modeTone?: Tone;
  onStart: () => void;
  onPause: () => void;
  onClose: () => void;
}

const ACTION_BLUE = '#39B8F2';

function resolveToneColor(
  tone: Tone,
  colors: ReturnType<typeof useAppTheme>['colors'],
) {
  if (tone === 'active') {
    return colors.profit;
  }

  if (tone === 'paused') {
    return colors.warning;
  }

  return colors.textSoft;
}

export function BotFuturesCommandHero({
  stats,
  pnlLabel,
  startLabel,
  startDisabled = false,
  pauseDisabled = false,
  closeDisabled = false,
  statusTone = 'paused',
  modeTone = 'neutral',
  onStart,
  onPause,
  onClose,
}: Props) {
  const { colors } = useAppTheme();
  const statusColor = resolveToneColor(statusTone, colors);
  const modeColor = resolveToneColor(modeTone, colors);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(colors.card, 0.98),
          borderColor: withOpacity(colors.borderStrong, 0.22),
        },
      ]}
    >
      <View style={styles.statRow}>
        {stats.map((stat, index) => (
          <View
            key={`${stat.label}-${index}`}
            style={[
              styles.statCell,
              {
                borderColor:
                  index === 0
                    ? withOpacity(statusColor, 0.24)
                    : index === 2
                      ? withOpacity(modeColor, 0.2)
                      : withOpacity(colors.borderStrong, 0.12),
                backgroundColor:
                  index === 0
                    ? withOpacity(statusColor, 0.05)
                    : index === 2
                      ? withOpacity(modeColor, 0.04)
                      : withOpacity(colors.surfaceElevated, 0.62),
              },
            ]}
          >
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{stat.label}</Text>
            {index === 0 ? (
              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor: withOpacity(statusColor, 0.14),
                    borderColor: withOpacity(statusColor, 0.3),
                  },
                ]}
              >
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusPillLabel, { color: statusColor }]} numberOfLines={1}>
                  {stat.value}
                </Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      index === 0 ? statusColor : index === 2 ? modeColor : colors.text,
                  },
                ]}
                numberOfLines={1}
              >
                {stat.value}
              </Text>
            )}
            {stat.subvalue ? (
              <Text style={[styles.statSubvalue, { color: colors.textMuted }]} numberOfLines={1}>
                {stat.subvalue}
              </Text>
            ) : null}
          </View>
        ))}
      </View>

      <View style={styles.pnlWrap}>
        <Text style={[styles.pnlLabel, { color: colors.textMuted }]}>PnL Diario</Text>
        <View style={styles.pnlRow}>
          <Text style={[styles.pnlValue, { color: colors.text }]}>{pnlLabel}</Text>
          <View
            style={[
              styles.pnlDot,
              {
                backgroundColor:
                  statusTone === 'active'
                    ? colors.profit
                    : statusTone === 'paused'
                      ? colors.warning
                      : colors.textMuted,
              },
            ]}
          />
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={startDisabled}
        onPress={onStart}
        style={[
          styles.primaryAction,
          {
            backgroundColor: startDisabled ? withOpacity(ACTION_BLUE, 0.24) : ACTION_BLUE,
            borderColor: withOpacity(ACTION_BLUE, startDisabled ? 0.2 : 0.38),
            opacity: startDisabled ? 0.62 : 1,
          },
        ]}
      >
        <Ionicons name="play-circle-outline" size={18} color="#07131A" />
        <Text style={styles.primaryActionLabel}>{startLabel}</Text>
      </Pressable>

      <View style={styles.secondaryRow}>
        <Pressable
          accessibilityRole="button"
          disabled={pauseDisabled}
          onPress={onPause}
          style={[
            styles.secondaryAction,
            {
              backgroundColor: withOpacity(colors.surfaceElevated, 0.84),
              borderColor: withOpacity(colors.borderStrong, 0.22),
              opacity: pauseDisabled ? 0.4 : 1,
            },
          ]}
        >
          <Text style={[styles.secondaryActionLabel, { color: colors.textMuted }]}>PAUSAR</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={closeDisabled}
          onPress={onClose}
          style={[
            styles.secondaryAction,
            {
              backgroundColor: withOpacity(colors.loss, 0.06),
              borderColor: withOpacity(colors.loss, 0.24),
              opacity: closeDisabled ? 0.4 : 1,
            },
          ]}
        >
          <Text style={[styles.secondaryActionLabel, { color: colors.loss }]}>CERRAR TODO</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statCell: {
    flex: 1,
    minHeight: 66,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 7,
    gap: 3,
  },
  statLabel: {
    fontFamily: FONT.medium,
    fontSize: 9,
    lineHeight: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.32,
  },
  statValue: {
    fontFamily: FONT.semibold,
    fontSize: 12,
    lineHeight: 15,
  },
  statSubvalue: {
    fontFamily: FONT.regular,
    fontSize: 9,
    lineHeight: 12,
  },
  statusPill: {
    minHeight: 26,
    alignSelf: 'flex-start',
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusPillLabel: {
    fontFamily: FONT.semibold,
    fontSize: 11,
    lineHeight: 14,
  },
  pnlWrap: {
    alignItems: 'center',
    gap: 2,
  },
  pnlLabel: {
    fontFamily: FONT.medium,
    fontSize: 10,
    lineHeight: 13,
  },
  pnlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pnlValue: {
    fontFamily: FONT.bold,
    fontSize: 29,
    lineHeight: 33,
  },
  pnlDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  primaryAction: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionLabel: {
    fontFamily: FONT.semibold,
    fontSize: 14,
    lineHeight: 17,
    color: '#07131A',
    letterSpacing: 0.2,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 6,
  },
  secondaryAction: {
    flex: 1,
    minHeight: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  secondaryActionLabel: {
    fontFamily: FONT.semibold,
    fontSize: 12,
    lineHeight: 15,
  },
});
