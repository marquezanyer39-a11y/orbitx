import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Linking, Pressable, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '../../../hooks/useI18n';
import { RouteRedirect } from '../../../components/common/RouteRedirect';
import { BrowserHeader } from './BrowserHeader';
import { BrowserHome } from './BrowserHome';
import { BrowserQuickActions } from './BrowserQuickActions';
import { BrowserWebView } from './BrowserWebView';
import { COLORS, styles } from './browserStyles';
import { useBrowserViewModel } from './useBrowserViewModel';

function DappSecurityWarning({
  host,
  onCancel,
  onContinue,
}: {
  host: string;
  onCancel: () => void;
  onContinue: () => void;
}) {
  return (
    <View style={styles.dappWarningCard}>
      <View style={styles.dappWarningIcon}>
        <Ionicons name="shield-checkmark-outline" size={26} color={COLORS.warning} />
      </View>
      <Text style={styles.dappWarningTitle}>Advertencia de seguridad Web3</Text>
      <Text style={styles.dappWarningBody}>
        Vas a abrir {host}. QVEX no controla contratos externos. Nunca ingreses seed phrase,
        private key ni apruebes permisos que no entiendas.
      </Text>
      <View style={styles.dappWarningActions}>
        <Pressable onPress={onCancel} style={({ pressed }) => [styles.dappWarningButton, pressed && styles.pressed]}>
          <Text style={styles.dappWarningSecondary}>Cancelar</Text>
        </Pressable>
        <Pressable
          onPress={onContinue}
          style={({ pressed }) => [styles.dappWarningButtonPrimary, pressed && styles.pressed]}
        >
          <Text style={styles.dappWarningPrimaryText}>Entiendo, abrir DApp</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function OrbitXBrowserScreen() {
  const insets = useSafeAreaInsets();
  const browser = useBrowserViewModel();
  const { t } = useI18n();

  if (browser.sessionStatus === 'signed_out') {
    return <RouteRedirect href="/" />;
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={['#08090B', '#090A0E', '#08090B']} style={styles.absoluteFill} />
      <View pointerEvents="none" style={styles.motionTrailTop} />
      <View pointerEvents="none" style={styles.motionTrailBottom} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 10) + 10 }]}>
          <BrowserHeader
            browserTitle={browser.browserTitle}
            currentUrl={browser.currentUrl}
            draftUrl={browser.draftUrl}
            inputRef={browser.inputRef}
            mode={browser.mode}
            quickLinks={browser.quickLinks}
            selectedId={browser.selectedId}
            source={browser.params.source}
            onBack={browser.goBack}
            onOpenDestination={browser.openDestination}
            onSetDraftUrl={browser.setDraftUrl}
            onToggleSettings={() => browser.setSettingsOpen((value) => !value)}
          />

          <View style={[styles.stage, browser.mode === 'browse' && styles.stageBrowsing]}>
            {browser.mode === 'browse' ? (
              browser.dappWarningVisible ? (
                <DappSecurityWarning
                  host={browser.hostLabel(browser.currentUrl)}
                  onCancel={browser.goBack}
                  onContinue={browser.acceptDappWarning}
                />
              ) : (
                <BrowserWebView
                  browserTitle={browser.browserTitle}
                  currentUrl={browser.currentUrl}
                  errorMessage={browser.webError}
                  loading={browser.loading}
                  progress={browser.progress}
                  webViewRef={browser.webViewRef}
                  onOpenExternalSite={browser.openExternalSite}
                  onSetCurrentUrl={browser.setCurrentUrl}
                  onSetDraftUrl={browser.setDraftUrl}
                  onSetError={browser.setWebError}
                  onSetLoading={browser.setLoading}
                  onSetModeBrowse={() => browser.setMode('browse')}
                  onSetProgress={browser.setProgress}
                  onSetWebCanGoBack={browser.setWebCanGoBack}
                />
              )
            ) : (
              <BrowserHome
                connected={browser.connected}
                dappLinks={browser.dappLinks}
                walletAddress={browser.walletAddress}
                walletNetwork={browser.walletNetwork}
                onOpenDestination={browser.openDestination}
                onWalletAction={browser.handleWalletAction}
              />
            )}
          </View>

          {browser.message ? (
            <View style={styles.messageCard}>
              <Ionicons name="information-circle-outline" size={16} color={COLORS.purpleSoft} />
              <Text style={styles.messageText}>{browser.message}</Text>
            </View>
          ) : null}

          <BrowserQuickActions
            favorite={browser.favorite}
            inputRef={browser.inputRef}
            mode={browser.mode}
            settingsOpen={browser.settingsOpen}
            onRefresh={browser.refresh}
            onResetHome={browser.resetHome}
            onToggleFavorite={browser.toggleFavorite}
            onToggleSettings={() => browser.setSettingsOpen((value) => !value)}
          />
        </View>

        {browser.settingsOpen ? (
          <View style={[styles.settingsSheet, { bottom: Math.max(insets.bottom, 10) + 92 }]}>
            <Text style={styles.settingsTitle}>{t('browser.settingsTitle')}</Text>
            <Pressable style={styles.settingsRow} onPress={() => void Linking.openURL(browser.currentUrl)}>
              <Ionicons name="open-outline" size={16} color={COLORS.textPrimary} />
              <Text style={styles.settingsLabel}>{t('browser.openExternal')}</Text>
            </Pressable>
            <Pressable style={styles.settingsRow} onPress={browser.resetHome}>
              <Ionicons name="sparkles-outline" size={16} color={COLORS.purpleSoft} />
              <Text style={styles.settingsLabel}>{t('browser.resetHome')}</Text>
            </Pressable>
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}
