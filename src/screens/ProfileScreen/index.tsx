import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useOrbitStore } from '../../../store/useOrbitStore';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { navigateToTrade } from '../../navigation/AppNavigator';
import { useProfileData } from '../../hooks/useProfileData';
import { useSecurityStatus } from '../../hooks/useSecurityStatus';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { useAuthStore } from '../../store/authStore';
import { useAstra } from '../../hooks/useAstra';
import { useUiStore } from '../../store/uiStore';
import { AstraAnimatedLogo } from '../../components/astra/AstraAnimatedLogo';
import { copyToClipboard } from '../../utils/copyToClipboard';

const QUICK = {
  browser: { label: 'Navegador', icon: 'globe-outline' as const },
  trade: { label: 'Operar', icon: 'swap-horizontal-outline' as const },
  markets: { label: 'Mercados', icon: 'stats-chart-outline' as const },
  launchpad: { label: 'Launchpad', icon: 'rocket-outline' as const },
} as const;

function Sheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const { colors } = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: withOpacity(colors.surfaceElevated, 0.98),
              borderColor: withOpacity(colors.borderStrong, 0.88),
            },
          ]}
        >
          <View style={styles.grabber} />
          <Text style={[styles.sheetTitle, { color: colors.text }]}>{title}</Text>
          {children}
        </View>
      </View>
    </Modal>
  );
}

function StatCard({
  title,
  value,
  helper,
  tone,
}: {
  title: string;
  value: string;
  helper: string;
  tone: string;
}) {
  const { colors } = useAppTheme();

  return (
    <LinearGradient
      colors={[withOpacity(tone, 0.16), withOpacity(colors.surface, 0.96)]}
      style={[styles.statCard, { borderColor: withOpacity(tone, 0.28) }]}
    >
      <Text style={[styles.statTitle, { color: colors.textMuted }]}>{title}</Text>
      <Text style={[styles.statValue, { color: tone }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[styles.statHelper, { color: colors.textSoft }]} numberOfLines={1}>
        {helper}
      </Text>
    </LinearGradient>
  );
}

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
          backgroundColor: withOpacity(colors.surfaceElevated, 0.8),
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

export default function ProfileScreen() {
  const { colors } = useAppTheme();
  const pulse = useRef(new Animated.Value(1)).current;
  const [sheet, setSheet] = useState<'edit' | 'quick' | 'about' | null>(null);
  const [draftName, setDraftName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [securityActionLoading, setSecurityActionLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const profile = useAuthStore((state) => state.profile);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const updateAvatar = useAuthStore((state) => state.updateAvatar);
  const signOut = useAuthStore((state) => state.signOut);
  const setQuickAccessAction = useOrbitStore((state) => state.setQuickAccessAction);
  const { identity, metrics, loading, favoriteCount, historyCount, alertCount, createdTokensCount } =
    useProfileData();
  const { alert, securityStatus, resendConfirmationEmail } = useSecurityStatus();
  const { settings, labels } = useUserPreferences();
  const { openAstra, language } = useAstra();
  const showToast = useUiStore((state) => state.showToast);

  useEffect(() => {
    setDraftName(profile.name);
  }, [profile.name]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 1700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1700, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const quickAccess = QUICK[settings.quickAccessAction];

  const runQuickAccess = () => {
    if (settings.quickAccessAction === 'trade') return navigateToTrade(router);
    if (settings.quickAccessAction === 'markets') return router.push('/(tabs)/market');
    if (settings.quickAccessAction === 'launchpad') return router.push('/create-token');
    return router.push('/browser');
  };

  const handleSecurityAction = async () => {
    if (!alert) return;
    if (alert.kind === 'verify_email') {
      setSecurityActionLoading(true);
      await resendConfirmationEmail(identity.email);
      setSecurityActionLoading(false);
      return;
    }
    router.push('/security');
  };

  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast('Necesitamos acceso a tu galeria para actualizar tu foto.', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.82,
      selectionLimit: 1,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    updateAvatar(result.assets[0].uri);
  };

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/');
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <>
      <StatusBar style="light" />
      <ScreenContainer contentContainerStyle={styles.content} backgroundMode="default">
        <View style={styles.header}>
          <Pressable
            onPress={() => router.replace('/home')}
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
            <Text style={[styles.title, { color: colors.text }]}>Perfil</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {loading ? 'Sincronizando tu experiencia OrbitX' : 'Personaliza tu experiencia en OrbitX'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => setSheet('quick')}
              style={[
                styles.circle,
                {
                  backgroundColor: withOpacity(colors.primary, 0.1),
                  borderColor: withOpacity(colors.primary, 0.18),
                },
              ]}
            >
              <Ionicons name="grid-outline" size={18} color={colors.text} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/personalization')}
              style={[
                styles.circle,
                {
                  backgroundColor: withOpacity(colors.primary, 0.1),
                  borderColor: withOpacity(colors.primary, 0.18),
                },
              ]}
            >
              <Ionicons name="settings-outline" size={18} color={colors.text} />
            </Pressable>
          </View>
        </View>

        <LinearGradient
          colors={[withOpacity(colors.primary, 0.22), withOpacity(colors.surface, 0.96)]}
          style={[styles.hero, { borderColor: withOpacity(colors.primary, 0.28) }]}
        >
          <View style={styles.heroTop}>
            <View style={styles.userBlock}>
              <Animated.View
                style={[
                  styles.avatarGlow,
                  {
                    transform: [{ scale: pulse }],
                    opacity: pulse.interpolate({ inputRange: [1, 1.08], outputRange: [0.36, 0.62] }),
                    backgroundColor: withOpacity(colors.primary, 0.18),
                    borderColor: withOpacity(colors.primary, 0.34),
                  },
                ]}
              />
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor: withOpacity(colors.primary, 0.14),
                    borderColor: withOpacity(colors.primary, 0.42),
                  },
                ]}
              >
                {identity.avatarUri ? (
                  <Image source={{ uri: identity.avatarUri }} style={styles.avatarImage} resizeMode="cover" />
                ) : (
                  <Text style={[styles.avatarText, { color: colors.text }]}>{identity.avatarInitial}</Text>
                )}
              </View>
              <View style={styles.userCopy}>
                <Text style={[styles.name, { color: colors.text }]}>{identity.displayName}</Text>
                <Text style={[styles.email, { color: colors.textMuted }]}>{identity.email}</Text>
                <Pressable
                  onPress={() => {
                    void copyToClipboard(identity.orbitId);
                    showToast('ID OrbitX copiado', 'success');
                  }}
                  style={[
                    styles.orbitIdBadge,
                    {
                      backgroundColor: withOpacity(colors.primary, 0.12),
                      borderColor: withOpacity(colors.primary, 0.24),
                    },
                  ]}
                >
                  <Text style={[styles.orbitIdLabel, { color: colors.primary }]}>
                    ID OrbitX
                  </Text>
                  <Text style={[styles.orbitIdValue, { color: colors.text }]}>
                    {identity.orbitId}
                  </Text>
                  <Ionicons name="copy-outline" size={12} color={colors.textMuted} />
                </Pressable>
              </View>
            </View>
            <Pressable
              onPress={() => setSheet('edit')}
              style={[
                styles.edit,
                {
                  backgroundColor: withOpacity(colors.primary, 0.12),
                  borderColor: withOpacity(colors.primary, 0.24),
                },
              ]}
            >
              <Ionicons name="create-outline" size={13} color={colors.text} />
              <Text style={[styles.editText, { color: colors.text }]}>Editar</Text>
            </Pressable>
          </View>
          <View style={styles.statusRow}>
            <View style={styles.statusLive}>
              <View style={[styles.dot, { backgroundColor: colors.profit }]} />
              <Text style={[styles.statusText, { color: colors.text }]}>{identity.accountStatus}</Text>
            </View>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: identity.isVerified ? colors.profitSoft : withOpacity(colors.warning, 0.16),
                  borderColor: identity.isVerified ? withOpacity(colors.profit, 0.3) : withOpacity(colors.warning, 0.3),
                },
              ]}
            >
              <Text
                style={[styles.badgeText, { color: identity.isVerified ? colors.profit : colors.warning }]}
              >
                {identity.verificationLabel}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.stats}>
          {metrics.map((metric) => (
            <StatCard
              key={metric.id}
              title={metric.title}
              value={metric.value}
              helper={metric.helper}
              tone={
                metric.tone === 'positive'
                  ? colors.profit
                  : metric.tone === 'negative'
                    ? colors.loss
                    : metric.tone === 'warning'
                      ? colors.warning
                      : colors.text
              }
            />
          ))}
        </View>

        {alert ? (
          <LinearGradient
            colors={[withOpacity(colors.warning, 0.16), withOpacity(colors.surface, 0.94)]}
            style={[styles.alert, { borderColor: withOpacity(colors.warning, 0.28) }]}
          >
            <View style={styles.alertCopy}>
              <View
                style={[
                  styles.iconBadge,
                  {
                    backgroundColor: withOpacity(colors.warning, 0.14),
                    borderColor: withOpacity(colors.warning, 0.26),
                  },
                ]}
              >
                <Ionicons name="shield-checkmark-outline" size={16} color={colors.warning} />
              </View>
              <View style={styles.alertTextWrap}>
                <Text style={[styles.alertTitle, { color: colors.text }]}>{alert.title}</Text>
                <Text style={[styles.alertBody, { color: colors.textMuted }]}>{alert.body}</Text>
              </View>
            </View>
            <Pressable
              onPress={() => void handleSecurityAction()}
              style={[
                styles.alertBtn,
                {
                  backgroundColor: withOpacity(colors.primary, 0.14),
                  borderColor: withOpacity(colors.primary, 0.26),
                  opacity: securityActionLoading ? 0.7 : 1,
                },
              ]}
            >
              <Text style={[styles.alertBtnText, { color: colors.text }]}>
                {securityActionLoading ? 'Procesando...' : alert.actionLabel}
              </Text>
            </Pressable>
          </LinearGradient>
        ) : null}

        <Pressable
          onPress={() =>
            openAstra({
              surface: 'profile',
              surfaceTitle: language === 'en' ? 'Profile' : 'Perfil',
              summary:
                language === 'en'
                  ? `Profile centralizes your identity, security, favorites and personalization. Active theme: ${labels.accent}.`
                  : `Perfil centraliza tu identidad, seguridad, favoritos y personalizacion. Tema actual: ${labels.accent}.`,
              currentThemeLabel: `${labels.accent} | ${settings.orbitMotionEnabled ? (language === 'en' ? 'Active' : 'Activo') : language === 'en' ? 'Paused' : 'Pausado'}`,
              usageMode: settings.usageMode,
            })
          }
          style={[
            styles.astraCard,
            {
              backgroundColor: withOpacity(colors.surfaceElevated, 0.88),
              borderColor: withOpacity(colors.primary, 0.18),
            },
          ]}
        >
          <View style={styles.personalizationCopy}>
            <View
              style={[
                styles.iconBadge,
                {
                  backgroundColor: withOpacity(colors.primary, 0.12),
                  borderColor: withOpacity(colors.primary, 0.24),
                },
              ]}
            >
              <AstraAnimatedLogo size={20} emphasis="entry" />
            </View>
            <View style={styles.personalizationText}>
              <Text style={[styles.gridTitle, { color: colors.text }]}>Astra</Text>
              <Text style={[styles.gridBody, { color: colors.textMuted }]}>
                Soporte con IA para seguridad, wallet, trading y personalizacion sin salir de OrbitX.
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Acciones rapidas</Text>
            <Pressable onPress={() => setSheet('quick')}>
              <Text style={[styles.link, { color: colors.primary }]}>Personalizar</Text>
            </Pressable>
          </View>
          <View style={styles.grid}>
            <Pressable
              onPress={() => router.push('/browser')}
              style={[styles.gridCard, { backgroundColor: withOpacity(colors.surfaceElevated, 0.92), borderColor: withOpacity(colors.primary, 0.16) }]}
            >
              <View style={[styles.iconBadge, { backgroundColor: withOpacity(colors.primary, 0.12), borderColor: withOpacity(colors.primary, 0.24) }]}>
                <Ionicons name="globe-outline" size={16} color={colors.text} />
              </View>
              <Text style={[styles.gridTitle, { color: colors.text }]}>Navegador</Text>
              <Text style={[styles.gridBody, { color: colors.textMuted }]}>Explora Web3</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/favorites')}
              style={[styles.gridCard, { backgroundColor: withOpacity(colors.surfaceElevated, 0.92), borderColor: withOpacity(colors.primary, 0.16) }]}
            >
              <View style={[styles.iconBadge, { backgroundColor: withOpacity(colors.primary, 0.12), borderColor: withOpacity(colors.primary, 0.24) }]}>
                <Ionicons name="star-outline" size={16} color={colors.text} />
              </View>
              <Text style={[styles.gridTitle, { color: colors.text }]}>Favoritos</Text>
              <Text style={[styles.gridBody, { color: colors.textMuted }]}>
                {favoriteCount ? `${favoriteCount} pares guardados` : 'Mercados guardados'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/history')}
              style={[styles.gridCard, { backgroundColor: withOpacity(colors.surfaceElevated, 0.92), borderColor: withOpacity(colors.primary, 0.16) }]}
            >
              <View style={[styles.iconBadge, { backgroundColor: withOpacity(colors.primary, 0.12), borderColor: withOpacity(colors.primary, 0.24) }]}>
                <Ionicons name="time-outline" size={16} color={colors.text} />
              </View>
              <Text style={[styles.gridTitle, { color: colors.text }]}>Historial</Text>
              <Text style={[styles.gridBody, { color: colors.textMuted }]}>
                {historyCount ? `${historyCount} eventos recientes` : 'Actividad reciente'}
              </Text>
            </Pressable>
            <Pressable
              onPress={runQuickAccess}
              style={[styles.gridCard, { backgroundColor: withOpacity(colors.surfaceElevated, 0.92), borderColor: withOpacity(colors.primary, 0.16) }]}
            >
              <Pressable
                onPress={(event) => {
                  event.stopPropagation();
                  setSheet('quick');
                }}
                style={[styles.plus, { backgroundColor: withOpacity(colors.primary, 0.14), borderColor: withOpacity(colors.primary, 0.28) }]}
              >
                <Ionicons name="add" size={12} color={colors.text} />
              </Pressable>
              <View style={[styles.iconBadge, { backgroundColor: withOpacity(colors.primary, 0.12), borderColor: withOpacity(colors.primary, 0.24) }]}>
                <Ionicons name={quickAccess.icon} size={16} color={colors.text} />
              </View>
              <Text style={[styles.gridTitle, { color: colors.text }]}>Acceso rapido</Text>
              <Text style={[styles.gridBody, { color: colors.textMuted }]}>{quickAccess.label}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Personalizacion</Text>
            <Pressable onPress={() => router.push('/personalization')}>
              <Text style={[styles.link, { color: colors.primary }]}>Abrir</Text>
            </Pressable>
          </View>
          <Pressable
            onPress={() => router.push('/personalization')}
            style={[
              styles.personalizationCard,
              {
                backgroundColor: withOpacity(colors.surfaceElevated, 0.84),
                borderColor: withOpacity(colors.primary, 0.18),
              },
            ]}
          >
            <View style={styles.personalizationCopy}>
              <View style={[styles.iconBadge, { backgroundColor: withOpacity(colors.primary, 0.12), borderColor: withOpacity(colors.primary, 0.24) }]}>
                <Ionicons name="sparkles-outline" size={16} color={colors.text} />
              </View>
              <View style={styles.personalizationText}>
                <Text style={[styles.gridTitle, { color: colors.text }]}>Colores, temas y movimiento</Text>
                <Text style={[styles.gridBody, { color: colors.textMuted }]}>
                  Gestiona toda la personalizacion desde una sola pantalla. El tema en movimiento solo se aplica en Home y Perfil.
                </Text>
              </View>
            </View>
            <View style={styles.personalizationMeta}>
              <Text style={[styles.personalizationValue, { color: colors.primary }]}>
                {labels.accent} | {settings.orbitMotionEnabled ? 'Activo' : 'Pausado'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </View>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferencias</Text>
          <Row
            icon="notifications-outline"
            label="Notificaciones"
            value={labels.notifications}
            onPress={() => router.push('/notifications')}
            highlight={settings.notificationsEnabled ? colors.profit : colors.warning}
          />
          <Row
            icon="shield-outline"
            label="Privacidad"
            value={labels.privacy}
            onPress={() => router.push('/privacy')}
            highlight={settings.privacyMode === 'strict' ? colors.warning : undefined}
          />
          <Row
            icon="lock-closed-outline"
            label="Seguridad"
            value={securityStatus.pinEnabled || securityStatus.biometricsEnabled ? '2FA, sesiones y mas' : 'Configurar acceso seguro'}
            onPress={() => router.push('/security')}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Mas</Text>
          <Row icon="flash-outline" label="Atajos rapidos" value={quickAccess.label} onPress={() => setSheet('quick')} highlight={colors.primary} />
          <Row
            icon="help-circle-outline"
            label="Centro de ayuda"
            value="Soporte y guias"
            onPress={() => router.push({ pathname: '/browser', params: { url: 'https://coinmarketcap.com/alexandria/' } })}
          />
          <Row
            icon="information-circle-outline"
            label="Acerca de OrbitX"
            value={`Version ${Constants.expoConfig?.version ?? '1.0.0'}`}
            onPress={() => setSheet('about')}
          />
          <Pressable
            onPress={() => void handleSignOut()}
            style={[
              styles.signOutRow,
              {
                backgroundColor: withOpacity(colors.surfaceElevated, 0.8),
                borderColor: withOpacity(colors.loss, 0.22),
                opacity: signingOut ? 0.72 : 1,
              },
            ]}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: withOpacity(colors.loss, 0.12), borderColor: withOpacity(colors.loss, 0.24) }]}>
                <Ionicons name="log-out-outline" size={15} color={colors.loss} />
              </View>
              <Text style={[styles.rowLabel, { color: colors.loss }]}>
                {signingOut ? 'Cerrando sesion...' : 'Cerrar sesion'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.loss} />
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>Gracias por ser parte de OrbitX</Text>
          <Ionicons name="heart" size={12} color={colors.primary} />
        </View>
      </ScreenContainer>

      <Sheet visible={sheet === 'edit'} title="Editar perfil" onClose={() => setSheet(null)}>
        <View style={styles.avatarPickerRow}>
          <View
            style={[
              styles.sheetAvatar,
              {
                backgroundColor: withOpacity(colors.primary, 0.12),
                borderColor: withOpacity(colors.primary, 0.26),
              },
            ]}
          >
            {identity.avatarUri ? (
              <Image source={{ uri: identity.avatarUri }} style={styles.sheetAvatarImage} resizeMode="cover" />
            ) : (
              <Text style={[styles.sheetAvatarText, { color: colors.text }]}>{identity.avatarInitial}</Text>
            )}
          </View>
          <View style={styles.avatarPickerActions}>
            <Pressable
              onPress={() => void handlePickAvatar()}
              style={[
                styles.modalBtn,
                {
                  backgroundColor: withOpacity(colors.primary, 0.12),
                  borderColor: withOpacity(colors.primary, 0.24),
                },
              ]}
            >
              <Text style={[styles.modalBtnText, { color: colors.text }]}>Cambiar foto</Text>
            </Pressable>
            {identity.avatarUri ? (
              <Pressable
                onPress={() => updateAvatar(null)}
                style={[
                  styles.modalBtn,
                  {
                    backgroundColor: withOpacity(colors.fieldBackground, 0.82),
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.modalBtnText, { color: colors.textMuted }]}>Quitar foto</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
        <TextInput
          value={draftName}
          onChangeText={setDraftName}
          placeholder="Escribe tu nombre"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { color: colors.text, backgroundColor: withOpacity(colors.fieldBackground, 0.84), borderColor: colors.border }]}
        />
        <View style={styles.modalButtons}>
          <Pressable onPress={() => setSheet(null)} style={[styles.modalBtn, { backgroundColor: withOpacity(colors.fieldBackground, 0.82), borderColor: colors.border }]}>
            <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancelar</Text>
          </Pressable>
          <Pressable
            disabled={savingProfile}
            onPress={() => {
              setSavingProfile(true);
              requestAnimationFrame(() => {
                const result = updateProfile(draftName);
                setSavingProfile(false);
                if (result.ok) setSheet(null);
              });
            }}
            style={[styles.modalBtn, { backgroundColor: colors.primary, borderColor: withOpacity(colors.primary, 0.62), opacity: savingProfile ? 0.72 : 1 }]}
          >
            <Text style={[styles.modalBtnText, { color: '#0B0B0F' }]}>{savingProfile ? 'Guardando...' : 'Guardar'}</Text>
          </Pressable>
        </View>
      </Sheet>

      <Sheet visible={sheet === 'quick'} title="Configurar acceso rapido" onClose={() => setSheet(null)}>
        {Object.entries(QUICK).map(([key, item]) => {
          const active = settings.quickAccessAction === key;
          return (
            <Pressable
              key={key}
              onPress={() => {
                setQuickAccessAction(key as keyof typeof QUICK);
                setSheet(null);
              }}
              style={[styles.sheetRow, { backgroundColor: active ? withOpacity(colors.primary, 0.14) : withOpacity(colors.fieldBackground, 0.82), borderColor: active ? withOpacity(colors.primary, 0.32) : colors.border }]}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.rowIcon, { backgroundColor: withOpacity(colors.primary, 0.1), borderColor: withOpacity(colors.primary, 0.18) }]}>
                  <Ionicons name={item.icon} size={15} color={colors.text} />
                </View>
                <Text style={[styles.rowLabel, { color: colors.text }]}>{item.label}</Text>
              </View>
              {active ? <Ionicons name="checkmark-circle" size={18} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </Sheet>

      <Sheet visible={sheet === 'about'} title="Acerca de OrbitX" onClose={() => setSheet(null)}>
        <View style={[styles.aboutCard, { backgroundColor: withOpacity(colors.fieldBackground, 0.84), borderColor: colors.border }]}>
          <Text style={[styles.rowLabel, { color: colors.text }]}>OrbitX {Constants.expoConfig?.version ?? '1.0.0'}</Text>
          <Text style={[styles.rowValue, { color: colors.textMuted, textAlign: 'left', maxWidth: '100%' }]}>
            Experiencia premium de mercado, trading y Web3 con configuracion personalizable y enfoque mobile-first.
          </Text>
          <Text style={[styles.rowValue, { color: colors.textSoft, textAlign: 'left', maxWidth: '100%' }]}>
            Favoritos: {favoriteCount} | Alertas: {alertCount} | Memes creadas: {createdTokensCount}
          </Text>
        </View>
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 10, paddingHorizontal: 18, paddingBottom: 28, gap: 18 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerCopy: { flex: 1, gap: 2, paddingTop: 2 },
  title: { fontFamily: FONT.bold, fontSize: 30, lineHeight: 34 },
  subtitle: { fontFamily: FONT.regular, fontSize: 12, lineHeight: 17 },
  circle: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { borderWidth: 1, borderRadius: 24, padding: 16, gap: 14 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  userBlock: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  userCopy: { flex: 1 },
  avatarGlow: { position: 'absolute', left: 2, width: 72, height: 72, borderRadius: 72, borderWidth: 1 },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 1.4, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: FONT.bold, fontSize: 34 },
  avatarImage: { width: '100%', height: '100%', borderRadius: 36 },
  name: { fontFamily: FONT.bold, fontSize: 28, lineHeight: 31 },
  email: { fontFamily: FONT.regular, fontSize: 12, lineHeight: 16 },
  orbitIdBadge: {
    marginTop: 10,
    alignSelf: 'flex-start',
    minHeight: 30,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orbitIdLabel: { fontFamily: FONT.bold, fontSize: 10, letterSpacing: 0.4 },
  orbitIdValue: { fontFamily: FONT.semibold, fontSize: 11 },
  edit: { minHeight: 38, paddingHorizontal: 12, borderRadius: RADII.pill, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  editText: { fontFamily: FONT.semibold, fontSize: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  statusLive: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 8 },
  statusText: { fontFamily: FONT.medium, fontSize: 12 },
  badge: { borderWidth: 1, borderRadius: RADII.pill, paddingHorizontal: 10, paddingVertical: 6 },
  badgeText: { fontFamily: FONT.medium, fontSize: 11 },
  stats: { flexDirection: 'row', gap: 8 },
  statCard: { flex: 1, minHeight: 110, borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 10, gap: 6 },
  statTitle: { fontFamily: FONT.medium, fontSize: 10 },
  statValue: { fontFamily: FONT.bold, fontSize: 16 },
  statHelper: { fontFamily: FONT.regular, fontSize: 10, lineHeight: 13, marginTop: 'auto' },
  alert: { borderWidth: 1, borderRadius: 20, padding: 14, gap: 12 },
  alertCopy: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  alertTextWrap: { flex: 1 },
  alertTitle: { fontFamily: FONT.semibold, fontSize: 14 },
  alertBody: { fontFamily: FONT.regular, fontSize: 11, lineHeight: 16 },
  alertBtn: { alignSelf: 'flex-start', minHeight: 36, paddingHorizontal: 12, borderRadius: RADII.pill, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  alertBtnText: { fontFamily: FONT.semibold, fontSize: 12 },
  section: { gap: 12 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: FONT.bold, fontSize: 18 },
  link: { fontFamily: FONT.semibold, fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridCard: { width: '48.5%', minHeight: 108, borderWidth: 1, borderRadius: 20, padding: 12, gap: 8, position: 'relative' },
  astraCard: { borderWidth: 1, borderRadius: 20, padding: 14, gap: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBadge: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  gridTitle: { fontFamily: FONT.semibold, fontSize: 14 },
  gridBody: { fontFamily: FONT.regular, fontSize: 11, lineHeight: 15 },
  plus: { position: 'absolute', right: 10, top: 10, width: 22, height: 22, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  personalizationCard: { borderWidth: 1, borderRadius: 20, padding: 14, gap: 12 },
  personalizationCopy: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  personalizationText: { flex: 1, gap: 4 },
  personalizationMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  personalizationValue: { fontFamily: FONT.semibold, fontSize: 12 },
  row: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: '52%' },
  rowIcon: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontFamily: FONT.medium, fontSize: 13 },
  rowValue: { fontFamily: FONT.medium, fontSize: 12, textAlign: 'right' },
  signOutRow: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  footer: { paddingTop: 4, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  footerText: { fontFamily: FONT.regular, fontSize: 11 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.58)', justifyContent: 'flex-end', padding: 16 },
  sheet: { borderWidth: 1, borderRadius: 24, padding: 16, gap: 12 },
  grabber: { alignSelf: 'center', width: 42, height: 4, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.16)' },
  sheetTitle: { fontFamily: FONT.bold, fontSize: 18, textAlign: 'center' },
  input: { minHeight: 48, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, fontFamily: FONT.medium, fontSize: 14 },
  avatarPickerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  avatarPickerActions: { flex: 1, gap: 8 },
  sheetAvatar: { width: 68, height: 68, borderRadius: 34, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  sheetAvatarImage: { width: '100%', height: '100%', borderRadius: 34 },
  sheetAvatarText: { fontFamily: FONT.bold, fontSize: 28 },
  modalButtons: { flexDirection: 'row', gap: 10 },
  modalBtn: { flex: 1, minHeight: 44, borderWidth: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  modalBtnText: { fontFamily: FONT.bold, fontSize: 13 },
  sheetRow: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 10 },
  aboutCard: { borderWidth: 1, borderRadius: 18, padding: 14, gap: 6 },
});
