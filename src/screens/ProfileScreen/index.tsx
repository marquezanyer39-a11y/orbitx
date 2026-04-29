import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileAstraCard } from '../../../components/profile/ProfileAstraCard';
import { ProfileCustomizationCard } from '../../../components/profile/ProfileCustomizationCard';
import { ProfileHeader } from '../../../components/profile/ProfileHeader';
import { ProfileHeroCard } from '../../../components/profile/ProfileHeroCard';
import { ProfileLogoutButton } from '../../../components/profile/ProfileLogoutButton';
import { ProfileMetricsGrid } from '../../../components/profile/ProfileMetricsGrid';
import { ProfileMoreList } from '../../../components/profile/ProfileMoreList';
import { ProfilePreferencesList } from '../../../components/profile/ProfilePreferencesList';
import { ProfileQuickActions } from '../../../components/profile/ProfileQuickActions';
import { ProfileSecurityCard } from '../../../components/profile/ProfileSecurityCard';
import { PROFILE_THEME } from '../../../components/profile/profileTheme';
import { useOrbitStore } from '../../../store/useOrbitStore';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { useAstra } from '../../hooks/useAstra';
import { useProfileData } from '../../hooks/useProfileData';
import { useSecurityStatus } from '../../hooks/useSecurityStatus';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';

const ACCENT_LABELS = {
  violet: 'Violeta',
  cyan: 'Cian',
  lime: 'Lima',
  sunset: 'Atardecer',
  rose: 'Rosa',
} as const;

const MOTION_LABELS = {
  bull: 'Toro',
  bear: 'Oso',
  battle: 'Batalla',
} as const;

const PROFILE_AVATAR_DIR = `${FileSystem.documentDirectory ?? ''}orbitx-profile/`;

function guessImageExtension(uri: string) {
  const cleanUri = uri.split('?')[0] ?? uri;
  const match = cleanUri.match(/\.([a-zA-Z0-9]{3,5})$/);
  return match?.[1] ? `.${match[1].toLowerCase()}` : '.jpg';
}

async function persistProfileAvatarUri(sourceUri: string) {
  if (!sourceUri.trim()) {
    throw new Error('No recibimos una imagen valida.');
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

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isSmallPhone = width < 380;
  const profile = useAuthStore((state) => state.profile);
  const signOut = useAuthStore((state) => state.signOut);
  const updateAvatar = useAuthStore((state) => state.updateAvatar);
  const showToast = useUiStore((state) => state.showToast);
  const settings = useOrbitStore((state) => state.settings);
  const { identity, metrics } = useProfileData();
  const { alert, resendConfirmationEmail, securityStatus } = useSecurityStatus();
  const { openAstra } = useAstra();
  const [securityActionLoading, setSecurityActionLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handle = profile.handle || '@anyer_orbit';
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const customizationSummary = `${ACCENT_LABELS[settings.orbitAccentPreset]} | ${
    settings.orbitMotionEnabled ? MOTION_LABELS[settings.orbitMotionPreset] : 'Pausado'
  }`;
  const bottomPadding = Math.max(PROFILE_THEME.bottomSpacing, 74 + insets.bottom + 48);
  const topPadding = isSmallPhone ? 12 : 14;

  const quickActions = [
    {
      key: 'browser',
      title: 'Navegador',
      subtitle: 'Explora Web3',
      icon: 'compass-outline' as const,
      onPress: () => router.push('/browser'),
    },
    {
      key: 'favorites',
      title: 'Favoritos',
      subtitle: 'Mercados guardados',
      icon: 'star-outline' as const,
      onPress: () => router.push('/(tabs)/market'),
    },
    {
      key: 'history',
      title: 'Historial',
      subtitle: 'Eventos recientes',
      icon: 'time-outline' as const,
      onPress: () => router.push('/history'),
    },
    {
      key: 'quick-access',
      title: 'Acceso rápido',
      subtitle: 'Navegador',
      icon: 'flash-outline' as const,
      onPress: () => router.push('/browser'),
    },
  ];

  const preferenceItems = [
    {
      key: 'notifications',
      label: 'Notificaciones',
      value: settings.notificationsEnabled ? 'Activas' : 'Desactivadas',
      icon: 'notifications-outline' as const,
      onPress: () => router.push('/notifications'),
    },
    {
      key: 'privacy',
      label: 'Privacidad',
      value: settings.privacyMode === 'strict' ? 'Estricto' : 'Estándar',
      icon: 'eye-off-outline' as const,
      onPress: () => router.push('/privacy'),
    },
    {
      key: 'security',
      label: 'Seguridad',
      value:
        securityStatus.pinEnabled || securityStatus.biometricsEnabled
          ? 'Acceso seguro'
          : 'Configurar',
      icon: 'shield-checkmark-outline' as const,
      onPress: () => router.push('/security'),
    },
  ];

  const moreItems = [
    {
      key: 'shortcuts',
      label: 'Atajos rápidos',
      value: 'Navegador',
      icon: 'flash-outline' as const,
      onPress: () => router.push('/browser'),
    },
    {
      key: 'help',
      label: 'Centro de ayuda',
      value: 'Soporte y guías',
      icon: 'help-circle-outline' as const,
      onPress: () =>
        router.push({
          pathname: '/browser',
          params: { url: 'https://coinmarketcap.com/alexandria/' },
        }),
    },
    {
      key: 'about',
      label: 'Acerca de OrbitX',
      value: `Versión ${version}`,
      icon: 'information-circle-outline' as const,
      onPress: () => {},
    },
  ];

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

    if (result.canceled || !result.assets?.length) {
      return;
    }

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
      <ScreenContainer
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPadding, paddingBottom: bottomPadding },
        ]}
        backgroundMode="plain"
      >
        <ProfileHeader
          onBack={() => router.replace('/(tabs)/home')}
          onGrid={() => router.push('/history')}
          onSettings={() => router.push('/security')}
        />

        <ProfileHeroCard
          identity={identity}
          handle={handle}
          isSmallPhone={isSmallPhone}
          onEdit={handlePickAvatar}
        />

        <ProfileMetricsGrid
          items={metrics.map((metric) => ({
            id: metric.id,
            title: metric.title,
            value: metric.value,
            tone: metric.tone,
          }))}
          isSmallPhone={isSmallPhone}
        />

        <ProfileSecurityCard
          title={alert?.title || 'Tu seguridad es prioridad'}
          body={alert?.body || 'Respalda tu frase semilla para no perder acceso.'}
          ctaLabel="Configurar"
          loading={securityActionLoading}
          onPress={handleSecurityAction}
        />

        <ProfileAstraCard
          onPress={() =>
            openAstra({
              screenName: 'Perfil',
              summary: 'Perfil, personalización y seguridad de cuenta',
              currentTask: 'profile_support',
            })
          }
        />

        <ProfileQuickActions items={quickActions} isSmallPhone={isSmallPhone} />

        <ProfileCustomizationCard
          summary={customizationSummary}
          onPress={() => router.push('/personalization')}
        />

        <ProfilePreferencesList items={preferenceItems} />
        <ProfileMoreList items={moreItems} />

        <ProfileLogoutButton loading={signingOut} onPress={handleSignOut} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Gracias por ser parte de OrbitX 💜</Text>
        </View>
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: PROFILE_THEME.spacing.horizontal,
    gap: PROFILE_THEME.spacing.section,
    backgroundColor: PROFILE_THEME.colors.background,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 6,
  },
  footerText: {
    color: PROFILE_THEME.colors.textSecondary,
    fontFamily: PROFILE_THEME.typography.body,
    fontSize: 13,
    textAlign: 'center',
  },
});
