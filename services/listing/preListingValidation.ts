import { buildCustomTradeRoute } from '../../constants/trading';
import type { MarketToken, PreListingTradeValidation } from '../../types';
import { fetchOneInchQuote } from '../trade/oneInch';

type SupportedValidationChain = 'ethereum' | 'base' | 'bnb';

function isSupportedValidationChain(
  chain: MarketToken['chain'],
): chain is SupportedValidationChain {
  return chain === 'ethereum' || chain === 'base' || chain === 'bnb';
}

export async function runPreListingTradeValidation(
  token: MarketToken,
  nativeTokenPriceUsd: number,
): Promise<PreListingTradeValidation> {
  const baseReport: PreListingTradeValidation = {
    status: 'failed',
    checkedAt: new Date().toISOString(),
    network: token.chain === 'base' || token.chain === 'bnb' || token.chain === 'ethereum' ? token.chain : undefined,
    buyPathValid: false,
    sellPathValid: false,
    sellBlocked: false,
    reasons: [],
  };

  if (!token.isUserCreated || !token.contractAddress || !token.chain || !isSupportedValidationChain(token.chain)) {
    return {
      ...baseReport,
      reasons: ['OrbitX protected trade validation is active first on supported EVM networks.'],
    };
  }

  if (!token.quoteTokenId || !token.quoteAddress || !token.liquidity || !token.liquidity.quoteAmount) {
    return {
      ...baseReport,
      reasons: ['The token does not have confirmed liquidity metadata yet.'],
    };
  }

  const route = buildCustomTradeRoute(token);
  if (!route) {
    return {
      ...baseReport,
      reasons: ['OrbitX could not build a real routing path for this token yet.'],
    };
  }

  const liquidityQuoteAmount = Number(token.liquidity.quoteAmount);
  const liquidityTokenAmount = Number(token.liquidity.tokenAmount);
  const buyAmount = Number(Math.max(Math.min(liquidityQuoteAmount * 0.01, 25), 5).toFixed(4));
  const sellAmount = Number(Math.max(Math.min(liquidityTokenAmount * 0.005, 1000), 1).toFixed(6));

  try {
    const [buyQuote, sellQuote] = await Promise.all([
      fetchOneInchQuote(
        token.chain,
        {
          tokenId: token.id,
          amount: buyAmount,
          side: 'buy',
          slippagePct: 1,
        },
        nativeTokenPriceUsd,
        route,
      ),
      fetchOneInchQuote(
        token.chain,
        {
          tokenId: token.id,
          amount: sellAmount,
          side: 'sell',
          slippagePct: 1,
        },
        nativeTokenPriceUsd,
        route,
      ),
    ]);

    const buyUnitPrice = buyQuote.receiveAmount > 0 ? buyAmount / buyQuote.receiveAmount : 0;
    const sellUnitPrice = sellAmount > 0 ? sellQuote.receiveAmount / sellAmount : 0;
    const estimatedSellFeePct =
      buyUnitPrice > 0 ? Math.max(0, 100 - (sellUnitPrice / buyUnitPrice) * 100) : undefined;
    const priceImpactPct = Math.max(
      buyQuote.priceImpactPct ?? 0,
      sellQuote.priceImpactPct ?? 0,
    );
    const reasons: string[] = [];

    if (sellQuote.receiveAmount <= 0) {
      reasons.push('Selling the token returned effectively zero output.');
    }

    if ((estimatedSellFeePct ?? 0) >= 35) {
      reasons.push('The estimated sell fee is too high for OrbitX protected listing.');
    }

    if (priceImpactPct >= 25) {
      reasons.push('The quoted price impact is too high for a protected listing.');
    }

    return {
      ...baseReport,
      status: reasons.length ? 'failed' : 'passed',
      buyPathValid: true,
      sellPathValid: sellQuote.receiveAmount > 0,
      sellBlocked: sellQuote.receiveAmount <= 0,
      estimatedSellFeePct,
      priceImpactPct,
      reasons,
    };
  } catch (error) {
    return {
      ...baseReport,
      reasons: [
        error instanceof Error
          ? error.message
          : 'OrbitX could not validate the buy/sell path with a real quote.',
      ],
    };
  }
}
