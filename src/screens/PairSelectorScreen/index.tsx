import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { FONT, RADII } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useMarketData } from '../../hooks/useMarketData';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { SectionHeader } from '../../components/common/SectionHeader';
import { MarketList } from '../../components/market/MarketList';

export default function PairSelectorScreen() {
  const params = useLocalSearchParams<{ pairId?: string }>();
  const { colors } = useAppTheme();
  const { markets } = useMarketData('markets');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return markets;
    }

    return markets.filter((pair) => `${pair.symbol} ${pair.coin.name}`.toLowerCase().includes(normalized));
  }, [markets, query]);

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <SectionHeader
        title="Seleccionar par"
        subtitle={params.pairId ? `Par actual: ${params.pairId.toUpperCase()}` : 'Elige el par para tu mesa Spot.'}
      />

      <View style={[styles.searchShell, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Busca BTC, ETH, SOL..."
          placeholderTextColor={colors.textMuted}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      <MarketList
        pairs={filtered}
        onSelectPair={(pair) =>
          router.replace({
            pathname: '/spot',
            params: { pairId: pair.id },
          })
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
  },
  searchShell: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: RADII.md,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  searchInput: {
    fontFamily: FONT.medium,
    fontSize: 13,
  },
});
