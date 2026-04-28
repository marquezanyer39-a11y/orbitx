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
import { getLocaleDirection, pickLanguageText } from '../constants/i18n';
import { FONT } from '../constants/theme';
import { useAppTheme } from '../hooks/useAppTheme';
import { useOrbitBootstrap } from '../hooks/useOrbitBootstrap';
import { useOrbitStore } from '../store/useOrbitStore';
import { AstraRuntimeBridge } from '../src/components/astra/AstraRuntimeBridge';
import { AstraVoiceSheet } from '../src/components/astra/AstraVoiceSheet';
import { ExternalWalletProvider } from '../src/providers/ExternalWalletProvider';
import { useAuthStore } from '../src/store/authStore';
import { useUiStore } from '../src/store/uiStore';
import { devWarn } from '../src/utils/devLog';
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
  const startupLabel = pickLanguageText(language, {
    en: 'Starting secure access...',
    es: 'Iniciando acceso seguro...',
    pt: 'Iniciando acesso seguro...',
    'zh-Hans': '\u6b63\u5728\u542f\u52a8\u5b89\u5168\u8bbf\u95ee...',
    hi: '\u0938\u0941\u0930\u0915\u094d\u0937\u093f\u0924 \u092a\u094d\u0930\u0935\u0947\u0936 \u0936\u0941\u0930\u0942 \u0939\u094b \u0930\u0939\u093e \u0939\u0948...',
    ru: '\u0417\u0430\u043f\u0443\u0441\u043a\u0430\u0435\u043c \u0431\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u044b\u0439 \u0434\u043e\u0441\u0442\u0443\u043f...',
    ar: '\u062c\u0627\u0631\u064d \u0628\u062f\u0621 \u0627\u0644\u0648\u0635\u0648\u0644 \u0627\u0644\u0622\u0645\u0646...',
    id: 'Memulai akses aman...',
  });
  const biometricTitle = pickLanguageText(language, {
    en: 'OrbitX locked',
    es: 'OrbitX bloqueado',
    pt: 'OrbitX bloqueado',
    'zh-Hans': 'OrbitX \u5df2\u9501\u5b9a',
    hi: 'OrbitX \u0932\u0949\u0915 \u0939\u0948',
    ru: 'OrbitX \u0437\u0430\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u0430\u043d',
    ar: 'OrbitX \u0645\u0642\u0641\u0644',
    id: 'OrbitX terkunci',
  });
  const biometricBody = pickLanguageText(language, {
    en: 'Verify your biometrics to enter your account.',
    es: 'Valida tu huella o rostro para entrar a tu cuenta.',
    pt: 'Valide sua biometria para entrar na sua conta.',
    'zh-Hans': '\u8bf7\u9a8c\u8bc1\u6307\u7eb9\u6216\u9762\u5bb9\u4ee5\u8fdb\u5165\u4f60\u7684\u8d26\u6237\u3002',
    hi: '\u0905\u092a\u0928\u0947 \u0916\u093e\u0924\u0947 \u092e\u0947\u0902 \u092a\u094d\u0930\u0935\u0947\u0936 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0905\u092a\u0928\u0940 \u092c\u093e\u092f\u094b\u092e\u0947\u091f\u094d\u0930\u093f\u0915 \u092a\u0939\u091a\u093e\u0928 \u0938\u0924\u094d\u092f\u093e\u092a\u093f\u0924 \u0915\u0930\u0947\u0902\u0964',
    ru: '\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438 \u043e\u0442\u043f\u0435\u0447\u0430\u0442\u043e\u043a \u0438\u043b\u0438 \u043b\u0438\u0446\u043e, \u0447\u0442\u043e\u0431\u044b \u0432\u043e\u0439\u0442\u0438 \u0432 \u0430\u043a\u043a\u0430\u0443\u043d\u0442.',
    ar: '\u062a\u062d\u0642\u0642 \u0645\u0646 \u0628\u0635\u0645\u062a\u0643 \u0623\u0648 \u0648\u062c\u0647\u0643 \u0644\u0644\u062f\u062e\u0648\u0644 \u0625\u0644\u0649 \u062d\u0633\u0627\u0628\u0643.',
    id: 'Verifikasi biometrik untuk masuk ke akunmu.',
  });
  const biometricCta = pickLanguageText(language, {
    en: 'Unlock',
    es: 'Desbloquear',
    pt: 'Desbloquear',
    'zh-Hans': '\u89e3\u9501',
    hi: '\u0905\u0928\u0932\u0949\u0915 \u0915\u0930\u0947\u0902',
    ru: '\u0420\u0430\u0437\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u0430\u0442\u044c',
    ar: '\u0625\u0644\u063a\u0627\u0621 \u0627\u0644\u0642\u0641\u0644',
    id: 'Buka kunci',
  });
  const biometricsUnavailableToast = pickLanguageText(language, {
    en: 'Biometrics are unavailable. We will continue with secure access.',
    es: 'La biometria no esta disponible. Continuaremos con acceso seguro.',
    pt: 'A biometria nao esta disponivel. Vamos continuar com acesso seguro.',
    'zh-Hans': '\u751f\u7269\u8bc6\u522b\u4e0d\u53ef\u7528\uff0c\u6211\u4eec\u5c06\u7ee7\u7eed\u4f7f\u7528\u5b89\u5168\u8bbf\u95ee\u3002',
    hi: '\u092c\u093e\u092f\u094b\u092e\u0947\u091f\u094d\u0930\u093f\u0915 \u0909\u092a\u0932\u092c\u094d\u0927 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 \u0939\u092e \u0938\u0941\u0930\u0915\u094d\u0937\u093f\u0924 \u090f\u0915\u094d\u0938\u0947\u0938 \u0915\u0947 \u0938\u093e\u0925 \u091c\u093e\u0930\u0940 \u0930\u0916\u0947\u0902\u0917\u0947\u0964',
    ru: '\u0411\u0438\u043e\u043c\u0435\u0442\u0440\u0438\u044f \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430. \u041c\u044b \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u043c \u0431\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u044b\u0439 \u0432\u0445\u043e\u0434.',
    ar: '\u0627\u0644\u0628\u0635\u0645\u0627\u062a \u0627\u0644\u062d\u064a\u0648\u064a\u0629 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d\u0629. \u0633\u0646\u062a\u0627\u0628\u0639 \u0628\u0627\u0644\u0648\u0635\u0648\u0644 \u0627\u0644\u0622\u0645\u0646.',
    id: 'Biometrik tidak tersedia. Kami akan melanjutkan dengan akses aman.',
  });

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
          showToast(biometricsUnavailableToast, 'info');
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
  }, [appReady, biometricsEnabled, biometricsUnavailableToast, sessionStatus, showToast]);

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
        <Text style={{ color: colors.text, fontSize: 24, fontFamily: FONT.bold }}>
          {biometricTitle}
        </Text>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 14,
            textAlign: 'center',
            lineHeight: 22,
            fontFamily: FONT.regular,
          }}
        >
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
        <ExternalWalletProvider>
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
        </ExternalWalletProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
