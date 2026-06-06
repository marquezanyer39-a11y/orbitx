import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONT, ORBITX_COLORS, withOpacity } from '../../../constants/theme';
import { getVipUserStatsSnapshot } from '../../services/vip/vipService';
import type { VipBenefit, VipBenefitState, VipRank, VipRequirementStatus } from '../../types/vip';
import {
  formatVipMoney,
  formatVipRequirement,
  getActiveVipBenefits,
  getAllVipRanks,
  getPausedVipBenefits,
  getVipProgress,
  getVipRankDisplayState,
  getVipRequirementStatus,
} from '../../utils/vipRanks';

const COLORS = {
  ...ORBITX_COLORS,
  text: ORBITX_COLORS.textPrimary,
  textSecondary: ORBITX_COLORS.textSecondary,
  textMuted: ORBITX_COLORS.textMuted,
  gold: '#FFB68D',
  goldStrong: '#D9B84A',
};

const vipUserStats = getVipUserStatsSnapshot();
const vipDisplayState = getVipRankDisplayState(vipUserStats);
const vipProgress = getVipProgress(vipUserStats);
const activeBenefits = getActiveVipBenefits(vipUserStats, vipDisplayState.currentRank.id);
const pausedBenefits = getPausedVipBenefits(vipUserStats, vipDisplayState.currentRank.id);

function benefitIcon(benefit: VipBenefit): keyof typeof Ionicons.glyphMap {
  switch (benefit.kind) {
    case 'ring_skin':
    case 'lifetime_skin':
      return 'color-filter-outline';
    case 'social_highlight':
      return 'sparkles-outline';
    case 'live_highlight':
    case 'live_entry_skin':
      return 'radio-outline';
    case 'permanent_plus':
    case 'premium_verification':
      return 'shield-checkmark-outline';
    case 'exclusive_airdrops':
    case 'priority_airdrops':
      return 'gift-outline';
    case 'free_projects':
    case 'project_alerts':
      return 'rocket-outline';
    case 'live_chat_highlight':
      return 'chatbubble-ellipses-outline';
    case 'presence_highlight':
      return 'megaphone-outline';
    case 'visibility_priority':
      return 'diamond-outline';
    default:
      return 'star-outline';
  }
}

function statusIcon(status: VipBenefitState['status']): keyof typeof Ionicons.glyphMap {
  if (status === 'paused') return 'pause-circle-outline';
  if (status === 'review_required') return 'hourglass-outline';
  if (status === 'lifetime') return 'infinite-outline';
  return 'checkmark-circle-outline';
}

function Header() {
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/profile');
  };

  return (
    <View style={styles.header}>
      <Pressable onPress={goBack} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
        <Ionicons name="chevron-back" size={22} color={COLORS.text} />
      </Pressable>

      <View style={styles.headerCopy}>
        <Text style={styles.headerTitle}>Rango QVEX</Text>
        <Text style={styles.headerSubtitle}>Consulta tu nivel, beneficios y progreso</Text>
      </View>

      <View style={[styles.headerButton, styles.headerIconBadge]}>
        <Ionicons name="diamond-outline" size={20} color={COLORS.gold} />
      </View>
    </View>
  );
}

function CurrentRankCard() {
  const currentRank = vipDisplayState.currentRank;

  return (
    <LinearGradient
      colors={[withOpacity(currentRank.visualStyle.accent, 0.22), withOpacity(COLORS.surface, 0.98)]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.currentCard}
    >
      <View style={styles.currentTop}>
        <View style={styles.avatarShell}>
          <LinearGradient
            colors={[
              withOpacity(currentRank.visualStyle.accent, 0.75),
              withOpacity(COLORS.purpleSoft, 0.35),
            ]}
            style={styles.avatarRing}
          >
            <View style={styles.avatarCore}>
              <Text style={styles.avatarInitial}>O</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.currentIdentity}>
          <Text style={styles.currentOverline}>RANGO ACTUAL</Text>
          <Text style={styles.currentRankName}>{currentRank.name}</Text>
          <Text style={styles.currentRankBody}>{vipDisplayState.subtitle}</Text>
        </View>
      </View>

      <View style={styles.badgeRow}>
        <View style={styles.activeBadge}>
          <View style={styles.activeDot} />
          <Text style={styles.activeBadgeText}>ACTIVO</Text>
        </View>
        <View style={styles.lifetimeBadge}>
          <Ionicons name="infinite-outline" size={13} color={COLORS.gold} />
          <Text style={styles.lifetimeBadgeText}>DE POR VIDA</Text>
        </View>
      </View>

      <View style={styles.verifiedRow}>
        <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.green} />
        <Text style={styles.verifiedRowText}>Cuenta verificada</Text>
      </View>

      <View style={styles.currentMetrics}>
        <View style={styles.metricBlock}>
          <Text style={styles.metricCaption}>Depósito acumulado</Text>
          <Text style={styles.metricValue}>{formatVipMoney(vipUserStats.totalDepositUsdt, 'USDT')}</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricBlock}>
          <Text style={styles.metricCaption}>Volumen acumulado</Text>
          <Text style={styles.metricValue}>{formatVipMoney(vipUserStats.totalTradeVolumeUsd, 'USD')}</Text>
        </View>
      </View>

      {vipDisplayState.reviewMessage ? (
        <View style={styles.stateHint}>
          <Ionicons name="sparkles-outline" size={14} color={COLORS.goldStrong} />
          <Text style={styles.stateHintText}>{vipDisplayState.reviewMessage}</Text>
        </View>
      ) : null}
    </LinearGradient>
  );
}

function ProgressCard() {
  return (
    <View style={styles.card}>
      <View style={styles.sectionBlockHeader}>
        <View style={styles.sectionBlockCopy}>
          <Text style={styles.blockTitle}>
            {vipProgress.targetRank ? `Progreso hacia ${vipProgress.targetRank.name}` : 'Nivel maximo alcanzado'}
          </Text>
          <Text style={styles.blockBody}>{vipProgress.primaryMessage}</Text>
        </View>
        <Text style={styles.progressPercent}>{vipProgress.progressPercent}%</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${vipProgress.progressPercent}%` }]} />
      </View>

      <Text style={styles.blockAction}>{vipProgress.nextActionLabel}</Text>

      <View style={styles.requirementsList}>
        {vipProgress.completedRequirements.map((item) => (
          <RequirementRow key={item.requirement.id} item={item} positive />
        ))}
        {vipProgress.missingRequirements.map((item) => (
          <RequirementRow key={item.requirement.id} item={item} />
        ))}
      </View>
    </View>
  );
}

function RequirementRow({
  item,
  positive,
}: {
  item: VipRequirementStatus;
  positive?: boolean;
}) {
  const iconName = positive ? 'checkmark-circle' : item.state === 'external' ? 'information-circle-outline' : 'ellipse-outline';
  const iconColor = positive ? COLORS.green : item.state === 'external' ? COLORS.gold : COLORS.textMuted;

  return (
    <View style={styles.requirementRow}>
      <Ionicons name={iconName} size={18} color={iconColor} />
      <View style={styles.requirementCopy}>
        <Text style={positive ? styles.requirementText : styles.requirementTextMuted}>
          {formatVipRequirement(item.requirement)}
        </Text>
        {item.helperText ? <Text style={styles.requirementHelper}>{item.helperText}</Text> : null}
      </View>
    </View>
  );
}

function BenefitsCard() {
  const lifetimeBenefits = vipDisplayState.currentRank.lifetimeBenefits.map((benefit) => ({
    benefit,
    status: 'lifetime' as const,
  }));
  const lockedBenefits =
    vipProgress.targetRank?.benefits.map((benefit) => ({
      benefit,
      status: vipProgress.targetRank?.id === 'gran_duque' ? ('review_required' as const) : ('blocked' as const),
      reason:
        vipProgress.targetRank?.id === 'gran_duque'
          ? 'Este beneficio depende de revisión interna'
          : 'Se desbloquea al subir de rango',
    })) ?? [];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Beneficios activos</Text>

      <View style={styles.benefitsGroup}>
        {lifetimeBenefits.map((item) => (
          <BenefitRow key={item.benefit.id} item={item} />
        ))}
        {activeBenefits.map((item) => (
          <BenefitRow key={item.benefit.id} item={item} />
        ))}
        {pausedBenefits.map((item) => (
          <BenefitRow key={item.benefit.id} item={item} />
        ))}
        {lockedBenefits.slice(0, 2).map((item) => (
          <BenefitRow key={item.benefit.id} item={item} />
        ))}
      </View>

      {vipDisplayState.maintenanceMessage ? (
        <View style={styles.warningNote}>
          <Ionicons name="time-outline" size={15} color={COLORS.warning} />
          <Text style={styles.warningNoteText}>{vipDisplayState.maintenanceMessage}</Text>
        </View>
      ) : null}
    </View>
  );
}

function BenefitRow({ item }: { item: VipBenefitState }) {
  const tint =
    item.status === 'active'
      ? COLORS.green
      : item.status === 'lifetime'
        ? COLORS.purpleSoft
        : item.status === 'paused'
          ? COLORS.warning
          : COLORS.textSecondary;

  return (
    <View style={styles.benefitRow}>
      <View style={[styles.benefitRowIcon, { backgroundColor: withOpacity(tint, 0.14) }]}>
        <Ionicons name={benefitIcon(item.benefit)} size={17} color={tint} />
      </View>
      <View style={styles.benefitRowCopy}>
        <Text style={styles.benefitRowText}>{item.benefit.label}</Text>
        <View style={styles.benefitStatusRow}>
          <Ionicons name={statusIcon(item.status)} size={13} color={tint} />
          <Text style={[styles.benefitStatusText, { color: tint }]}>
            {item.status === 'lifetime'
              ? 'De por vida'
              : item.status === 'active'
                ? 'Activo'
                : item.status === 'paused'
                  ? 'Pausado'
                  : item.status === 'review_required'
                    ? 'Sujeto a revisión'
                    : 'Bloqueado'}
          </Text>
        </View>
        {item.reason ? <Text style={styles.benefitReason}>{item.reason}</Text> : null}
      </View>
    </View>
  );
}

function RankCard({ rank }: { rank: VipRank }) {
  const isCurrent = vipDisplayState.currentRank.id === rank.id;
  const isNext = vipDisplayState.nextRank?.id === rank.id;
  const requirementStatuses = getVipRequirementStatus(vipUserStats, rank.id);

  return (
    <View
      style={[
        styles.rankCard,
        isCurrent && styles.rankCardCurrent,
        isNext && styles.rankCardNext,
        rank.isExclusive && styles.rankCardExclusive,
      ]}
    >
      <View style={styles.rankCardHeader}>
        <View style={[styles.rankCardIcon, { backgroundColor: rank.visualStyle.accentSoft }]}>
          <Ionicons
            name={rank.visualStyle.icon as keyof typeof Ionicons.glyphMap}
            size={20}
            color={rank.visualStyle.accent}
          />
        </View>

        <View style={styles.rankCardCopy}>
          <View style={styles.rankCardTitleRow}>
            <Text style={styles.rankCardTitle}>{rank.name}</Text>
            {isCurrent ? (
              <View style={styles.currentChip}>
                <Text style={styles.currentChipText}>ACTUAL</Text>
              </View>
            ) : null}
            {isNext ? (
              <View style={styles.nextChip}>
                <Text style={styles.nextChipText}>SIGUIENTE</Text>
              </View>
            ) : null}
            {rank.requiresReview ? (
              <View style={styles.reviewChip}>
                <Text style={styles.reviewChipText}>REVISIÓN INTERNA</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.rankCardBody}>{rank.description}</Text>
        </View>
      </View>

      <View style={styles.rankMetaRow}>
        <Text style={styles.rankMetaTitle}>Requisitos</Text>
      </View>

      <View style={styles.rankList}>
        {rank.requirements.map((requirement) => {
          const status = requirementStatuses.find((item) => item.requirement.id === requirement.id);
          const achieved = status?.completed ?? false;
          const isExternal = status?.state === 'external';
          const color = achieved
            ? COLORS.green
            : isExternal || rank.requiresReview
              ? COLORS.goldStrong
              : COLORS.textSecondary;
          const icon = achieved
            ? 'checkmark-circle'
            : isExternal || rank.requiresReview
              ? 'lock-closed-outline'
              : 'ellipse-outline';

          return (
            <View key={requirement.id} style={styles.rankListRow}>
              <Ionicons name={icon} size={16} color={color} />
              <Text style={styles.rankListText}>{formatVipRequirement(requirement)}</Text>
            </View>
          );
        })}

        {rank.maintenanceRequirement ? (
          <View style={styles.rankMaintenance}>
            <Ionicons name="time-outline" size={15} color={COLORS.warning} />
            <Text style={styles.rankMaintenanceText}>
              Mantenimiento: {formatVipRequirement(rank.maintenanceRequirement)}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.rankMetaRow}>
        <Text style={styles.rankMetaTitle}>Beneficios</Text>
      </View>

      <View style={styles.rankList}>
        {rank.benefits.map((benefit) => (
          <View key={benefit.id} style={styles.rankListRow}>
            <Ionicons name={benefitIcon(benefit)} size={16} color={rank.visualStyle.accent} />
            <Text style={styles.rankListText}>{benefit.label}</Text>
          </View>
        ))}
      </View>

      {rank.monthlyLimit ? (
        <View style={styles.rankFooterNote}>
          <Ionicons name="sparkles-outline" size={15} color={COLORS.goldStrong} />
          <Text style={styles.rankFooterNoteText}>Solo {rank.monthlyLimit} usuarios por mes</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function OrbitXRankScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 12) + 112 }]}
        showsVerticalScrollIndicator={false}
      >
        <Header />
        <CurrentRankCard />
        <ProgressCard />
        <BenefitsCard />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rangos disponibles</Text>
          <View style={styles.rankStack}>
            {getAllVipRanks().map((rank) => (
              <RankCard key={rank.id} rank={rank} />
            ))}
          </View>
        </View>

        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>
            Los rangos QVEX reconocen la actividad y participación dentro del ecosistema. Algunos
            beneficios pueden depender de revisión interna o mantenimiento mensual.
          </Text>
          <Text style={styles.footerNoteSubtext}>
            Vista temporal basada en mock controlado para Perfil. No representa saldos, rewards ni
            beneficios reales activos.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 18,
  },
  header: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerIconBadge: {
    backgroundColor: withOpacity(COLORS.gold, 0.08),
    borderColor: withOpacity(COLORS.gold, 0.22),
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  headerTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 28,
    lineHeight: 32,
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  currentCard: {
    width: '100%',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: withOpacity(COLORS.purpleSoft, 0.3),
    gap: 14,
    overflow: 'hidden',
  },
  currentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarShell: {
    width: 76,
    height: 76,
  },
  avatarRing: {
    flex: 1,
    borderRadius: 38,
    padding: 3,
  },
  avatarCore: {
    flex: 1,
    borderRadius: 35,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: withOpacity(COLORS.text, 0.08),
  },
  avatarInitial: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 30,
  },
  currentIdentity: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  currentOverline: {
    color: COLORS.textMuted,
    fontFamily: FONT.bold,
    fontSize: 11,
    letterSpacing: 1.3,
  },
  currentRankName: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 24,
    lineHeight: 28,
  },
  currentRankBody: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 14,
    lineHeight: 19,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  activeBadge: {
    minHeight: 30,
    borderRadius: 15,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: withOpacity(COLORS.green, 0.14),
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.green,
  },
  activeBadgeText: {
    color: COLORS.green,
    fontFamily: FONT.bold,
    fontSize: 12,
  },
  lifetimeBadge: {
    minHeight: 30,
    borderRadius: 15,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: withOpacity(COLORS.gold, 0.12),
  },
  lifetimeBadgeText: {
    color: COLORS.gold,
    fontFamily: FONT.bold,
    fontSize: 12,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedRowText: {
    color: COLORS.text,
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  currentMetrics: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: withOpacity(COLORS.background, 0.34),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.text, 0.06),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  metricBlock: {
    flex: 1,
    gap: 5,
  },
  metricCaption: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  metricValue: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  metricDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: COLORS.border,
  },
  stateHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  stateHintText: {
    color: COLORS.goldStrong,
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    padding: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    gap: 14,
  },
  sectionBlockHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
  },
  sectionBlockCopy: {
    flex: 1,
    minWidth: 0,
  },
  blockTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 18,
    lineHeight: 22,
  },
  blockBody: {
    marginTop: 4,
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  progressPercent: {
    color: COLORS.purpleSoft,
    fontFamily: FONT.bold,
    fontSize: 22,
    lineHeight: 26,
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: withOpacity(COLORS.text, 0.08),
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.purpleSoft,
  },
  blockAction: {
    color: COLORS.text,
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  requirementsList: {
    gap: 10,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  requirementCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  requirementText: {
    color: COLORS.text,
    fontFamily: FONT.medium,
    fontSize: 14,
    lineHeight: 18,
  },
  requirementTextMuted: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 14,
    lineHeight: 18,
  },
  requirementHelper: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  section: {
    width: '100%',
    gap: 12,
  },
  sectionTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 20,
    lineHeight: 24,
  },
  benefitsGroup: {
    width: '100%',
    borderRadius: 18,
    padding: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  benefitRowIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitRowCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  benefitRowText: {
    color: COLORS.text,
    fontFamily: FONT.semibold,
    fontSize: 13,
    lineHeight: 18,
  },
  benefitStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  benefitStatusText: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  benefitReason: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 11,
    lineHeight: 15,
  },
  warningNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 2,
  },
  warningNoteText: {
    flex: 1,
    color: COLORS.warning,
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 17,
  },
  rankStack: {
    gap: 14,
  },
  rankCard: {
    width: '100%',
    borderRadius: 20,
    padding: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    gap: 14,
  },
  rankCardCurrent: {
    borderColor: withOpacity(COLORS.purpleSoft, 0.34),
    backgroundColor: withOpacity(COLORS.purpleSoft, 0.08),
  },
  rankCardNext: {
    borderColor: withOpacity(COLORS.gold, 0.3),
  },
  rankCardExclusive: {
    borderColor: withOpacity(COLORS.goldStrong, 0.34),
    backgroundColor: withOpacity(COLORS.goldStrong, 0.06),
  },
  rankCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  rankCardIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankCardCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  rankCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  rankCardTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 18,
    lineHeight: 22,
  },
  rankCardBody: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  currentChip: {
    minHeight: 22,
    borderRadius: 7,
    paddingHorizontal: 8,
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.green, 0.14),
  },
  currentChipText: {
    color: COLORS.green,
    fontFamily: FONT.bold,
    fontSize: 10,
  },
  nextChip: {
    minHeight: 22,
    borderRadius: 7,
    paddingHorizontal: 8,
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.gold, 0.14),
  },
  nextChipText: {
    color: COLORS.gold,
    fontFamily: FONT.bold,
    fontSize: 10,
  },
  reviewChip: {
    minHeight: 22,
    borderRadius: 7,
    paddingHorizontal: 8,
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.goldStrong, 0.18),
  },
  reviewChipText: {
    color: COLORS.goldStrong,
    fontFamily: FONT.bold,
    fontSize: 10,
  },
  rankMetaRow: {
    paddingTop: 2,
  },
  rankMetaTitle: {
    color: COLORS.textMuted,
    fontFamily: FONT.bold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  rankList: {
    gap: 9,
  },
  rankListRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  rankListText: {
    flex: 1,
    color: COLORS.text,
    fontFamily: FONT.medium,
    fontSize: 14,
    lineHeight: 19,
  },
  rankMaintenance: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  rankMaintenanceText: {
    flex: 1,
    color: COLORS.warning,
    fontFamily: FONT.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  rankFooterNote: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rankFooterNoteText: {
    color: COLORS.goldStrong,
    fontFamily: FONT.medium,
    fontSize: 13,
  },
  footerNote: {
    width: '100%',
    borderRadius: 18,
    padding: 18,
    backgroundColor: withOpacity(COLORS.surfaceElevated, 0.92),
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  footerNoteText: {
    color: COLORS.text,
    fontFamily: FONT.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  footerNoteSubtext: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 17,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
});
