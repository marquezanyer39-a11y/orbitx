import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { FONT, RADII } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { MarketListRow } from '../../../components/lists/MarketListRow';
import { useOrbitStore } from '../../../store/useOrbitStore';
import { useAuthStore } from '../../store/authStore';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingState } from '../../components/common/LoadingState';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { SectionHeader } from '../../components/common/SectionHeader';
import { MarketList } from '../../components/market/MarketList';
import { useMarketData } from '../../hooks/useMarketData';
import { navigateToTrade } from '../../navigation/AppNavigator';
import { buildLegacyTokenPairId, mapLegacyTokenToMarketPair } from '../../utils/tradePairs';

type MarketTab = 'top' | 'memes' | 'mine';

const MARKET_TABS: Array<{ key: MarketTab; label: string }> = [
  { key: 'top', label: 'Top' },
  { key: 'memes', label: 'Memes' },
  { key: 'mine', label: 'Mis memes' },
];

export default function MarketsScreen() {
  const { colors } = useAppTheme();
  const { markets, loading, error, loadMarkets } = useMarketData('markets');
  const legacyTokens = useOrbitStore((state) => state.tokens);
  const profile = useAuthStore((state) => state.profile);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<MarketTab>('top');

  const marketByLegacyKey = useMemo(() => {
    const map = new Map<string, (typeof markets)[number]>();

    markets.forEach((pair) => {
      map.set(pair.baseId.toLowerCase(), pair);
      map.set(pair.baseSymbol.toLowerCase(), pair);
      map.set(pair.symbol.toLowerCase(), pair);
    });

    return map;
  }, [markets]);

  const topMarkets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const mappedLegacyPairs = legacyTokens
      .filter((token) => token.isTradeable && token.kind !== 'cash')
      .filter(
        (token) =>
          !markets.some(
            (pair) =>
              pair.baseId === (token.coingeckoId || token.id) ||
              pair.baseSymbol.toLowerCase() === token.symbol.toLowerCase(),
          ),
      )
      .map(mapLegacyTokenToMarketPair);

    const merged = [...markets, ...mappedLegacyPairs].sort(
      (left, right) => (right.coin.marketCap ?? 0) - (left.coin.marketCap ?? 0),
    );

    if (!normalized) {
      return merged;
    }

    return merged.filter((pair) => {
      const haystack = `${pair.symbol} ${pair.coin.name} ${pair.baseSymbol}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [legacyTokens, markets, query]);

  const memeTokens = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const source = legacyTokens
      .filter((token) => token.kind === 'meme' || token.isUserCreated)
      .map((token) => {
        const marketMatch =
          marketByLegacyKey.get((token.coingeckoId || '').toLowerCase()) ??
          marketByLegacyKey.get(token.symbol.toLowerCase()) ??
          null;

        if (!marketMatch) {
          return token;
        }

        return {
          ...token,
          price: marketMatch.price || token.price,
          change24h: marketMatch.change24h,
          volume24h: marketMatch.volume24h || token.volume24h,
          marketCap: marketMatch.coin.marketCap || token.marketCap,
          sparkline: marketMatch.sparkline.length ? marketMatch.sparkline : token.sparkline,
          logo: marketMatch.image || token.logo,
          coingeckoId: marketMatch.baseId || token.coingeckoId,
        };
      });

    if (!normalized) {
      return source
        .slice()
        .sort((left, right) => right.marketCap - left.marketCap)
        .slice(0, 12);
    }

    return source
      .filter((token) => {
        const haystack = `${token.symbol} ${token.name} ${token.creator ?? ''}`.toLowerCase();
        return haystack.includes(normalized);
      })
      .sort((left, right) => right.marketCap - left.marketCap)
      .slice(0, 12);
  }, [legacyTokens, marketByLegacyKey, query]);

  const myMemeTokens = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const source = legacyTokens
      .filter(
        (token) =>
          token.isUserCreated &&
          (!profile.handle || !token.creator ? true : token.creator === profile.handle),
      )
      .map((token) => {
        const marketMatch =
          marketByLegacyKey.get((token.coingeckoId || '').toLowerCase()) ??
          marketByLegacyKey.get(token.symbol.toLowerCase()) ??
          null;

        if (!marketMatch) {
          return token;
        }

        return {
          ...token,
          price: marketMatch.price || token.price,
          change24h: marketMatch.change24h,
          volume24h: marketMatch.volume24h || token.volume24h,
          marketCap: marketMatch.coin.marketCap || token.marketCap,
          sparkline: marketMatch.sparkline.length ? marketMatch.sparkline : token.sparkline,
          logo: marketMatch.image || token.logo,
          coingeckoId: marketMatch.baseId || token.coingeckoId,
        };
      });

    if (!normalized) {
      return source
        .slice()
        .sort(
          (left, right) =>
            new Date(right.updatedAt ?? right.createdAt ?? 0).getTime() -
            new Date(left.updatedAt ?? left.createdAt ?? 0).getTime(),
        )
        .slice(0, 12);
    }

    return source
      .filter((token) => {
        const haystack = `${token.symbol} ${token.name} ${token.creator ?? ''}`.toLowerCase();
        return haystack.includes(normalized);
      })
      .sort(
        (left, right) =>
          new Date(right.updatedAt ?? right.createdAt ?? 0).getTime() -
          new Date(left.updatedAt ?? left.createdAt ?? 0).getTime(),
      )
      .slice(0, 12);
  }, [legacyTokens, marketByLegacyKey, profile.handle, query]);

  const marketSubtitle =
    activeTab === 'top'
      ? 'Mercado en vivo por capitalizacion, liquidez y pares destacados.'
      : activeTab === 'memes'
        ? 'Memecoins activas y operables dentro del ecosistema OrbitX.'
        : 'Tus memecoins creadas, listas para seguimiento o trade.';

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <SectionHeader
        title="Mercados"
        subtitle={marketSubtitle}
        rightSlot={
          activeTab === 'top' ? undefined : (
            <PrimaryButton label="Crear token" onPress={() => router.push('/create-token')} />
          )
        }
      />

      <View
        style={[
          styles.searchShell,
          { backgroundColor: colors.fieldBackground, borderColor: colors.border },
        ]}
      >
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Busca por par, meme o activo"
          placeholderTextColor={colors.textMuted}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      <View style={styles.tabsRow}>
        {MARKET_TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tabChip,
                {
                  backgroundColor: active ? colors.primarySoft : colors.fieldBackground,
                  borderColor: active ? colors.borderStrong : colors.border,
                },
              ]}
            >
              <Text style={[styles.tabChipLabel, { color: active ? colors.text : colors.textMuted }]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {activeTab === 'top' ? (
        loading ? (
          <LoadingState title="Cargando mercados" body="Estamos trayendo los pares principales del mercado." />
        ) : error ? (
          <ErrorState body={error} onRetry={() => void loadMarkets()} />
        ) : (
          <MarketList
            pairs={topMarkets}
            onSelectPair={(pair) => navigateToTrade(router, { pairId: pair.id })}
          />
        )
      ) : activeTab === 'memes' ? (
        memeTokens.length ? (
          <View>
            {memeTokens.map((token) => (
              <MarketListRow
                key={token.id}
                token={token}
                statusLabel={token.isUserCreated ? 'Tu meme' : 'Meme'}
                statusTone={token.isUserCreated ? 'success' : 'muted'}
                onPress={() =>
                  token.isTradeable
                    ? navigateToTrade(router, { pairId: buildLegacyTokenPairId(token) })
                    : router.push(`/token/${token.id}`)
                }
              />
            ))}
          </View>
        ) : (
          <View
            style={[
              styles.emptyLaunchpad,
              { backgroundColor: colors.fieldBackground, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.emptyLaunchpadTitle, { color: colors.text }]}>
              No hay memecoins visibles por ahora
            </Text>
            <Text style={[styles.emptyLaunchpadBody, { color: colors.textMuted }]}>
              Vuelve cuando entren nuevos listados o crea tu primer meme dentro de OrbitX.
            </Text>
          </View>
        )
      ) : myMemeTokens.length ? (
        <View>
          {myMemeTokens.map((token) => (
            <MarketListRow
              key={token.id}
              token={token}
              statusLabel="Creada"
              statusTone="success"
              onPress={() =>
                token.isTradeable
                  ? navigateToTrade(router, { pairId: buildLegacyTokenPairId(token) })
                  : router.push(`/token/${token.id}`)
              }
            />
          ))}
        </View>
      ) : (
        <View
          style={[
            styles.emptyLaunchpad,
            { backgroundColor: colors.fieldBackground, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.emptyLaunchpadTitle, { color: colors.text }]}>
            Aun no tienes memes creadas
          </Text>
          <Text style={[styles.emptyLaunchpadBody, { color: colors.textMuted }]}>
            Cuando lances un token desde OrbitX, aparecera aqui con su estado y acceso a trade.
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabChip: {
    minHeight: 36,
    borderWidth: 1,
    borderRadius: RADII.pill,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabChipLabel: {
    fontFamily: FONT.semibold,
    fontSize: 12,
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
  emptyLaunchpad: {
    borderWidth: 1,
    borderRadius: RADII.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 6,
  },
  emptyLaunchpadTitle: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  emptyLaunchpadBody: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
});
