import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import * as Linking from 'expo-linking';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';

import { OrbitBullLoader } from '../components/common/OrbitBullLoader';
import { OrbitLogo } from '../components/common/OrbitLogo';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { ToastHost } from '../components/common/ToastHost';
import { getLocaleDirection } from '../constants/i18n';
import { useAppTheme } from '../hooks/useAppTheme';
import { useOrbitBootstrap } from '../hooks/useOrbitBootstrap';
import { useOrbitStore } from '../store/useOrbitStore';
import { useAuthStore } from '../src/store/authStore';
import { useUiStore } from '../src/store/uiStore';
import { devWarn } from '../src/utils/devLog';
import { AstraRuntimeBridge } from '../src/components/astra/AstraRuntimeBridge';
import { AstraVoiceSheet } from '../src/components/astra/AstraVoiceSheet';
import {
  getOrbitXBiometricAvailability,
  unlockOrbitXWithBiometrics,
} from '../utils/biometrics';
import { looksLikeOrbitAuthCallbackUrl, subscribeToOrbitAuth } from '../utils/orbitAuth';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const authHasHydrated = useAuthStore((state) => state.hasHydrated);
  const authHasBootstrapped = useAuthStore((state) => state.hasBootstrapped);
  const authIsRestoring = useAuthStore((state) => state.isRestoring);
  const sessionStatus = useAuthStore((state) => state.session.status);
  const biometricsEnabled = useOrbitStore((state) => state.walletFuture.biometricsEnabled);
  const showToast = useUiStore((state) => state.showToast);
  const language = useOrbitStore((state) => state.settings.language);
  const restoreAuthSession = useAuthStore((state) => state.restoreAuthSession);
  const handleAuthCallbackUrl = useAuthStore((state) => state.handleAuthCallbackUrl);
  const syncSupabaseSession = useAuthStore((state) => state.syncSupabaseSession);
  const { colors } = useAppTheme();
  const [biometricUnlocked, setBiometricUnlocked] = useState(false);
  const [biometricChecking, setBiometricChecking] = useState(false);
  const [startupFallbackReady, setStartupFallbackReady] = useState(false);
  const hydrationReady =
    (authHasHydrated && authHasBootstrapped) ||
    (authHasHydrated && !authIsRestoring && startupFallbackReady) ||
    startupFallbackReady;
  const fontsReady = fontsLoaded || startupFallbackReady;
  const appReady = hydrationReady && fontsReady;
  const direction = getLocaleDirection(language);
  const startupLabel =
    language === 'es'
      ? 'Iniciando acceso seguro...'
      : language === 'pt'
        ? 'Iniciando acesso seguro...'
        : language === 'zh-Hans'
          ? '正在启动安全访问...'
          : language === 'hi'
            ? 'सुरक्षित प्रवेश शुरू हो रहा है...'
            : language === 'ru'
              ? 'Запускаем безопасный доступ...'
              : language === 'ar'
                ? 'جارٍ بدء الوصول الآمن...'
                : language === 'id'
                  ? 'Memulai akses aman...'
                  : 'Starting secure access...';
  const biometricTitle =
    language === 'es'
      ? 'OrbitX bloqueado'
      : language === 'pt'
        ? 'OrbitX bloqueado'
        : language === 'zh-Hans'
          ? 'OrbitX 已锁定'
          : language === 'hi'
            ? 'OrbitX लॉक है'
            : language === 'ru'
              ? 'OrbitX заблокирован'
              : language === 'ar'
                ? 'OrbitX مقفل'
                : language === 'id'
                  ? 'OrbitX terkunci'
                  : 'OrbitX locked';
  const biometricBody =
    language === 'es'
      ? 'Valida tu huella o rostro para entrar a tu cuenta.'
      : language === 'pt'
        ? 'Valide sua biometria para entrar na sua conta.'
        : language === 'zh-Hans'
          ? '请验证指纹或面容以进入你的账户。'
          : language === 'hi'
            ? 'अपने खाते में प्रवेश करने के लिए अपनी बायोमेट्रिक पहचान सत्यापित करें।'
            : language === 'ru'
              ? 'Подтвердите отпечаток или лицо, чтобы войти в аккаунт.'
              : language === 'ar'
                ? 'تحقق من بصمتك أو وجهك للدخول إلى حسابك.'
                : language === 'id'
                  ? 'Verifikasi biometrik untuk masuk ke akunmu.'
                  : 'Verify your biometrics to enter your account.';
  const biometricCta =
    language === 'es'
      ? 'Desbloquear'
      : language === 'pt'
        ? 'Desbloquear'
        : language === 'zh-Hans'
          ? '解锁'
          : language === 'hi'
            ? 'अनलॉक करें'
            : language === 'ru'
              ? 'Разблокировать'
              : language === 'ar'
                ? 'إلغاء القفل'
                : language === 'id'
                  ? 'Buka kunci'
                  : 'Unlock';

  useOrbitBootstrap();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setStartupFallbackReady(true);
    }, 2800);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!appReady) {
      return;
    }

    if (!biometricsEnabled || sessionStatus === 'signed_out') {
      setBiometricUnlocked(true);
      setBiometricChecking(false);
      return;
    }

    let cancelled = false;

    const verifyBiometricGate = async () => {
      setBiometricChecking(true);

      try {
        const availability = await getOrbitXBiometricAvailability();
        if (cancelled) {
          return;
        }

        if (!availability.available || !availability.enrolled) {
          useOrbitStore.setState((state) => ({
            walletFuture: {
              ...state.walletFuture,
              biometricsEnabled: false,
            },
          }));
          setBiometricUnlocked(true);
          showToast('Biometria no disponible. Continuamos con acceso seguro.', 'info');
          return;
        }

        setBiometricUnlocked(false);
      } finally {
        if (!cancelled) {
          setBiometricChecking(false);
        }
      }
    };

    void verifyBiometricGate();

    return () => {
      cancelled = true;
    };
  }, [appReady, biometricsEnabled, sessionStatus, showToast]);

  useEffect(() => {
    if (!authHasHydrated || authHasBootstrapped) {
      return;
    }

    const run = async () => {
      try {
        await Promise.race([
          restoreAuthSession(),
          new Promise<void>((resolve) => {
            setTimeout(resolve, 2500);
          }),
        ]);
      } catch (error) {
        devWarn('[OrbitX] restoreAuthSession failed', error);
      }
    };

    void run();
  }, [authHasBootstrapped, authHasHydrated, restoreAuthSession]);

  useEffect(() => {
    if (!authHasHydrated) {
      return undefined;
    }

    const resolveUrl = async (url: string | null | undefined) => {
      if (!url || !looksLikeOrbitAuthCallbackUrl(url)) {
        return;
      }

      try {
        const result = await handleAuthCallbackUrl(url);
        if (!result.ok) {
          return;
        }

        if (result.code === 'password_recovery') {
          router.replace('/auth/reset');
          return;
        }

        router.replace('/home');
      } catch (error) {
        devWarn('[OrbitX] auth callback handling failed', error);
      }
    };

    void Linking.getInitialURL().then((url) => {
      void resolveUrl(url);
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      void resolveUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, [authHasHydrated, handleAuthCallbackUrl]);

  useEffect(() => {
    if (!appReady) {
      return undefined;
    }

    const unsubscribe = subscribeToOrbitAuth((_event, session) => {
      syncSupabaseSession(session);
    });

    return () => {
      unsubscribe();
    };
  }, [appReady, syncSupabaseSession]);

  if (!appReady) {
    return <OrbitBullLoader label={startupLabel} />;
  }

  if (biometricsEnabled && sessionStatus !== 'signed_out' && !biometricUnlocked) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
          gap: 18,
        }}
      >
        <OrbitLogo size={88} />
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700' }}>{biometricTitle}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22 }}>
          {biometricBody}
        </Text>
        {biometricChecking ? <ActivityIndicator color={colors.primary} /> : null}
        <PrimaryButton
          label={biometricCta}
          onPress={async () => {
            setBiometricChecking(true);
            const result = await unlockOrbitXWithBiometrics();
            setBiometricChecking(false);
            if (result.ok) {
              setBiometricUnlocked(true);
              return;
            }

            showToast(result.message, 'error');
          }}
        />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, direction }}>
      <SafeAreaProvider>
        <StatusBar style={colors.statusBarStyle} />
        <AstraRuntimeBridge />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="auth/reset" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="security"
            options={{ presentation: 'card', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="notifications"
            options={{ presentation: 'card', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="privacy"
            options={{ presentation: 'card', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="personalization"
            options={{ presentation: 'card', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="language"
            options={{ presentation: 'card', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="favorites"
            options={{ presentation: 'card', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="history"
            options={{ presentation: 'card', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="receive"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="send"
            options={{ presentation: 'card', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="pair-selector"
            options={{ presentation: 'card', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="token/[id]"
            options={{ presentation: 'card', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="trade/chart"
            options={{ presentation: 'card', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="create-token"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="browser"
            options={{ presentation: 'modal', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="astra"
            options={{ presentation: 'card', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="convert"
            options={{ presentation: 'card', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="pool"
            options={{ presentation: 'card', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="ramp/summary"
            options={{ presentation: 'card', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="ramp/flow"
            options={{ presentation: 'card', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="ramp/result"
            options={{ presentation: 'card', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="social/index"
            options={{ presentation: 'card', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="social/create"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="social/live"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="social/messages"
            options={{ presentation: 'card', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="social/creator/[creatorId]"
            options={{ presentation: 'card', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="social/comments/[postId]"
            options={{ presentation: 'card', animation: 'slide_from_right' }}
          />
        </Stack>
        <AstraVoiceSheet />
        <ToastHost />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
