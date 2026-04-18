import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII } from '../../../constants/theme';
import { formatUsdCents } from '../../services/rewardsPool/poolCopy';
import type { RewardsPoolCopy, RewardsPoolLeaderboardRow } from '../../types/rewardsPool';

interface Props {
  copy: RewardsPoolCopy;
  rows: RewardsPoolLeaderboardRow[];
  language: RewardsPoolCopy['language'];
}

function getRowPalette(position: number) {
  if (position === 1) {
    return {
      colors: ['rgba(220, 182, 92, 0.94)', 'rgba(75, 55, 18, 0.96)'] as [string, string],
      borderColor: 'rgba(247, 213, 124, 0.92)',
      textColor: '#FFF6D8',
      amountColor: '#FFED99',
    };
  }

  if (position === 2) {
    return {
      colors: ['rgba(216, 224, 235, 0.86)', 'rgba(85, 92, 108, 0.96)'] as [string, string],
      borderColor: 'rgba(226, 232, 241, 0.72)',
      textColor: '#F8FBFF',
      amountColor: '#FFFFFF',
    };
  }

  if (position === 3) {
    return {
      colors: ['rgba(197, 133, 82, 0.88)', 'rgba(92, 54, 30, 0.96)'] as [string, string],
      borderColor: 'rgba(217, 154, 101, 0.72)',
      textColor: '#FFF5EF',
      amountColor: '#FFD0A6',
    };
  }

  if (position === 4) {
    return {
      colors: ['rgba(125, 139, 158, 0.5)', 'rgba(49, 58, 74, 0.92)'] as [string, string],
      borderColor: 'rgba(139, 153, 173, 0.34)',
      textColor: '#E6EEFF',
      amountColor: '#E8F0FF',
    };
  }

  return {
    colors: ['rgba(27, 36, 51, 0.98)', 'rgba(17, 23, 36, 0.98)'] as [string, string],
    borderColor: 'rgba(255,255,255,0.06)',
    textColor: '#DDE8FA',
    amountColor: '#FFFFFF',
  };
}

export function LiveParticipantsList({ copy, rows, language }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{copy.liveParticipantsTitle}</Text>

      <View style={styles.list}>
        {rows.map((row) => {
          const palette = getRowPalette(row.position);
          const isUser = row.isCurrentUser || row.isProjected;

          return (
            <LinearGradient
              key={`${row.entryId}-${row.position}`}
              colors={palette.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.row,
                {
                  borderColor: isUser
                    ? '#22E8FF'
                    : palette.borderColor,
                  shadowColor: isUser ? '#22E8FF' : palette.borderColor,
                },
              ]}
            >
              <View style={styles.left}>
                <Text style={[styles.rank, { color: palette.textColor }]}>#{row.position}</Text>
                <Text style={[styles.mask, { color: palette.textColor }]}>{row.maskedCode}</Text>
                {isUser ? (
                  <View style={styles.youChip}>
                    <Text style={styles.youChipLabel}>{row.isProjected ? copy.projectedBadge : copy.thisIsYou}</Text>
                  </View>
                ) : null}
              </View>

              <Text style={[styles.amount, { color: palette.amountColor }]}>
                {formatUsdCents(language, row.aporteUsdCents)}
              </Text>
            </LinearGradient>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  title: {
    color: '#C4CFDF',
    fontFamily: FONT.bold,
    fontSize: 15,
    letterSpacing: 0.2,
  },
  list: {
    gap: 5,
  },
  row: {
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  rank: {
    fontFamily: FONT.bold,
    fontSize: 15,
    minWidth: 30,
  },
  mask: {
    fontFamily: FONT.semibold,
    fontSize: 14,
    letterSpacing: 0.25,
  },
  amount: {
    fontFamily: FONT.bold,
    fontSize: 16,
  },
  youChip: {
    borderRadius: RADII.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  youChipLabel: {
    color: '#F5FBFF',
    fontFamily: FONT.bold,
    fontSize: 9,
    letterSpacing: 0.3,
  },
});
