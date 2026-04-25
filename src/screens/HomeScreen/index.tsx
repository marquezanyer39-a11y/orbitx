import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HomeNewsSection } from '../../../components/home/HomeNewsSection';
import { formatCurrencyByLanguage, pickLanguageText, translate } from '../../../constants/i18n';
import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useI18n } from '../../../hooks/useI18n';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useOrbitStore } from '../../../store/useOrbitStore';
import { useAuthStore } from '../../store/authStore';
import { navigateToTrade } from '../../navigation/AppNavigator';
import { useMarketData } from '../../hooks/useMarketData';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { SectionHeader } from '../../components/common/SectionHeader';
import { MarketList } from '../../components/market/MarketList';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { ExploreEntryCard } from '../../components/social/ExploreEntryCard';
import { SocialDisclaimerModal } from '../../components/social/SocialDisclaimerModal';
import { PoolHomeCard } from '../../components/rewardsPool/PoolHomeCard';
import { useSocialFeed } from '../../hooks/useSocialFeed';
import { AstraLauncherButton } from '../../components/astra/AstraLauncherButton';
import { useAstra } from '../../hooks/useAstra';
import { useMonthlyRewardsPool } from '../../hooks/useMonthlyRewardsPool';

function QuickAction({
  label,
  icon,
  onPress,
  featured = false,
  fullWidth = false,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  featured?: boolean;
  fullWidth?: boolean;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.quickAction,
        fullWidth ? styles.quickActionFullWidth : null,
        {
          backgroundColor: featured
            ? withOpacity(colors.primary, 0.12)
            : withOpacity(colors.surfaceElevated, 0.2),
          borderColor: featured
            ? withOpacity(colors.primary, 0.24)
            : withOpacity(colors.borderStrong, 0.18),
        },
      ]}
    >
      <View
        style={[
          styles.quickActionIconShell,
          {
            backgroundColor: featured
              ? withOpacity(colors.primary, 0.12)
              : withOpacity(colors.text, 0.02),
            borderColor: featured
              ? withOpacity(colors.primary, 0.24)
              : withOpacity(colors.borderStrong, 0.12),
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={15}
          color={featured ? colors.primary : colors.textSoft}
        />
      </View>
      <Text style={[styles.quickActionLabel, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

function MarketActionButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.marketActionButton}>
      <Text style={styles.marketActionLabel}>{label}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const profile = useAuthStore((state) => state.profile);
  const legacyTokens = useOrbitStore((state) => state.tokens);
  const { homeMarkets, loading, error, loadHomeMarkets } = useMarketData('home');
  const { disclaimerAccepted, acceptDisclaimer } = useSocialFeed();
  const { openAstra, openAstraWithQuestion, language } = useAstra();
  const { t } = useI18n();
  const rewardsPool = useMonthlyRewardsPool();
  const bot = useOrbitStore((state) => state.bot);
  const tokens = useOrbitStore((state) => state.tokens);
  const [showSocialDisclaimer, setShowSocialDisclaimer] = useState(false);

  const firstName = profile.name.split(' ')[0] || 'OrbitX';
  const liveTotal = homeMarkets.reduce((sum, item) => sum + item.price, 0);
  const selectedBotToken = tokens.find((token) => token.id === bot.selectedTokenId);
  const greetingPrefix =
    language === 'es'
      ? 'Hola'
      : language === 'pt'
        ? 'Olá'
        : language === 'zh-Hans'
          ? '你好'
          : language === 'hi'
            ? 'नमस्ते'
            : language === 'ru'
              ? 'Привет'
              : language === 'ar'
                ? 'مرحبًا'
                : language === 'id'
                  ? 'Halo'
                  : 'Hello';
  const tradeLabel =
    language === 'es'
      ? 'Operar'
      : language === 'pt'
        ? 'Operar'
        : language === 'zh-Hans'
          ? '交易'
          : language === 'hi'
            ? 'ट्रेड'
            : language === 'ru'
              ? 'Торговать'
              : language === 'ar'
                ? 'تداول'
                : language === 'id'
                  ? 'Trade'
                  : 'Trade';
  const marketsLabel =
    language === 'es'
      ? 'Mercados'
      : language === 'pt'
        ? 'Mercados'
        : language === 'zh-Hans'
          ? '市场'
          : language === 'hi'
            ? 'बाज़ार'
            : language === 'ru'
              ? 'Рынки'
              : language === 'ar'
                ? 'الأسواق'
                : language === 'id'
                  ? 'Pasar'
                  : 'Markets';
  const portfolioLabel =
    language === 'es'
      ? 'Balance total'
      : language === 'pt'
        ? 'Saldo total'
        : language === 'zh-Hans'
          ? '总资产'
          : language === 'hi'
            ? 'कुल बैलेंस'
            : language === 'ru'
              ? 'Общий баланс'
              : language === 'ar'
                ? 'إجمالي الرصيد'
                : language === 'id'
                  ? 'Saldo total'
                  : 'Total balance';
  const homeSurfaceTitle =
    language === 'es'
      ? 'Inicio'
      : language === 'pt'
        ? 'Início'
        : language === 'zh-Hans'
          ? '首页'
          : language === 'hi'
            ? 'होम'
            : language === 'ru'
              ? 'Главная'
              : language === 'ar'
                ? 'الرئيسية'
                : language === 'id'
                  ? 'Beranda'
                  : 'Home';
  const botDiagnosisLabel =
    language === 'es'
      ? 'Bot Trader'
      : language === 'pt'
        ? 'Bot Trader'
        : 'Bot Trader';
  const greetingPrefixText = pickLanguageText(
    language,
    {
      en: 'Hello',
      es: 'Hola',
      pt: 'Ola',
      'zh-Hans': '\u4f60\u597d',
      hi: '\u0928\u092e\u0938\u094d\u0924\u0947',
      ru: '\u041f\u0440\u0438\u0432\u0435\u0442',
      ar: '\u0645\u0631\u062d\u0628\u0627',
      id: 'Halo',
    },
    'en',
  );
  const tradeLabelText = pickLanguageText(
    language,
    {
      en: 'Trade',
      es: 'Operar',
      pt: 'Operar',
      'zh-Hans': '\u4ea4\u6613',
      hi: '\u091f\u094d\u0930\u0947\u0921',
      ru: '\u0422\u043e\u0440\u0433\u043e\u0432\u043b\u044f',
      ar: '\u0627\u0644\u062a\u062f\u0627\u0648\u0644',
      id: 'Trade',
    },
    'en',
  );
  const marketsLabelText = pickLanguageText(
    language,
    {
      en: 'Markets',
      es: 'Mercados',
      pt: 'Mercados',
      'zh-Hans': '\u5e02\u573a',
      hi: '\u092c\u093e\u091c\u093e\u0930',
      ru: '\u0420\u044b\u043d\u043a\u0438',
      ar: '\u0627\u0644\u0623\u0633\u0648\u0627\u0642',
      id: 'Pasar',
    },
    'en',
  );
  const portfolioLabelText = pickLanguageText(
    language,
    {
      en: 'Total balance',
      es: 'Balance total',
      pt: 'Saldo total',
      'zh-Hans': '\u603b\u8d44\u4ea7',
      hi: '\u0915\u0941\u0932 \u092c\u0948\u0932\u0947\u0902\u0938',
      ru: '\u041e\u0431\u0449\u0438\u0439 \u0431\u0430\u043b\u0430\u043d\u0441',
      ar: '\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0631\u0635\u064a\u062f',
      id: 'Saldo total',
    },
    'en',
  );
  const homeSurfaceTitleText = pickLanguageText(
    language,
    {
      en: 'Home',
      es: 'Inicio',
      pt: 'Inicio',
      'zh-Hans': '\u9996\u9875',
      hi: '\u0939\u094b\u092e',
      ru: '\u0413\u043b\u0430\u0432\u043d\u0430\u044f',
      ar: '\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629',
      id: 'Beranda',
    },
    'en',
  );

  const openExplore = () => {
    if (disclaimerAccepted) {
      router.push('/social');
      return;
    }

    setShowSocialDisclaimer(true);
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content} backgroundMode="default">
      <View style={[styles.hero, { borderBottomColor: withOpacity(colors.border, 0.72) }]}>
        <View style={styles.heroHeader}>
          <View style={styles.heroCopy}>
            <Text style={[styles.greeting, { color: colors.text }]}>
              {greetingPrefixText}, {firstName}
            </Text>
            <Text style={[styles.subcopy, { color: colors.textMuted }]}>
              {t('home.heroSubtitle')}
            </Text>
          </View>

          <View
            style={[
            styles.headerActionWrap,
            {
              backgroundColor: withOpacity(colors.surfaceElevated, 0.26),
              borderColor: withOpacity(colors.borderStrong, 0.16),
            },
          ]}
        >
            <AstraLauncherButton
              size={48}
              onPress={() =>
                openAstra({
                  surface: 'home',
                  surfaceTitle: homeSurfaceTitleText,
                  summary: error
                    ? `${t('errors.astraSummary')} ${error}`
                    : loading
                      ? t('home.updatingMarket')
                      : t('home.referenceBalanceBody'),
                })
              }
            />
          </View>
        </View>

        <View style={styles.balanceBlock}>
          <Text style={[styles.balanceLabel, { color: colors.textMuted }]}>{portfolioLabelText}</Text>
          <Text style={[styles.balanceValue, { color: colors.text }]}>
            {homeMarkets.length
              ? formatCurrencyByLanguage(language, liveTotal, 'USD')
              : t('home.updatingMarket')}
          </Text>
          <Text style={[styles.balanceBody, { color: colors.textMuted }]}>
            {t('home.referenceBalanceBody')}
          </Text>
        </View>

        <View style={styles.poolCardSlot}>
          <PoolHomeCard
            copy={rewardsPool.copy}
            currentUsdCents={rewardsPool.snapshot.totalPoolUsdCents}
            targetUsdCents={rewardsPool.snapshot.pool.targetUsdCents}
            timeLabel={rewardsPool.countdownLabel}
            status={rewardsPool.snapshot.status}
            userPosition={rewardsPool.currentUserDisplayRow?.position}
            estimatedRewardCents={rewardsPool.currentUserDisplayResult?.totalRewardCents ?? null}
            hasParticipation={Boolean(rewardsPool.snapshot.currentUserParticipation)}
            onPressCard={() => router.push('/pool')}
            onPressCta={() => {
              if (
                rewardsPool.snapshot.status !== 'open' ||
                rewardsPool.snapshot.currentUserParticipation
              ) {
                router.push('/pool');
                return;
              }

              router.push({
                pathname: '/pool',
                params: { participate: '1' },
              });
            }}
          />
        </View>

        <View style={styles.quickRow}>
          <QuickAction
            label={tradeLabelText}
            icon="swap-horizontal"
            onPress={() => navigateToTrade(router)}
          />
          <QuickAction
            label={marketsLabelText}
            icon="stats-chart"
            onPress={() => router.push('/(tabs)/market')}
          />
          <QuickAction
            label={translate(language, 'common.wallet')}
            icon="wallet"
            onPress={() => router.push('/(tabs)/wallet')}
          />
          <QuickAction
            label={translate(language, 'launchpad.title')}
            icon="rocket"
            onPress={() => router.push('/create-token')}
          />
          <QuickAction
            label={botDiagnosisLabel}
            icon="analytics-outline"
            featured
            fullWidth
            onPress={() => router.push('/bot')}
          />
        </View>

        <ExploreEntryCard onPress={openExplore} />
      </View>

      <View style={styles.section}>
        <SectionHeader
          title={t('home.marketSectionTitle')}
          subtitle={t('home.marketSectionSubtitle')}
          rightSlot={
            <MarketActionButton
              label={t('home.tradeNow')}
              onPress={() => navigateToTrade(router)}
            />
          }
        />

        {loading ? (
          <LoadingState
            title={t('home.marketLoadingTitle')}
            body={t('home.marketLoadingBody')}
          />
        ) : error ? (
          <ErrorState
            title={t('home.marketSectionTitle')}
            body={error}
            onRetry={() => void loadHomeMarkets()}
          />
        ) : (
          <MarketList
            pairs={homeMarkets.slice(0, 5)}
            onSelectPair={(pair) => navigateToTrade(router, { pairId: pair.id })}
          />
        )}
      </View>

      <HomeNewsSection
        tokens={legacyTokens}
        onOpenToken={(tokenId) => router.push(`/token/${tokenId}`)}
      />

      <SocialDisclaimerModal
        visible={showSocialDisclaimer}
        onAccept={() => {
          acceptDisclaimer();
          setShowSocialDisclaimer(false);
          router.push('/social');
        }}
        onClose={() => setShowSocialDisclaimer(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
  },
  hero: {
    gap: 16,
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  heroCopy: {
    flex: 1,
    gap: 6,
    paddingTop: 2,
  },
  greeting: {
    fontFamily: FONT.bold,
    fontSize: 28,
    lineHeight: 32,
  },
  subcopy: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
    maxWidth: '96%',
  },
  headerActionWrap: {
    width: 56,
    height: 56,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceBlock: {
    gap: 6,
    paddingBottom: 2,
  },
  balanceLabel: {
    fontFamily: FONT.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceValue: {
    fontFamily: FONT.bold,
    fontSize: 36,
    lineHeight: 40,
  },
  balanceBody: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  poolCardSlot: {
    paddingTop: 2,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAction: {
    minWidth: '48.6%',
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  quickActionFullWidth: {
    minWidth: '100%',
  },
  quickActionIconShell: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  section: {
    gap: 14,
  },
  marketActionButton: {
    minHeight: 40,
    minWidth: 114,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: withOpacity('#B8FCFF', 0.4),
    backgroundColor: '#1FE6FF',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marketActionLabel: {
    color: '#062833',
    fontFamily: FONT.bold,
    fontSize: 13,
  },
});
