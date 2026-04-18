import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { RouteRedirect } from '../components/common/RouteRedirect';
import { ORBIT_BROWSER_LINKS } from '../constants/externalLinks';
import { FONT, RADII, withOpacity } from '../constants/theme';
import { useAppTheme } from '../hooks/useAppTheme';
import { useHomeNews } from '../hooks/useHomeNews';
import { useOrbitStore } from '../store/useOrbitStore';
import { useAuthStore } from '../src/store/authStore';
import { useMarketData } from '../src/hooks/useMarketData';
import { formatCurrency } from '../src/utils/formatCurrency';
import { formatPercent } from '../src/utils/formatPercent';
import { mapLegacyTokenToMarketPair } from '../src/utils/tradePairs';

type BrowserMode = 'home' | 'browse';

const QUICK_IDS = ['coinmarketcap', 'dextools', 'popcoin'] as const;
const DAPP_IDS = ['trustwallet', 'jupiter'] as const;
const TRENDING = ['WIF', 'PEPE', 'BONK', 'DOGE'] as const;

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function normalizeBrowserUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return ORBIT_BROWSER_LINKS[0].url;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[\w.-]+\.[a-z]{2,}/i.test(trimmed)) return `https://${trimmed}`;
  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
}

function hostLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./i, '');
  } catch {
    return url;
  }
}

function timeAgo(input: string) {
  const diff = Math.max(Date.now() - new Date(input).getTime(), 0);
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  return hours < 24 ? `Hace ${hours} h` : `Hace ${Math.floor(hours / 24)} d`;
}

function BottomItem({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable onPress={onPress} style={styles.bottomItem}>
      <Ionicons name={icon} size={18} color={active ? colors.primary : colors.textMuted} />
      <Text style={[styles.bottomLabel, { color: active ? colors.primary : colors.textMuted }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function BrowserScreen() {
  const { colors } = useAppTheme();
  const sessionStatus = useAuthStore((state) => state.session.status);
  const params = useLocalSearchParams<{ url?: string; title?: string }>();
  const webViewRef = useRef<WebView>(null);
  const inputRef = useRef<TextInput>(null);
  const { markets, loading: marketsLoading, loadMarkets } = useMarketData('markets');
  const legacyTokens = useOrbitStore((state) => state.tokens);
  const { items: flashItems, refresh: refreshFlash } = useHomeNews('crypto', 2);

  const defaultLink = ORBIT_BROWSER_LINKS[0];
  const quickLinks = useMemo(
    () => QUICK_IDS.map((id) => ORBIT_BROWSER_LINKS.find((item) => item.id === id)).filter(isDefined),
    [],
  );
  const dappLinks = useMemo(
    () => DAPP_IDS.map((id) => ORBIT_BROWSER_LINKS.find((item) => item.id === id)).filter(isDefined),
    [],
  );
  const initialUrl = useMemo(
    () => normalizeBrowserUrl(typeof params.url === 'string' && params.url.trim() ? params.url : defaultLink.url),
    [defaultLink.url, params.url],
  );

  const [mode, setMode] = useState<BrowserMode>(params.url ? 'browse' : 'home');
  const [selectedId, setSelectedId] = useState<string>(defaultLink.id);
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [draftUrl, setDraftUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (!markets.length) {
      void loadMarkets();
    }
  }, [loadMarkets, markets.length]);

  useEffect(() => {
    setCurrentUrl(initialUrl);
    setDraftUrl(initialUrl);
    setMode(params.url ? 'browse' : 'home');
  }, [initialUrl, params.url]);

  if (sessionStatus === 'signed_out') {
    return <RouteRedirect href="/" />;
  }

  const trendingTokens = useMemo(() => {
    const live = TRENDING.map((symbol) =>
      markets.find((item) => item.baseSymbol.toUpperCase() === symbol),
    ).filter(isDefined);

    if (live.length >= 4) {
      return live.slice(0, 4);
    }

    const fallback = legacyTokens
      .filter((token) => TRENDING.includes(token.symbol.toUpperCase() as (typeof TRENDING)[number]))
      .map(mapLegacyTokenToMarketPair);

    return [...live, ...fallback]
      .filter((pair, index, list) => list.findIndex((item) => item.baseSymbol === pair.baseSymbol) === index)
      .slice(0, 4);
  }, [legacyTokens, markets]);

  const currentFavorite = favorites.includes(currentUrl);

  const openDestination = (input: string, selected?: string) => {
    const nextUrl = normalizeBrowserUrl(input);
    setCurrentUrl(nextUrl);
    setDraftUrl(nextUrl);
    setSelectedId(selected ?? hostLabel(nextUrl));
    setMode('browse');
    setShowSettings(false);
  };

  const resetHome = () => {
    setMode('home');
    setCurrentUrl(defaultLink.url);
    setDraftUrl(defaultLink.url);
    setSelectedId(defaultLink.id);
    setShowSettings(false);
  };

  const handleRefresh = () => {
    if (mode === 'browse' && Platform.OS !== 'web') {
      webViewRef.current?.reload();
      return;
    }
    void Promise.all([loadMarkets(), refreshFlash()]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.backgroundAlt }]}>
      <StatusBar style={colors.statusBarStyle} />
      <LinearGradient colors={['#05050A', '#0A0811', '#05050A']} style={StyleSheet.absoluteFillObject} />
      <View style={[styles.orbTop, { backgroundColor: withOpacity(colors.primary, 0.1) }]} />
      <View style={[styles.orbBottom, { backgroundColor: withOpacity(colors.primary, 0.08) }]} />
      <View style={[styles.ringTop, { borderColor: withOpacity(colors.primary, 0.14) }]} />
      <View style={[styles.ringBottom, { borderColor: withOpacity(colors.primary, 0.12) }]} />

      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={[styles.browserTitle, { color: colors.textMuted }]}>ORBITX BROWSER</Text>

          <LinearGradient
            colors={[withOpacity(colors.primary, 0.18), withOpacity('#16121E', 0.98)]}
            style={styles.urlGlow}
          >
            <View
              style={[
                styles.urlBar,
                {
                  backgroundColor: withOpacity('#15111C', 0.92),
                  borderColor: withOpacity(colors.primary, 0.2),
                },
              ]}
            >
              <Ionicons name="lock-closed" size={15} color={colors.textMuted} />
              <TextInput
                ref={inputRef}
                value={draftUrl}
                onChangeText={setDraftUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                placeholder="https://coinmarketcap.com"
                placeholderTextColor={colors.textMuted}
                style={[styles.urlInput, { color: colors.text }]}
                onSubmitEditing={() => openDestination(draftUrl)}
              />
              <Pressable
                onPress={() => openDestination(draftUrl)}
                style={[styles.goButton, { backgroundColor: withOpacity(colors.primary, 0.2) }]}
              >
                <Ionicons name="arrow-forward" size={16} color={colors.text} />
              </Pressable>
            </View>
          </LinearGradient>

          <View style={styles.quickRow}>
            {quickLinks.map((item) =>
              item ? (
                <Pressable
                  key={item.id}
                  onPress={() => openDestination(item.url, item.id)}
                  style={[
                    styles.quickChip,
                    {
                      backgroundColor:
                        selectedId === item.id ? withOpacity(colors.primary, 0.12) : withOpacity('#14111B', 0.92),
                      borderColor:
                        selectedId === item.id ? withOpacity(colors.primary, 0.45) : withOpacity(colors.primary, 0.18),
                    },
                  ]}
                >
                  <Ionicons name={item.icon} size={15} color={colors.text} />
                  <Text style={[styles.quickLabel, { color: colors.text }]}>{item.title}</Text>
                </Pressable>
              ) : null,
            )}
          </View>

          <View style={styles.stage}>
            {mode === 'home' ? (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.homeContent}>
                <View style={styles.sectionRow}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Explorar</Text>
                  <Ionicons name="chevron-forward" size={15} color={colors.textMuted} />
                </View>

                <LinearGradient
                  colors={[withOpacity(colors.primary, 0.16), withOpacity('#110F18', 0.98)]}
                  style={styles.cardGlow}
                >
                  <View
                    style={[
                      styles.card,
                      {
                        backgroundColor: withOpacity('#120F19', 0.94),
                        borderColor: withOpacity(colors.primary, 0.16),
                      },
                    ]}
                  >
                    <View style={styles.cardHead}>
                      <Text style={[styles.cardTitle, { color: colors.text }]}>Tokens en tendencia</Text>
                      <Ionicons name="chevron-forward" size={15} color={colors.textMuted} />
                    </View>

                    <View style={styles.tokenGrid}>
                      {trendingTokens.map((token) => (
                        <Pressable
                          key={token.id}
                          onPress={() =>
                            openDestination(`https://coinmarketcap.com/currencies/${token.coin.coingeckoId || token.baseId}/`, 'coinmarketcap')
                          }
                          style={[
                            styles.tokenCard,
                            {
                              backgroundColor: withOpacity('#17131F', 0.92),
                              borderColor: withOpacity(colors.primary, 0.12),
                            },
                          ]}
                        >
                          <Text style={[styles.tokenName, { color: colors.text }]}>{token.baseSymbol}</Text>
                          <Text style={[styles.tokenPrice, { color: colors.textSoft }]}>{formatCurrency(token.price)}</Text>
                          <Text
                            style={[
                              styles.tokenChange,
                              { color: token.change24h >= 0 ? colors.profit : colors.loss },
                            ]}
                          >
                            {formatPercent(token.change24h)}
                          </Text>
                        </Pressable>
                      ))}
                      {!trendingTokens.length && !marketsLoading ? (
                        <View style={[styles.emptyBlock, { borderColor: withOpacity(colors.primary, 0.12) }]}>
                          <Text style={[styles.emptyTitle, { color: colors.text }]}>Mercado en actualización</Text>
                          <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
                            Estamos sincronizando los tokens más activos.
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </LinearGradient>

                <View style={styles.sectionRow}>
                  <Text style={[styles.sectionTitleSmall, { color: colors.text }]}>Explorar</Text>
                  <Ionicons name="chevron-forward" size={15} color={colors.textMuted} />
                </View>

                <LinearGradient
                  colors={[withOpacity(colors.primary, 0.14), withOpacity('#110F18', 0.98)]}
                  style={styles.cardGlow}
                >
                  <View
                    style={[
                      styles.card,
                      {
                        backgroundColor: withOpacity('#120F19', 0.94),
                        borderColor: withOpacity(colors.primary, 0.16),
                      },
                    ]}
                  >
                    <View style={styles.cardHead}>
                      <Text style={[styles.cardTitle, { color: colors.text }]}>Tokens relámpago</Text>
                      <Text style={[styles.metaText, { color: colors.textMuted }]}>
                        {flashItems[0] ? timeAgo(flashItems[0].publishedAt) : 'Ahora'}
                      </Text>
                    </View>
                    <View style={styles.flashList}>
                      {flashItems.slice(0, 2).map((item) => (
                        <Pressable key={item.id} onPress={() => openDestination(item.url)} style={styles.flashRow}>
                          <View style={[styles.flashDot, { backgroundColor: withOpacity(colors.primary, 0.14) }]}>
                            <Ionicons name="flash-outline" size={13} color={colors.warning} />
                          </View>
                          <View style={styles.flashCopy}>
                            <Text style={[styles.flashTitle, { color: colors.text }]} numberOfLines={1}>
                              {item.title}
                            </Text>
                            <Text style={[styles.flashMeta, { color: colors.textMuted }]} numberOfLines={1}>
                              {item.source} · {timeAgo(item.publishedAt)}
                            </Text>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </LinearGradient>

                <View style={styles.sectionRow}>
                  <Text style={[styles.sectionTitleSmall, { color: colors.text }]}>DApps Populares</Text>
                  <Ionicons name="chevron-forward" size={15} color={colors.textMuted} />
                </View>

                <View style={styles.dappRow}>
                  {dappLinks.map((item) =>
                    item ? (
                      <Pressable
                        key={item.id}
                        onPress={() => openDestination(item.url, item.id)}
                        style={[
                          styles.dappCard,
                          {
                            backgroundColor: withOpacity('#14111C', 0.94),
                            borderColor: withOpacity(colors.primary, 0.14),
                          },
                        ]}
                      >
                        <View style={styles.dappLeft}>
                          <Ionicons name={item.icon} size={16} color={colors.text} />
                          <Text style={[styles.dappLabel, { color: colors.text }]}>{item.title}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={15} color={colors.textMuted} />
                      </Pressable>
                    ) : null,
                  )}
                </View>
              </ScrollView>
            ) : Platform.OS === 'web' ? (
              <View style={styles.webFallback}>
                <Ionicons name="globe-outline" size={44} color={colors.textMuted} />
                <Text style={[styles.fallbackTitle, { color: colors.text }]}>Browser Web3 en desktop</Text>
                <Text style={[styles.fallbackBody, { color: colors.textMuted }]}>
                  En PC abrimos el sitio fuera de la app para mantener compatibilidad.
                </Text>
                <Pressable
                  onPress={() => void Linking.openURL(currentUrl)}
                  style={[styles.primaryAction, { borderColor: withOpacity(colors.primary, 0.28) }]}
                >
                  <Text style={[styles.primaryActionLabel, { color: colors.text }]}>Abrir sitio</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.webviewWrap}>
                <WebView
                  ref={webViewRef}
                  source={{ uri: currentUrl }}
                  onLoadStart={() => {
                    setLoading(true);
                    setProgress(0.08);
                  }}
                  onLoadProgress={({ nativeEvent }) => setProgress(nativeEvent.progress)}
                  onLoadEnd={() => {
                    setLoading(false);
                    setProgress(1);
                  }}
                  onNavigationStateChange={(event) => {
                    setCurrentUrl(event.url);
                    setDraftUrl(event.url);
                    setMode('browse');
                  }}
                  startInLoadingState
                  javaScriptEnabled
                  domStorageEnabled
                  sharedCookiesEnabled
                  thirdPartyCookiesEnabled
                  cacheEnabled
                  setSupportMultipleWindows={false}
                  originWhitelist={['*']}
                  style={styles.webview}
                />
                {loading ? (
                  <View style={[styles.loadOverlay, { backgroundColor: withOpacity('#0A0910', 0.92) }]}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.loadLabel, { color: colors.textSoft }]}>
                      Cargando {hostLabel(currentUrl)}
                    </Text>
                    <View style={[styles.track, { backgroundColor: withOpacity(colors.primary, 0.08) }]}>
                      <View style={[styles.fill, { backgroundColor: colors.primary, width: `${Math.max(progress * 100, 8)}%` }]} />
                    </View>
                  </View>
                ) : null}
              </View>
            )}
          </View>

          <View
            style={[
              styles.bottomBar,
              {
                backgroundColor: withOpacity('#0E0C14', 0.96),
                borderColor: withOpacity(colors.primary, 0.14),
              },
            ]}
          >
            <BottomItem icon="home-outline" label="Inicio" active={mode === 'home'} onPress={resetHome} />
            <BottomItem icon="refresh-outline" label="Recargar" onPress={handleRefresh} />
            <BottomItem
              icon="search-outline"
              label="Buscar"
              active={mode === 'browse'}
              onPress={() => {
                setShowSettings(false);
                inputRef.current?.focus();
              }}
            />
            <BottomItem
              icon={currentFavorite ? 'star' : 'star-outline'}
              label="Favoritos"
              active={currentFavorite}
              onPress={() =>
                setFavorites((current) =>
                  current.includes(currentUrl)
                    ? current.filter((item) => item !== currentUrl)
                    : [currentUrl, ...current].slice(0, 8),
                )
              }
            />
            <BottomItem
              icon="settings-outline"
              label="Ajustes"
              active={showSettings}
              onPress={() => setShowSettings((current) => !current)}
            />
          </View>
        </View>

        {showSettings ? (
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: withOpacity('#14111D', 0.98),
                borderColor: withOpacity(colors.primary, 0.18),
              },
            ]}
          >
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Ajustes del navegador</Text>
            <Pressable style={styles.sheetRow} onPress={() => void Linking.openURL(currentUrl)}>
              <Ionicons name="open-outline" size={15} color={colors.text} />
              <Text style={[styles.sheetRowLabel, { color: colors.text }]}>Abrir en navegador externo</Text>
            </Pressable>
            <Pressable style={styles.sheetRow} onPress={resetHome}>
              <Ionicons name="sparkles-outline" size={15} color={colors.primary} />
              <Text style={[styles.sheetRowLabel, { color: colors.text }]}>Restablecer OrbitX Browser</Text>
            </Pressable>
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 2, paddingBottom: 8 },
  browserTitle: { fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.2, marginBottom: 8 },
  urlGlow: { borderRadius: 24, padding: 1, marginBottom: 10 },
  urlBar: {
    minHeight: 52,
    borderRadius: 24,
    borderWidth: 1,
    paddingLeft: 14,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  urlInput: { flex: 1, minHeight: 42, fontFamily: FONT.medium, fontSize: 14 },
  goButton: { width: 34, height: 34, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  quickRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  quickChip: {
    flex: 1,
    minHeight: 38,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  quickLabel: { fontFamily: FONT.medium, fontSize: 12 },
  stage: { flex: 1 },
  homeContent: { gap: 12, paddingBottom: 18 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 2 },
  sectionTitle: { fontFamily: FONT.bold, fontSize: 24 },
  sectionTitleSmall: { fontFamily: FONT.bold, fontSize: 20 },
  cardGlow: { borderRadius: 22, padding: 1 },
  card: { borderRadius: 22, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14, gap: 12 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  cardTitle: { fontFamily: FONT.semibold, fontSize: 15 },
  metaText: { fontFamily: FONT.medium, fontSize: 11 },
  tokenGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tokenCard: { width: '48%', minHeight: 82, borderRadius: 18, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12, gap: 4 },
  tokenName: { fontFamily: FONT.semibold, fontSize: 14 },
  tokenPrice: { fontFamily: FONT.medium, fontSize: 11 },
  tokenChange: { fontFamily: FONT.semibold, fontSize: 12, marginTop: 'auto' },
  emptyBlock: { width: '100%', borderRadius: 18, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 14, gap: 4 },
  emptyTitle: { fontFamily: FONT.semibold, fontSize: 13 },
  emptyBody: { fontFamily: FONT.regular, fontSize: 11, lineHeight: 16 },
  flashList: { gap: 10 },
  flashRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  flashDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  flashCopy: { flex: 1, gap: 3 },
  flashTitle: { fontFamily: FONT.medium, fontSize: 13, lineHeight: 18 },
  flashMeta: { fontFamily: FONT.regular, fontSize: 11 },
  dappRow: { gap: 10, paddingBottom: 6 },
  dappCard: { minHeight: 58, borderRadius: 18, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dappLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dappLabel: { fontFamily: FONT.semibold, fontSize: 14 },
  webviewWrap: { flex: 1, overflow: 'hidden', borderRadius: 22, backgroundColor: '#09090D' },
  webview: { flex: 1 },
  loadOverlay: { position: 'absolute', top: 12, left: 12, right: 12, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, gap: 10 },
  loadLabel: { fontFamily: FONT.medium, fontSize: 12 },
  track: { height: 4, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999 },
  webFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 12 },
  fallbackTitle: { fontFamily: FONT.bold, fontSize: 24, textAlign: 'center' },
  fallbackBody: { fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  primaryAction: { minHeight: 44, borderWidth: 1, borderRadius: 999, paddingHorizontal: 18, justifyContent: 'center' },
  primaryActionLabel: { fontFamily: FONT.semibold, fontSize: 13 },
  bottomBar: {
    marginTop: 10,
    minHeight: 74,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 5 },
  bottomLabel: { fontFamily: FONT.medium, fontSize: 10 },
  sheet: { position: 'absolute', left: 16, right: 16, bottom: 98, borderRadius: 22, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14, gap: 10 },
  sheetTitle: { fontFamily: FONT.bold, fontSize: 16 },
  sheetRow: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 10 },
  sheetRowLabel: { fontFamily: FONT.medium, fontSize: 13 },
  orbTop: { position: 'absolute', top: 86, right: -32, width: 160, height: 160, borderRadius: 999 },
  orbBottom: { position: 'absolute', bottom: 120, left: -28, width: 120, height: 120, borderRadius: 999 },
  ringTop: { position: 'absolute', top: 20, right: -68, width: 250, height: 250, borderRadius: 999, borderWidth: 1 },
  ringBottom: { position: 'absolute', bottom: 46, left: -38, width: 220, height: 220, borderRadius: 999, borderWidth: 1 },
});
