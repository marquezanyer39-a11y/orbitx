import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONT, ORBITX_COLORS, RADII, withOpacity } from '../../../constants/theme';
import { useI18n } from '../../../hooks/useI18n';
import { useAstra } from '../../hooks/useAstra';
import { getVipUserStatsSnapshot } from '../../services/vip/vipService';
import { useProfileData } from '../../hooks/useProfileData';
import { useSecurityStatus } from '../../hooks/useSecurityStatus';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { getVipRankDisplayState } from '../../utils/vipRanks';

const COLORS = {
  ...ORBITX_COLORS,
  text: ORBITX_COLORS.textPrimary,
  textSecondary: ORBITX_COLORS.textSecondary,
  textMuted: ORBITX_COLORS.textMuted,
  greenBright: ORBITX_COLORS.green,
  securityGold: '#FFB68D',
};

const PROFILE_AVATAR_DIR = `${FileSystem.documentDirectory ?? ''}orbitx-profile/`;

type QuickAction = {
  key: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  onPress: () => void;
};

type SettingsItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

function guessImageExtension(uri: string) {
  const cleanUri = uri.split('?')[0] ?? uri;
  const match = cleanUri.match(/\.([a-zA-Z0-9]{3,5})$/);
  return match?.[1] ? `.${match[1].toLowerCase()}` : '.jpg';
}

async function persistProfileAvatarUri(sourceUri: string) {
  if (!sourceUri.trim()) {
    throw new Error('No recibimos una imagen válida.');
  }

  if (!FileSystem.documentDirectory || /^https?:\/\//i.test(sourceUri)) {
    return sourceUri;
  }

  if (sourceUri.startsWith(PROFILE_AVATAR_DIR)) {
    return sourceUri;
  }

  const directory = await FileSystem.getInfoAsync(PROFILE_AVATAR_DIR);
  if (!directory.exists) {
    await FileSystem.makeDirectoryAsync(PROFILE_AVATAR_DIR, { intermediates: true });
  }

  const destinationUri = `${PROFILE_AVATAR_DIR}avatar-${Date.now()}${guessImageExtension(sourceUri)}`;
  await FileSystem.copyAsync({ from: sourceUri, to: destinationUri });
  return destinationUri;
}

function formatOrbitId(value: string) {
  const cleaned = value.trim() || '82931048';
  return cleaned.replace(/^OX-/i, '');
}

function Header({ onSettings }: { onSettings: () => void }) {
  const { t } = useI18n();

  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>
        <Text style={styles.headerSubtitle}>{t('profile.subtitle')}</Text>
      </View>
      <Pressable onPress={onSettings} style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}>
        <Ionicons name="settings-outline" size={22} color={COLORS.purpleSoft} />
      </Pressable>
    </View>
  );
}

function ProfileHero({
  displayName,
  handle,
  email,
  orbitId,
  avatarInitial,
  avatarUri,
  onCopyId,
  onEdit,
}: {
  displayName: string;
  handle: string;
  email: string;
  orbitId: string;
  avatarInitial: string;
  avatarUri: string | null;
  isVerified: boolean;
  onCopyId: () => void;
  onEdit: () => void;
}) {
  const { t } = useI18n();

  return (
    <View style={styles.heroCard}>
      <View style={styles.heroTop}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarRing}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} resizeMode="cover" />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>{avatarInitial}</Text>
              </View>
            )}
          </View>
          <View style={styles.avatarCheck}>
            <Ionicons name="checkmark" size={13} color={COLORS.background} />
          </View>
        </View>

        <View style={styles.identityCopy}>
          <Text style={styles.displayName} numberOfLines={1} adjustsFontSizeToFit>
            {displayName}
          </Text>
          <Text style={styles.handleText} numberOfLines={1}>{handle}</Text>
          <Text style={styles.emailText} numberOfLines={1} ellipsizeMode="middle">{email}</Text>
        </View>

        <Pressable onPress={onEdit} style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}>
          <Text style={styles.editText}>{t('profile.edit')}</Text>
        </Pressable>
      </View>

      <View style={styles.heroDivider} />

      <View style={styles.heroBottom}>
        <Pressable onPress={onCopyId} style={({ pressed }) => [styles.idBlock, pressed && styles.pressed]}>
          <Text style={styles.idLabel}>ID DE USUARIO</Text>
          <View style={styles.idRow}>
            <Text style={styles.idValue}>{formatOrbitId(orbitId)}</Text>
            <Ionicons name="copy-outline" size={16} color={COLORS.purpleSoft} />
          </View>
        </Pressable>

        <View style={styles.badgeRow}>
          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.activeBadgeText}>ACTIVO</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark-outline" size={13} color={COLORS.greenBright} />
            <Text style={styles.verifiedBadgeText}>VERIFICADA</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function MetricsGrid() {
  const metrics = [
    { label: 'PNL ACUMULADO', value: 'USD 0.00', tone: 'neutral' },
    { label: 'GANANCIA HOY', value: '+ USD 0.00', tone: 'positive' },
    { label: 'OPERACIONES', value: '0', tone: 'neutral' },
    { label: 'WIN RATE', value: 'Sin datos', tone: 'muted' },
  ] as const;

  return (
    <View style={styles.metricsGrid}>
      {metrics.map((metric) => (
        <View key={metric.label} style={styles.metricCard}>
          <Text style={styles.metricLabel}>{metric.label}</Text>
          <Text
            style={[
              styles.metricValue,
              metric.tone === 'positive' && styles.metricValuePositive,
              metric.tone === 'muted' && styles.metricValueMuted,
            ]}
          >
            {metric.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

function SecurityCard({ loading, onPress }: { loading?: boolean; onPress: () => void }) {
  return (
    <View style={styles.securityCard}>
      <View style={styles.securityIcon}>
        <Ionicons name="shield-outline" size={20} color={COLORS.securityGold} />
      </View>
      <View style={styles.cardCopy}>
        <Text style={styles.cardTitle} numberOfLines={2}>Tu seguridad es importante</Text>
        <Text style={styles.cardBody} numberOfLines={2}>Respalda tu frase semilla y protege tus activos.</Text>
      </View>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.configureButton, pressed && styles.pressed]}>
        <LinearGradient colors={[COLORS.purple, COLORS.purpleSoft]} style={styles.configureGradient}>
          <Text style={styles.configureText}>{loading ? 'Enviando...' : 'Configurar'}</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

function AstraCard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.astraCard, pressed && styles.pressed]}>
      <View style={styles.astraIcon}>
        <Ionicons name="hardware-chip-outline" size={20} color={COLORS.purpleSoft} />
      </View>
      <View style={styles.cardCopy}>
        <View style={styles.inlineTitleRow}>
          <Text style={styles.cardTitle}>Asistente Astra AI</Text>
          <View style={styles.betaBadge}>
            <Text style={styles.betaText}>BETA</Text>
          </View>
        </View>
        <Text style={styles.cardBody}>Optimiza tu portafolio hoy</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
    </Pressable>
  );
}

function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function OrbitStatusCard({
  onPress,
  badgeLabel,
  subtitle,
}: {
  onPress: () => void;
  badgeLabel: string;
  subtitle: string;
}) {
  return (
    <View style={styles.section}>
      <SectionTitle title="ESTATUS QVEX" />
      <Pressable onPress={onPress} style={({ pressed }) => [styles.rankCard, pressed && styles.pressed]}>
        <View style={styles.rankIcon}>
          <Ionicons name="diamond" size={22} color={COLORS.text} />
        </View>
        <View style={styles.cardCopy}>
          <View style={styles.inlineTitleRow}>
            <Text style={styles.rankTitle}>Rango QVEX</Text>
            <View style={styles.plusBadge}>
              <Text style={styles.plusText}>{badgeLabel}</Text>
            </View>
          </View>
          <Text style={styles.rankSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
      </Pressable>
    </View>
  );
}

function QuickActions({ items, onPersonalize }: { items: QuickAction[]; onPersonalize: () => void }) {
  const { t } = useI18n();

  return (
    <View style={styles.section}>
      <SectionTitle title={t('profile.quickActions')} action={t('profile.personalize')} onAction={onPersonalize} />
      <View style={styles.quickGrid}>
        {items.map((item) => (
          <Pressable
            key={item.key}
            onPress={item.onPress}
            disabled={item.disabled}
            style={({ pressed }) => [styles.quickCard, item.disabled && styles.quickCardDisabled, pressed && styles.pressed]}
          >
            <Ionicons name={item.icon} size={20} color={COLORS.purpleSoft} />
            <View>
              <Text style={[styles.quickTitle, item.disabled && styles.quickTitleDisabled]}>{item.title}</Text>
              {item.subtitle ? <Text style={styles.quickSubtitle}>{item.subtitle}</Text> : null}
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function SettingsList({ items }: { items: SettingsItem[] }) {
  const { t } = useI18n();

  return (
    <View style={styles.section}>
      <SectionTitle title={t('profile.personalizationSettings')} />
      <View style={styles.settingsCard}>
        {items.map((item, index) => (
          <Pressable key={item.key} onPress={item.onPress} style={({ pressed }) => [styles.settingsRow, pressed && styles.pressed]}>
            <View style={styles.settingsLeft}>
              <Ionicons name={item.icon} size={22} color={COLORS.textSecondary} />
              <Text style={styles.settingsLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            {index < items.length - 1 ? <View style={styles.settingsSeparator} /> : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((state) => state.profile);
  const updateAvatar = useAuthStore((state) => state.updateAvatar);
  const showToast = useUiStore((state) => state.showToast);
  const { identity } = useProfileData();
  const { alert, resendConfirmationEmail } = useSecurityStatus();
  const { openAstra } = useAstra();
  const [securityActionLoading, setSecurityActionLoading] = useState(false);

  const version = Constants.expoConfig?.version ?? '1.0.0';
  const displayName = identity.displayName || 'qvexuser';
  const handle = profile.handle || '@qvexuser';
  const email = identity.email || 'usuario@qvex.com';
  const vipDisplayState = getVipRankDisplayState(getVipUserStatsSnapshot());

  const handleCopyId = async () => {
    if (!identity.orbitId) {
      showToast('No hay ID QVEX disponible.', 'error');
      return;
    }

    await copyToClipboard(identity.orbitId);
    showToast('ID QVEX copiado.', 'success');
  };

  const handleSecurityAction = async () => {
    if (alert?.kind === 'verify_email') {
      setSecurityActionLoading(true);
      try {
        await resendConfirmationEmail(identity.email);
      } finally {
        setSecurityActionLoading(false);
      }
      return;
    }

    router.push('/security');
  };

  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast('Necesitamos acceso a tu galería para cambiar la foto.', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.86,
      selectionLimit: 1,
    });

    if (result.canceled || !result.assets?.length) return;

    const assetUri = result.assets[0]?.uri;
    if (!assetUri) {
      showToast('No pudimos leer la imagen seleccionada.', 'error');
      return;
    }

    try {
      const storedAvatarUri = await persistProfileAvatarUri(assetUri);
      updateAvatar(storedAvatarUri);
    } catch {
      updateAvatar(assetUri);
    }
  };

  const quickActions: QuickAction[] = [
    {
      key: 'browser',
      title: 'Navegador',
      icon: 'compass-outline',
      onPress: () =>
        router.push({
          pathname: '/browser',
          params: { source: 'dapp', title: 'Navegador QVEX' },
        }),
    },
    {
      key: 'favorites',
      title: 'Favoritos',
      icon: 'star-outline',
      onPress: () => router.push('/favorites'),
    },
    {
      key: 'history',
      title: 'Historial',
      icon: 'time-outline',
      onPress: () => router.push('/history'),
    },
    {
      key: 'quick-access',
      title: 'Acceso rápido',
      icon: 'flash-outline',
      disabled: true,
      onPress: () => undefined,
    },
  ];

  const settingsItems: SettingsItem[] = [
    {
      key: 'personalization',
      label: 'Colores, temas y modos',
      icon: 'color-palette-outline',
      onPress: () => router.push('/personalization'),
    },
    {
      key: 'notifications',
      label: 'Notificaciones',
      icon: 'notifications-outline',
      onPress: () => router.push('/notifications'),
    },
    {
      key: 'privacy',
      label: 'Privacidad',
      icon: 'lock-closed-outline',
      onPress: () => router.push('/privacy'),
    },
    {
      key: 'security',
      label: 'Seguridad avanzada',
      icon: 'bag-add-outline',
      onPress: () => router.push('/security'),
    },
    {
      key: 'shortcuts',
      label: 'Atajos rápidos',
      icon: 'apps-outline',
      onPress: () => router.push('/personalization'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 10) + 112 }]}
        showsVerticalScrollIndicator={false}
      >
        <Header onSettings={() => router.push('/security')} />

        <ProfileHero
          displayName={displayName}
          handle={handle}
          email={email}
          orbitId={identity.orbitId}
          avatarInitial={identity.avatarInitial}
          avatarUri={identity.avatarUri}
          isVerified={identity.isVerified}
          onCopyId={handleCopyId}
          onEdit={handlePickAvatar}
        />

        <MetricsGrid />

        <SecurityCard loading={securityActionLoading} onPress={handleSecurityAction} />

        <AstraCard
          onPress={() =>
            openAstra({
              screenName: 'Perfil',
              summary: 'Perfil, personalización y seguridad de cuenta',
              currentTask: 'profile_support',
            })
          }
        />

        <OrbitStatusCard
          onPress={() => router.push('/profile-vip')}
          badgeLabel={vipDisplayState.badgeLabel}
          subtitle={vipDisplayState.subtitle}
        />

        <QuickActions items={quickActions} onPersonalize={() => router.push('/personalization')} />

        <SettingsList items={settingsItems} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>QVEX PREMIUM V{version}</Text>
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
    paddingTop: 8,
    gap: 14,
  },
  header: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  headerTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 26,
    lineHeight: 30,
  },
  headerSubtitle: {
    color: COLORS.textMuted,
    fontFamily: FONT.bold,
    fontSize: 12,
    letterSpacing: 2,
  },
  settingsButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    width: '100%',
    borderRadius: 18,
    padding: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    width: 62,
    height: 62,
  },
  avatarRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    padding: 3,
    backgroundColor: withOpacity(COLORS.purpleSoft, 0.24),
    borderWidth: 2,
    borderColor: COLORS.purpleSoft,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  avatarFallback: {
    flex: 1,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceElevated,
  },
  avatarInitial: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 22,
  },
  avatarCheck: {
    position: 'absolute',
    right: -1,
    bottom: 1,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.greenBright,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  identityCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  displayName: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 17,
    lineHeight: 21,
  },
  handleText: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 13,
  },
  emailText: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  editButton: {
    minHeight: 34,
    borderRadius: RADII.pill,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  editText: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 12,
  },
  heroDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  heroBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  idBlock: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  idLabel: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  idValue: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 13,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  activeBadge: {
    minHeight: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 9,
    backgroundColor: withOpacity(COLORS.green, 0.16),
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.greenBright,
  },
  activeBadgeText: {
    color: COLORS.greenBright,
    fontFamily: FONT.bold,
    fontSize: 10,
  },
  verifiedBadge: {
    minHeight: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    backgroundColor: withOpacity(COLORS.green, 0.13),
  },
  verifiedBadgeText: {
    color: COLORS.greenBright,
    fontFamily: FONT.bold,
    fontSize: 10,
  },
  metricsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 10,
    rowGap: 10,
  },
  metricCard: {
    flexBasis: '48.2%',
    flexGrow: 1,
    minHeight: 72,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    gap: 5,
  },
  metricLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 10,
    letterSpacing: 0.6,
  },
  metricValue: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 17,
    lineHeight: 21,
  },
  metricValuePositive: {
    color: COLORS.greenBright,
  },
  metricValueMuted: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  securityCard: {
    width: '100%',
    minHeight: 84,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.securityGold,
  },
  securityIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.securityGold, 0.15),
  },
  cardCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  cardTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 14,
    lineHeight: 18,
  },
  cardBody: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  configureButton: {
    minHeight: 34,
    minWidth: 88,
    borderRadius: 10,
    overflow: 'hidden',
  },
  configureGradient: {
    minHeight: 34,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  configureText: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 12,
  },
  astraCard: {
    width: '100%',
    minHeight: 68,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 12,
    backgroundColor: withOpacity(COLORS.purple, 0.09),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.purpleSoft, 0.26),
  },
  astraIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.purpleSoft, 0.18),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.purpleSoft, 0.38),
  },
  inlineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  betaBadge: {
    minHeight: 18,
    borderRadius: 5,
    justifyContent: 'center',
    paddingHorizontal: 6,
    backgroundColor: withOpacity(COLORS.purpleSoft, 0.24),
  },
  betaText: {
    color: COLORS.purpleSoft,
    fontFamily: FONT.bold,
    fontSize: 9,
  },
  section: {
    width: '100%',
    gap: 9,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontFamily: FONT.bold,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  sectionAction: {
    color: COLORS.purpleSoft,
    fontFamily: FONT.bold,
    fontSize: 12,
  },
  rankCard: {
    width: '100%',
    minHeight: 88,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: withOpacity(COLORS.purple, 0.1),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.purpleSoft, 0.38),
  },
  rankIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.purpleSoft,
  },
  rankTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 16,
  },
  rankSubtitle: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  plusBadge: {
    minHeight: 22,
    borderRadius: 6,
    justifyContent: 'center',
    paddingHorizontal: 8,
    backgroundColor: withOpacity(COLORS.purpleSoft, 0.22),
  },
  plusText: {
    color: COLORS.purpleSoft,
    fontFamily: FONT.bold,
    fontSize: 10,
  },
  quickGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 10,
    rowGap: 10,
  },
  quickCard: {
    flexBasis: '48.2%',
    flexGrow: 1,
    minHeight: 72,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  quickCardDisabled: {
    opacity: 0.48,
  },
  quickTitle: {
    color: COLORS.text,
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  quickTitleDisabled: {
    color: COLORS.textMuted,
  },
  quickSubtitle: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  settingsCard: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  settingsRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 14,
  },
  settingsLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsLabel: {
    color: COLORS.text,
    fontFamily: FONT.medium,
    fontSize: 14,
  },
  settingsSeparator: {
    position: 'absolute',
    left: 58,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: COLORS.border,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  footerText: {
    color: COLORS.textMuted,
    fontFamily: FONT.bold,
    fontSize: 12,
    letterSpacing: 2.4,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
});
