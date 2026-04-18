import { Ionicons } from '@expo/vector-icons';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMemo, useState } from 'react';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import type { ConvertAssetOption, ConvertCopy } from '../../types/convert';
import { formatConvertAmount } from '../../services/convert/convertCopy';

interface Props {
  visible: boolean;
  title: string;
  assets: ConvertAssetOption[];
  copy: ConvertCopy;
  activeSymbol?: string;
  onClose: () => void;
  onSelect: (asset: ConvertAssetOption) => void;
  onToggleFavorite: (symbol: string) => void;
}

function AssetRow({
  asset,
  copy,
  active,
  onPress,
  onToggleFavorite,
}: {
  asset: ConvertAssetOption;
  copy: ConvertCopy;
  active: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}) {
  const { colors } = useAppTheme();
  const disabled = !asset.availableAsDestination && !asset.availableAsSource;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.row,
        {
          backgroundColor: active
            ? withOpacity(colors.primary, 0.12)
            : withOpacity(colors.surfaceElevated, 0.96),
          borderColor: active ? withOpacity(colors.primary, 0.24) : colors.border,
          opacity: disabled ? 0.45 : 1,
        },
      ]}
    >
      <View style={styles.assetLeft}>
        {asset.image ? (
          <Image source={{ uri: asset.image }} style={styles.logo} />
        ) : (
          <View
            style={[
              styles.logo,
              {
                backgroundColor:
                  asset.kind === 'fiat'
                    ? withOpacity(colors.warning, 0.18)
                    : withOpacity(colors.primary, 0.16),
              },
            ]}
          >
            <Text style={[styles.logoLabel, { color: colors.text }]}>
              {asset.symbol.slice(0, 1)}
            </Text>
          </View>
        )}

        <View style={styles.assetCopy}>
          <View style={styles.assetTopRow}>
            <Text style={[styles.assetSymbol, { color: colors.text }]}>{asset.symbol}</Text>
            {asset.kind === 'fiat' ? (
              <View
                style={[
                  styles.tag,
                  {
                    backgroundColor: withOpacity(colors.warning, 0.12),
                    borderColor: withOpacity(colors.warning, 0.24),
                  },
                ]}
              >
                <Text style={[styles.tagText, { color: colors.warning }]}>
                  {copy.availableByRegionTag}
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.assetName, { color: colors.textSoft }]} numberOfLines={1}>
            {asset.name}
          </Text>
          <Text style={[styles.assetMeta, { color: colors.textMuted }]}>
            {asset.kind === 'fiat'
              ? asset.providerLabel || copy.providerManagedTag
              : asset.networkLabel || 'spot'}
          </Text>
        </View>
      </View>

      <View style={styles.assetRight}>
        <Pressable
          onPress={onToggleFavorite}
          hitSlop={8}
          style={styles.favoriteButton}
        >
          <Ionicons
            name={asset.favorite ? 'star' : 'star-outline'}
            size={15}
            color={asset.favorite ? colors.warning : colors.textMuted}
          />
        </Pressable>
        <Text style={[styles.balanceValue, { color: colors.text }]}>
          {formatConvertAmount(copy.language, asset.balance, asset.symbol, 4)}
        </Text>
        {asset.availabilityLabel ? (
          <Text style={[styles.assetMeta, { color: colors.textMuted }]} numberOfLines={1}>
            {asset.availabilityLabel}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function Section({
  title,
  items,
  copy,
  activeSymbol,
  onSelect,
  onToggleFavorite,
}: {
  title: string;
  items: ConvertAssetOption[];
  copy: ConvertCopy;
  activeSymbol?: string;
  onSelect: (asset: ConvertAssetOption) => void;
  onToggleFavorite: (symbol: string) => void;
}) {
  if (!items.length) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>
        {items.map((asset) => (
          <AssetRow
            key={asset.id}
            asset={asset}
            copy={copy}
            active={activeSymbol === asset.symbol}
            onPress={() => onSelect(asset)}
            onToggleFavorite={() => onToggleFavorite(asset.symbol)}
          />
        ))}
      </View>
    </View>
  );
}

export function ConvertAssetSelectorSheet({
  visible,
  title,
  assets,
  copy,
  activeSymbol,
  onClose,
  onSelect,
  onToggleFavorite,
}: Props) {
  const { colors } = useAppTheme();
  const [query, setQuery] = useState('');

  const filteredAssets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const items = !normalized
      ? assets
      : assets.filter((asset) => {
          const haystack = `${asset.symbol} ${asset.name}`.toLowerCase();
          return haystack.includes(normalized);
        });

    return [...items].sort((left, right) => {
      if (left.favorite !== right.favorite) {
        return left.favorite ? -1 : 1;
      }
      if (left.frequent !== right.frequent) {
        return left.frequent ? -1 : 1;
      }
      return right.balance - left.balance;
    });
  }, [assets, query]);

  const favorites = filteredAssets.filter((asset) => asset.favorite);
  const frequent = filteredAssets.filter((asset) => asset.frequent && !asset.favorite);
  const remaining = filteredAssets.filter((asset) => !asset.favorite && !asset.frequent);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: withOpacity(colors.background, 0.98),
              borderColor: withOpacity(colors.primary, 0.14),
            },
          ]}
        >
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetTitleRow}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>{title}</Text>
              <Pressable
                onPress={onClose}
                style={[
                  styles.closeButton,
                  {
                    backgroundColor: withOpacity(colors.surfaceElevated, 0.92),
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="close" size={16} color={colors.text} />
              </Pressable>
            </View>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={copy.searchPlaceholder}
              placeholderTextColor={colors.textMuted}
              style={[
                styles.searchInput,
                {
                  color: colors.text,
                  backgroundColor: withOpacity(colors.fieldBackground, 0.96),
                  borderColor: colors.border,
                },
              ]}
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Section
              title={copy.favoritesTitle}
              items={favorites}
              copy={copy}
              activeSymbol={activeSymbol}
              onSelect={onSelect}
              onToggleFavorite={onToggleFavorite}
            />
            <Section
              title={copy.frequentTitle}
              items={frequent}
              copy={copy}
              activeSymbol={activeSymbol}
              onSelect={onSelect}
              onToggleFavorite={onToggleFavorite}
            />
            <Section
              title={title}
              items={remaining}
              copy={copy}
              activeSymbol={activeSymbol}
              onSelect={onSelect}
              onToggleFavorite={onToggleFavorite}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(3, 4, 8, 0.62)',
  },
  sheet: {
    maxHeight: '88%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 22,
    gap: 14,
  },
  sheetHeader: {
    gap: 12,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginBottom: 2,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sheetTitle: {
    fontFamily: FONT.bold,
    fontSize: 20,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    minHeight: 46,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontFamily: FONT.medium,
    fontSize: 13,
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 12,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontFamily: FONT.semibold,
    fontSize: 12,
    color: '#9B9CB6',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  sectionBody: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  assetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLabel: {
    fontFamily: FONT.bold,
    fontSize: 16,
  },
  assetCopy: {
    flex: 1,
    gap: 3,
  },
  assetTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assetSymbol: {
    fontFamily: FONT.bold,
    fontSize: 15,
  },
  assetName: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  assetMeta: {
    fontFamily: FONT.regular,
    fontSize: 10,
  },
  assetRight: {
    alignItems: 'flex-end',
    gap: 4,
    maxWidth: 132,
  },
  favoriteButton: {
    padding: 2,
  },
  balanceValue: {
    fontFamily: FONT.semibold,
    fontSize: 12,
    textAlign: 'right',
  },
  tag: {
    borderWidth: 1,
    borderRadius: RADII.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontFamily: FONT.medium,
    fontSize: 9,
  },
});
