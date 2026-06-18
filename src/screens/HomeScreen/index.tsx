import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AstraRadarStrip } from '../../../components/home/AstraRadarStrip';
import { BalanceHero } from '../../../components/home/BalanceHero';
import { HomeHeader } from '../../../components/home/HomeHeader';
import { LiveMarketSection } from '../../../components/home/LiveMarketSection';
import { MainShortcuts } from '../../../components/home/MainShortcuts';
import { NewsSection, type HomeNewsCategory } from '../../../components/home/NewsSection';
import { PromoBanner } from '../../../components/home/PromoBanner';
import { QuickActions } from '../../../components/home/QuickActions';
import { RewardsPoolCard } from '../../../components/home/RewardsPoolCard';
import { SocialEntryStrip } from '../../../components/home/SocialEntryStrip';
import { AstraLocalInsightCard } from '../../components/astra/AstraLocalInsightCard';
import {
  ORBITX_THEME,
  SCREEN_PADDING,
  SCREEN_PADDING_SMALL,
  SECTION_GAP,
  getHomeLayoutMetrics,
} from '../../../components/home/orbitxTheme';
import { formatRelativeTimeByLanguage } from '../../../constants/i18n';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { useAstra } from '../../hooks/useAstra';
import { useLiveMarkets } from '../../hooks/useLiveMarkets';
import { useNewsFeed } from '../../hooks/useNewsFeed';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { useRewardsPool } from '../../hooks/useRewardsPool';
import { buildPairSelectorHref, navigateToTrade } from '../../navigation/AppNavigator';
import {
  SAFE_MODE_BLOCK_MESSAGE,
  isSensitiveRoutesBlockedInStableMode,
  SENSITIVE_ROUTE_BLOCK_MESSAGE,
} from '../../config/runtimeMode';
import { buildHomeLocalInsight } from '../../services/astra/astraLocalInsights';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';

function buildRadarInsight(symbol: string, change24h: number) {
  if (change24h >= 2.5) {
    return `${symbol} mantiene impulso alcista.`;
  }

  if (change24h <= -2.5) {
    return `${symbol} entra en zona de tensión.`;
  }

  return `${symbol} cerca de zona de rebote.`;
}

export default function HomeScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const { isSmallPhone } = getHomeLayoutMetrics(screenWidth);
  const horizontalPadding = isSmallPhone ? SCREEN_PADDING_SMALL : SCREEN_PADDING;
  const contentWidth = Math.max(screenWidth - horizontalPadding * 2, 0);
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((state) => state.profile);
  const showToast = useUiStore((state) => state.showToast);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [activeNewsCategory, setActiveNewsCategory] = useState<HomeNewsCategory>('crypto');
  const bottomTabHeight = 84 + insets.bottom;

  const { openAstra, openAstraWithQuestion } = useAstra();
  const portfolio = usePortfolioData();
  const {
    items: liveMarkets,
    error: marketError,
    loading: marketsLoading,
    usingFallback: marketsUsingFallback,
    refresh: refreshMarkets,
  } = useLiveMarkets();
  const rewardsPool = useRewardsPool();
  const news = useNewsFeed(activeNewsCategory);
  const sensitiveRoutesBlocked = isSensitiveRoutesBlockedInStableMode();

  const currentPoolAmount = rewardsPool.amountLabel.split(' / ')[0] ?? '$0';
  const targetPoolAmount = rewardsPool.amountLabel.split(' / ')[1]
    ? `/ ${rewardsPool.amountLabel.split(' / ')[1]}`
    : '/ $0';
  const firstMarket = liveMarkets[0];
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
    assetLabel: (market.coin?.name ?? market.baseSymbol).toUpperCase(),
    priceLabel:
      market.price >= 1000
        ? `$${market.price.toLocaleString('es-419', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        : `$${market.price.toLocaleString('es-419', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          })}`,
    changeLabel: `${market.change24h >= 0 ? '+' : ''}${market.change24h.toFixed(2)}%`,
    positive: market.change24h >= 0,
    sparkline: market.sparkline,
    image: market.image,
    onPress: () =>
      sensitiveRoutesBlocked
        ? showToast(SENSITIVE_ROUTE_BLOCK_MESSAGE, 'info')
        : navigateToTrade(router, { pairId: market.id }),
  }));
  const homeAstraInsight = useMemo(
    () =>
      buildHomeLocalInsight({
        balanceLabel: portfolio.totalBalanceLabel,
        leadPairLabel: marketRows[0]?.pairLabel,
        leadPairChangeLabel: marketRows[0]?.changeLabel,
        rewardsLabel: rewardsPool.amountLabel,
      }),
    [marketRows, portfolio.totalBalanceLabel, rewardsPool.amountLabel],
  );

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
      onPress: () => showToast(SAFE_MODE_BLOCK_MESSAGE, 'info'),
    },
    {
      key: 'comprar',
      label: 'Comprar',
      icon: 'cart-outline' as const,
      onPress: () => router.push('/spot'),
    },
    {
      key: 'enviar',
      label: 'Enviar',
      icon: 'send-outline' as const,
      onPress: () => showToast(SAFE_MODE_BLOCK_MESSAGE, 'info'),
    },
    {
      key: 'recibir',
      label: 'Recibir',
      icon: 'download-outline' as const,
      onPress: () => showToast(SAFE_MODE_BLOCK_MESSAGE, 'info'),
    },
  ];

  const mainShortcuts = [
    {
      key: 'operar',
      label: 'Operar',
      icon: 'flash-outline' as const,
      onPress: () => router.push('/spot'),
    },
    {
      key: 'mercados',
      label: 'Mercados',
      icon: 'analytics-outline' as const,
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
      icon: 'cube-outline' as const,
      onPress: () => showToast(SENSITIVE_ROUTE_BLOCK_MESSAGE, 'info'),
    },
  ];
  const visibleMainShortcuts = sensitiveRoutesBlocked
    ? mainShortcuts.filter((item) => item.key !== 'crear-token')
    : mainShortcuts;
  const visibleQuickActions = quickActions;

  function openHomeAstraLocal() {
    void openAstraWithQuestion(homeContext, homeAstraInsight.question);
  }

  return (
    <ScreenContainer
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom: bottomTabHeight + 48,
        },
      ]}
      backgroundMode="plain"
    >
      <HomeHeader
        avatarLabel={profile.avatar}
        avatarUri={profile.avatarUri}
        isSmallPhone={isSmallPhone}
        onProfilePress={() => router.push('/profile')}
        onSearchPress={() => router.push(buildPairSelectorHref())}
      />

      <View style={[styles.stack, { paddingHorizontal: horizontalPadding }]}>
        <BalanceHero
          amountLabel={portfolio.totalBalanceLabel}
          deltaLabel={portfolio.changeLabel}
          positive={portfolio.changePct >= 0}
          hidden={balanceHidden}
          series={portfolio.series}
          loading={portfolio.loading}
          cacheLabel={portfolio.cacheLabel}
          contentWidth={contentWidth}
          isSmallPhone={isSmallPhone}
          onToggleVisibility={() => setBalanceHidden((value) => !value)}
          onViewAnalysis={() =>
            void openAstraWithQuestion(
              homeContext,
              'Analiza mi balance y el mercado de hoy en una lectura breve.',
            )
          }
        />

        {visibleQuickActions.length ? (
          <QuickActions items={visibleQuickActions} isSmallPhone={isSmallPhone} />
        ) : null}

        <MainShortcuts items={visibleMainShortcuts} isSmallPhone={isSmallPhone} />

        <PromoBanner isSmallPhone={isSmallPhone} onPress={() => router.push('/pool')} />

        <RewardsPoolCard
          currentAmountLabel={currentPoolAmount}
          targetAmountLabel={targetPoolAmount}
          progressPercent={rewardsPool.snapshot.progressPercent}
          progressLabel={rewardsPool.progressLabel}
          remainingLabel={rewardsPool.countdownLabel}
          contentWidth={contentWidth}
          isSmallPhone={isSmallPhone}
          onParticipate={() => router.push('/pool')}
        />

        <LiveMarketSection
          items={marketRows}
          loading={marketsLoading}
          error={marketError}
          contentWidth={contentWidth}
          isSmallPhone={isSmallPhone}
          usingFallback={marketsUsingFallback}
          onRetry={refreshMarkets}
          onViewAll={() => router.push('/market')}
        />

        <AstraRadarStrip
          insight={astraInsight}
          isSmallPhone={isSmallPhone}
          onPress={() =>
            void openAstra({
              ...homeContext,
              currentTask: 'market_radar',
            })
          }
        />

        <AstraLocalInsightCard
          insight={homeAstraInsight}
          onPrimaryPress={openHomeAstraLocal}
          onSecondaryPress={() => router.push('/dev/astra-simulation')}
        />

        <SocialEntryStrip isSmallPhone={isSmallPhone} onPress={() => router.push('/social')} />

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
                ? 'Mostrando el último titular disponible'
                : null
          }
          isSmallPhone={isSmallPhone}
          onOpenFeatured={() => {
            if (!news.featuredItem) {
              return;
            }
            if (sensitiveRoutesBlocked) {
              showToast(SENSITIVE_ROUTE_BLOCK_MESSAGE, 'info');
              return;
            }

            router.push({
              pathname: '/browser',
              params: {
                initialUrl: news.featuredItem.url,
                title: news.featuredItem.title,
                source: 'news',
              },
            });
          }}
          onViewAll={() =>
            sensitiveRoutesBlocked
              ? showToast(SENSITIVE_ROUTE_BLOCK_MESSAGE, 'info')
              : router.push({
                  pathname: '/browser',
                  params: { source: 'news', title: 'Noticias' },
                })
          }
          onRefresh={() => void news.refresh()}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: ORBITX_THEME.colors.background,
    paddingHorizontal: 0,
    paddingTop: 0,
    gap: 0,
  },
  stack: {
    paddingTop: 5,
    gap: SECTION_GAP,
  },
});
