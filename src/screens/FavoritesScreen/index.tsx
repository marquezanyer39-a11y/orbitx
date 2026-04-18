import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { MarketListRow } from '../../../components/lists/MarketListRow';
import { useOrbitStore } from '../../../store/useOrbitStore';
import { EmptyState } from '../../components/common/EmptyState';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { SectionHeader } from '../../components/common/SectionHeader';
import { useMarketData } from '../../hooks/useMarketData';
import { navigateToTrade } from '../../navigation/AppNavigator';
import { useProfileStore } from '../../store/profileStore';
import { buildLegacyTokenPairId, findLegacyTokenForTradeId, mapLegacyTokenToMarketPair } from '../../utils/tradePairs';

export default function FavoritesScreen() {
  const { colors } = useAppTheme();
  const favoritePairIds = useProfileStore((state) => state.favoritePairIds);
  const toggleFavoritePair = useProfileStore((state) => state.toggleFavoritePair);
  const { markets } = useMarketData('markets');
  const legacyTokens = useOrbitStore((state) => state.tokens);

  const pairs = useMemo(() => {
    return favoritePairIds
      .map((pairId) => {
        const marketPair = markets.find((pair) => pair.id === pairId);
        if (marketPair) {
          return { kind: 'market' as const, pair: marketPair };
        }

        const legacyToken = findLegacyTokenForTradeId(legacyTokens, pairId);
        if (!legacyToken) {
          return null;
        }

        return { kind: 'legacy' as const, token: legacyToken };
      })
      .filter(Boolean);
  }, [favoritePairIds, legacyTokens, markets]);

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <SectionHeader
        title="Favoritos"
        subtitle="Tus pares guardados para volver rapido a mercado y operacion."
      />

      {pairs.length ? (
        <View style={styles.list}>
          {pairs.map((entry) =>
            entry?.kind === 'market' ? (
              <View key={entry.pair.id} style={styles.rowWrap}>
                <MarketListRow
                  token={{
                    id: entry.pair.id,
                    symbol: entry.pair.baseSymbol,
                    name: entry.pair.coin.name,
                    price: entry.pair.price,
                    change24h: entry.pair.change24h,
                    marketCap: entry.pair.coin.marketCap,
                    volume24h: entry.pair.volume24h,
                    sparkline: entry.pair.sparkline,
                    color: colors.primary,
                    categories: [],
                    description: entry.pair.coin.name,
                    holders: 0,
                    isTradeable: true,
                    kind: 'bluechip',
                    logo: entry.pair.image,
                  }}
                  statusLabel="Favorito"
                  statusTone="success"
                  onPress={() => navigateToTrade(router, { pairId: entry.pair.id })}
                />
                <Text style={[styles.remove, { color: colors.textMuted }]} onPress={() => toggleFavoritePair(entry.pair.id)}>
                  Quitar
                </Text>
              </View>
            ) : (
              <View key={entry?.token.id} style={styles.rowWrap}>
                <MarketListRow
                  token={entry!.token}
                  statusLabel="Favorito"
                  statusTone="success"
                  onPress={() => navigateToTrade(router, { pairId: buildLegacyTokenPairId(entry!.token) })}
                />
                <Text style={[styles.remove, { color: colors.textMuted }]} onPress={() => toggleFavoritePair(buildLegacyTokenPairId(entry!.token))}>
                  Quitar
                </Text>
              </View>
            ),
          )}
        </View>
      ) : (
        <EmptyState
          title="Aun no guardas favoritos"
          body="Marca estrellas desde Operar para construir tu lista rapida."
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
  },
  list: {
    gap: 10,
  },
  rowWrap: {
    gap: 6,
  },
  remove: {
    fontFamily: FONT.medium,
    fontSize: 12,
    textAlign: 'right',
    paddingRight: 6,
  },
});
