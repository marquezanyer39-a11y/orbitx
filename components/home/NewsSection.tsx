import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../constants/theme';
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

      <View style={styles.chipsRow}>
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
      </View>

      {helperLabel ? (
        <View style={styles.helperRow}>
          <Text style={styles.helperText} numberOfLines={1} ellipsizeMode="tail">
            {helperLabel}
          </Text>
          <Pressable onPress={onRefresh} style={({ pressed }) => (pressed ? styles.pressed : null)}>
            <Ionicons name="refresh-outline" size={16} color={ORBITX_THEME.colors.textSecondary} />
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
          {item ? `${item.sourceLabel} - ${item.timeLabel}` : 'CRYPTO HOY - 1H'}
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
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
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
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'nowrap',
  },
  chip: {
    minHeight: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  chipIdle: {
    backgroundColor: 'transparent',
    borderColor: withOpacity(ORBITX_THEME.colors.border, 0.95),
  },
  chipLabel: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  chipLabelActive: {
    color: '#08090B',
  },
  chipLabelIdle: {
    color: ORBITX_THEME.colors.textSecondary,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  helperText: {
    flex: 1,
    color: ORBITX_THEME.colors.textSecondary,
    fontFamily: FONT.regular,
    fontSize: 11,
  },
  storyWrap: {
    gap: 10,
  },
  storyImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    backgroundColor: ORBITX_THEME.colors.surface,
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
  },
  storyMeta: {
    color: withOpacity(ORBITX_THEME.colors.textSecondary, 0.9),
    fontFamily: FONT.medium,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  storyTitle: {
    color: ORBITX_THEME.colors.textPrimary,
    fontFamily: FONT.medium,
    fontSize: 16,
    lineHeight: 22,
  },
  storyTitleSmall: {
    fontSize: 15,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.8,
  },
});
