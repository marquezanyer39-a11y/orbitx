import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../constants/theme';

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
  onOpenFeatured: () => void;
  onViewAll: () => void;
  onRefresh: () => void;
}

function NewsSkeleton() {
  return (
    <View style={styles.storyRow}>
      <View style={styles.imageSkeleton} />
      <View style={styles.storyCopy}>
        <View style={styles.storyMetaSkeleton} />
        <View style={[styles.storyTitleSkeleton, { width: '100%' }]} />
        <View style={[styles.storyTitleSkeleton, { width: '82%' }]} />
      </View>
    </View>
  );
}

export function NewsSection({
  categories,
  activeCategory,
  onSelectCategory,
  item,
  loading = false,
  helperLabel,
  onOpenFeatured,
  onViewAll,
  onRefresh,
}: NewsSectionProps) {
  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Noticias</Text>
        <Pressable onPress={onViewAll} style={styles.linkButton}>
          <Text style={styles.linkText}>Ver todas</Text>
          <Ionicons name="chevron-forward" size={14} color="#1EDC8B" />
        </Pressable>
      </View>

      <View style={styles.chipsRow}>
        {categories.map((category) => {
          const active = category.key === activeCategory;

          return (
            <Pressable
              key={category.key}
              onPress={() => onSelectCategory(category.key)}
              style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
            >
              <Text
                style={[
                  styles.chipLabel,
                  active ? styles.chipLabelActive : styles.chipLabelIdle,
                ]}
              >
                {category.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.panel}>
        {helperLabel ? (
          <View style={styles.helperRow}>
            <Text style={styles.helperText}>{helperLabel}</Text>
            <Pressable onPress={onRefresh}>
              <Ionicons name="refresh-outline" size={16} color="#9AA4B2" />
            </Pressable>
          </View>
        ) : null}

        {loading && !item ? (
          <NewsSkeleton />
        ) : item ? (
          <Pressable onPress={onOpenFeatured} style={styles.storyRow}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.storyImage} />
            ) : (
              <View style={styles.storyImageFallback}>
                <Ionicons name="newspaper-outline" size={22} color="#1EDC8B" />
              </View>
            )}

            <View style={styles.storyCopy}>
              <Text style={styles.storyMeta}>
                {item.sourceLabel} | {item.timeLabel}
              </Text>
              <Text style={styles.storyTitle}>{item.title}</Text>
            </View>

            <Ionicons name="bookmark-outline" size={18} color="#9AA4B2" />
          </Pressable>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No se pudo cargar la noticia destacada</Text>
            <Pressable onPress={onRefresh} style={styles.retryButton}>
              <Text style={styles.retryLabel}>Reintentar</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#F5F7FA',
    fontFamily: FONT.semibold,
    fontSize: 22,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  linkText: {
    color: '#1EDC8B',
    fontFamily: FONT.medium,
    fontSize: 13,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    minHeight: 30,
    borderRadius: RADII.pill,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: withOpacity('#1EDC8B', 0.14),
    borderColor: withOpacity('#1EDC8B', 0.22),
  },
  chipIdle: {
    backgroundColor: '#11131A',
    borderColor: '#232634',
  },
  chipLabel: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  chipLabelActive: {
    color: '#F5F7FA',
  },
  chipLabelIdle: {
    color: '#9AA4B2',
  },
  panel: {
    borderRadius: 18,
    backgroundColor: '#11131A',
    borderWidth: 1,
    borderColor: '#232634',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  helperText: {
    flex: 1,
    color: '#9AA4B2',
    fontFamily: FONT.regular,
    fontSize: 12,
  },
  storyRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  storyImage: {
    width: 82,
    height: 82,
    borderRadius: 16,
  },
  storyImageFallback: {
    width: 82,
    height: 82,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#1EDC8B', 0.08),
  },
  storyCopy: {
    flex: 1,
    gap: 8,
  },
  storyMeta: {
    color: '#9AA4B2',
    fontFamily: FONT.medium,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  storyTitle: {
    color: '#F5F7FA',
    fontFamily: FONT.medium,
    fontSize: 17,
    lineHeight: 24,
  },
  emptyState: {
    minHeight: 86,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 10,
  },
  emptyTitle: {
    color: '#F5F7FA',
    fontFamily: FONT.medium,
    fontSize: 14,
  },
  retryButton: {
    minHeight: 32,
    borderRadius: RADII.pill,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#1EDC8B', 0.12),
  },
  retryLabel: {
    color: '#1EDC8B',
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  imageSkeleton: {
    width: 82,
    height: 82,
    borderRadius: 16,
    backgroundColor: withOpacity('#F5F7FA', 0.08),
  },
  storyMetaSkeleton: {
    width: 96,
    height: 10,
    borderRadius: RADII.pill,
    backgroundColor: withOpacity('#F5F7FA', 0.07),
  },
  storyTitleSkeleton: {
    height: 14,
    borderRadius: RADII.pill,
    backgroundColor: withOpacity('#F5F7FA', 0.08),
  },
});
