import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useI18n } from '../../../hooks/useI18n';
import { COLORS, styles } from './browserStyles';
import { BrowserHistorySection } from './BrowserHistorySection';
import type { BrowserLink } from './useBrowserViewModel';
import { TRENDING_TOKENS } from './useBrowserViewModel';

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
}

interface BrowserHomeProps {
  connected: boolean;
  dappLinks: BrowserLink[];
  walletAddress: string;
  walletNetwork: string;
  onOpenDestination: (input?: string | null, selected?: string) => void;
  onWalletAction: () => void;
}

export function BrowserHome({
  connected,
  dappLinks,
  onOpenDestination,
  onWalletAction,
  walletAddress,
  walletNetwork,
}: BrowserHomeProps) {
  const { t } = useI18n();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.homeContent}>
      <View style={styles.walletCard}>
        <View style={styles.walletHeader}>
          <View>
            <Text style={styles.walletTitle}>{t('browser.walletTitle')}</Text>
            <View style={styles.walletStatusRow}>
              <View style={[styles.statusDot, connected && styles.statusDotConnected]} />
              <Text style={[styles.walletStatus, connected && styles.walletStatusConnected]}>
                {connected ? t('browser.connected') : t('browser.disconnected')}
              </Text>
            </View>
          </View>
          <Pressable onPress={onWalletAction} style={({ pressed }) => [styles.walletAction, pressed && styles.pressed]}>
            <Text style={styles.walletActionText}>{connected ? t('browser.changeNetwork') : t('browser.connect')}</Text>
          </Pressable>
        </View>
        <View style={styles.walletInfoBox}>
          <View>
            <Text style={styles.walletInfoLabel}>{t('browser.address')}</Text>
            <Text style={styles.walletInfoValue}>{walletAddress}</Text>
          </View>
          <View style={styles.networkBadge}>
            <Ionicons name="radio-outline" size={14} color={COLORS.web3Blue} />
            <Text style={styles.networkBadgeText}>{walletNetwork}</Text>
          </View>
        </View>
      </View>

      <SectionHeader title={t('browser.trending')} action={t('browser.viewAll')} />
      <View style={styles.trendingGrid}>
        {TRENDING_TOKENS.map((token) => (
          <Pressable
            key={token.symbol}
            onPress={() => onOpenDestination(`https://coinmarketcap.com/currencies/${token.symbol.toLowerCase()}/`, 'coinmarketcap')}
            style={({ pressed }) => [styles.trendingCard, pressed && styles.pressed]}
          >
            <View style={styles.tokenGlyph}>
              <Text style={styles.tokenGlyphText}>{token.symbol.slice(0, 2)}</Text>
            </View>
            <Text style={[styles.tokenChange, token.positive ? styles.positive : styles.negative]}>
              {token.change}
            </Text>
            <Text style={styles.tokenSymbol}>{token.symbol}</Text>
            <Text style={styles.tokenPrice}>{token.price}</Text>
          </Pressable>
        ))}
      </View>

      <SectionHeader title={t('browser.featured')} />
      <Pressable
        onPress={() => onOpenDestination('https://coinmarketcap.com/trending-cryptocurrencies/', 'coinmarketcap')}
        style={({ pressed }) => [styles.featureCard, pressed && styles.pressed]}
      >
        <View style={styles.featureArt}>
          <View style={styles.featureLineOne} />
          <View style={styles.featureLineTwo} />
          <Ionicons name="flash-outline" size={22} color={COLORS.purpleSoft} />
        </View>
        <View style={styles.featureCopy}>
          <Text style={styles.featureTitle}>{t('browser.featureTitle')}</Text>
          <Text style={styles.featureBody}>{t('browser.featureBody')}</Text>
          <Text style={styles.featureMeta}>{t('browser.featureMeta')}</Text>
        </View>
      </Pressable>

      <SectionHeader title={t('browser.popularDapps')} />
      <View style={styles.dappList}>
        {dappLinks.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onOpenDestination(item.url, item.id)}
            style={({ pressed }) => [styles.dappRow, pressed && styles.pressed]}
          >
            <View style={styles.dappIcon}>
              <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={18} color={COLORS.purpleSoft} />
            </View>
            <View style={styles.dappCopy}>
              <Text style={styles.dappTitle}>{item.title}</Text>
              <Text style={styles.dappSubtitle} numberOfLines={1}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={COLORS.textMuted} />
          </Pressable>
        ))}
      </View>

      <SectionHeader title={t('browser.recent')} />
      <BrowserHistorySection onOpenDestination={onOpenDestination} />
    </ScrollView>
  );
}
