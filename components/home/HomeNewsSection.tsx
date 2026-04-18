import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { formatRelativeTimeByLanguage } from '../../constants/i18n';
import { FONT, RADII, withOpacity } from '../../constants/theme';
import { useHomeNews } from '../../hooks/useHomeNews';
import { useI18n } from '../../hooks/useI18n';
import { useAppTheme } from '../../hooks/useAppTheme';
import {
  getNewsCategoryLabel,
  getNewsProviderLabel,
  getNewsSentimentLabel,
} from '../../services/news/helpers';
import { ORBIT_NEWS_REFRESH_MS } from '../../services/news/newsService';
import type { OrbitNewsCategory } from '../../services/news/types';
import type { MarketToken } from '../../types';
import { SectionHeader } from '../common/SectionHeader';
import { NewsStoryRow } from './NewsStoryRow';

interface HomeNewsSectionProps {
  tokens: MarketToken[];
  onOpenToken: (tokenId: string) => void;
}

export function HomeNewsSection({ tokens, onOpenToken }: HomeNewsSectionProps) {
  const { colors } = useAppTheme();
  const { language, t } = useI18n();
  const { width: screenWidth } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<OrbitNewsCategory>('crypto');
  const { items, provider, loading, refreshing, refresh, lastUpdatedAt } =
    useHomeNews(activeTab, 5, ORBIT_NEWS_REFRESH_MS);

  const tokenMap = useMemo(
    () => new Map(tokens.map((token) => [token.symbol.toUpperCase(), token])),
    [tokens],
  );
  const cardWidth = Math.min(Math.max(screenWidth - 42, 260), 340);
  const featuredItem = items[0];
  const secondaryItems = items.slice(1, 4);

  function openArticle(url: string, title: string) {
    router.push({
      pathname: '/browser',
      params: { url, title },
    });
  }

  const refreshLabel =
    lastUpdatedAt > 0
      ? t('news.updated', {
          time: formatRelativeTimeByLanguage(language, new Date(lastUpdatedAt).toISOString()),
        })
      : t('news.notUpdated');

  return (
    <View style={styles.root}>
      <SectionHeader
        title={t('news.title')}
        subtitle={t('news.subtitle')}
        rightSlot={
          <View style={styles.headerBadges}>
            <View
              style={[
                styles.providerBadge,
                {
                  backgroundColor: withOpacity(colors.text, 0.08),
                },
              ]}
            >
              <Text
                style={[
                  styles.providerBadgeLabel,
                  { color: colors.textMuted },
                ]}
              >
                {getNewsProviderLabel(provider, language)}
              </Text>
            </View>
            <Text style={[styles.cacheLabel, { color: colors.textMuted }]}>{refreshLabel}</Text>
          </View>
        }
      />

      <View style={styles.tabsRow}>
        {(['crypto', 'economy', 'politics', 'technology'] as OrbitNewsCategory[]).map((tab) => {
          const active = activeTab === tab;

          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabChip,
                {
                  backgroundColor: active ? colors.primarySoft : colors.fieldBackground,
                  borderColor: active ? colors.borderStrong : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabChipLabel,
                  { color: active ? colors.text : colors.textMuted },
                ]}
              >
                {getNewsCategoryLabel(tab, language)}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          onPress={() => {
            void refresh();
          }}
          style={[
            styles.refreshChip,
            { backgroundColor: colors.fieldBackground, borderColor: colors.border },
          ]}
        >
          <Ionicons name={refreshing ? 'sync' : 'refresh-outline'} size={15} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.carouselSection}>
        {loading ? (
          <Text style={[styles.helperText, { color: colors.textMuted }]}>
            {t('news.loading', {
              category: getNewsCategoryLabel(activeTab, language).toLowerCase(),
            })}
          </Text>
        ) : !items.length ? (
          <View
            style={[
              styles.emptyState,
              {
                borderColor: withOpacity(colors.border, 0.7),
                backgroundColor: colors.fieldBackground,
              },
            ]}
          >
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {t('news.emptyTitle')}
            </Text>
            <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
              {t('news.emptyBody')}
            </Text>
          </View>
        ) : (
          <>
            {featuredItem ? (
              <NewsStoryRow
                item={featuredItem}
                token={
                  featuredItem.relatedSymbol
                    ? tokenMap.get(featuredItem.relatedSymbol.toUpperCase())
                    : undefined
                }
                cardWidth={cardWidth}
                variant="featured"
                language={language}
                timeAgoLabel={(timestamp) => formatRelativeTimeByLanguage(language, timestamp)}
                sentimentLabel={(sentiment) => getNewsSentimentLabel(sentiment, language)}
                onOpenArticle={openArticle}
                onOpenToken={onOpenToken}
              />
            ) : null}

            {secondaryItems.length ? (
              <View
                style={[
                  styles.secondaryFeed,
                  { borderTopColor: withOpacity(colors.border, 0.7) },
                ]}
              >
                {secondaryItems.map((item) => {
                  const token = item.relatedSymbol
                    ? tokenMap.get(item.relatedSymbol.toUpperCase())
                    : undefined;

                  return (
                    <NewsStoryRow
                      key={item.id}
                      item={item}
                      token={token}
                      variant="compact"
                      language={language}
                      timeAgoLabel={(timestamp) => formatRelativeTimeByLanguage(language, timestamp)}
                      sentimentLabel={(sentiment) => getNewsSentimentLabel(sentiment, language)}
                      onOpenArticle={openArticle}
                      onOpenToken={onOpenToken}
                    />
                  );
                })}
              </View>
            ) : null}

            <View style={styles.footerRow}>
              <Text style={[styles.footerCaption, { color: colors.textMuted }]}>
                {t('news.footer')}
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
  },
  headerBadges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  providerBadge: {
    minHeight: 22,
    borderRadius: RADII.pill,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerBadgeLabel: {
    fontFamily: FONT.semibold,
    fontSize: 10,
  },
  cacheLabel: {
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  tabChip: {
    minHeight: 28,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabChipLabel: {
    fontFamily: FONT.semibold,
    fontSize: 10,
  },
  refreshChip: {
    width: 28,
    height: 28,
    borderRadius: RADII.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselSection: {
    gap: 8,
  },
  helperText: {
    fontFamily: FONT.regular,
    fontSize: 11,
  },
  emptyState: {
    borderWidth: 1,
    borderRadius: RADII.lg,
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 4,
  },
  emptyTitle: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  emptyBody: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  secondaryFeed: {
    gap: 0,
    borderTopWidth: 1,
    paddingTop: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  footerCaption: {
    fontFamily: FONT.medium,
    fontSize: 10,
  },
});
