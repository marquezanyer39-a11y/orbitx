import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Platform, TextInput } from 'react-native';
import type { WebView } from 'react-native-webview';

import { useI18n } from '../../../hooks/useI18n';
import { ORBIT_BROWSER_LINKS } from '../../../constants/externalLinks';
import { FEATURE_STATUS } from '../../constants/featureStatus';
import { getDappById, isWhitelistedDappUrl } from '../../constants/dappsCatalog';
import { useExternalWallet } from '../../hooks/useExternalWallet';
import { useAuthStore } from '../../store/authStore';

export type BrowserMode = 'home' | 'browse';
export type BrowserSource = 'news' | 'dapp' | 'explorer' | 'token' | 'manual';
export type BrowserLink = (typeof ORBIT_BROWSER_LINKS)[number];

const QUICK_IDS = ['coinmarketcap', 'dextools', 'popcoin'] as const;
const DAPP_IDS = ['trustwallet', 'jupiter', 'uniswap', 'opensea'] as const;

let dappWarningAcceptedThisSession = false;

export const TRENDING_TOKENS = [
  { symbol: 'PEPE', price: '$0.0000104', change: '+12.4%', positive: true },
  { symbol: 'DOGE', price: '$0.1642', change: '-2.1%', positive: false },
  { symbol: 'BONK', price: '$0.000028', change: '+4.8%', positive: true },
  { symbol: 'WIF', price: '$3.42', change: '+8.1%', positive: true },
];

export const RECENT_SITES = [
  { id: 'recent-cmc', title: 'CoinMarketCap', host: 'coinmarketcap.com', url: 'https://coinmarketcap.com/', icon: 'globe-outline' },
  { id: 'recent-jupiter', title: 'Jupiter', host: 'jup.ag', url: 'https://jup.ag/', icon: 'rocket-outline' },
  { id: 'recent-solscan', title: 'Solscan', host: 'solscan.io', url: 'https://solscan.io/', icon: 'search-outline' },
] as const;

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function normalizeBrowserUrl(input?: string | null) {
  const trimmed = (input ?? '').trim();
  if (!trimmed) return ORBIT_BROWSER_LINKS[0].url;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[\w.-]+\.[a-z]{2,}/i.test(trimmed)) return `https://${trimmed}`;
  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
}

export function hostLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./i, '');
  } catch {
    return url;
  }
}

export function maskAddress(address?: string, emptyLabel = 'Sin dirección') {
  if (!address) return emptyLabel;
  if (address.length <= 12) return address;
  return `${address.slice(0, 5)}...${address.slice(-4)}`;
}

export function sourceLabel(source?: string | string[]) {
  const value = Array.isArray(source) ? source[0] : source;
  const labels: Record<BrowserSource, string> = {
    news: 'Noticias',
    dapp: 'dApps',
    explorer: 'Explorador',
    token: 'Token',
    manual: 'Manual',
  };

  return value && value in labels ? labels[value as BrowserSource] : 'Web3';
}

export function useBrowserViewModel() {
  const { t } = useI18n();
  const params = useLocalSearchParams<{
    initialUrl?: string;
    url?: string;
    dappId?: string;
    title?: string;
    source?: string;
    showWalletStatus?: string;
    returnTo?: string;
  }>();
  const sessionStatus = useAuthStore((state) => state.session.status);
  const externalWallet = useExternalWallet();
  const webViewRef = useRef<WebView>(null);
  const inputRef = useRef<TextInput>(null);

  const initialParamUrl =
    typeof params.initialUrl === 'string' && params.initialUrl.trim()
      ? params.initialUrl
      : typeof params.url === 'string'
        ? params.url
        : '';
  const isDappSource = params.source === 'dapp';
  const requestedDapp = typeof params.dappId === 'string' ? getDappById(params.dappId) : undefined;
  const requestedUrl = useMemo(() => normalizeBrowserUrl(initialParamUrl), [initialParamUrl]);
  const isTrustedDappUrl =
    !isDappSource ||
    (Boolean(requestedDapp) && requestedDapp?.url === requestedUrl && isWhitelistedDappUrl(requestedUrl));
  const initialUrl = isTrustedDappUrl ? requestedUrl : ORBIT_BROWSER_LINKS[0].url;
  const initialMode: BrowserMode = initialParamUrl && isTrustedDappUrl ? 'browse' : 'home';
  const quickLinks = useMemo(
    () => QUICK_IDS.map((id) => ORBIT_BROWSER_LINKS.find((item) => item.id === id)).filter(isDefined),
    [],
  );
  const dappLinks = useMemo(
    () => DAPP_IDS.map((id) => ORBIT_BROWSER_LINKS.find((item) => item.id === id)).filter(isDefined),
    [],
  );

  const [mode, setMode] = useState<BrowserMode>(initialMode);
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [draftUrl, setDraftUrl] = useState(initialUrl);
  const [selectedId, setSelectedId] = useState<string>(ORBIT_BROWSER_LINKS[0].id);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [webCanGoBack, setWebCanGoBack] = useState(false);
  const [webError, setWebError] = useState('');
  const [dappWarningVisible, setDappWarningVisible] = useState(
    Boolean(
      isDappSource &&
        initialParamUrl &&
        isTrustedDappUrl &&
        FEATURE_STATUS.web3.dappsWarningEnabled &&
        !dappWarningAcceptedThisSession,
    ),
  );

  useEffect(() => {
    setCurrentUrl(initialUrl);
    setDraftUrl(initialUrl);
    setMode(initialMode);
    setWebError('');
  }, [initialMode, initialUrl]);

  useEffect(() => {
    if (isDappSource && initialParamUrl && !isTrustedDappUrl) {
      setMessage('DApp bloqueada: la URL no pertenece al catálogo verificado de QVEX.');
    }
  }, [initialParamUrl, isDappSource, isTrustedDappUrl]);

  const hasUrl = Boolean(currentUrl);
  const favorite = favorites.includes(currentUrl);
  const browserTitle = typeof params.title === 'string' && params.title.trim() ? params.title : t('browser.title');
  const returnTo = typeof params.returnTo === 'string' && params.returnTo.trim() ? params.returnTo : '';
  const connected = externalWallet.isConnected && Boolean(externalWallet.address);
  const walletAddress = connected ? maskAddress(externalWallet.address, t('browser.noAddress')) : t('browser.noWallet');
  const walletNetwork = connected ? externalWallet.chainLabel : t('browser.noNetwork');

  const openDestination = (input?: string | null, selected?: string) => {
    const nextUrl = normalizeBrowserUrl(input);
    setCurrentUrl(nextUrl);
    setDraftUrl(nextUrl);
    setSelectedId(selected ?? hostLabel(nextUrl));
    setMode('browse');
    setWebCanGoBack(false);
    setSettingsOpen(false);
    setWebError('');
    setMessage('');
  };

  const resetHome = () => {
    setMode('home');
    setCurrentUrl(ORBIT_BROWSER_LINKS[0].url);
    setDraftUrl(ORBIT_BROWSER_LINKS[0].url);
    setSelectedId(ORBIT_BROWSER_LINKS[0].id);
    setWebCanGoBack(false);
    setSettingsOpen(false);
    setWebError('');
    setMessage('');
  };

  const acceptDappWarning = () => {
    dappWarningAcceptedThisSession = true;
    setDappWarningVisible(false);
  };

  const refresh = () => {
    if (mode === 'browse' && Platform.OS !== 'web') {
      webViewRef.current?.reload();
      return;
    }

    setMessage(t('browser.homeUpdated'));
  };

  const handleWalletAction = () => {
    if (!connected) {
      void externalWallet.connect();
      return;
    }

    void externalWallet.switchToNetwork('ethereum');
  };

  const goBack = () => {
    if (mode === 'browse' && Platform.OS !== 'web' && webCanGoBack) {
      webViewRef.current?.goBack();
      return;
    }

    if (returnTo) {
      router.replace(returnTo as never);
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/home');
  };

  const openExternalSite = () => {
    void Linking.openURL(currentUrl);
  };

  const toggleFavorite = () => {
    if (!hasUrl) return;

    setFavorites((current) =>
      current.includes(currentUrl)
        ? current.filter((item) => item !== currentUrl)
        : [currentUrl, ...current].slice(0, 8),
    );
  };

  return {
    acceptDappWarning,
    browserTitle,
    connected,
    currentUrl,
    dappLinks,
    dappWarningVisible,
    draftUrl,
    favorite,
    favorites,
    goBack,
    handleWalletAction,
    hostLabel,
    inputRef,
    loading,
    message,
    mode,
    openDestination,
    openExternalSite,
    params,
    progress,
    quickLinks,
    refresh,
    resetHome,
    selectedId,
    sessionStatus,
    setDraftUrl,
    setCurrentUrl,
    setLoading,
    setMessage,
    setMode,
    setProgress,
    setSettingsOpen,
    setWebError,
    setWebCanGoBack,
    settingsOpen,
    sourceLabel,
    toggleFavorite,
    walletAddress,
    walletNetwork,
    webError,
    webViewRef,
  };
}
