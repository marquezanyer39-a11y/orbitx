import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../constants/theme';
import { MiniSparkline } from './MiniSparkline';

export interface LiveMarketRowItem {
  id: string;
  pairLabel: string;
  priceLabel: string;
  changeLabel: string;
  positive: boolean;
  sparkline: number[];
  image?: string;
  onPress: () => void;
}

interface LiveMarketSectionProps {
  items: LiveMarketRowItem[];
  loading?: boolean;
  error?: string | null;
  onRetry: () => void;
  onViewAll: () => void;
}

function SkeletonRow() {
  return (
    <View style={styles.row}>
      <View style={styles.leftRow}>
        <View style={styles.assetSkeleton} />
        <View style={styles.textSkeletonColumn}>
          <View style={styles.lineLarge} />
          <View style={styles.lineSmall} />
        </View>
      </View>
      <View style={styles.sparklineSkeleton} />
      <View style={styles.priceSkeletonColumn}>
        <View style={styles.lineLarge} />
        <View style={styles.pillSkeleton} />
      </View>
    </View>
  );
}

export function LiveMarketSection({
  items,
  loading = false,
  error,
  onRetry,
  onViewAll,
}: LiveMarketSectionProps) {
  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Mercado en vivo</Text>
        <Pressable onPress={onViewAll} style={styles.linkButton}>
          <Text style={styles.linkText}>Ver todos</Text>
          <Ionicons name="chevron-forward" size={14} color="#1EDC8B" />
        </Pressable>
      </View>

      <View style={styles.panel}>
        {error ? (
          <View style={styles.statusRow}>
            <Text style={styles.errorText}>No se pudo actualizar el mercado</Text>
            <Pressable onPress={onRetry} style={styles.retryButton}>
              <Text style={styles.retryLabel}>Reintentar</Text>
            </Pressable>
          </View>
        ) : null}

        {loading && !items.length ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : (
          items.map((item, index) => (
            <Pressable key={item.id} onPress={item.onPress} style={styles.row}>
              <View style={styles.leftRow}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.assetImage} />
                ) : (
                  <View style={styles.assetFallback}>
                    <Text style={styles.assetFallbackText}>{item.pairLabel.slice(0, 1)}</Text>
                  </View>
                )}
                <Text style={styles.pairLabel}>{item.pairLabel}</Text>
              </View>

              <MiniSparkline
                data={item.sparkline}
                width={74}
                height={26}
                color="#1EDC8B"
                negativeColor="#FF5A67"
                positive={item.positive}
                barWidth={3}
                barGap={1}
                subtle
              />

              <View style={styles.priceColumn}>
                <Text style={styles.priceLabel}>{item.priceLabel}</Text>
                <View
                  style={[
                    styles.changePill,
                    {
                      backgroundColor: item.positive
                        ? withOpacity('#1EDC8B', 0.14)
                        : withOpacity('#FF5A67', 0.14),
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.changeLabel,
                      { color: item.positive ? '#1EDC8B' : '#FF5A67' },
                    ]}
                  >
                    {item.changeLabel}
                  </Text>
                </View>
              </View>

              {index < items.length - 1 ? <View style={styles.separator} /> : null}
            </Pressable>
          ))
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
  panel: {
    borderRadius: 20,
    backgroundColor: '#11131A',
    borderWidth: 1,
    borderColor: '#232634',
    overflow: 'hidden',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#232634',
    backgroundColor: withOpacity('#FF5A67', 0.06),
  },
  errorText: {
    flex: 1,
    color: '#F5F7FA',
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  retryButton: {
    minHeight: 28,
    borderRadius: RADII.pill,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: withOpacity('#F5F7FA', 0.12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryLabel: {
    color: '#F5F7FA',
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    position: 'relative',
  },
  leftRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  assetImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  assetFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#1EDC8B', 0.12),
  },
  assetFallbackText: {
    color: '#1EDC8B',
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  pairLabel: {
    color: '#F5F7FA',
    fontFamily: FONT.medium,
    fontSize: 15,
  },
  priceColumn: {
    minWidth: 106,
    alignItems: 'flex-end',
    gap: 6,
  },
  priceLabel: {
    color: '#F5F7FA',
    fontFamily: FONT.semibold,
    fontSize: 15,
  },
  changePill: {
    minHeight: 24,
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeLabel: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  separator: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
    height: 1,
    backgroundColor: '#232634',
  },
  assetSkeleton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: withOpacity('#F5F7FA', 0.08),
  },
  textSkeletonColumn: {
    gap: 6,
  },
  lineLarge: {
    width: 78,
    height: 12,
    borderRadius: 999,
    backgroundColor: withOpacity('#F5F7FA', 0.08),
  },
  lineSmall: {
    width: 56,
    height: 10,
    borderRadius: 999,
    backgroundColor: withOpacity('#F5F7FA', 0.06),
  },
  sparklineSkeleton: {
    width: 74,
    height: 26,
    borderRadius: 12,
    backgroundColor: withOpacity('#1EDC8B', 0.08),
  },
  priceSkeletonColumn: {
    alignItems: 'flex-end',
    gap: 6,
  },
  pillSkeleton: {
    width: 62,
    height: 22,
    borderRadius: RADII.pill,
    backgroundColor: withOpacity('#F5F7FA', 0.06),
  },
});
