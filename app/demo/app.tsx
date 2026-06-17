import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../constants/theme';
import { useUiStore } from '../../src/store/uiStore';
import {
  DEMO_BLOCKED_ACTION_LABEL,
  QVEX_DEMO_MARKETS,
  type DemoMarketItem,
} from '../../src/demo/qvexDemoData';
import { DemoAstraScreen } from '../../src/demo/screens/DemoAstraScreen';
import { DemoHomeScreen } from '../../src/demo/screens/DemoHomeScreen';
import { DemoMarketsScreen } from '../../src/demo/screens/DemoMarketsScreen';
import { DemoTradeScreen } from '../../src/demo/screens/DemoTradeScreen';
import { DemoWalletScreen } from '../../src/demo/screens/DemoWalletScreen';

type DemoTabId = 'home' | 'markets' | 'wallet' | 'trade' | 'astra';

const DEMO_TABS: Array<{ id: DemoTabId; label: string }> = [
  { id: 'home', label: 'Inicio' },
  { id: 'markets', label: 'Mercados' },
  { id: 'wallet', label: 'Wallet Demo' },
  { id: 'trade', label: 'Trade Demo' },
  { id: 'astra', label: 'ASTRA' },
];

export default function DemoAppScreen() {
  const showToast = useUiStore((state) => state.showToast);
  const [activeTab, setActiveTab] = useState<DemoTabId>('home');
  const [selectedMarketId, setSelectedMarketId] = useState(QVEX_DEMO_MARKETS[0]?.id ?? 'btc-usdt');

  const selectedMarket = useMemo<DemoMarketItem>(
    () =>
      QVEX_DEMO_MARKETS.find((item) => item.id === selectedMarketId) ??
      QVEX_DEMO_MARKETS[0],
    [selectedMarketId],
  );

  const handleBlockedAction = (message = DEMO_BLOCKED_ACTION_LABEL) => {
    showToast(message, 'info');
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <DemoHomeScreen
            onOpenWallet={() => setActiveTab('wallet')}
            onOpenTrade={() => setActiveTab('trade')}
            onOpenAstra={() => setActiveTab('astra')}
          />
        );
      case 'markets':
        return (
          <DemoMarketsScreen
            selectedMarketId={selectedMarketId}
            onSelectMarket={(marketId) => {
              setSelectedMarketId(marketId);
              setActiveTab('trade');
            }}
          />
        );
      case 'wallet':
        return <DemoWalletScreen onBlockedAction={handleBlockedAction} />;
      case 'trade':
        return <DemoTradeScreen market={selectedMarket} onBlockedAction={handleBlockedAction} />;
      case 'astra':
        return (
          <DemoAstraScreen
            onOpenSimulation={() => router.push('/dev/astra-simulation')}
            onOpenAstraLayer={() => router.push('/demo/astra')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>QVEX Secure Demo</Text>
          <Text style={styles.title}>Explora la app completa con datos simulados</Text>
        </View>
        <Pressable onPress={() => router.back()} style={styles.exitButton}>
          <Text style={styles.exitLabel}>Salir</Text>
        </Pressable>
      </View>

      <View style={styles.tabBar}>
        {DEMO_TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[styles.tabChip, active ? styles.tabChipActive : null]}
            >
              <Text style={[styles.tabChipLabel, active ? styles.tabChipLabelActive : null]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {renderActiveScreen()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  exitButton: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  exitLabel: {
    color: '#F8FBFF',
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  eyebrow: {
    color: '#00E5FF',
    fontFamily: FONT.medium,
    fontSize: 12,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#08090B',
    borderBottomColor: 'rgba(255,255,255,0.06)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 14,
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  screen: {
    backgroundColor: '#08090B',
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: '#08090B',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  tabChip: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tabChipActive: {
    backgroundColor: 'rgba(0,229,255,0.16)',
    borderColor: 'rgba(0,229,255,0.24)',
  },
  tabChipLabel: {
    color: '#8EA0B8',
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  tabChipLabelActive: {
    color: '#F8FBFF',
  },
  title: {
    color: '#F8FBFF',
    fontFamily: FONT.semibold,
    fontSize: 20,
    lineHeight: 26,
    marginTop: 4,
    maxWidth: 280,
  },
});
