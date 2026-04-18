import { derivePath } from 'ed25519-hd-key';
import { mnemonicToSeedSync } from 'bip39';
import { Buffer } from 'buffer';
import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';

import { ORBIT_TRADE_ROUTES } from '../../constants/trading';
import { PUBLIC_RPC_URLS } from '../../constants/onchain';
import { getStoredWalletBundle } from '../../utils/wallet';
import type {
  NormalizedTradeQuote,
  TradeExecutionResult,
  TradeQuoteRequest,
} from './types';

const JUPITER_BASE_URL = process.env.EXPO_PUBLIC_JUPITER_API_URL || 'https://api.jup.ag';
const JUPITER_API_KEY = process.env.EXPO_PUBLIC_JUPITER_API_KEY || '';

function getHeaders() {
  return {
    accept: 'application/json',
    ...(JUPITER_API_KEY ? { 'x-api-key': JUPITER_API_KEY } : {}),
  };
}

async function requestJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...getHeaders(),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Jupiter devolvio ${response.status}`);
  }

  return (await response.json()) as T;
}

function getSolanaKeypair(mnemonic: string) {
  global.Buffer = global.Buffer || Buffer;
  const seed = mnemonicToSeedSync(mnemonic);
  const derived = derivePath("m/44'/501'/0'/0'", seed.toString('hex')).key;
  return Keypair.fromSeed(Uint8Array.from(derived).slice(0, 32));
}

function getActiveSolanaRoute(tokenId: string) {
  return ORBIT_TRADE_ROUTES.find(
    (route) => route.provider === 'jupiter' && route.network === 'solana' && route.tokenId === tokenId,
  );
}

export async function fetchJupiterQuote(
  request: TradeQuoteRequest,
): Promise<NormalizedTradeQuote> {
  const route = getActiveSolanaRoute(request.tokenId);
  if (!route) {
    throw new Error('Este token todavia no tiene routing real en Solana.');
  }

  const bundle = await getStoredWalletBundle();
  if (!bundle) {
    throw new Error('Primero crea o importa tu wallet OrbitX.');
  }

  const inputMint = request.side === 'buy' ? route.quoteAddress : route.tokenAddress;
  const outputMint = request.side === 'buy' ? route.tokenAddress : route.quoteAddress;
  const inputDecimals = request.side === 'buy' ? route.quoteDecimals : route.tokenDecimals;
  const outputDecimals = request.side === 'buy' ? route.tokenDecimals : route.quoteDecimals;
  const amountRaw = Math.round(request.amount * 10 ** inputDecimals).toString();

  const quoteUrl = new URL(`${JUPITER_BASE_URL}/swap/v1/quote`);
  quoteUrl.searchParams.set('inputMint', inputMint);
  quoteUrl.searchParams.set('outputMint', outputMint);
  quoteUrl.searchParams.set('amount', amountRaw);
  quoteUrl.searchParams.set('slippageBps', String(Math.round(request.slippagePct * 100)));
  quoteUrl.searchParams.set('swapMode', 'ExactIn');

  const quoteResponse = await requestJson<{
    outAmount: string;
    priceImpactPct?: string;
    routePlan?: Array<{
      swapInfo?: {
        feeAmount?: string;
        feeMint?: string;
      };
    }>;
  }>(quoteUrl.toString());

  const swapResponse = await requestJson<{
    swapTransaction: string;
  }>(`${JUPITER_BASE_URL}/swap/v1/swap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userPublicKey: bundle.receiveAddresses.solana,
      quoteResponse,
      dynamicComputeUnitLimit: true,
      dynamicSlippage: true,
      prioritizationFeeLamports: {
        priorityLevelWithMaxLamports: {
          priorityLevel: 'high',
          maxLamports: 1_000_000,
        },
      },
    }),
  });

  const receiveAmount = Number(quoteResponse.outAmount) / 10 ** outputDecimals;
  const routeFeesRaw = (quoteResponse.routePlan ?? []).reduce((sum, routeItem) => {
    return sum + Number(routeItem.swapInfo?.feeAmount ?? '0');
  }, 0);
  const feeAmountUsd = routeFeesRaw / 10 ** outputDecimals;

  return {
    routeId: route.id,
    network: 'solana',
    provider: 'jupiter',
    tokenId: route.tokenId,
    quoteTokenId: route.quoteTokenId,
    payAmount: request.amount,
    receiveAmount,
    feeAmountUsd,
    slippagePct: request.slippagePct,
    priceImpactPct: quoteResponse.priceImpactPct ? Number(quoteResponse.priceImpactPct) * 100 : undefined,
    execution: {
      provider: 'jupiter',
      network: 'solana',
      routeId: route.id,
      tokenId: route.tokenId,
      quoteTokenId: route.quoteTokenId,
      side: request.side,
      amountInRaw: amountRaw,
      amountOutRaw: quoteResponse.outAmount,
      quoteResponse,
      swapResponse,
    },
  };
}

export async function executeJupiterSwap(
  quote: NormalizedTradeQuote,
  onStageChange?: (stage: 'signing' | 'executing') => void,
): Promise<TradeExecutionResult> {
  const bundle = await getStoredWalletBundle();
  if (!bundle) {
    throw new Error('Primero crea o importa tu wallet OrbitX.');
  }

  const swapResponse = quote.execution.swapResponse as { swapTransaction?: string } | undefined;
  if (!swapResponse?.swapTransaction) {
    throw new Error('Jupiter no devolvio una transaccion para firmar.');
  }

  global.Buffer = global.Buffer || Buffer;

  const keypair = getSolanaKeypair(bundle.mnemonic);
  const connection = new Connection(PUBLIC_RPC_URLS.solana, 'confirmed');
  const transaction = VersionedTransaction.deserialize(
    Uint8Array.from(Buffer.from(swapResponse.swapTransaction, 'base64')),
  );

  onStageChange?.('signing');
  transaction.sign([keypair]);

  onStageChange?.('executing');
  const signature = await connection.sendRawTransaction(Uint8Array.from(transaction.serialize()), {
    skipPreflight: false,
    maxRetries: 2,
  });

  await connection.confirmTransaction(signature, 'confirmed');

  return {
    network: 'solana',
    hash: signature,
    provider: 'jupiter',
  };
}
