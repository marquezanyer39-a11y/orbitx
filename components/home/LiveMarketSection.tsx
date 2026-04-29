import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../constants/theme';
import { MiniSparkline } from './MiniSparkline';
import { ORBITX_THEME } from './orbitxTheme';

export interface LiveMarketRowItem {
  id: string;
  pairLabel: string;
  assetLabel: string;
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
  contentWidth: number;
  isSmallPhone?: boolean;
  onRetry: () => void;
  onViewAll: () => void;
}

function MarketSkeleton({ isSmallPhone = false }: { isSmallPhone?: boolean }) {
  return (
    <View style={[styles.row, isSmallPhone ? styles.rowSmall : null]}>
      <View style={styles.assetColumn}>
        <View style={styles.assetIconSkeleton} />
        <View style={styles.assetTextSkeleton}>
          <View style={styles.textLineWide} />
          <View style={styles.textLineNarrow} />
        </View>
      </View>
      <View style={styles.sparklineSkeleton} />
      <View style={styles.priceColumn}>
        <View style={styles.textLineWide} />
        <View style={styles.textLineNarrow} />
      </View>
    </View>
  );
}

export function LiveMarketSection({
  items,
  loading = false,
  error,
  contentWidth,
  isSmallPhone = false,
  onRetry,
  onViewAll,
}: LiveMarketSectionProps) {
  const assetWidth = Math.max(isSmallPhone ? 118 : 126, Math.floor(contentWidth * 0.34));
  const chartWidth = Math.max(isSmallPhone ? 88 : 96, Math.floor(contentWidth * 0.28));
  const priceWidth = Math.max(isSmallPhone ? 116 : 126, contentWidth - assetWidth - chartWidth);

  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Mercado en vivo</Text>
        <Pressable onPress={onViewAll} style={({ pressed }) => (pressed ? styles.pressed : null)}>
          <Text style={styles.viewAllLabel}>Ver todos</Text>
        </Pressable>
      </View>

      <View style={styles.columnsHeader}>
        <Text style={[styles.columnLabel, styles.columnAsset]}>ACTIVO</Text>
        <Text style={[styles.columnLabel, styles.columnChart, { width: chartWidth }]}>GRÁFICO</Text>
        <Text style={[styles.columnLabel, styles.columnPrice, { width: priceWidth }]}>PRECIO / 24H</Text>
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <Text style={styles.errorText}>No se pudo actualizar el mercado</Text>
          <Pressable onPress={onRetry} style={({ pressed }) => [styles.retryButton, pressed ? styles.pressed : null]}>
            <Text style={styles.retryLabel}>Reintentar</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.list}>
        {loading && !items.length
          ? Array.from({ length: 4 }, (_, index) => (
              <MarketSkeleton key={`skeleton-${index}`} isSmallPhone={isSmallPhone} />
            ))
          : items.map((item, index) => (
              <Pressable
                key={item.id}
                onPress={item.onPress}
                style={({ pressed }) => [
                  styles.row,
                  isSmallPhone ? styles.rowSmall : null,
                  pressed ? styles.rowPressed : null,
                ]}
              >
                <View style={[styles.assetColumn, { width: assetWidth }]}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.assetImage} />
                  ) : (
                    <View style={styles.assetFallback}>
                      <Text style={styles.assetFallbackLabel}>{item.pairLabel.slice(0, 1)}</Text>
                    </View>
                  )}

                  <View style={styles.assetCopy}>
                    <Text
                      style={[styles.pairLabel, isSmallPhone ? styles.pairLabelSmall : null]}
                      numberOfLines={1}
                    >
                      {item.pairLabel}
                    </Text>
                    <Text style={styles.assetLabel} numberOfLines={1}>
                      {item.assetLabel}
                    </Text>
                  </View>
                </View>

                <View style={[styles.chartCell, { width: chartWidth }]}>
                  <MiniSparkline
                    data={item.sparkline}
                    width={chartWidth}
                    height={22}
                    color={ORBITX_THEME.colors.primaryGreen}
                    negativeColor={ORBITX_THEME.colors.lossRed}
                    positive={item.positive}
                    subtle
                    variant="line"
                  />
                </View>

                <View style={[styles.priceColumn, { width: priceWidth }]}>
                  <Text
                    style={[styles.priceLabel, isSmallPhone ? styles.priceLabelSmall : null]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.84}
                  >
                    {item.priceLabel}
                  </Text>
                  <Text
                    style={[
                      styles.changeLabel,
                      {
                        color: item.positive ? ORBITX_THEME.colors.primaryGreen : ORBITX_THEME.colors.lossRed,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {item.changeLabel}
                  </Text>
                </View>

                {index < items.length - 1 ? <View style={styles.separator} /> : null}
              </Pressable>
            ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    gap: 12,
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
  viewAllLabel: {
    color: ORBITX_THEME.colors.primaryGreen,
    fontFamily: FONT.medium,
    fontSize: 14,
  },
  columnsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 6,
  },
  columnLabel: {
    color: withOpacity(ORBITX_THEME.colors.textSecondary, 0.42),
    fontFamily: FONT.medium,
    fontSize: 9,
    letterSpacing: 0.7,
  },
  columnAsset: {
    flex: 1,
  },
  columnChart: {
    textAlign: 'center',
  },
  columnPrice: {
    textAlign: 'right',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 6,
  },
  errorText: {
    flex: 1,
    color: ORBITX_THEME.colors.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  retryButton: {
    minHeight: 28,
    paddingHorizontal: 12,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: withOpacity(ORBITX_THEME.colors.border, 0.5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryLabel: {
    color: ORBITX_THEME.colors.textPrimary,
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  list: {
    gap: 0,
  },
  row: {
    width: '100%',
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  rowSmall: {
    minHeight: 54,
  },
  rowPressed: {
    opacity: 0.74,
  },
  assetColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  assetImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  assetFallback: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: withOpacity(ORBITX_THEME.colors.primaryGreen, 0.12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetFallbackLabel: {
    color: ORBITX_THEME.colors.primaryGreen,
    fontFamily: FONT.semibold,
    fontSize: 10,
  },
  assetCopy: {
    flex: 1,
    minWidth: 0,
  },
  pairLabel: {
    color: ORBITX_THEME.colors.textPrimary,
    fontFamily: FONT.semibold,
    fontSize: 11.2,
  },
  pairLabelSmall: {
    fontSize: 10.7,
  },
  assetLabel: {
    marginTop: 1,
    color: withOpacity(ORBITX_THEME.colors.textSecondary, 0.76),
    fontFamily: FONT.medium,
    fontSize: 8,
    letterSpacing: 0.45,
    textTransform: 'uppercase',
  },
  chartCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 0,
  },
  priceLabel: {
    color: ORBITX_THEME.colors.textPrimary,
    fontFamily: FONT.semibold,
    fontSize: 13.2,
  },
  priceLabelSmall: {
    fontSize: 12.3,
  },
  changeLabel: {
    marginTop: 2,
    fontFamily: FONT.bold,
    fontSize: 9,
  },
  separator: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: withOpacity(ORBITX_THEME.colors.border, 0.26),
  },
  assetIconSkeleton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: withOpacity('#FAFAFA', 0.08),
  },
  assetTextSkeleton: {
    gap: 4,
  },
  textLineWide: {
    width: 74,
    height: 10,
    borderRadius: RADII.pill,
    backgroundColor: withOpacity('#FAFAFA', 0.08),
  },
  textLineNarrow: {
    width: 52,
    height: 8,
    borderRadius: RADII.pill,
    backgroundColor: withOpacity('#FAFAFA', 0.06),
  },
  sparklineSkeleton: {
    width: 88,
    height: 20,
    borderRadius: 10,
    backgroundColor: withOpacity(ORBITX_THEME.colors.primaryGreen, 0.08),
  },
  pressed: {
    opacity: 0.8,
  },
});
