export interface PortfolioBalanceParts {
  spotBalanceUsd?: number;
  localAccountBalanceUsd?: number;
  web3BalanceUsd?: number;
}

export interface PortfolioDistribution {
  spotPercent: number;
  localPercent: number;
  web3Percent: number;
}

function safeUsd(value: number | null | undefined) {
  return Number.isFinite(value) && value ? Math.max(Number(value), 0) : 0;
}

export function getTotalPortfolioBalanceUsd(parts: PortfolioBalanceParts) {
  return (
    safeUsd(parts.spotBalanceUsd) +
    safeUsd(parts.localAccountBalanceUsd) +
    safeUsd(parts.web3BalanceUsd)
  );
}

export function getPortfolioDistribution(parts: PortfolioBalanceParts): PortfolioDistribution {
  const spotBalanceUsd = safeUsd(parts.spotBalanceUsd);
  const localAccountBalanceUsd = safeUsd(parts.localAccountBalanceUsd);
  const web3BalanceUsd = safeUsd(parts.web3BalanceUsd);
  const total = getTotalPortfolioBalanceUsd({
    spotBalanceUsd,
    localAccountBalanceUsd,
    web3BalanceUsd,
  });

  if (total <= 0) {
    return {
      spotPercent: 0,
      localPercent: 0,
      web3Percent: 0,
    };
  }

  return {
    spotPercent: (spotBalanceUsd / total) * 100,
    localPercent: (localAccountBalanceUsd / total) * 100,
    web3Percent: (web3BalanceUsd / total) * 100,
  };
}
