import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../constants/theme';
import { ORBITX_THEME } from './orbitxTheme';

export type HomeNewsCategory = 'crypto' | 'economy' | 'technology' | 'politics';

export interface HomeNewsFeaturedItem {
  id: string;
  title: string;
  sourceLabel: string;
  timeLabel: string;
  image?: string;
}

interface NewsSectionProps {
  categories: Array<{ key: HomeNewsCategory; label: string }>;
  activeCategory: HomeNewsCategory;
  onSelectCategory: (category: HomeNewsCategory) => void;
  item: HomeNewsFeaturedItem | null;
  loading?: boolean;
  helperLabel?: string | null;
  isSmallPhone?: boolean;
  onOpenFeatured: () => void;
  onViewAll: () => void;
  onRefresh: () => void;
}

export function NewsSection({
  categories,
  activeCategory,
  onSelectCategory,
  item,
  loading = false,
  helperLabel,
  isSmallPhone = false,
  onOpenFeatured,
  onViewAll,
  onRefresh,
}: NewsSectionProps) {
  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Noticias</Text>
        <Pressable
          onPress={onViewAll}
          style={({ pressed }) => [styles.iconButton, pressed ? styles.pressed : null]}
        >
          <Ionicons name="options-outline" size={18} color={ORBITX_THEME.colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContent}
      >
        {categories.map((category) => {
          const active = category.key === activeCategory;

          return (
            <Pressable
              key={category.key}
              onPress={() => onSelectCategory(category.key)}
              style={({ pressed }) => [
                styles.chip,
                active ? styles.chipActive : styles.chipIdle,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text
                style={[
                  styles.chipLabel,
                  active ? styles.chipLabelActive : styles.chipLabelIdle,
                ]}
                numberOfLines={1}
              >
                {category.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {helperLabel ? (
        <View style={styles.helperRow}>
          <Text style={styles.helperText} numberOfLines={1} ellipsizeMode="tail">
            {helperLabel}
          </Text>
          <Pressable onPress={onRefresh} style={({ pressed }) => (pressed ? styles.pressed : null)}>
            <Ionicons name="refresh-outline" size={14} color={ORBITX_THEME.colors.textSecondary} />
          </Pressable>
        </View>
      ) : null}

      <Pressable
        onPress={item ? onOpenFeatured : onRefresh}
        style={({ pressed }) => [styles.storyWrap, pressed ? styles.pressed : null]}
      >
        {item?.image ? (
          <Image source={{ uri: item.image }} style={styles.storyImage} />
        ) : (
          <View style={styles.storyImageFallback}>
            <Ionicons
              name={loading ? 'refresh-outline' : 'newspaper-outline'}
              size={24}
              color={withOpacity(ORBITX_THEME.colors.primaryGreen, 0.9)}
            />
          </View>
        )}

        <Text style={styles.storyMeta} numberOfLines={1}>
          {item ? `${item.sourceLabel} • ${item.timeLabel}` : 'CRYPTO HOY • 1H'}
        </Text>
        <Text
          style={[styles.storyTitle, isSmallPhone ? styles.storyTitleSmall : null]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item?.title ?? 'No se pudo cargar la noticia destacada'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  title: {
    color: ORBITX_THEME.colors.textPrimary,
    fontFamily: FONT.semibold,
    fontSize: 18,
  },
  iconButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsContent: {
    columnGap: 8,
    paddingRight: 16,
  },
  chip: {
    height: 34,
    borderRadius: 17,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: '#FAFAFA',
    borderColor: '#FAFAFA',
  },
  chipIdle: {
    backgroundColor: 'transparent',
    borderColor: ORBITX_THEME.colors.border,
  },
  chipLabel: {
    fontSize: 13,
    textAlign: 'center',
    includeFontPadding: false,
  },
  chipLabelActive: {
    color: '#08090B',
    fontFamily: FONT.semibold,
  },
  chipLabelIdle: {
    color: ORBITX_THEME.colors.textSecondary,
    fontFamily: FONT.medium,
  },
  helperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    marginBottom: 12,
  },
  helperText: {
    flex: 1,
    color: ORBITX_THEME.colors.textSecondary,
    fontFamily: FONT.regular,
    fontSize: 12,
  },
  storyWrap: {
    gap: 0,
  },
  storyImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    backgroundColor: ORBITX_THEME.colors.surface,
    marginBottom: 12,
  },
  storyImageFallback: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    backgroundColor: '#253026',
    borderWidth: 1,
    borderColor: withOpacity(ORBITX_THEME.colors.border, 0.5),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  storyMeta: {
    color: withOpacity(ORBITX_THEME.colors.textSecondary, 0.9),
    fontFamily: FONT.medium,
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  storyTitle: {
    color: ORBITX_THEME.colors.textPrimary,
    fontFamily: FONT.medium,
    fontSize: 16,
    lineHeight: 22,
  },
  storyTitleSmall: {
    fontSize: 15,
    lineHeight: 21,
  },
  pressed: {
    opacity: 0.8,
  },
});
