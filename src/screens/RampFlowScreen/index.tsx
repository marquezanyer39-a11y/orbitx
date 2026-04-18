import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { FONT, RADII, SPACING, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { AstraEntryPoint } from '../../components/astra/AstraEntryPoint';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { useAstra } from '../../hooks/useAstra';
import { buildRampBridgeScript, parseRampBridgeMessage } from '../../services/ramp/rampBridge';
import { getRampCopy, getRampProviderLabel } from '../../services/ramp/rampCopy';
import {
  createRampWidgetSession,
  getRampAvailability,
  parseRampProviderCallback,
} from '../../services/ramp/rampService';
import { useRampStore } from '../../store/rampStore';
import type { RampFlowRequest, RampProviderId } from '../../types/ramp';

function normalizeProvider(raw?: string | string[]): RampProviderId {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === 'moonpay' ? 'moonpay' : 'transak';
}

export default function RampFlowScreen() {
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{
    mode?: string;
    providerId?: string;
    fiatCurrency?: string;
    cryptoCurrency?: string;
    network?: string;
    fiatAmount?: string;
    countryCode?: string;
    paymentMethod?: string;
  }>();
  const webViewRef = useRef<WebView>(null);
  const externalOpenedRef = useRef(false);
  const { language, openAstra } = useAstra();
  const copy = getRampCopy(language);
  const activeFlow = useRampStore((state) => state.activeFlow);
  const setSession = useRampStore((state) => state.setSession);
  const setStatus = useRampStore((state) => state.setStatus);
  const completeFlow = useRampStore((state) => state.completeFlow);
  const failFlow = useRampStore((state) => state.failFlow);
  const clearActiveFlow = useRampStore((state) => state.clearActiveFlow);
  const [loadingSession, setLoadingSession] = useState(true);
  const [widgetUrl, setWidgetUrl] = useState('');
  const [error, setError] = useState('');
  const [presentationMode, setPresentationMode] = useState<'webview' | 'external_browser'>('webview');
  const request = useMemo<RampFlowRequest>(() => {
    if (activeFlow?.request) {
      return activeFlow.request;
    }

    return {
      mode:
        params.mode === 'sell' || params.mode === 'convert' || params.mode === 'pay'
          ? params.mode
          : 'buy',
      providerId: normalizeProvider(params.providerId),
      fiatCurrency: params.fiatCurrency || 'USD',
      cryptoCurrency: params.cryptoCurrency || 'BTC',
      network: params.network || 'bitcoin',
      fiatAmount: Number.parseFloat(params.fiatAmount || '0') || 0,
      countryCode: params.countryCode || undefined,
      paymentMethod: params.paymentMethod || undefined,
      language,
    };
  }, [activeFlow?.request, language, params.countryCode, params.cryptoCurrency, params.fiatAmount, params.fiatCurrency, params.mode, params.network, params.paymentMethod, params.providerId]);

  const providerLabel = getRampProviderLabel(request.providerId);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      setLoadingSession(true);
      setError('');
      try {
        const availability = await getRampAvailability(request);
        if (cancelled) {
          return;
        }

        if (!availability.available) {
          throw new Error(availability.reasonLabel ?? copy.providerUnavailable);
        }

        const session = await createRampWidgetSession(request);
        if (cancelled) {
          return;
        }

        setSession(session);
        setStatus('redirecting', copy.redirecting);
        setWidgetUrl(session.widgetUrl);
        setPresentationMode(session.presentationMode);
      } catch (nextError) {
        if (cancelled) {
          return;
        }

        const message =
          nextError instanceof Error ? nextError.message : copy.providerUnavailable;
        setError(message);
        failFlow(message, 'failed');
      } finally {
        if (!cancelled) {
          setLoadingSession(false);
        }
      }
    };

    void boot();

    return () => {
      cancelled = true;
    };
  }, [copy.providerUnavailable, copy.redirecting, failFlow, request, setSession, setStatus]);

  useEffect(() => {
    if (loadingSession || !widgetUrl || presentationMode !== 'external_browser' || externalOpenedRef.current) {
      return;
    }

    externalOpenedRef.current = true;
    void Linking.openURL(widgetUrl).catch(() => {
      setError(copy.providerUnavailable);
    });
  }, [copy.providerUnavailable, loadingSession, presentationMode, widgetUrl]);

  const finalize = (status: 'completed' | 'failed' | 'cancelled', message?: string, url?: string) => {
    const callback = url ? parseRampProviderCallback(request.providerId, url) : null;
    if (callback) {
      completeFlow(callback);
      router.replace({
        pathname: '/ramp/result',
        params: {
          status: callback.status,
          providerId: request.providerId,
          message: callback.message ?? message,
          transactionId: callback.externalTransactionId,
          orderId: callback.providerOrderId,
        },
      });
      return;
    }

    if (status === 'completed') {
      completeFlow({ status, message });
    } else {
      failFlow(message ?? (status === 'cancelled' ? copy.cancelled : copy.failed), status);
    }

    router.replace({
      pathname: '/ramp/result',
      params: {
        status,
        providerId: request.providerId,
        message,
      },
    });
  };

  const handleNavUrl = (url: string) => {
    if (!url) {
      return false;
    }

    const directCallback = parseRampProviderCallback(request.providerId, url);
    if (directCallback?.status === 'kyc') {
      setStatus('kyc', copy.kyc);
      return false;
    }

    if (directCallback?.status === 'processing') {
      setStatus('processing', copy.processing);
      return false;
    }

    if (
      url.startsWith('orbitx://ramp/result') ||
      directCallback?.status === 'completed' ||
      directCallback?.status === 'failed' ||
      directCallback?.status === 'cancelled'
    ) {
      finalize(directCallback?.status ?? 'completed', directCallback?.message, url);
      return false;
    }

    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('kyc')) {
      setStatus('kyc', copy.kyc);
    } else if (lowerUrl.includes('order') || lowerUrl.includes('checkout') || lowerUrl.includes('process')) {
      setStatus('processing', copy.processing);
    }

    return true;
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    const callback = parseRampBridgeMessage(event.nativeEvent.data);
    if (!callback) {
      return;
    }

    if (callback.status === 'kyc') {
      setStatus('kyc', copy.kyc);
      return;
    }

    if (callback.status === 'processing') {
      setStatus('processing', copy.processing);
      return;
    }

    finalize(callback.status, callback.message);
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content} scrollable={false}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => finalize('cancelled', copy.cancelled)}
          style={[
            styles.iconButton,
            {
              backgroundColor: withOpacity(colors.surfaceElevated, 0.9),
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="close" size={18} color={colors.text} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {providerLabel}
          </Text>
          <Text style={[styles.headerBody, { color: colors.textMuted }]}>
            {copy.providerDepends}
          </Text>
        </View>
        <AstraEntryPoint
          onPress={() =>
            openAstra({
              surface: 'ramp',
              surfaceTitle: providerLabel,
              summary: copy.liveProviderNotice(providerLabel),
              rampMode: copy.modeLabel(request.mode),
              rampProviderLabel: providerLabel,
            })
          }
          size={42}
          accessibilityLabel="Abrir Astra en flujo del proveedor"
        />
      </View>

      <LinearGradient
        colors={[withOpacity(colors.primary, 0.16), withOpacity(colors.card, 0.98)]}
        style={[styles.statusCard, { borderColor: withOpacity(colors.primary, 0.18) }]}
      >
        <Text style={[styles.statusLabel, { color: colors.textMuted }]}>
          {copy.statusLabel}
        </Text>
        <Text style={[styles.statusValue, { color: colors.text }]}>
          {activeFlow?.status === 'kyc'
            ? copy.kyc
            : activeFlow?.status === 'processing'
              ? copy.processing
              : loadingSession
                ? copy.openingProvider
                : copy.redirecting}
        </Text>
      </LinearGradient>

      <View
        style={[
          styles.stage,
          {
            backgroundColor: withOpacity(colors.surfaceElevated, 0.9),
            borderColor: colors.border,
          },
        ]}
      >
        {loadingSession ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.stateTitle, { color: colors.text }]}>
              {copy.openingProvider}
            </Text>
            <Text style={[styles.stateBody, { color: colors.textMuted }]}>
              {copy.liveProviderNotice(providerLabel)}
            </Text>
          </View>
        ) : error ? (
          <View style={styles.centerState}>
            <Ionicons name="alert-circle-outline" size={30} color={colors.loss} />
            <Text style={[styles.stateTitle, { color: colors.text }]}>
              {copy.providerUnavailable}
            </Text>
            <Text style={[styles.stateBody, { color: colors.textMuted }]}>
              {error}
            </Text>
            <View style={styles.actionRow}>
              <PrimaryButton label={copy.askAstra} tone="secondary" onPress={() =>
                openAstra({
                  surface: 'error',
                  surfaceTitle: providerLabel,
                  summary: copy.liveProviderNotice(providerLabel),
                  errorTitle: copy.providerUnavailable,
                  errorBody: error,
                  rampMode: copy.modeLabel(request.mode),
                  rampProviderLabel: providerLabel,
                })
              } />
              <PrimaryButton label={copy.flowRetry} onPress={() => router.replace({
                pathname: '/ramp/summary',
                params: { mode: request.mode },
              })} />
            </View>
          </View>
        ) : presentationMode === 'external_browser' ? (
          <View style={styles.centerState}>
            <Ionicons name="open-outline" size={32} color={colors.primary} />
            <Text style={[styles.stateTitle, { color: colors.text }]}>
              {copy.redirecting}
            </Text>
            <Text style={[styles.stateBody, { color: colors.textMuted }]}>
              {copy.liveProviderNotice(providerLabel)}
            </Text>
            <PrimaryButton
              label={copy.startFlowLabel}
              onPress={() => void Linking.openURL(widgetUrl)}
            />
          </View>
        ) : (
          <WebView
            ref={webViewRef}
            source={{ uri: widgetUrl }}
            style={styles.webview}
            onShouldStartLoadWithRequest={(requestInfo) => handleNavUrl(requestInfo.url)}
            onNavigationStateChange={(event) => {
              handleNavUrl(event.url);
            }}
            injectedJavaScript={buildRampBridgeScript(request.providerId)}
            onMessage={handleMessage}
            startInLoadingState
            javaScriptEnabled
            domStorageEnabled
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            setSupportMultipleWindows={false}
            originWhitelist={['*']}
          />
        )}
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label={copy.flowCancel}
          tone="secondary"
          onPress={() => finalize('cancelled', copy.cancelled)}
          style={styles.footerButton}
        />
        <PrimaryButton
          label={copy.backToWallet}
          tone="ghost"
          onPress={() => {
            clearActiveFlow();
            router.replace('/(tabs)/wallet');
          }}
          style={styles.footerButton}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 3,
    paddingTop: 2,
  },
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: 24,
  },
  headerBody: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCard: {
    borderWidth: 1,
    borderRadius: RADII.lg,
    padding: 16,
    gap: 4,
  },
  statusLabel: {
    fontFamily: FONT.medium,
    fontSize: 11,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  statusValue: {
    fontFamily: FONT.bold,
    fontSize: 20,
  },
  stage: {
    flex: 1,
    minHeight: 420,
    borderWidth: 1,
    borderRadius: RADII.lg,
    overflow: 'hidden',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  stateTitle: {
    fontFamily: FONT.bold,
    fontSize: 20,
    textAlign: 'center',
  },
  stateBody: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  webview: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: SPACING.xs,
  },
  footerButton: {
    flex: 1,
  },
});
