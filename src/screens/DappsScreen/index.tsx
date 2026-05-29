import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  DAPP_CATEGORIES,
  DAPP_CATEGORY_LABELS,
  DAPP_RISK_LABELS,
  getEnabledDapps,
  searchDapps,
  type DappCategory,
  type DappDefinition,
  type DappRiskLevel,
} from '../../constants/dappsCatalog';
import { FEATURE_STATUS } from '../../constants/featureStatus';
import { FONT, ORBITX_COLORS, RADII, withOpacity } from '../../../constants/theme';
import { useExternalWallet } from '../../hooks/useExternalWallet';

const COLORS = {
  ...ORBITX_COLORS,
  text: ORBITX_COLORS.textPrimary,
  textSecondary: ORBITX_COLORS.textSecondary,
  textMuted: ORBITX_COLORS.textMuted,
};

type CategoryFilter = 'all' | DappCategory;

const RISK_COLORS: Record<DappRiskLevel, string> = {
  low: COLORS.green,
  medium: COLORS.warning,
  high: COLORS.red,
};

function maskAddress(address?: string | null) {
  const normalized = address?.trim() ?? '';
  if (!normalized) {
    return 'Wallet no conectada';
  }

  return `${normalized.slice(0, 6)}...${normalized.slice(-4)}`;
}

function openDapp(dapp: DappDefinition) {
  router.push({
    pathname: '/browser',
    params: {
      dappId: dapp.id,
      initialUrl: dapp.url,
      returnTo: '/dapps',
      source: 'dapp',
      title: dapp.name,
    },
  });
}

function DappCard({ dapp }: { dapp: DappDefinition }) {
  const riskColor = RISK_COLORS[dapp.riskLevel];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${dapp.name}. ${DAPP_RISK_LABELS[dapp.riskLevel]}`}
      onPress={() => openDapp(dapp)}
      style={({ pressed }) => [styles.dappCard, pressed && styles.pressed]}
    >
      <View style={styles.dappHeader}>
        <View style={styles.dappIcon}>
          <Ionicons name={dapp.icon as keyof typeof Ionicons.glyphMap} size={20} color={COLORS.purpleSoft} />
        </View>
        <View style={styles.dappTitleWrap}>
          <Text style={styles.dappName}>{dapp.name}</Text>
          <Text style={styles.dappDomain}>{dapp.officialDomain}</Text>
        </View>
        <View style={[styles.riskPill, { borderColor: withOpacity(riskColor, 0.34) }]}>
          <View style={[styles.riskDot, { backgroundColor: riskColor }]} />
          <Text style={[styles.riskText, { color: riskColor }]}>
            {DAPP_RISK_LABELS[dapp.riskLevel]}
          </Text>
        </View>
      </View>

      <Text style={styles.dappDescription}>{dapp.description}</Text>
      <View style={styles.tagRow}>
        <Text style={styles.categoryPill}>{DAPP_CATEGORY_LABELS[dapp.category]}</Text>
        <Text style={styles.chainPill}>{dapp.supportedChains.length} redes</Text>
        {dapp.requiresWallet ? <Text style={styles.walletPill}>Wallet requerida</Text> : null}
      </View>
    </Pressable>
  );
}

export default function DappsScreen() {
  const insets = useSafeAreaInsets();
  const externalWallet = useExternalWallet();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const dapps = useMemo(() => {
    const source = query.trim() ? searchDapps(query) : getEnabledDapps();
    return category === 'all' ? source : source.filter((dapp) => dapp.category === category);
  }, [category, query]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <LinearGradient colors={['#08090B', '#0A0B10', '#08090B']} style={StyleSheet.absoluteFill} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 12) + 28 }]}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/wallet-web3'))}
            style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={22} color={COLORS.text} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>DApps Hub</Text>
            <Text style={styles.headerSubtitle}>Catálogo verificado para explorar Web3 con cuidado.</Text>
          </View>
        </View>

        <View style={styles.securityBanner}>
          <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.warning} />
          <Text style={styles.securityText}>
            Abre solo DApps verificadas. QVEX nunca pedirá seed phrase ni private key.
          </Text>
        </View>

        <View style={styles.walletCard}>
          <View>
            <Text style={styles.walletLabel}>Wallet externa</Text>
            <Text style={styles.walletValue}>{maskAddress(externalWallet.address)}</Text>
          </View>
          <Text style={styles.networkLabel}>
            {externalWallet.chainLabel || 'Sin red'}
          </Text>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar DApp, categoría o red"
            placeholderTextColor={COLORS.textMuted}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {(['all', ...DAPP_CATEGORIES] as CategoryFilter[]).map((item) => {
            const active = item === category;
            return (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                style={({ pressed }) => [
                  styles.filterChip,
                  active && styles.filterChipActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {item === 'all' ? 'Todas' : DAPP_CATEGORY_LABELS[item]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {FEATURE_STATUS.web3.swapEnabled ? null : (
          <View style={styles.swapNotice}>
            <Ionicons name="swap-horizontal-outline" size={18} color={COLORS.web3Blue} />
            <Text style={styles.swapNoticeText}>
              Swap real está deshabilitado. El botón Intercambiar solo muestra información de próximamente.
            </Text>
          </View>
        )}

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>DApps verificadas</Text>
          <Text style={styles.sectionMeta}>{dapps.length} disponibles</Text>
        </View>

        {dapps.length ? (
          <View style={styles.dappList}>
            {dapps.map((dapp) => (
              <DappCard key={dapp.id} dapp={dapp} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptyBody}>Prueba otra búsqueda o categoría.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 16, paddingTop: 8, gap: 16 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] },
  header: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.surfaceElevated, 0.78),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerCopy: { flex: 1, minWidth: 0 },
  headerTitle: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 22 },
  headerSubtitle: { color: COLORS.textSecondary, fontFamily: FONT.medium, fontSize: 12, marginTop: 3 },
  securityBanner: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: withOpacity(COLORS.warning, 0.22),
    backgroundColor: withOpacity(COLORS.warning, 0.08),
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  securityText: { flex: 1, color: COLORS.textSecondary, fontFamily: FONT.medium, fontSize: 12, lineHeight: 17 },
  walletCard: {
    minHeight: 62,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: withOpacity(COLORS.surface, 0.8),
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  walletLabel: { color: COLORS.textMuted, fontFamily: FONT.medium, fontSize: 10, textTransform: 'uppercase' },
  walletValue: { color: COLORS.text, fontFamily: FONT.semibold, fontSize: 14, marginTop: 4 },
  networkLabel: { color: COLORS.purpleSoft, fontFamily: FONT.semibold, fontSize: 12 },
  searchBox: {
    minHeight: 46,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: withOpacity(COLORS.surfaceElevated, 0.74),
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: { flex: 1, color: COLORS.text, fontFamily: FONT.medium, fontSize: 14 },
  filters: { gap: 8, paddingRight: 16 },
  filterChip: {
    minHeight: 34,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: withOpacity(COLORS.surface, 0.72),
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  filterChipActive: {
    borderColor: withOpacity(COLORS.purpleSoft, 0.5),
    backgroundColor: withOpacity(COLORS.purple, 0.16),
  },
  filterText: { color: COLORS.textSecondary, fontFamily: FONT.semibold, fontSize: 12 },
  filterTextActive: { color: COLORS.text },
  swapNotice: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: withOpacity(COLORS.web3Blue, 0.18),
    backgroundColor: withOpacity(COLORS.web3Blue, 0.08),
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  swapNoticeText: { flex: 1, color: COLORS.textSecondary, fontFamily: FONT.medium, fontSize: 12, lineHeight: 16 },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 18 },
  sectionMeta: { color: COLORS.textMuted, fontFamily: FONT.medium, fontSize: 12 },
  dappList: { gap: 12 },
  dappCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: withOpacity(COLORS.surface, 0.78),
    padding: 14,
    gap: 12,
  },
  dappHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dappIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.purple, 0.15),
  },
  dappTitleWrap: { flex: 1, minWidth: 0 },
  dappName: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 16 },
  dappDomain: { color: COLORS.textMuted, fontFamily: FONT.medium, fontSize: 11, marginTop: 3 },
  riskPill: {
    minHeight: 26,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  riskDot: { width: 6, height: 6, borderRadius: 3 },
  riskText: { fontFamily: FONT.bold, fontSize: 10, textTransform: 'uppercase' },
  dappDescription: { color: COLORS.textSecondary, fontFamily: FONT.medium, fontSize: 13, lineHeight: 18 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryPill: {
    color: COLORS.text,
    fontFamily: FONT.semibold,
    fontSize: 11,
    backgroundColor: withOpacity(COLORS.purple, 0.16),
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADII.pill,
  },
  chainPill: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 11,
    backgroundColor: withOpacity(COLORS.surfaceElevated, 0.72),
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADII.pill,
  },
  walletPill: {
    color: COLORS.warning,
    fontFamily: FONT.medium,
    fontSize: 11,
    backgroundColor: withOpacity(COLORS.warning, 0.1),
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADII.pill,
  },
  emptyCard: {
    minHeight: 108,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: withOpacity(COLORS.surface, 0.74),
    justifyContent: 'center',
    padding: 16,
    gap: 5,
  },
  emptyTitle: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 16 },
  emptyBody: { color: COLORS.textSecondary, fontFamily: FONT.medium, fontSize: 12 },
});
