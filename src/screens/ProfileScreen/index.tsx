import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONT, withOpacity } from '../../../constants/theme';
import { useAstra } from '../../hooks/useAstra';
import { useProfileData } from '../../hooks/useProfileData';
import { useSecurityStatus } from '../../hooks/useSecurityStatus';
import { getVipUserStatsSnapshot } from '../../services/vip/vipService';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { SettingsRow } from '../../components/ui/SettingsRow';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { getVipRankDisplayState } from '../../utils/vipRanks';

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG = '#080B10';
const PANEL = '#0D1220';
const BORDER = '#22314A';
const CYAN = '#00E5FF';
const TEXT_PRIMARY = '#F8FBFF';
const TEXT_MUTED = '#8A94A6';
const GREEN = '#00FFB2';
const AMBER = '#F5A623';
const RED = '#FF3B6B';

const PROFILE_AVATAR_DIR = `${FileSystem.documentDirectory ?? ''}orbitx-profile/`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function guessImageExtension(uri: string) {
  const cleanUri = uri.split('?')[0] ?? uri;
  const match = cleanUri.match(/\.([a-zA-Z0-9]{3,5})$/);
  return match?.[1] ? `.${match[1].toLowerCase()}` : '.jpg';
}

async function persistProfileAvatarUri(sourceUri: string) {
  if (!sourceUri.trim()) throw new Error('No recibimos una imagen válida.');
  if (!FileSystem.documentDirectory || /^https?:\/\//i.test(sourceUri)) return sourceUri;
  if (sourceUri.startsWith(PROFILE_AVATAR_DIR)) return sourceUri;

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

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

function ListCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.listCard}>{children}</View>;
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((state) => state.profile);
  const updateAvatar = useAuthStore((state) => state.updateAvatar);
  const signOut = useAuthStore((state) => state.signOut);
  const showToast = useUiStore((state) => state.showToast);
  const { identity } = useProfileData();
  const { alert, resendConfirmationEmail } = useSecurityStatus();
  const { openAstra } = useAstra();
  const [securityActionLoading, setSecurityActionLoading] = useState(false);

  const version = Constants.expoConfig?.version ?? '1.0.0';
  const displayName = identity.displayName || 'qvexuser';
  const handle = profile.handle || '@qvexuser';
  const email = identity.email || 'usuario@qvex.com';
  const avatarInitial = identity.avatarInitial || displayName.charAt(0).toUpperCase();
  const orbitId = formatOrbitId(identity.orbitId);
  const vipDisplayState = getVipRankDisplayState(getVipUserStatsSnapshot());

  // Show security warning when there's an active alert
  const showSecurityBanner = Boolean(alert);

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

  const handleLogout = () => {
    Alert.alert(
      '¿Cerrar sesión?',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 10) + 112 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Perfil</Text>
            <Text style={styles.headerSubtitle}>PERSONALIZA TU EXPERIENCIA</Text>
          </View>
          <Pressable
            onPress={() => router.push('/security')}
            style={({ pressed }) => [styles.gearBtn, pressed && styles.pressed]}
            accessibilityLabel="Configuración"
          >
            <Ionicons name="settings-outline" size={19} color={CYAN} />
          </Pressable>
        </View>

        {/* ── User card ── */}
        <View style={styles.userCard}>
          {/* Zone A — user info */}
          <View style={styles.userRow}>
            <Pressable onPress={handlePickAvatar} style={styles.avatar}>
              {identity.avatarUri ? (
                <Image source={{ uri: identity.avatarUri }} style={styles.avatarImg} resizeMode="cover" />
              ) : (
                <Text style={styles.avatarInitial}>{avatarInitial}</Text>
              )}
            </Pressable>

            <View style={styles.userInfo}>
              <View style={styles.unameRow}>
                <Text style={styles.uname} numberOfLines={1}>{displayName}</Text>
                <Ionicons name="checkmark-circle" size={14} color={GREEN} />
              </View>
              <Text style={styles.umeta} numberOfLines={1}>{handle}</Text>
              <Text style={styles.umeta} numberOfLines={1} ellipsizeMode="middle">{email}</Text>
            </View>

            <Pressable
              onPress={handlePickAvatar}
              style={({ pressed }) => [styles.editBtn, pressed && styles.pressed]}
            >
              <Text style={styles.editBtnText}>Editar</Text>
            </Pressable>
          </View>

          {/* Zone B — stats row */}
          <View style={styles.statsRow}>
            {[
              { label: 'PNL', value: '0.00', tone: 'neutral' },
              { label: 'Hoy', value: '+0.00', tone: 'green' },
              { label: 'Ops.', value: '0', tone: 'neutral' },
              { label: 'Win %', value: '—', tone: 'empty' },
            ].map((stat, idx) => (
              <View key={stat.label} style={[styles.stat, idx < 3 && styles.statBorder]}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text
                  style={[
                    styles.statValue,
                    stat.tone === 'green' && styles.statValueGreen,
                    stat.tone === 'empty' && styles.statValueEmpty,
                  ]}
                >
                  {stat.value}
                </Text>
              </View>
            ))}
          </View>

          {/* Zone C — ID + chips */}
          <View style={styles.idBar}>
            <Text style={styles.idValue} numberOfLines={1}>{orbitId}</Text>
            <Pressable
              onPress={handleCopyId}
              hitSlop={8}
              accessibilityLabel="Copiar ID"
            >
              <Ionicons name="copy-outline" size={15} color={CYAN} />
            </Pressable>
            <View style={styles.chipGreen}>
              <View style={styles.chipDot} />
              <Text style={styles.chipGreenText}>ACTIVO</Text>
            </View>
            <View style={styles.chipCyan}>
              <Text style={styles.chipCyanText}>VERIF.</Text>
            </View>
          </View>
        </View>

        {/* ── Rango QVEX — slim gradient bar ── */}
        <Pressable
          onPress={() => router.push('/profile-vip')}
          style={({ pressed }) => [styles.rangoBар, pressed && styles.pressed]}
        >
          <View style={styles.rangoIcon}>
            <Ionicons name="diamond" size={18} color={CYAN} />
          </View>
          <View style={styles.rangoCopy}>
            <View style={styles.rangoTitleRow}>
              <Text style={styles.rangoTitle}>Rango QVEX</Text>
              <View style={styles.chipSolid}>
                <Text style={styles.chipSolidText}>{vipDisplayState.badgeLabel}</Text>
              </View>
            </View>
            <Text style={styles.rangoSub}>{vipDisplayState.subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={withOpacity(TEXT_MUTED, 0.6)} />
        </Pressable>

        {/* ── Security inline alert (conditional) ── */}
        {showSecurityBanner ? (
          <View style={styles.securityInline}>
            <View style={styles.secIconBox}>
              <Ionicons name="shield-outline" size={17} color={AMBER} />
            </View>
            <View style={styles.secText}>
              <Text style={styles.secTitle}>Tu seguridad es importante</Text>
              <Text style={styles.secSub}>Respalda tu frase semilla</Text>
            </View>
            <Pressable
              onPress={handleSecurityAction}
              style={({ pressed }) => [styles.configBtn, pressed && styles.pressed]}
              disabled={securityActionLoading}
            >
              <Text style={styles.configBtnText}>
                {securityActionLoading ? '...' : 'Configurar'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* ── Herramientas ── */}
        <SectionLabel label="HERRAMIENTAS" />
        <ListCard>
          <SettingsRow
            icon="sparkles-outline"
            label="Asistente Astra AI"
            subtitle="Optimiza tu portafolio hoy"
            badge="BETA"
            onPress={() =>
              openAstra({
                screenName: 'Perfil',
                summary: 'Perfil, personalización y seguridad de cuenta',
                currentTask: 'profile_support',
              })
            }
          />
          <SettingsRow
            icon="compass-outline"
            label="Navegador"
            onPress={() =>
              router.push({ pathname: '/browser', params: { source: 'dapp', title: 'Navegador QVEX' } })
            }
          />
          <SettingsRow
            icon="star-outline"
            label="Favoritos"
            onPress={() => router.push('/favorites')}
          />
          <SettingsRow
            icon="time-outline"
            label="Historial"
            onPress={() => router.push('/history')}
            isLast
          />
        </ListCard>

        {/* ── Ajustes ── */}
        <SectionLabel label="AJUSTES" />
        <ListCard>
          <SettingsRow
            icon="color-palette-outline"
            label="Colores, temas y modos"
            onPress={() => router.push('/personalization')}
          />
          <SettingsRow
            icon="notifications-outline"
            label="Notificaciones"
            onPress={() => router.push('/notifications')}
          />
          <SettingsRow
            icon="lock-closed-outline"
            label="Privacidad"
            onPress={() => router.push('/privacy')}
          />
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Seguridad avanzada"
            onPress={() => router.push('/security')}
          />
          <SettingsRow
            icon="apps-outline"
            label="Atajos rápidos"
            onPress={() => router.push('/personalization')}
            isLast
          />
        </ListCard>

        {/* ── Cerrar sesión ── */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [styles.logoutRow, pressed && styles.pressed]}
          accessibilityRole="button"
        >
          <View style={styles.logoutIcon}>
            <Ionicons name="log-out-outline" size={17} color={RED} />
          </View>
          <Text style={styles.logoutLabel}>Cerrar sesión</Text>
        </Pressable>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>QVEX PREMIUM V{version}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  scroll: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.985 }],
  },
  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerCopy: {
    gap: 3,
  },
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: 26,
    color: TEXT_PRIMARY,
    lineHeight: 30,
  },
  headerSubtitle: {
    fontFamily: FONT.medium,
    fontSize: 10,
    color: TEXT_MUTED,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  gearBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: PANEL,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ── User card ──
  userCard: {
    backgroundColor: PANEL,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    padding: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#0B1622',
    borderWidth: 2,
    borderColor: withOpacity(CYAN, 0.55),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    fontFamily: FONT.bold,
    fontSize: 20,
    color: CYAN,
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  unameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  uname: {
    fontFamily: FONT.semibold,
    fontSize: 15,
    color: TEXT_PRIMARY,
    flexShrink: 1,
  },
  umeta: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: TEXT_MUTED,
  },
  editBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: withOpacity(CYAN, 0.45),
    paddingHorizontal: 12,
    paddingVertical: 5,
    flexShrink: 0,
  },
  editBtnText: {
    fontFamily: FONT.semibold,
    fontSize: 12,
    color: CYAN,
  },
  // Zone B — stats
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 14,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  statBorder: {
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  statLabel: {
    fontFamily: FONT.medium,
    fontSize: 9,
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
    lineHeight: 12,
  },
  statValue: {
    fontFamily: FONT.bold,
    fontSize: 15,
    color: TEXT_PRIMARY,
    lineHeight: 18,
  },
  statValueGreen: {
    color: GREEN,
  },
  statValueEmpty: {
    fontFamily: FONT.regular,
    fontSize: 11,
    fontStyle: 'italic',
    color: TEXT_MUTED,
  },
  // Zone C — ID bar
  idBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 12,
    marginTop: 14,
  },
  idValue: {
    fontFamily: FONT.medium,
    fontSize: 11,
    color: TEXT_MUTED,
    flex: 1,
  },
  chipGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0,255,178,0.10)',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chipDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: GREEN,
  },
  chipGreenText: {
    fontFamily: FONT.bold,
    fontSize: 10,
    color: GREEN,
    letterSpacing: 0.3,
  },
  chipCyan: {
    borderRadius: 999,
    backgroundColor: 'rgba(0,229,255,0.10)',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chipCyanText: {
    fontFamily: FONT.bold,
    fontSize: 10,
    color: CYAN,
    letterSpacing: 0.3,
  },
  // ── Rango bar ──
  rangoBар: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: withOpacity(CYAN, 0.28),
    backgroundColor: 'rgba(0,229,255,0.06)',
    padding: 12,
  },
  rangoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: withOpacity(CYAN, 0.14),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rangoCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  rangoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexWrap: 'wrap',
  },
  rangoTitle: {
    fontFamily: FONT.semibold,
    fontSize: 13,
    color: TEXT_PRIMARY,
  },
  chipSolid: {
    borderRadius: 999,
    backgroundColor: CYAN,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  chipSolidText: {
    fontFamily: FONT.bold,
    fontSize: 10,
    color: BG,
  },
  rangoSub: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: TEXT_MUTED,
  },
  // ── Security inline ──
  securityInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.30)',
    backgroundColor: '#13100A',
    padding: 11,
  },
  secIconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: 'rgba(245,166,35,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  secText: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  secTitle: {
    fontFamily: FONT.semibold,
    fontSize: 12,
    color: TEXT_PRIMARY,
  },
  secSub: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: TEXT_MUTED,
  },
  configBtn: {
    borderRadius: 999,
    backgroundColor: CYAN,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexShrink: 0,
  },
  configBtnText: {
    fontFamily: FONT.semibold,
    fontSize: 11,
    color: BG,
  },
  // ── Section label ──
  sectionLabel: {
    fontFamily: FONT.medium,
    fontSize: 10,
    color: TEXT_MUTED,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    paddingHorizontal: 2,
    marginTop: 6,
    marginBottom: -4,
  },
  // ── List card ──
  listCard: {
    backgroundColor: PANEL,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    overflow: 'hidden',
  },
  // ── Logout row ──
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: PANEL,
    borderWidth: 1,
    borderColor: 'rgba(255,59,107,0.22)',
    borderRadius: 16,
    marginTop: 12,
  },
  logoutIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,59,107,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutLabel: {
    fontFamily: FONT.semibold,
    fontSize: 14,
    color: RED,
    flex: 1,
  },
  // ── Footer ──
  footer: {
    alignItems: 'center',
    paddingTop: 12,
  },
  footerText: {
    fontFamily: FONT.medium,
    fontSize: 10,
    color: TEXT_MUTED,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    opacity: 0.5,
  },
});
