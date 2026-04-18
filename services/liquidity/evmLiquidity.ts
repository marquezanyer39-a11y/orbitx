import { ethers } from 'ethers';

import type { LaunchChain } from '../../types';
import { getStoredWalletBundle } from '../../utils/wallet';

type SupportedLiquidityChain = 'ethereum' | 'bnb';
export type LiquidityPairKind = 'native' | 'stable';

export interface LiquidityPairOption {
  id: LiquidityPairKind;
  label: string;
  quoteTokenId: string;
  quoteLabel: string;
  quoteAddress: string;
  quoteDecimals: number;
  usesNative: boolean;
}

export interface RealLiquidityEstimate {
  pairLabel: string;
  tokenAmount: number;
  quoteAmount: number;
  estimatedFeeUsd: number;
  routerAddress: string;
  quoteTokenId: string;
  quoteAddress: string;
  quoteDecimals: number;
}

export interface RealLiquidityResult extends RealLiquidityEstimate {
  chain: SupportedLiquidityChain;
  pairAddress: string;
  transactionHash: string;
  creatorAddress: string;
  tokenDecimals: number;
  priceUsd: number;
  liquidityPoolUsd: number;
  lpTokenAmountRaw: string;
  lpTokenAmount: string;
  marketCapUsd: number;
}

interface RouterConfig {
  routerAddress: string;
  chainId: number;
  rpcUrl: string;
  stable: {
    tokenId: string;
    label: string;
    address: string;
    decimals: number;
    assumedUsd: number;
  };
  native: {
    tokenId: string;
    label: string;
  };
}

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address owner) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
];

const ROUTER_ABI = [
  'function factory() external pure returns (address)',
  'function WETH() external pure returns (address)',
  'function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)',
  'function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)',
];

const FACTORY_ABI = ['function getPair(address tokenA, address tokenB) external view returns (address)'];

const CONFIG_BY_CHAIN: Record<SupportedLiquidityChain, RouterConfig> = {
  ethereum: {
    routerAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    chainId: 1,
    rpcUrl: process.env.EXPO_PUBLIC_ETHEREUM_RPC_URL || 'https://ethereum-rpc.publicnode.com',
    stable: {
      tokenId: 'usdt',
      label: 'USDT',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
      assumedUsd: 1,
    },
    native: {
      tokenId: 'eth',
      label: 'ETH',
    },
  },
  bnb: {
    routerAddress: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    chainId: 56,
    rpcUrl: process.env.EXPO_PUBLIC_BNB_RPC_URL || 'https://bsc-dataseed.bnbchain.org',
    stable: {
      tokenId: 'usdt',
      label: 'USDT',
      address: '0x55d398326f99059fF775485246999027B3197955',
      decimals: 18,
      assumedUsd: 1,
    },
    native: {
      tokenId: 'bnb',
      label: 'BNB',
    },
  },
};

function assertSupportedChain(chain: LaunchChain): asserts chain is SupportedLiquidityChain {
  if (chain !== 'ethereum' && chain !== 'bnb') {
    throw new Error('La liquidez real queda activa primero en Ethereum y BNB Chain.');
  }
}

function getProvider(chain: SupportedLiquidityChain) {
  const config = CONFIG_BY_CHAIN[chain];
  return new ethers.providers.StaticJsonRpcProvider(config.rpcUrl, config.chainId);
}

async function getSigner(chain: SupportedLiquidityChain) {
  const bundle = await getStoredWalletBundle();
  if (!bundle) {
    throw new Error('Primero crea o importa tu wallet OrbitX.');
  }

  const provider = getProvider(chain);
  const signer = ethers.Wallet.fromMnemonic(bundle.mnemonic).connect(provider);

  return {
    signer,
    address: signer.address,
  };
}

function getPairOption(chain: SupportedLiquidityChain, pair: LiquidityPairKind): LiquidityPairOption {
  const config = CONFIG_BY_CHAIN[chain];

  if (pair === 'native') {
    return {
      id: 'native',
      label: `TOKEN/${config.native.label}`,
      quoteTokenId: config.native.tokenId,
      quoteLabel: config.native.label,
      quoteAddress: ethers.constants.AddressZero,
      quoteDecimals: 18,
      usesNative: true,
    };
  }

  return {
    id: 'stable',
    label: `TOKEN/${config.stable.label}`,
    quoteTokenId: config.stable.tokenId,
    quoteLabel: config.stable.label,
    quoteAddress: config.stable.address,
    quoteDecimals: config.stable.decimals,
    usesNative: false,
  };
}

async function ensureAllowance(
  tokenAddress: string,
  signer: ethers.Wallet,
  spender: string,
  amount: ethers.BigNumber,
) {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  const allowance = await token.allowance(signer.address, spender);

  if (allowance.gte(amount)) {
    return;
  }

  const approval = await token.approve(spender, amount);
  await approval.wait(1);
}

async function getTokenDecimals(tokenAddress: string, signer: ethers.Wallet) {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  const decimals = await token.decimals();
  return Number(decimals);
}

async function getTokenBalance(tokenAddress: string, address: string, provider: ethers.providers.Provider) {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  return token.balanceOf(address) as Promise<ethers.BigNumber>;
}

export function supportsRealLiquidityCreation(chain: LaunchChain) {
  return chain === 'ethereum' || chain === 'bnb';
}

export function getLiquidityPairOptions(chain: LaunchChain): LiquidityPairOption[] {
  if (!supportsRealLiquidityCreation(chain)) {
    return [];
  }

  return [getPairOption(chain, 'native'), getPairOption(chain, 'stable')];
}

export async function estimateRealLiquidityCreation(params: {
  chain: LaunchChain;
  tokenAddress: string;
  pair: LiquidityPairKind;
  tokenAmount: string;
  quoteAmount: string;
  nativeTokenPriceUsd: number;
}) {
  assertSupportedChain(params.chain);

  const tokenAmount = Number(params.tokenAmount);
  const quoteAmount = Number(params.quoteAmount);

  if (!Number.isFinite(tokenAmount) || tokenAmount <= 0 || !Number.isFinite(quoteAmount) || quoteAmount <= 0) {
    throw new Error('Define un monto valido para token y quote.');
  }

  const { signer } = await getSigner(params.chain);
  const config = CONFIG_BY_CHAIN[params.chain];
  const pair = getPairOption(params.chain, params.pair);
  const router = new ethers.Contract(config.routerAddress, ROUTER_ABI, signer);
  const tokenDecimals = await getTokenDecimals(params.tokenAddress, signer);

  const tokenAmountDesired = ethers.utils.parseUnits(String(tokenAmount), tokenDecimals);
  const quoteAmountDesired = ethers.utils.parseUnits(String(quoteAmount), pair.quoteDecimals);
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

  const txRequest = pair.usesNative
    ? await router.populateTransaction.addLiquidityETH(
        params.tokenAddress,
        tokenAmountDesired,
        tokenAmountDesired.mul(97).div(100),
        quoteAmountDesired.mul(97).div(100),
        signer.address,
        deadline,
        { value: quoteAmountDesired },
      )
    : await router.populateTransaction.addLiquidity(
        params.tokenAddress,
        pair.quoteAddress,
        tokenAmountDesired,
        quoteAmountDesired,
        tokenAmountDesired.mul(97).div(100),
        quoteAmountDesired.mul(97).div(100),
        signer.address,
        deadline,
      );

  const gasEstimate = await signer.estimateGas({
    ...txRequest,
    from: signer.address,
  });
  const feeData = await signer.provider.getFeeData();
  const gasPrice = feeData.maxFeePerGas ?? feeData.gasPrice ?? ethers.utils.parseUnits('1', 'gwei');
  const gasNative = Number(ethers.utils.formatEther(gasEstimate.mul(gasPrice)));
  const estimatedFeeUsd = gasNative * Math.max(params.nativeTokenPriceUsd, 0);

  return {
    pairLabel: pair.label,
    tokenAmount,
    quoteAmount,
    estimatedFeeUsd,
    routerAddress: config.routerAddress,
    quoteTokenId: pair.quoteTokenId,
    quoteAddress: pair.quoteAddress,
    quoteDecimals: pair.quoteDecimals,
  } satisfies RealLiquidityEstimate;
}

export async function createRealLiquidityPool(params: {
  chain: LaunchChain;
  tokenAddress: string;
  pair: LiquidityPairKind;
  tokenAmount: string;
  quoteAmount: string;
  nativeTokenPriceUsd: number;
  totalSupply: string;
}) {
  assertSupportedChain(params.chain);

  const tokenAmount = Number(params.tokenAmount);
  const quoteAmount = Number(params.quoteAmount);

  if (!Number.isFinite(tokenAmount) || tokenAmount <= 0 || !Number.isFinite(quoteAmount) || quoteAmount <= 0) {
    throw new Error('Define un monto valido para token y quote.');
  }

  const { signer, address } = await getSigner(params.chain);
  const provider = signer.provider;
  const config = CONFIG_BY_CHAIN[params.chain];
  const pair = getPairOption(params.chain, params.pair);
  const router = new ethers.Contract(config.routerAddress, ROUTER_ABI, signer);
  const factoryAddress: string = await router.factory();
  const wrappedNativeAddress: string = await router.WETH();
  const quotePairAddress = pair.usesNative ? wrappedNativeAddress : pair.quoteAddress;
  const factory = new ethers.Contract(factoryAddress, FACTORY_ABI, provider);
  const preExistingPairAddress: string = await factory.getPair(params.tokenAddress, quotePairAddress);
  const tokenDecimals = await getTokenDecimals(params.tokenAddress, signer);
  const tokenAmountDesired = ethers.utils.parseUnits(String(tokenAmount), tokenDecimals);
  const quoteAmountDesired = ethers.utils.parseUnits(String(quoteAmount), pair.quoteDecimals);
  const pairTokenBeforeBalance =
    preExistingPairAddress && preExistingPairAddress !== ethers.constants.AddressZero
      ? await getTokenBalance(preExistingPairAddress, address, provider)
      : ethers.constants.Zero;

  const tokenBalance = await getTokenBalance(params.tokenAddress, address, provider);
  if (tokenBalance.lt(tokenAmountDesired)) {
    throw new Error('No tienes suficientes tokens para crear esa liquidez.');
  }

  if (pair.usesNative) {
    const nativeBalance = await provider.getBalance(address);
    if (nativeBalance.lt(quoteAmountDesired)) {
      throw new Error(`No tienes suficiente ${pair.quoteLabel} para crear la liquidez.`);
    }
  } else {
    const quoteBalance = await getTokenBalance(pair.quoteAddress, address, provider);
    if (quoteBalance.lt(quoteAmountDesired)) {
      throw new Error(`No tienes suficiente ${pair.quoteLabel} para crear la liquidez.`);
    }
    await ensureAllowance(pair.quoteAddress, signer, config.routerAddress, quoteAmountDesired);
  }

  await ensureAllowance(params.tokenAddress, signer, config.routerAddress, tokenAmountDesired);

  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
  const minToken = tokenAmountDesired.mul(97).div(100);
  const minQuote = quoteAmountDesired.mul(97).div(100);

  const tx = pair.usesNative
    ? await router.addLiquidityETH(
        params.tokenAddress,
        tokenAmountDesired,
        minToken,
        minQuote,
        address,
        deadline,
        { value: quoteAmountDesired },
      )
    : await router.addLiquidity(
        params.tokenAddress,
        pair.quoteAddress,
        tokenAmountDesired,
        quoteAmountDesired,
        minToken,
        minQuote,
        address,
        deadline,
      );

  const receipt = await tx.wait(1);
  const pairAddress: string = await factory.getPair(params.tokenAddress, quotePairAddress);
  const pairTokenAfterBalance = await getTokenBalance(pairAddress, address, provider);
  const lpTokenAmountRaw = pairTokenAfterBalance.sub(pairTokenBeforeBalance);

  const quoteUsd =
    pair.usesNative
      ? quoteAmount * Math.max(params.nativeTokenPriceUsd, 0)
      : quoteAmount * CONFIG_BY_CHAIN[params.chain].stable.assumedUsd;
  const priceUsd = quoteUsd / tokenAmount;
  const liquidityPoolUsd = quoteUsd * 2;
  const totalSupplyNumber = Number(params.totalSupply);
  const marketCapUsd = Number.isFinite(totalSupplyNumber) ? totalSupplyNumber * priceUsd : 0;

  return {
    chain: params.chain,
    pairAddress,
    transactionHash: receipt.transactionHash,
    creatorAddress: address,
    pairLabel: pair.label,
    tokenAmount,
    quoteAmount,
    estimatedFeeUsd: 0,
    routerAddress: config.routerAddress,
    quoteTokenId: pair.quoteTokenId,
    quoteAddress: pair.usesNative ? wrappedNativeAddress : pair.quoteAddress,
    quoteDecimals: pair.quoteDecimals,
    tokenDecimals,
    priceUsd,
    liquidityPoolUsd,
    lpTokenAmountRaw: lpTokenAmountRaw.toString(),
    lpTokenAmount: ethers.utils.formatUnits(lpTokenAmountRaw, 18),
    marketCapUsd,
  } satisfies RealLiquidityResult & { marketCapUsd: number };
}
