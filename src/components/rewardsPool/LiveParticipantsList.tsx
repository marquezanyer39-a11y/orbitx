import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../../constants/theme';
import { formatUsdCents } from '../../services/rewardsPool/poolCopy';
import type { RewardsPoolCopy, RewardsPoolLeaderboardRow } from '../../types/rewardsPool';
import { POOL_THEME } from './poolVisualTheme';

interface Props {
  copy: RewardsPoolCopy;
  rows: RewardsPoolLeaderboardRow[];
  language: RewardsPoolCopy['language'];
}

function getRankColor(position: number) {
  if (position === 1) return POOL_THEME.colors.accentGold;
  if (position === 2) return POOL_THEME.colors.accentSilver;
  if (position === 3) return POOL_THEME.colors.accentBronze;
  return POOL_THEME.colors.textSecondary;
}

function maskParticipant(maskedCode: string) {
  const compact = maskedCode.replace(/\s/g, '');
  const tail = compact.slice(-2) || '00';
  const head = compact.slice(0, 2).replace(/\*/g, '').toLowerCase() || 'zx';
  return `${head}***${tail}`;
}

function RankMarker({ position }: { position: number }) {
  const color = getRankColor(position);

  if (position <= 3) {
    return <Ionicons name="medal" size={18} color={color} />;
  }

  return <Text style={[styles.rankNumber, { color }]}>{position}</Text>;
}

export function LiveParticipantsList({ copy, rows, language }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{copy.liveParticipantsTitle}</Text>

      <View style={styles.list}>
        {rows.map((row, index) => {
          const isLast = index === rows.length - 1;
          const isUser = row.isCurrentUser || row.isProjected;
          const rankColor = getRankColor(row.position);

          return (
            <View
              key={`${row.entryId}-${row.position}`}
              style={[
                styles.row,
                !isLast ? styles.rowBorder : null,
                isUser ? styles.currentUserRow : null,
              ]}
            >
              <View style={styles.left}>
                <View style={styles.rankSlot}>
                  <RankMarker position={row.position} />
                </View>

                <View style={[styles.avatar, { borderColor: `${rankColor}55` }]}>
                  <Ionicons name="person-outline" size={18} color={POOL_THEME.colors.textSecondary} />
                </View>

                <View style={styles.nameColumn}>
                  <Text style={styles.mask}>{maskParticipant(row.maskedCode)}</Text>
                  {isUser ? (
                    <Text style={styles.youChipLabel}>
                      {row.isProjected ? copy.projectedBadge : copy.thisIsYou}
                    </Text>
                  ) : null}
                </View>
              </View>

              <Text style={styles.amount}>{formatUsdCents(language, row.aporteUsdCents)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  title: {
    color: POOL_THEME.colors.textPrimary,
    fontFamily: FONT.bold,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  list: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: POOL_THEME.colors.border,
    backgroundColor: POOL_THEME.colors.cardPrimary,
    overflow: 'hidden',
  },
  row: {
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: POOL_THEME.colors.separator,
  },
  currentUserRow: {
    backgroundColor: 'rgba(59,167,255,0.08)',
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  rankSlot: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontFamily: FONT.bold,
    fontSize: 20,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    backgroundColor: POOL_THEME.colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameColumn: {
    flex: 1,
    gap: 3,
  },
  mask: {
    color: POOL_THEME.colors.textPrimary,
    fontFamily: FONT.medium,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  youChipLabel: {
    color: POOL_THEME.colors.accentCyan,
    fontFamily: FONT.bold,
    fontSize: 10,
    letterSpacing: 0.4,
  },
  amount: {
    color: POOL_THEME.colors.textPrimary,
    fontFamily: FONT.bold,
    fontSize: 14,
    lineHeight: 18,
  },
});
