import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { withOpacity } from '../../../../constants/theme';
import {
  ASSET_FILTERS,
  type AssetFilter,
  formatTokenAmount,
  formatUsd,
  type Web3AssetRow,
} from './useWeb3WalletViewModel';
import { COLORS, styles } from './web3WalletStyles';
import { Web3EmptyState } from './Web3EmptyState';

function AssetRow({ asset }: { asset: Web3AssetRow }) {
  return (
    <Pressable style={({ pressed }) => [styles.assetRow, pressed && styles.pressed]}>
      <View style={[styles.assetIcon, { backgroundColor: withOpacity(asset.color, 0.16) }]}>
        <Ionicons name={asset.icon} size={22} color={asset.color} />
      </View>
      <View style={styles.assetCopy}>
        <Text style={styles.assetSymbol} numberOfLines={1}>{asset.symbol}</Text>
        <Text style={styles.assetName} numberOfLines={1}>{asset.chainLabel || asset.name}</Text>
      </View>
      <View style={styles.assetValues}>
        <Text style={styles.assetAmount} numberOfLines={1}>{formatTokenAmount(asset.amount)}</Text>
        <Text style={styles.assetUsd} numberOfLines={1}>
          {asset.priceAvailable ? `~ ${formatUsd(asset.usdValue)}` : 'Valor no disponible'}
        </Text>
      </View>
    </Pressable>
  );
}

interface Web3AssetListProps {
  activeFilter: AssetFilter;
  assets: Web3AssetRow[];
  onSetFilter: (filter: AssetFilter) => void;
}

export function Web3AssetList({ activeFilter, assets, onSetFilter }: Web3AssetListProps) {
  return (
    <View style={styles.assetsSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Activos Web3</Text>
        <Pressable style={({ pressed }) => [styles.searchButton, pressed && styles.pressed]}>
          <Ionicons name="search-outline" size={17} color={COLORS.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.assetFilters}>
        {ASSET_FILTERS.map((filter) => {
          const active = filter === activeFilter;
          return (
            <Pressable
              key={filter}
              onPress={() => onSetFilter(filter)}
              style={({ pressed }) => [styles.filterButton, pressed && styles.pressed]}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{filter}</Text>
              {active ? <View style={styles.filterUnderline} /> : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.assetList}>
        {assets.length ? (
          assets.slice(0, 5).map((asset) => <AssetRow key={asset.id} asset={asset} />)
        ) : (
          <Web3EmptyState />
        )}
      </View>
    </View>
  );
}
