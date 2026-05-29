import { Platform, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { RefObject } from 'react';

import { styles } from './browserStyles';
import { BrowserErrorState } from './BrowserErrorState';
import { BrowserLoadingState } from './BrowserLoadingState';
import { hostLabel } from './useBrowserViewModel';

interface BrowserWebViewProps {
  browserTitle: string;
  currentUrl: string;
  errorMessage: string;
  loading: boolean;
  progress: number;
  webViewRef: RefObject<WebView | null>;
  onOpenExternalSite: () => void;
  onSetCurrentUrl: (url: string) => void;
  onSetDraftUrl: (url: string) => void;
  onSetError: (error: string) => void;
  onSetLoading: (loading: boolean) => void;
  onSetModeBrowse: () => void;
  onSetProgress: (progress: number) => void;
  onSetWebCanGoBack: (canGoBack: boolean) => void;
}

export function BrowserWebView({
  browserTitle,
  currentUrl,
  errorMessage,
  loading,
  onOpenExternalSite,
  onSetCurrentUrl,
  onSetDraftUrl,
  onSetError,
  onSetLoading,
  onSetModeBrowse,
  onSetProgress,
  onSetWebCanGoBack,
  progress,
  webViewRef,
}: BrowserWebViewProps) {
  if (Platform.OS === 'web') {
    return (
      <BrowserErrorState
        title={browserTitle}
        body="En Expo web abre el sitio externo; en Android la APK lo carga dentro del Navegador QVEX."
        actionLabel="Abrir sitio"
        onAction={onOpenExternalSite}
      />
    );
  }

  if (errorMessage) {
    return (
      <BrowserErrorState
        title="No se pudo cargar"
        body={errorMessage}
        actionLabel="Reintentar"
        onAction={() => onSetError('')}
      />
    );
  }

  return (
    <View style={[styles.webViewCard, styles.webViewCardFullscreen]}>
      <WebView
        key={currentUrl}
        ref={webViewRef}
        source={{ uri: currentUrl }}
        onLoadStart={() => {
          onSetError('');
          onSetLoading(true);
          onSetProgress(0.08);
        }}
        onLoadProgress={({ nativeEvent }) => onSetProgress(nativeEvent.progress)}
        onLoadEnd={() => {
          onSetLoading(false);
          onSetProgress(1);
        }}
        onNavigationStateChange={(event) => {
          onSetCurrentUrl(event.url);
          onSetDraftUrl(event.url);
          onSetModeBrowse();
          onSetWebCanGoBack(event.canGoBack);
        }}
        onError={({ nativeEvent }) => {
          onSetLoading(false);
          onSetError(nativeEvent.description || 'La DApp no respondió correctamente.');
        }}
        pullToRefreshEnabled
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
        nestedScrollEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        cacheEnabled
        setSupportMultipleWindows={false}
        originWhitelist={['*']}
        style={styles.webView}
      />
      {loading ? <BrowserLoadingState host={hostLabel(currentUrl)} progress={progress} /> : null}
    </View>
  );
}
