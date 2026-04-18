import type {
  ActivityEntry,
  BotState,
  MarketFilter,
  MarketToken,
  PortfolioAsset,
  WalletAsset,
} from '../types';

export function getTokenMap(tokens: MarketToken[]) {
  return new Map(tokens.map((token) => [token.id, token]));
}

export function getTokenById(tokens: MarketToken[], tokenId: string) {
  return tokens.find((token) => token.id === tokenId) ?? null;
}

export function getPortfolioAssets(assets: WalletAsset[], tokens: MarketToken[]): PortfolioAsset[] {
  const tokenMap = getTokenMap(tokens);

  return assets
    .map((asset) => {
      const token = tokenMap.get(asset.tokenId);
      if (!token) {
        return null;
      }

      const valueUsd = asset.amount * token.price;
      const pnlUsd = (token.price - asset.averageCost) * asset.amount;
      const pnlPct = asset.averageCost > 0 ? ((token.price - asset.averageCost) / asset.averageCost) * 100 : 0;

      return {
        ...asset,
        token,
        valueUsd,
        pnlUsd,
        pnlPct,
      };
    })
    .filter((asset): asset is PortfolioAsset => asset !== null && asset.amount > 0)
    .sort((left, right) => right.valueUsd - left.valueUsd);
}

export function getTotalBalance(assets: WalletAsset[], tokens: MarketToken[], bot: BotState) {
  void bot;
  return getPortfolioAssets(assets, tokens).reduce((sum, asset) => sum + asset.valueUsd, 0);
}

export function getDailyPnl(assets: WalletAsset[], tokens: MarketToken[], bot: BotState) {
  void bot;
  const portfolioPnl = getPortfolioAssets(assets, tokens).reduce(
    (sum, asset) => sum + asset.valueUsd * (asset.token.change24h / 100),
    0,
  );

  return portfolioPnl;
}

export function getDailyPnlPct(assets: WalletAsset[], tokens: MarketToken[], bot: BotState) {
  const totalBalance = getTotalBalance(assets, tokens, bot);
  if (totalBalance <= 0) {
    return 0;
  }

  return (getDailyPnl(assets, tokens, bot) / totalBalance) * 100;
}

export function getTradeableTokens(tokens: MarketToken[]) {
  return tokens.filter((token) => token.isTradeable && token.kind !== 'cash');
}

export function getFilteredTokens(tokens: MarketToken[], filter: MarketFilter, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  return getTradeableTokens(tokens)
    .filter((token) => token.categories.includes(filter))
    .filter((token) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        token.name.toLowerCase().includes(normalizedQuery) ||
        token.symbol.toLowerCase().includes(normalizedQuery)
      );
    })
    .sort((left, right) => right.volume24h - left.volume24h);
}

export function getTrendingTokens(tokens: MarketToken[], limit = 4) {
  return getTradeableTokens(tokens)
    .sort((left, right) => right.change24h - left.change24h)
    .slice(0, limit);
}

export function getHiddenGems(tokens: MarketToken[], limit = 4) {
  return getTradeableTokens(tokens)
    .filter((token) => token.marketCap < 1_300_000_000)
    .sort(
      (left, right) =>
        right.change24h + right.volume24h / 1_000_000_000 - (left.change24h + left.volume24h / 1_000_000_000),
    )
    .slice(0, limit);
}

export function getQuickMarket(tokens: MarketToken[], limit = 4) {
  return getTradeableTokens(tokens)
    .sort((left, right) => right.volume24h - left.volume24h)
    .slice(0, limit);
}

export function getRecentActivity(activity: ActivityEntry[], limit = 6) {
  return activity
    .slice()
    .sort(
      (left, right) =>
        new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
    )
    .slice(0, limit);
}
