import type { SupportedNetwork } from '../../types';
import { isValidEvmAddress } from '../../../utils/validation';
import { FEATURE_STATUS } from '../../constants/featureStatus';
import { type TokenDefinition } from '../wallet/tokenRegistry';
import { ERC20_ABI_MINIMAL } from './erc20Abi';
import { normalizeWeb3Error, Web3ValidationError } from './web3Errors';
import {
  getChainConfig,
  getChainConfigById,
  getExplorerTxUrl,
  getNetworkConfig,
  getWeb3ExplorerUrl,
  type Web3ChainKey,
} from './web3NetworkConfig';

let ethersRuntimePromise: Promise<typeof import('ethers').ethers> | null = null;

async function getEthersRuntime() {
  if (!ethersRuntimePromise) {
    ethersRuntimePromise = (async () => {
      await import('react-native-get-random-values');
      await import('@ethersproject/shims');
      const module = await import('ethers');
      return module.ethers;
    })();
  }

  return ethersRuntimePromise;
}

function normalizeAmount(amountNative: number | string) {
  const amountString = typeof amountNative === 'number' ? String(amountNative) : amountNative.trim();
  const numericAmount = Number(amountString);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error('invalid amount');
  }

  return amountString;
}

function assertExternalProvider(provider: unknown) {
  if (!provider || typeof provider !== 'object') {
    throw new Error('provider not found');
  }

  return provider;
}

export interface ExternalTransactionParams {
  provider: unknown;
  fromAddress: string;
  toAddress: string;
  amountNative: number | string;
  chainId: number;
}

export interface ExternalTransactionEstimate {
  chainId: number;
  gasLimit: string;
  estimatedFeeNative: string;
  estimatedTotalNative: string;
}

export interface ExternalTransactionResult {
  hash: string | null;
  chainId: number;
  from: string | null;
  to: string | null;
  amountNative: string | null;
  explorerUrl?: string;
  status: 'sent' | 'confirmed' | 'blocked';
  blockNumber?: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface SendNativeParams {
  fromAddress: string;
  toAddress: string;
  amount: string;
  chainId: number;
  provider: unknown;
}

export interface SendErc20Params {
  fromAddress: string;
  toAddress: string;
  token: TokenDefinition;
  amount: string;
  chainId: number;
  provider: unknown;
}

export interface TransactionResult {
  status: 'success' | 'failed' | 'rejected_by_user' | 'pending' | 'blocked';
  txHash: string | null;
  explorerUrl: string | null;
  errorCode?: string;
  errorMessage?: string;
  gasUsed?: string;
  confirmedAt?: number;
}

export interface GasEstimate {
  gasLimit: string;
  gasPriceGwei: string;
  estimatedCostNative: string;
  estimatedCostUsd?: string;
  canEstimate: boolean;
  errorMessage?: string;
}

export type TxStatusMessage =
  | 'preparing'
  | 'estimating_gas'
  | 'waiting_wallet_confirmation'
  | 'tx_sent'
  | 'confirming_on_chain'
  | 'confirmed'
  | 'failed'
  | 'rejected';

export const TX_STATUS_LABELS: Record<TxStatusMessage, string> = {
  preparing: 'Preparando transacción...',
  estimating_gas: 'Estimando gas...',
  waiting_wallet_confirmation: 'Esperando confirmación en tu wallet.',
  tx_sent: 'Transacción enviada.',
  confirming_on_chain: 'Confirmando en blockchain...',
  confirmed: 'Transacción confirmada.',
  failed: 'Transacción fallida.',
  rejected: 'Firma rechazada por el usuario.',
};

const WEB3_EXECUTION_DISABLED_RESULT: TransactionResult = {
  status: 'blocked',
  txHash: null,
  explorerUrl: null,
  errorCode: 'WEB3_EXECUTION_DISABLED',
  errorMessage:
    'La ejecucion Web3 real esta deshabilitada por configuracion. No se firmo ni envio ninguna transaccion.',
};

function isWeb3RealExecutionEnabled() {
  return Boolean(FEATURE_STATUS.web3.realExecutionEnabled as boolean) && Boolean(FEATURE_STATUS.web3.sendEnabled as boolean);
}

function isExternalSendEnabled() {
  return isWeb3RealExecutionEnabled() && Boolean(FEATURE_STATUS.web3.externalSendEnabled as boolean);
}

function parseDecimalToUnitsString(amount: string, decimals: number) {
  const normalized = amount.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(normalized) || decimals < 0) {
    throw new Web3ValidationError('INVALID_AMOUNT');
  }

  const [wholePart, fractionPart = ''] = normalized.split('.');
  if (fractionPart.length > decimals) {
    throw new Web3ValidationError('INVALID_AMOUNT');
  }

  const paddedFraction = fractionPart.padEnd(decimals, '0');
  return `${wholePart}${paddedFraction}`.replace(/^0+(?=\d)/, '') || '0';
}

function decimalStringToHex(decimalValue: string) {
  let value = decimalValue.replace(/^0+(?=\d)/, '') || '0';
  if (!/^\d+$/.test(value)) {
    throw new Web3ValidationError('INVALID_AMOUNT');
  }

  if (value === '0') {
    return '0';
  }

  let hex = '';
  const hexDigits = '0123456789abcdef';

  while (value !== '0') {
    let quotient = '';
    let remainder = 0;

    for (const digit of value) {
      const accumulator = remainder * 10 + Number(digit);
      const nextDigit = Math.floor(accumulator / 16);
      remainder = accumulator % 16;

      if (quotient.length > 0 || nextDigit > 0) {
        quotient += String(nextDigit);
      }
    }

    hex = hexDigits[remainder] + hex;
    value = quotient || '0';
  }

  return hex;
}

function encodeAddress(address: string) {
  if (!isValidEvmAddress(address)) {
    throw new Web3ValidationError('INVALID_ADDRESS');
  }

  return address.trim().replace(/^0x/i, '').padStart(64, '0');
}

function encodeUint256(amount: string, decimals: number) {
  const units = parseDecimalToUnitsString(amount, decimals);
  if (units === '0') {
    throw new Web3ValidationError('INVALID_AMOUNT');
  }

  return decimalStringToHex(units).padStart(64, '0');
}

function formatGasEstimate(params: {
  ethers: typeof import('ethers').ethers;
  gasLimit: import('ethers').ethers.BigNumber;
  gasPrice: import('ethers').ethers.BigNumber | null | undefined;
}): GasEstimate {
  const gasPrice = params.gasPrice ?? params.ethers.BigNumber.from(0);
  const estimatedCost = params.gasLimit.mul(gasPrice);

  return {
    gasLimit: params.gasLimit.toString(),
    gasPriceGwei: params.ethers.utils.formatUnits(gasPrice, 'gwei'),
    estimatedCostNative: params.ethers.utils.formatEther(estimatedCost),
    canEstimate: true,
  };
}

export function buildErc20TransferData(toAddress: string, amount: string, decimals: number): string {
  return `0xa9059cbb${encodeAddress(toAddress)}${encodeUint256(amount, decimals)}`;
}

export function buildErc20ApproveData(
  spenderAddress: string,
  amount: string,
  decimals: number,
): string {
  return `0x095ea7b3${encodeAddress(spenderAddress)}${encodeUint256(amount, decimals)}`;
}

async function getWalletSignerContext(params: {
  chainId: number;
  fromAddress: string;
  provider: unknown;
}) {
  const config = getChainConfigById(params.chainId);
  if (!config || !config.supportsSend) {
    throw new Web3ValidationError('UNSUPPORTED_CHAIN');
  }

  if (!params.fromAddress.trim()) {
    throw new Web3ValidationError('WALLET_NOT_CONNECTED');
  }

  const provider = assertExternalProvider(params.provider);
  const ethers = await getEthersRuntime();
  const web3Provider = new ethers.providers.Web3Provider(provider as any, 'any');
  const network = await web3Provider.getNetwork();
  if (network.chainId !== params.chainId) {
    throw new Web3ValidationError('CHAIN_MISMATCH');
  }

  const signer = web3Provider.getSigner();
  const signerAddress = (await signer.getAddress()).trim();
  if (signerAddress.toLowerCase() !== params.fromAddress.trim().toLowerCase()) {
    throw new Web3ValidationError('WALLET_NOT_CONNECTED');
  }

  return {
    ethers,
    web3Provider,
    signer,
    signerAddress,
  };
}

export async function validateSendParams(
  params: SendNativeParams | SendErc20Params,
): Promise<void> {
  if (!isValidEvmAddress(params.toAddress)) {
    throw new Web3ValidationError('INVALID_ADDRESS');
  }

  const amountString = normalizeAmount(params.amount);
  const context = await getWalletSignerContext(params);

  if ('token' in params) {
    if (!params.token.isEnabled || params.token.isNative || !params.token.contractAddress) {
      throw new Web3ValidationError('TOKEN_SEND_DISABLED');
    }

    const tokenAmount = context.ethers.utils.parseUnits(amountString, params.token.decimals);
    if (tokenAmount.lte(0)) {
      throw new Web3ValidationError('INVALID_AMOUNT');
    }

    const contract = new context.ethers.Contract(
      params.token.contractAddress,
      ERC20_ABI_MINIMAL,
      context.web3Provider,
    );
    const tokenBalance = await contract.balanceOf(context.signerAddress);
    if (tokenBalance.lt(tokenAmount)) {
      throw new Web3ValidationError('INSUFFICIENT_FUNDS');
    }

    const nativeBalance = await context.web3Provider.getBalance(context.signerAddress);
    if (nativeBalance.lte(0)) {
      throw new Web3ValidationError('INSUFFICIENT_GAS');
    }

    return;
  }

  const value = context.ethers.utils.parseEther(amountString);
  if (value.lte(0)) {
    throw new Web3ValidationError('INVALID_AMOUNT');
  }

  const balance = await context.web3Provider.getBalance(context.signerAddress);
  if (balance.lt(value)) {
    throw new Web3ValidationError('INSUFFICIENT_FUNDS');
  }
}

export async function estimateNativeTransferGas(
  params: Omit<SendNativeParams, 'provider'>,
): Promise<GasEstimate> {
  try {
    if (!isValidEvmAddress(params.toAddress)) {
      throw new Web3ValidationError('INVALID_ADDRESS');
    }

    const networkConfig = getNetworkConfig(params.chainId);
    if (!networkConfig) {
      throw new Web3ValidationError('UNSUPPORTED_CHAIN');
    }

    const ethers = await getEthersRuntime();
    const provider = new ethers.providers.StaticJsonRpcProvider(networkConfig.rpcUrl, params.chainId);
    const value = ethers.utils.parseEther(normalizeAmount(params.amount));
    const [gasLimit, feeData] = await Promise.all([
      provider.estimateGas({
        from: params.fromAddress.trim(),
        to: params.toAddress.trim(),
        value,
      }),
      provider.getFeeData(),
    ]);

    return formatGasEstimate({
      ethers,
      gasLimit,
      gasPrice: feeData.maxFeePerGas ?? feeData.gasPrice,
    });
  } catch (error) {
    const normalized = normalizeWeb3Error(error, 'No se pudo estimar el gas.');
    return {
      gasLimit: '0',
      gasPriceGwei: '0',
      estimatedCostNative: '0',
      canEstimate: false,
      errorMessage: normalized.userMessage,
    };
  }
}

export async function estimateErc20TransferGas(
  params: Omit<SendErc20Params, 'provider'>,
): Promise<GasEstimate> {
  try {
    if (!params.token.contractAddress || !params.token.canSend) {
      throw new Web3ValidationError('TOKEN_SEND_DISABLED');
    }

    const networkConfig = getNetworkConfig(params.chainId);
    if (!networkConfig) {
      throw new Web3ValidationError('UNSUPPORTED_CHAIN');
    }

    const ethers = await getEthersRuntime();
    const provider = new ethers.providers.StaticJsonRpcProvider(networkConfig.rpcUrl, params.chainId);
    const data = buildErc20TransferData(params.toAddress, params.amount, params.token.decimals);
    const [gasLimit, feeData] = await Promise.all([
      provider.estimateGas({
        from: params.fromAddress.trim(),
        to: params.token.contractAddress,
        data,
      }),
      provider.getFeeData(),
    ]);

    return formatGasEstimate({
      ethers,
      gasLimit,
      gasPrice: feeData.maxFeePerGas ?? feeData.gasPrice,
    });
  } catch (error) {
    const normalized = normalizeWeb3Error(error, 'No se pudo estimar el gas.');
    return {
      gasLimit: '0',
      gasPriceGwei: '0',
      estimatedCostNative: '0',
      canEstimate: false,
      errorMessage: normalized.userMessage,
    };
  }
}

export async function sendNativeTransaction(
  params: SendNativeParams,
  onStatusChange: (status: TxStatusMessage) => void,
): Promise<TransactionResult> {
  if (!isExternalSendEnabled()) {
    onStatusChange('failed');
    return WEB3_EXECUTION_DISABLED_RESULT;
  }

  try {
    onStatusChange('preparing');
    await validateSendParams(params);
    onStatusChange('estimating_gas');
    const gasEstimate = await estimateNativeTransferGas(params);
    if (!gasEstimate.canEstimate) {
      throw new Web3ValidationError('GAS_ESTIMATION_FAILED', gasEstimate.errorMessage);
    }

    const context = await getWalletSignerContext(params);
    const value = context.ethers.utils.parseEther(normalizeAmount(params.amount));
    onStatusChange('waiting_wallet_confirmation');
    const response = await context.signer.sendTransaction({
      to: params.toAddress.trim(),
      value,
    });
    onStatusChange('tx_sent');

    return {
      status: 'success',
      txHash: response.hash,
      explorerUrl: getExplorerTxUrl(params.chainId, response.hash),
    };
  } catch (error) {
    const normalized = normalizeWeb3Error(error);
    onStatusChange(normalized.code === 'USER_REJECTED' ? 'rejected' : 'failed');

    return {
      status: normalized.code === 'USER_REJECTED' ? 'rejected_by_user' : 'failed',
      txHash: null,
      explorerUrl: null,
      errorCode: normalized.code,
      errorMessage: normalized.userMessage,
    };
  }
}

export async function sendErc20Transaction(
  params: SendErc20Params,
  onStatusChange: (status: TxStatusMessage) => void,
): Promise<TransactionResult> {
  if (!isExternalSendEnabled()) {
    onStatusChange('failed');
    return WEB3_EXECUTION_DISABLED_RESULT;
  }

  try {
    if (!params.token.canSend || !params.token.contractAddress) {
      throw new Web3ValidationError('TOKEN_SEND_DISABLED');
    }

    onStatusChange('preparing');
    await validateSendParams(params);
    onStatusChange('estimating_gas');
    const gasEstimate = await estimateErc20TransferGas(params);
    if (!gasEstimate.canEstimate) {
      throw new Web3ValidationError('GAS_ESTIMATION_FAILED', gasEstimate.errorMessage);
    }

    const context = await getWalletSignerContext(params);
    const data = buildErc20TransferData(params.toAddress, params.amount, params.token.decimals);
    onStatusChange('waiting_wallet_confirmation');
    const response = await context.signer.sendTransaction({
      to: params.token.contractAddress,
      data,
      value: 0,
    });
    onStatusChange('tx_sent');

    return {
      status: 'success',
      txHash: response.hash,
      explorerUrl: getExplorerTxUrl(params.chainId, response.hash),
    };
  } catch (error) {
    const normalized = normalizeWeb3Error(error);
    onStatusChange(normalized.code === 'USER_REJECTED' ? 'rejected' : 'failed');

    return {
      status: normalized.code === 'USER_REJECTED' ? 'rejected_by_user' : 'failed',
      txHash: null,
      explorerUrl: null,
      errorCode: normalized.code,
      errorMessage: normalized.userMessage,
    };
  }
}

export async function estimateExternalTransactionGas(
  params: ExternalTransactionParams,
): Promise<ExternalTransactionEstimate> {
  const config = getChainConfigById(params.chainId);
  if (!config || !config.supportsSend) {
    throw new Error('unsupported chain');
  }

  if (!isValidEvmAddress(params.toAddress)) {
    throw new Error('invalid address');
  }

  const provider = assertExternalProvider(params.provider);
  const ethers = await getEthersRuntime();
  const web3Provider = new ethers.providers.Web3Provider(provider as any, 'any');
  const network = await web3Provider.getNetwork();
  if (network.chainId !== params.chainId) {
    throw new Error('chain mismatch');
  }

  const signer = web3Provider.getSigner();
  const amountString = normalizeAmount(params.amountNative);
  const value = ethers.utils.parseEther(amountString);
  const transactionRequest = {
    to: params.toAddress.trim(),
    value,
  };

  const [gasLimit, feeData, balance] = await Promise.all([
    signer.estimateGas(transactionRequest),
    web3Provider.getFeeData(),
    web3Provider.getBalance(params.fromAddress.trim()),
  ]);

  const gasPrice = feeData.maxFeePerGas ?? feeData.gasPrice;
  const estimatedFee = gasPrice ? gasLimit.mul(gasPrice) : ethers.BigNumber.from(0);
  const estimatedTotal = value.add(estimatedFee);

  if (balance.lt(estimatedTotal)) {
    throw new Error('insufficient funds');
  }

  return {
    chainId: params.chainId,
    gasLimit: gasLimit.toString(),
    estimatedFeeNative: ethers.utils.formatEther(estimatedFee),
    estimatedTotalNative: ethers.utils.formatEther(estimatedTotal),
  };
}

export async function sendExternalWalletTransaction(
  params: ExternalTransactionParams,
): Promise<ExternalTransactionResult> {
  if (!isExternalSendEnabled()) {
    return {
      hash: null,
      chainId: params.chainId,
      from: null,
      to: null,
      amountNative: null,
      status: 'blocked',
      errorCode: 'WEB3_EXECUTION_DISABLED',
      errorMessage:
        'La ejecucion Web3 real esta deshabilitada por configuracion. No se firmo ni envio ninguna transaccion.',
    };
  }

  const config = getChainConfigById(params.chainId);
  if (!config || !config.supportsSend) {
    throw new Error('unsupported chain');
  }

  if (!params.fromAddress.trim()) {
    throw new Error('wallet not connected');
  }

  if (!isValidEvmAddress(params.toAddress)) {
    throw new Error('invalid address');
  }

  const provider = assertExternalProvider(params.provider);
  const ethers = await getEthersRuntime();
  const web3Provider = new ethers.providers.Web3Provider(provider as any, 'any');
  const network = await web3Provider.getNetwork();
  if (network.chainId !== params.chainId) {
    throw new Error('chain mismatch');
  }

  const signer = web3Provider.getSigner();
  const signerAddress = (await signer.getAddress()).trim();
  const fromAddress = params.fromAddress.trim();
  if (signerAddress.toLowerCase() !== fromAddress.toLowerCase()) {
    throw new Error('wallet not connected');
  }

  const amountString = normalizeAmount(params.amountNative);
  const value = ethers.utils.parseEther(amountString);
  const transactionRequest = {
    to: params.toAddress.trim(),
    value,
  };

  await estimateExternalTransactionGas({ ...params, fromAddress: signerAddress });
  const response = await signer.sendTransaction(transactionRequest);

  return {
    hash: response.hash,
    chainId: params.chainId,
    from: signerAddress,
    to: params.toAddress.trim(),
    amountNative: amountString,
    explorerUrl: getWeb3ExplorerUrl(params.chainId, response.hash, 'tx'),
    status: 'sent',
    blockNumber: response.blockNumber ?? undefined,
  };
}

export async function waitForExternalTransactionConfirmation(params: {
  provider: unknown;
  hash: string;
  confirmations?: number;
  timeoutMs?: number;
}) {
  const provider = assertExternalProvider(params.provider);
  const ethers = await getEthersRuntime();
  const web3Provider = new ethers.providers.Web3Provider(provider as any, 'any');

  const timeoutMs = params.timeoutMs ?? 45_000;
  const waitPromise = web3Provider.waitForTransaction(params.hash, params.confirmations ?? 1);

  const receipt = await Promise.race([
    waitPromise,
    new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error('timeout')), timeoutMs);
    }),
  ]);

  if (!receipt || receipt.status !== 1) {
    throw new Error('transaction failed');
  }

  return receipt;
}

export async function switchExternalWalletNetwork(params: {
  targetNetwork: Web3ChainKey;
  currentChainId?: number;
  switchNetwork?: (network: SupportedNetwork) => Promise<{ ok: boolean; message: string }>;
}) {
  const config = getChainConfig(params.targetNetwork);
  if (!config.supportsSwitch) {
    throw new Error(config.readOnlyReason ?? 'unsupported chain');
  }

  if (params.currentChainId === config.chainId) {
    return { changed: false, config };
  }

  if (!params.switchNetwork) {
    throw new Error('provider not found');
  }

  const nextNetwork = params.targetNetwork as SupportedNetwork;
  const result = await params.switchNetwork(nextNetwork);
  if (!result.ok) {
    throw new Error(result.message || 'user rejected');
  }

  return { changed: true, config };
}

export function getExternalTransactionErrorMessage(error: unknown) {
  return normalizeWeb3Error(error).message;
}
