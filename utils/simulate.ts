import type { BotRisk, BotState, BotTrade, MarketToken, TradeSide } from '../types';

export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function randomBetween(minimum: number, maximum: number) {
  return Math.random() * (maximum - minimum) + minimum;
}

export function sample<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

export function roundTo(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

export function normalizeTicker(value: string) {
  return value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6);
}

export function createSparkline(centerPrice: number, steps = 12, variance = 0.08) {
  const points: number[] = [];
  let current = centerPrice;

  for (let index = 0; index < steps; index += 1) {
    current = Math.max(current * (1 + randomBetween(-variance, variance)), centerPrice * 0.4);
    points.push(roundAdaptivePrice(current));
  }

  return points;
}

export function roundAdaptivePrice(value: number) {
  if (value >= 1_000) {
    return roundTo(value, 2);
  }

  if (value >= 1) {
    return roundTo(value, 4);
  }

  return Number(value.toPrecision(6));
}

export function getRiskMultiplier(risk: BotRisk) {
  switch (risk) {
    case 'conservative':
      return 0.8;
    case 'aggressive':
      return 1.45;
    default:
      return 1;
  }
}

export function buildBotTrade(
  tokenId: string,
  side: TradeSide,
  amountUsd: number,
  pnlUsd: number,
): BotTrade {
  return {
    id: `trade-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    tokenId,
    side,
    amountUsd: roundTo(amountUsd, 2),
    pnlUsd: roundTo(pnlUsd, 2),
    status: 'closed',
    timestamp: new Date().toISOString(),
  };
}

export function simulateBot(bot: BotState, tokens: MarketToken[]) {
  if (!bot.enabled) {
    return bot;
  }

  const multiplier = getRiskMultiplier(bot.risk);
  const nextDailyPnl = clamp(
    bot.dailyPnlUsd + randomBetween(-14, 22) * multiplier,
    -bot.allocatedUsd * 0.2,
    bot.allocatedUsd * 0.32,
  );
  const nextTotalProfit = clamp(
    bot.totalProfitUsd + randomBetween(-9, 28) * multiplier,
    -bot.allocatedUsd * 0.18,
    bot.allocatedUsd * 0.9,
  );

  let nextHistory = bot.history;
  if (Math.random() > 0.72) {
    const tradeableTokens = tokens.filter((token) => token.isTradeable && token.kind !== 'cash');
    const preferredToken =
      tradeableTokens.find((token) => token.id === bot.selectedTokenId) ?? null;
    const token =
      preferredToken && Math.random() > 0.18 ? preferredToken : sample(tradeableTokens);
    const side: TradeSide = Math.random() > 0.5 ? 'buy' : 'sell';
    const pnlUsd = randomBetween(-18, 32) * multiplier + token.change24h * 0.45;
    const nextTrade = buildBotTrade(
      token.id,
      side,
      randomBetween(Math.max(bot.allocatedUsd * 0.12, 120), Math.max(bot.allocatedUsd * 0.32, 420)),
      pnlUsd,
    );
    nextHistory = [nextTrade, ...bot.history].slice(0, 8);
  }

  return {
    ...bot,
    dailyPnlUsd: roundTo(nextDailyPnl, 2),
    dailyGainPct: roundTo((nextDailyPnl / bot.allocatedUsd) * 100, 2),
    totalProfitUsd: roundTo(nextTotalProfit, 2),
    history: nextHistory,
  };
}
