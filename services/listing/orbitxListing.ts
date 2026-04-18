import { buildExplorerAddressUrl, buildExplorerTxUrl, getLaunchChainConfig } from '../../constants/networks';
import type {
  LaunchChain,
  LaunchTokenPayload,
  LaunchVenue,
  MarketToken,
  TokenTransparency,
} from '../../types';
import {
  createRealLiquidityPool,
  type LiquidityPairKind,
  type RealLiquidityResult,
} from '../liquidity/evmLiquidity';
import { runContractSafetyChecks } from './contractSafety';
import { createRealLiquidityLock } from './liquidityLock';
import { runPreListingTradeValidation } from './preListingValidation';

function inferVenue(chain: LaunchChain): LaunchVenue {
  const config = getLaunchChainConfig(chain);
  return config?.dexVenue ?? 'orbitx';
}

export function buildTokenTransparency(token: {
  chain: LaunchChain;
  chainId?: number | null;
  contractAddress?: string | null;
  deployerAddress?: string | null;
  deploymentTxHash?: string | null;
  poolAddress?: string | null;
  liquidityTxHash?: string | null;
  liquidityLock?: {
    txHash?: string;
    lockerAddress?: string;
  } | null;
}): TokenTransparency {
  return {
    network: token.chain,
    chainId: token.chainId ?? undefined,
    contractAddress: token.contractAddress ?? undefined,
    contractExplorerUrl: buildExplorerAddressUrl(token.chain, token.contractAddress) ?? undefined,
    creationTxHash: token.deploymentTxHash ?? undefined,
    creationExplorerUrl: buildExplorerTxUrl(token.chain, token.deploymentTxHash) ?? undefined,
    creatorWallet: token.deployerAddress ?? undefined,
    creatorExplorerUrl: buildExplorerAddressUrl(token.chain, token.deployerAddress) ?? undefined,
    poolAddress: token.poolAddress ?? undefined,
    poolExplorerUrl: buildExplorerAddressUrl(token.chain, token.poolAddress) ?? undefined,
    liquidityTxHash: token.liquidityTxHash ?? undefined,
    liquidityExplorerUrl: buildExplorerTxUrl(token.chain, token.liquidityTxHash) ?? undefined,
    lockTxHash: token.liquidityLock?.txHash ?? undefined,
    lockExplorerUrl: buildExplorerTxUrl(token.chain, token.liquidityLock?.txHash) ?? undefined,
    lockerAddress: token.liquidityLock?.lockerAddress ?? undefined,
    lockerExplorerUrl:
      buildExplorerAddressUrl(token.chain, token.liquidityLock?.lockerAddress) ?? undefined,
  };
}

export async function createExternalDexListing(params: {
  token: MarketToken;
  pairKind: LiquidityPairKind;
  tokenAmount: string;
  quoteAmount: string;
  nativeTokenPriceUsd: number;
}): Promise<LaunchTokenPayload> {
  if (!params.token.contractAddress || !params.token.tokenSupply || !params.token.chain) {
    throw new Error('The token is missing on-chain metadata required for listing.');
  }

  const liquidity = await createRealLiquidityPool({
    chain: params.token.chain,
    tokenAddress: params.token.contractAddress,
    pair: params.pairKind,
    tokenAmount: params.tokenAmount,
    quoteAmount: params.quoteAmount,
    nativeTokenPriceUsd: params.nativeTokenPriceUsd,
    totalSupply: params.token.tokenSupply,
  });

  return {
    mode: 'dex',
    listingType: 'external',
    lifecycleStatus: 'external_listing_selected',
    dexNetwork: liquidity.chain,
    dexVenue: inferVenue(liquidity.chain),
    pairKind: params.pairKind,
    tokenLiquidityAmount: Number(params.tokenAmount),
    quoteLiquidityAmount: Number(params.quoteAmount),
    liquidityPoolUsd: liquidity.liquidityPoolUsd,
    estimatedFeeUsd: liquidity.estimatedFeeUsd,
    poolReference: liquidity.pairAddress,
    poolAddress: liquidity.pairAddress,
    quoteTokenId: liquidity.quoteTokenId,
    quoteAddress: liquidity.quoteAddress,
    quoteDecimals: liquidity.quoteDecimals,
    tokenDecimals: liquidity.tokenDecimals,
    priceUsd: liquidity.priceUsd,
    marketCapUsd: liquidity.marketCapUsd,
    liquidityTxHash: liquidity.transactionHash,
    creatorWallet: liquidity.creatorAddress,
    chainId: liquidity.chain === 'ethereum' ? 1 : liquidity.chain === 'bnb' ? 56 : 8453,
    lpTokenAmount: liquidity.lpTokenAmount,
  };
}

export async function createOrbitxProtectedListing(params: {
  token: MarketToken;
  pairKind: LiquidityPairKind;
  tokenAmount: string;
  quoteAmount: string;
  nativeTokenPriceUsd: number;
  lockDurationDays: number;
  onStageChange?: (
    stage: 'checks' | 'liquidity' | 'validation' | 'lock',
  ) => void;
  onSafetyReport?: (report: Awaited<ReturnType<typeof runContractSafetyChecks>>) => void;
  onValidationReport?: (
    report: Awaited<ReturnType<typeof runPreListingTradeValidation>>,
  ) => void;
  onLiquidityCreated?: (result: RealLiquidityResult) => void;
}): Promise<LaunchTokenPayload> {
  if (!params.token.contractAddress || !params.token.tokenSupply || !params.token.chain) {
    throw new Error('The token is missing on-chain metadata required for protected listing.');
  }

  params.onStageChange?.('checks');
  const contractSafety = await runContractSafetyChecks(
    params.token.chain,
    params.token.contractAddress,
  );
  params.onSafetyReport?.(contractSafety);

  if (contractSafety.status !== 'passed') {
    const reason =
      contractSafety.reasons[0] ||
      'OrbitX could not approve the contract checks for protected listing.';
    throw new Error(reason);
  }

  params.onStageChange?.('liquidity');
  const liquidity = await createRealLiquidityPool({
    chain: params.token.chain,
    tokenAddress: params.token.contractAddress,
    pair: params.pairKind,
    tokenAmount: params.tokenAmount,
    quoteAmount: params.quoteAmount,
    nativeTokenPriceUsd: params.nativeTokenPriceUsd,
    totalSupply: params.token.tokenSupply,
  });
  params.onLiquidityCreated?.(liquidity);

  const tokenWithLiquidity: MarketToken = {
    ...params.token,
    quoteTokenId: liquidity.quoteTokenId,
    quoteAddress: liquidity.quoteAddress,
    quoteDecimals: liquidity.quoteDecimals,
    tokenDecimals: liquidity.tokenDecimals,
    liquidityPoolUsd: liquidity.liquidityPoolUsd,
    liquidity: {
      listingType: 'orbitx_protected',
      network: params.token.chain,
      dexVenue: inferVenue(params.token.chain),
      poolAddress: liquidity.pairAddress,
      creatorWallet: liquidity.creatorAddress,
      tokenAddress: params.token.contractAddress,
      pairKind: params.pairKind,
      quoteTokenId: liquidity.quoteTokenId,
      quoteAddress: liquidity.quoteAddress,
      quoteDecimals: liquidity.quoteDecimals,
      tokenDecimals: liquidity.tokenDecimals,
      tokenAmount: params.tokenAmount,
      quoteAmount: params.quoteAmount,
      liquidityAmountUsd: liquidity.liquidityPoolUsd,
      lpTokenAmount: liquidity.lpTokenAmount,
      createdAt: new Date().toISOString(),
      txHash: liquidity.transactionHash,
    },
  };

  params.onStageChange?.('validation');
  const preListingValidation = await runPreListingTradeValidation(
    tokenWithLiquidity,
    params.nativeTokenPriceUsd,
  );
  params.onValidationReport?.(preListingValidation);

  if (preListingValidation.status !== 'passed') {
    const reason =
      preListingValidation.reasons[0] ||
      'OrbitX could not validate real buy/sell routing for protected listing.';
    throw new Error(reason);
  }

  params.onStageChange?.('lock');
  const liquidityLock = await createRealLiquidityLock({
    chain: params.token.chain,
    poolAddress: liquidity.pairAddress,
    lpTokenAmountRaw: liquidity.lpTokenAmountRaw,
    liquidityAmountUsd: liquidity.liquidityPoolUsd,
    durationDays: params.lockDurationDays,
  });

  return {
    mode: 'orbitx',
    listingType: 'orbitx_protected',
    lifecycleStatus: 'orbitx_listed',
    dexVenue: inferVenue(liquidity.chain),
    pairKind: params.pairKind,
    tokenLiquidityAmount: Number(params.tokenAmount),
    quoteLiquidityAmount: Number(params.quoteAmount),
    liquidityPoolUsd: liquidity.liquidityPoolUsd,
    estimatedFeeUsd: liquidity.estimatedFeeUsd,
    poolReference: liquidity.pairAddress,
    poolAddress: liquidity.pairAddress,
    quoteTokenId: liquidity.quoteTokenId,
    quoteAddress: liquidity.quoteAddress,
    quoteDecimals: liquidity.quoteDecimals,
    tokenDecimals: liquidity.tokenDecimals,
    priceUsd: liquidity.priceUsd,
    marketCapUsd: liquidity.marketCapUsd,
    liquidityTxHash: liquidity.transactionHash,
    creatorWallet: liquidity.creatorAddress,
    chainId: liquidity.chain === 'ethereum' ? 1 : liquidity.chain === 'bnb' ? 56 : 8453,
    contractSafety,
    preListingValidation,
    liquidityLock,
    lpTokenAmount: liquidity.lpTokenAmount,
  };
}
