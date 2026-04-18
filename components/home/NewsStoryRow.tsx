import { useEffect, useRef, useState } from 'react';
import {
  Animated as RNAnimated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { translate } from '../../constants/i18n';
import { FONT, RADII, SPACING, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import {
  getExternalSourceLabel,
  getNewsCategoryLabel,
  getNewsProviderLabel,
} from '../../services/news/helpers';
import type { LanguageCode, MarketToken } from '../../types';
import type { OrbitNewsItem } from '../../services/news/types';

interface NewsStoryRowProps {
  item: OrbitNewsItem;
  token?: MarketToken;
  cardWidth?: number;
  variant?: 'featured' | 'compact';
  language: LanguageCode;
  timeAgoLabel: (timestamp: string) => string;
  sentimentLabel: (sentiment: 'bullish' | 'bearish' | 'neutral') => string;
  onOpenArticle: (url: string, title: string) => void;
  onOpenToken: (tokenId: string) => void;
}

export function NewsStoryRow({
  item,
  token,
  cardWidth,
  variant = 'featured',
  language,
  timeAgoLabel,
  sentimentLabel,
  onOpenArticle,
  onOpenToken,
}: NewsStoryRowProps) {
  const { colors } = useAppTheme();
  const imageOpacity = useRef(new RNAnimated.Value(item.image ? 0 : 1)).current;
  const [imageFailed, setImageFailed] = useState(!item.image);
  const positive = item.sentiment === 'bullish';
  const negative = item.sentiment === 'bearish';
  const imageSource = !imageFailed && item.image ? item.image : undefined;
  const sourceLabel = item.source?.trim() || getExternalSourceLabel(language);
  const providerLabel = getNewsProviderLabel(item.provider, language);
  const readMoreLabel = translate(language, 'common.readMore');
  const viewTokenLabel = translate(language, 'common.viewToken');

  useEffect(() => {
    imageOpacity.setValue(imageSource ? 0 : 1);
  }, [imageOpacity, imageSource]);

  useEffect(() => {
    setImageFailed(!item.image);
  }, [item.image]);

  function handleImageLoaded() {
    RNAnimated.timing(imageOpacity, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }

  if (variant === 'compact') {
    return (
      <Pressable onPress={() => onOpenArticle(item.url, item.title)} style={styles.compactStory}>
        <RNAnimated.View
          style={[
            styles.compactMediaShell,
            {
              opacity: imageOpacity,
              backgroundColor: colors.backgroundAlt,
              borderColor: withOpacity(colors.border, 0.56),
            },
          ]}
        >
          {imageSource ? (
            <Image
              source={{ uri: imageSource }}
              style={styles.compactMedia}
              resizeMode="cover"
              onLoad={handleImageLoaded}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <View style={styles.compactFallback}>
              <Text style={[styles.compactFallbackLabel, { color: colors.textMuted }]}>
                {providerLabel}
              </Text>
            </View>
          )}
        </RNAnimated.View>

        <View style={styles.compactBody}>
          <View style={styles.compactMeta}>
            <Text style={[styles.compactMetaLabel, { color: colors.textMuted }]} numberOfLines={1}>
              {sourceLabel}
            </Text>
            <View style={[styles.dot, { backgroundColor: colors.textMuted }]} />
            <Text style={[styles.compactMetaLabel, { color: colors.textMuted }]} numberOfLines={1}>
              {timeAgoLabel(item.publishedAt)}
            </Text>
          </View>

          <Text style={[styles.compactTitle, { color: colors.text }]} numberOfLines={3}>
            {item.title}
          </Text>

          {item.excerpt ? (
            <Text style={[styles.compactExcerpt, { color: colors.textSoft }]} numberOfLines={2}>
              {item.excerpt}
            </Text>
          ) : null}

          <View style={styles.compactFooter}>
            <Text
              style={[
                styles.compactSentiment,
                {
                  color: positive ? colors.profit : negative ? colors.loss : colors.textSoft,
                },
              ]}
            >
              {sentimentLabel(item.sentiment)}
            </Text>

            <View style={styles.actionRow}>
              <Pressable
                onPress={(event) => {
                  event.stopPropagation();
                  onOpenArticle(item.url, item.title);
                }}
                hitSlop={8}
              >
                <Text style={[styles.actionLabel, { color: colors.text }]}>{readMoreLabel}</Text>
              </Pressable>

              {token ? (
                <Pressable
                  onPress={(event) => {
                    event.stopPropagation();
                    onOpenToken(token.id);
                  }}
                  hitSlop={8}
                >
                  <Text style={[styles.actionLabel, { color: colors.profit }]}>{viewTokenLabel}</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => onOpenArticle(item.url, item.title)}
      style={[styles.story, { width: cardWidth ?? 320 }]}
    >
      <RNAnimated.View
        style={[
          styles.mediaShell,
          {
            opacity: imageOpacity,
            backgroundColor: colors.backgroundAlt,
            borderColor: withOpacity(colors.border, 0.56),
          },
        ]}
      >
        {imageSource ? (
          <Image
            source={{ uri: imageSource }}
            style={styles.media}
            resizeMode="cover"
            onLoad={handleImageLoaded}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.placeholderMedia}>
            <Text style={[styles.placeholderEyebrow, { color: colors.textMuted }]}>
              {providerLabel}
            </Text>
            <Text style={[styles.placeholderTitle, { color: colors.text }]}>
              {getNewsCategoryLabel(item.category, language)}
            </Text>
          </View>
        )}
        <View
          style={[
            styles.mediaOverlay,
            { backgroundColor: withOpacity(colors.background, 0.18) },
          ]}
        />
      </RNAnimated.View>

      <View style={styles.body}>
        <View style={styles.metaTop}>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: colors.textMuted }]} numberOfLines={1}>
              {sourceLabel}
            </Text>
            <View style={[styles.dot, { backgroundColor: colors.textMuted }]} />
            <Text style={[styles.metaLabel, { color: colors.textMuted }]} numberOfLines={1}>
              {providerLabel}
            </Text>
            <View style={[styles.dot, { backgroundColor: colors.textMuted }]} />
            <Text style={[styles.metaLabel, { color: colors.textMuted }]} numberOfLines={1}>
              {timeAgoLabel(item.publishedAt)}
            </Text>
          </View>

          <View
            style={[
              styles.sentimentPill,
              {
                backgroundColor: positive
                  ? withOpacity(colors.profit, 0.12)
                  : negative
                    ? withOpacity(colors.loss, 0.12)
                    : withOpacity(colors.text, 0.08),
              },
            ]}
          >
            <Text
              style={[
                styles.sentimentLabel,
                {
                  color: positive
                    ? colors.profit
                    : negative
                      ? colors.loss
                      : colors.textMuted,
                },
              ]}
            >
              {sentimentLabel(item.sentiment)}
            </Text>
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]} numberOfLines={3}>
          {item.title}
        </Text>

        {item.excerpt ? (
          <Text style={[styles.excerpt, { color: colors.textSoft }]} numberOfLines={3}>
            {item.excerpt}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            {item.relatedSymbol ? (
              <Text style={[styles.relatedSymbol, { color: colors.textSoft }]} numberOfLines={1}>
                {item.relatedSymbol}
              </Text>
            ) : null}
          </View>

          <View style={styles.actionRow}>
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                onOpenArticle(item.url, item.title);
              }}
              hitSlop={8}
            >
              <Text style={[styles.actionLabel, { color: colors.text }]}>{readMoreLabel}</Text>
            </Pressable>

            {token ? (
              <Pressable
                onPress={(event) => {
                  event.stopPropagation();
                  onOpenToken(token.id);
                }}
                hitSlop={8}
                >
                  <Text style={[styles.actionLabel, { color: colors.profit }]}>{viewTokenLabel}</Text>
                </Pressable>
              ) : null}
            </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  story: {
    gap: 8,
    paddingBottom: 2,
  },
  compactStory: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
    paddingVertical: 7,
  },
  compactMediaShell: {
    width: 88,
    height: 78,
    borderRadius: RADII.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  compactMedia: {
    width: '100%',
    height: '100%',
  },
  compactFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  compactFallbackLabel: {
    fontFamily: FONT.medium,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    textAlign: 'center',
  },
  compactBody: {
    flex: 1,
    gap: 5,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  compactMetaLabel: {
    fontFamily: FONT.medium,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  compactTitle: {
    fontFamily: FONT.bold,
    fontSize: 13,
    lineHeight: 18,
  },
  compactExcerpt: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  compactFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  compactSentiment: {
    fontFamily: FONT.semibold,
    fontSize: 10,
  },
  mediaShell: {
    width: '100%',
    height: 132,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  placeholderMedia: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    gap: 4,
  },
  placeholderEyebrow: {
    fontFamily: FONT.medium,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  placeholderTitle: {
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  mediaOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 30,
  },
  body: {
    gap: 8,
    paddingHorizontal: 2,
  },
  metaTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
    flex: 1,
  },
  metaLabel: {
    fontFamily: FONT.medium,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 3,
  },
  sentimentPill: {
    minHeight: 22,
    borderRadius: RADII.pill,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentimentLabel: {
    fontFamily: FONT.semibold,
    fontSize: 10,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 15,
    lineHeight: 20,
  },
  excerpt: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  footerLeft: {
    flex: 1,
  },
  relatedSymbol: {
    fontFamily: FONT.semibold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionLabel: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
});
