import { ethers } from 'ethers';

import { ORBIT_TRADE_ROUTES } from '../../constants/trading';
import type { WalletNetwork } from '../../types';
import type { OrbitTradeRoute } from '../../constants/trading';
import { getStoredWalletBundle } from '../../utils/wallet';
import type {
  NormalizedTradeQuote,
  TradeExecutionResult,
  TradeQuoteRequest,
} from './types';

const ONEINCH_BASE_URL = process.env.EXPO_PUBLIC_ONEINCH_API_URL || 'https://api.1inch.dev';
const ONEINCH_API_KEY = process.env.EXPO_PUBLIC_ONEINCH_API_KEY || '';

const providerCache = new Map<'ethereum' | 'base' | 'bnb', ethers.providers.StaticJsonRpcProvider>();

function ensureOneInchConfigured() {
  if (!ONEINCH_API_KEY) {
    throw new Error('Falta EXPO_PUBLIC_ONEINCH_API_KEY para activar swaps reales EVM.');
  }
}

function getHeaders() {
  return {
    Authorization: `Bearer ${ONEINCH_API_KEY}`,
    accept: 'application/json',
  };
}

async function requestJson<T>(url: string) {
  const response = await fetch(url, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `1inch devolvio ${response.status}`);
  }

  return (await response.json()) as T;
}

async function getProvider(network: 'ethereum' | 'base' | 'bnb') {
  const cached = providerCache.get(network);
  if (cached) {
    return cached;
  }

  const rpcMap = {
    ethereum: process.env.EXPO_PUBLIC_ETHEREUM_RPC_URL || 'https://ethereum-rpc.publicnode.com',
    base: process.env.EXPO_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
    bnb: process.env.EXPO_PUBLIC_BNB_RPC_URL || 'https://bsc-dataseed.bnbchain.org',
  };
  const chainIds = {
    ethereum: 1,
    base: 8453,
    bnb: 56,
  } as const;

  const provider = new ethers.providers.StaticJsonRpcProvider(rpcMap[network], chainIds[network]);
  providerCache.set(network, provider);
  return provider;
}

function getActiveEvmRoute(tokenId: string, network: WalletNetwork) {
  return ORBIT_TRADE_ROUTES.find(
    (route) =>
      route.provider === '1inch' &&
      route.tokenId === tokenId &&
      route.network === network &&
      route.active,
  );
}

async function getWalletAddress() {
  const bundle = await getStoredWalletBundle();
  if (!bundle) {
    throw new Error('Primero crea o importa tu wallet OrbitX.');
  }

  return {
    mnemonic: bundle.mnemonic,
    address: bundle.receiveAddresses.ethereum,
  };
}

export async function fetchOneInchQuote(
  network: 'ethereum' | 'base' | 'bnb',
  request: TradeQuoteRequest,
  nativeTokenPriceUsd: number,
  routeOverride?: OrbitTradeRoute,
): Promise<NormalizedTradeQuote> {
  ensureOneInchConfigured();
  const route = routeOverride ?? getActiveEvmRoute(request.tokenId, network);
  if (!route || !route.chainId) {
    throw new Error('Este token todavia no tiene routing real en esta red.');
  }

  const wallet = await getWalletAddress();
  const srcAddress = request.side === 'buy' ? route.quoteAddress : route.tokenAddress;
  const dstAddress = request.side === 'buy' ? route.tokenAddress : route.quoteAddress;
  const srcDecimals = request.side === 'buy' ? route.quoteDecimals : route.tokenDecimals;
  const dstDecimals = request.side === 'buy' ? route.tokenDecimals : route.quoteDecimals;
  const amountRaw = ethers.utils.parseUnits(String(request.amount), srcDecimals).toString();

  const quoteUrl = new URL(`${ONEINCH_BASE_URL}/swap/v6.1/${route.chainId}/quote`);
  quoteUrl.searchParams.set('src', srcAddress);
  quoteUrl.searchParams.set('dst', dstAddress);
  quoteUrl.searchParams.set('amount', amountRaw);
  quoteUrl.searchParams.set('includeGas', 'true');

  const allowanceUrl = new URL(`${ONEINCH_BASE_URL}/swap/v6.1/${route.chainId}/approve/allowance`);
  allowanceUrl.searchParams.set('tokenAddress', srcAddress);
  allowanceUrl.searchParams.set('walletAddress', wallet.address);

  const [quote, allowancePayload] = await Promise.all([
    requestJson<{
      dstAmount: string;
      gas?: number;
      gasPrice?: string;
    }>(quoteUrl.toString()),
    srcAddress.toLowerCase() === route.quoteAddress.toLowerCase() && request.side === 'buy'
      ? requestJson<{ allowance: string }>(allowanceUrl.toString())
      : srcAddress.toLowerCase() === route.tokenAddress.toLowerCase() &&
          route.tokenAddress !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
        ? requestJson<{ allowance: string }>(allowanceUrl.toString())
        : Promise.resolve({ allowance: ethers.constants.MaxUint256.toString() }),
  ]);

  const receiveAmount = Number(ethers.utils.formatUnits(quote.dstAmount, dstDecimals));
  const gasPrice = quote.gasPrice ? Number(ethers.utils.formatUnits(quote.gasPrice, 18)) : 0;
  const gasCostNative = (quote.gas ?? 0) * gasPrice;
  const feeAmountUsd =
    network === 'bnb'
      ? gasCostNative * 640
      : gasCostNative * (network === 'base' || network === 'ethereum' ? nativeTokenPriceUsd : 0);
  const approvalRequired =
    route.quoteAddress !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' &&
    ethers.BigNumber.from(allowancePayload.allowance || '0').lt(amountRaw);

  const swapUrl = new URL(`${ONEINCH_BASE_URL}/swap/v6.1/${route.chainId}/swap`);
  swapUrl.searchParams.set('src', srcAddress);
  swapUrl.searchParams.set('dst', dstAddress);
  swapUrl.searchParams.set('amount', amountRaw);
  swapUrl.searchParams.set('from', wallet.address);
  swapUrl.searchParams.set('slippage', String(request.slippagePct));
  swapUrl.searchParams.set('disableEstimate', 'true');
  swapUrl.searchParams.set('allowPartialFill', 'false');

  const swapResponse = await requestJson<{
    dstAmount: string;
    tx: {
      from: string;
      to: string;
      data: string;
      value: string;
      gas?: string;
      gasPrice?: string;
    };
  }>(swapUrl.toString());

  return {
    routeId: route.id,
    network,
    provider: '1inch',
    tokenId: route.tokenId,
    quoteTokenId: route.quoteTokenId,
    payAmount: request.amount,
    receiveAmount,
    feeAmountUsd,
    slippagePct: request.slippagePct,
    execution: {
      provider: '1inch',
      network,
      routeId: route.id,
      chainId: route.chainId,
      tokenId: route.tokenId,
      quoteTokenId: route.quoteTokenId,
      side: request.side,
      amountInRaw: amountRaw,
      amountOutRaw: quote.dstAmount,
      sourceAddress: srcAddress,
      quoteResponse: quote,
      swapResponse,
      approvalRequired,
    },
  };
}

export async function executeOneInchSwap(
  quote: NormalizedTradeQuote,
  onStageChange?: (stage: 'signing' | 'executing') => void,
): Promise<TradeExecutionResult> {
  ensureOneInchConfigured();
  if (quote.provider !== '1inch') {
    throw new Error('Quote invalida para 1inch.');
  }

  const executionChainId = quote.execution.chainId;
  const route =
    ORBIT_TRADE_ROUTES.find((item) => item.id === quote.routeId) ??
    ({ network: quote.network, chainId: executionChainId } as Pick<OrbitTradeRoute, 'network' | 'chainId'>);

  if (!route || !route.chainId || route.network === 'solana') {
    throw new Error('No encontramos la ruta EVM para este swap.');
  }

  const bundle = await getStoredWalletBundle();
  if (!bundle) {
    throw new Error('Primero crea o importa tu wallet OrbitX.');
  }

  const provider = await getProvider(route.network);
  const signer = ethers.Wallet.fromMnemonic(bundle.mnemonic).connect(provider);
  const swapResponse = quote.execution.swapResponse as
    | {
        tx?: {
          to: string;
          data: string;
          value: string;
          gas?: string;
          gasPrice?: string;
        };
      }
    | undefined;

  if (!swapResponse?.tx) {
    throw new Error('No recibimos la transaccion de 1inch.');
  }

  if (quote.execution.approvalRequired) {
    const approveUrl = new URL(`${ONEINCH_BASE_URL}/swap/v6.1/${route.chainId}/approve/transaction`);
    approveUrl.searchParams.set('tokenAddress', quote.execution.sourceAddress || '');
    approveUrl.searchParams.set('amount', quote.execution.amountInRaw);

    const approvalTx = await requestJson<{
      data: string;
      to: string;
      value?: string;
      gasPrice?: string;
    }>(approveUrl.toString());

    onStageChange?.('signing');
    const approvalResult = await signer.sendTransaction({
      to: approvalTx.to,
      data: approvalTx.data,
      value: approvalTx.value ? ethers.BigNumber.from(approvalTx.value) : ethers.constants.Zero,
      gasPrice: approvalTx.gasPrice ? ethers.BigNumber.from(approvalTx.gasPrice) : undefined,
    });
    onStageChange?.('executing');
    await approvalResult.wait(1);
  }

  onStageChange?.('signing');
  const transaction = await signer.sendTransaction({
    to: swapResponse.tx.to,
    data: swapResponse.tx.data,
    value: ethers.BigNumber.from(swapResponse.tx.value || '0'),
    gasLimit: swapResponse.tx.gas ? ethers.BigNumber.from(swapResponse.tx.gas) : undefined,
    gasPrice: swapResponse.tx.gasPrice
      ? ethers.BigNumber.from(swapResponse.tx.gasPrice)
      : undefined,
  });

  onStageChange?.('executing');
  await transaction.wait(1);

  return {
    network: route.network,
    hash: transaction.hash,
    provider: '1inch',
  };
}
