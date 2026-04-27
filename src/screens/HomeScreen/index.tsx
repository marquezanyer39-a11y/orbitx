import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AstraRadarStrip } from '../../../components/home/AstraRadarStrip';
import { BalanceHero } from '../../../components/home/BalanceHero';
import { HomeHeader } from '../../../components/home/HomeHeader';
import { LiveMarketSection } from '../../../components/home/LiveMarketSection';
import { MainShortcuts } from '../../../components/home/MainShortcuts';
import { NewsSection, type HomeNewsCategory } from '../../../components/home/NewsSection';
import { QuickActions } from '../../../components/home/QuickActions';
import { RewardsPoolCard } from '../../../components/home/RewardsPoolCard';
import { formatRelativeTimeByLanguage } from '../../../constants/i18n';
import { useAstra } from '../../hooks/useAstra';
import { useLiveMarkets } from '../../hooks/useLiveMarkets';
import { useNewsFeed } from '../../hooks/useNewsFeed';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { useRewardsPool } from '../../hooks/useRewardsPool';
import { navigateToTrade, buildPairSelectorHref, buildReceiveHref, buildSendHref } from '../../navigation/AppNavigator';
import { useAuthStore } from '../../store/authStore';
import { useWalletStore } from '../../store/walletStore';
import { ScreenContainer } from '../../components/common/ScreenContainer';

function buildRadarInsight(symbol: string, change24h: number) {
  if (change24h >= 2.5) {
    return `${symbol} mantiene impulso alcista y puede seguir liderando el flujo comprador.`;
  }

  if (change24h <= -2.5) {
    return `${symbol} entra en zona de tension y puede dejar una oportunidad de rebote.`;
  }

  return `${symbol} cerca de zona de rebote.`;
}

export default function HomeScreen() {
  const profile = useAuthStore((state) => state.profile);
  const selectedNetwork = useWalletStore((state) => state.selectedNetwork);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [activeNewsCategory, setActiveNewsCategory] = useState<HomeNewsCategory>('crypto');

  const { openAstraWithQuestion, openAstra } = useAstra();
  const portfolio = usePortfolioData();
  const { items: liveMarkets, error: marketError, refresh: refreshMarkets } = useLiveMarkets();
  const rewardsPool = useRewardsPool();
  const news = useNewsFeed(activeNewsCategory);

  const firstMarket = liveMarkets[0];
  const rewardAmountParts = rewardsPool.amountLabel.split(' / ');
  const currentPoolAmount = rewardAmountParts[0] ?? '$0';
  const targetPoolAmount = rewardAmountParts[1] ? `/${rewardAmountParts[1]}` : '/$0';

  const astraInsight = useMemo(
    () => buildRadarInsight(firstMarket?.baseSymbol ?? 'BTC', firstMarket?.change24h ?? 0),
    [firstMarket?.baseSymbol, firstMarket?.change24h],
  );

  const featuredNews = news.featuredItem
    ? {
        id: news.featuredItem.id,
        title: news.featuredItem.title,
        sourceLabel: (news.featuredItem.source || 'Crypto Hoy').toUpperCase(),
        timeLabel: formatRelativeTimeByLanguage('es', news.featuredItem.publishedAt),
        image: news.featuredItem.image,
      }
    : null;

  const marketRows = liveMarkets.map((market) => ({
    id: market.id,
    pairLabel: market.symbol,
    priceLabel:
      market.price >= 1000
        ? `$${market.price.toLocaleString('es-419', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : `$${market.price.toLocaleString('es-419', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`,
    changeLabel: `${market.change24h >= 0 ? '+' : ''}${market.change24h.toFixed(2)}%`,
    positive: market.change24h >= 0,
    sparkline: market.sparkline,
    image: market.image,
    onPress: () => navigateToTrade(router, { pairId: market.id }),
  }));

  const homeContext = useMemo(
    () => ({
      surface: 'home' as const,
      screenName: 'Inicio',
      summary: `Balance ${portfolio.totalBalanceLabel}. ${marketRows[0]?.pairLabel ?? 'BTC/USDT'} ${marketRows[0]?.changeLabel ?? ''}. ${astraInsight}`,
      currentTask: 'home_overview',
      labels: {
        balanceLabel: portfolio.totalBalanceLabel,
        rewardsLabel: rewardsPool.amountLabel,
        leadPairLabel: marketRows[0]?.pairLabel ?? 'BTC/USDT',
      },
    }),
    [astraInsight, marketRows, portfolio.totalBalanceLabel, rewardsPool.amountLabel],
  );

  const quickActions = [
    {
      key: 'depositar',
      label: 'Depositar',
      icon: 'arrow-down-outline' as const,
      onPress: () => router.push('/ramp/flow'),
    },
    {
      key: 'comprar',
      label: 'Comprar',
      icon: 'add-circle-outline' as const,
      onPress: () => router.push('/convert'),
    },
    {
      key: 'enviar',
      label: 'Enviar',
      icon: 'arrow-up-outline' as const,
      onPress: () => router.push(buildSendHref(selectedNetwork)),
    },
    {
      key: 'recibir',
      label: 'Recibir',
      icon: 'download-outline' as const,
      onPress: () => router.push(buildReceiveHref(selectedNetwork)),
    },
  ];

  const mainShortcuts = [
    {
      key: 'operar',
      label: 'Operar',
      icon: 'flash-outline' as const,
      onPress: () => navigateToTrade(router),
    },
    {
      key: 'mercados',
      label: 'Mercados',
      icon: 'bar-chart-outline' as const,
      onPress: () => router.push('/market'),
    },
    {
      key: 'billetera',
      label: 'Billetera',
      icon: 'wallet-outline' as const,
      onPress: () => router.push('/wallet'),
    },
    {
      key: 'crear-token',
      label: 'Crear token',
      icon: 'leaf-outline' as const,
      onPress: () => router.push('/create-token'),
    },
  ];

  return (
    <ScreenContainer contentContainerStyle={styles.content} backgroundMode="plain">
      <HomeHeader
        avatarLabel={profile.avatar}
        avatarUri={profile.avatarUri}
        onProfilePress={() => router.push('/profile')}
        onSearchPress={() => router.push(buildPairSelectorHref())}
        onNotificationsPress={() => router.push('/notifications')}
        onAstraPress={() => openAstra(homeContext)}
        onProPress={() => router.push('/profile')}
      />

      <View style={styles.heroStack}>
        <BalanceHero
          amountLabel={portfolio.totalBalanceLabel}
          deltaLabel={portfolio.changeLabel}
          positive={portfolio.changePct >= 0}
          hidden={balanceHidden}
          series={portfolio.series}
          loading={portfolio.loading}
          cacheLabel={portfolio.cacheLabel}
          onToggleVisibility={() => setBalanceHidden((value) => !value)}
          onViewAnalysis={() =>
            void openAstraWithQuestion(
              homeContext,
              'Analiza mi balance, el mercado actual y dime la mejor oportunidad de hoy.',
            )
          }
        />
        <QuickActions items={quickActions} />
      </View>

      <MainShortcuts items={mainShortcuts} />

      <RewardsPoolCard
        currentAmountLabel={currentPoolAmount}
        targetAmountLabel={targetPoolAmount}
        progressPercent={rewardsPool.snapshot.progressPercent}
        progressLabel={rewardsPool.progressLabel}
        remainingLabel={rewardsPool.countdownLabel}
        onParticipate={() => router.push('/pool')}
      />

      <LiveMarketSection
        items={marketRows}
        loading={portfolio.loading}
        error={marketError}
        onRetry={refreshMarkets}
        onViewAll={() => router.push('/market')}
      />

      <AstraRadarStrip
        insight={astraInsight}
        onPress={() =>
          void openAstraWithQuestion(
            {
              ...homeContext,
              currentTask: 'market_insight',
            },
            'Dame una lectura breve del mercado y la mejor oportunidad visible ahora mismo.',
          )
        }
      />

      <NewsSection
        categories={news.categories}
        activeCategory={activeNewsCategory}
        onSelectCategory={setActiveNewsCategory}
        item={featuredNews}
        loading={news.loading}
        helperLabel={
          news.loading
            ? 'Actualizando noticias...'
            : news.fromCache
              ? 'Mostrando el ultimo titular disponible'
              : null
        }
        onOpenFeatured={() => {
          if (!news.featuredItem) {
            return;
          }

          router.push({
            pathname: '/browser',
            params: {
              url: news.featuredItem.url,
              title: 'Noticias',
            },
          });
        }}
        onViewAll={() => router.push('/browser')}
        onRefresh={() => void news.refresh()}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 118,
    gap: 16,
    backgroundColor: '#0B0B0F',
  },
  heroStack: {
    gap: 0,
  },
});
