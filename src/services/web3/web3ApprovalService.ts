import { FEATURE_STATUS } from '../../constants/featureStatus';
import { type TokenDefinition } from '../wallet/tokenRegistry';
import { ERC20_ABI_MINIMAL } from './erc20Abi';
import { normalizeWeb3Error, Web3ValidationError } from './web3Errors';
import { getExplorerTxUrl, getNetworkConfig } from './web3NetworkConfig';
import {
  buildErc20ApproveData,
  type TransactionResult,
  type TxStatusMessage,
} from './web3TransactionService';

export interface AllowanceResult {
  allowance: string;
  allowanceRaw: string;
  isUnlimited: boolean;
  token: TokenDefinition;
  spender: string;
  owner: string;
}

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

function assertErc20Token(token: TokenDefinition) {
  if (token.isNative || !token.contractAddress || !token.canApprove) {
    throw new Web3ValidationError('TOKEN_NOT_SUPPORTED');
  }
}

export async function getErc20Allowance(
  ownerAddress: string,
  spenderAddress: string,
  token: TokenDefinition,
  chainId: number,
): Promise<AllowanceResult> {
  assertErc20Token(token);

  const networkConfig = getNetworkConfig(chainId);
  if (!networkConfig) {
    throw new Web3ValidationError('UNSUPPORTED_CHAIN');
  }

  const contractAddress = token.contractAddress;
  if (!contractAddress) {
    throw new Web3ValidationError('TOKEN_NOT_SUPPORTED');
  }

  const ethers = await getEthersRuntime();
  const provider = new ethers.providers.StaticJsonRpcProvider(networkConfig.rpcUrl, chainId);
  const contract = new ethers.Contract(contractAddress, ERC20_ABI_MINIMAL, provider);
  const allowance = await contract.allowance(ownerAddress.trim(), spenderAddress.trim());
  const unlimitedThreshold = ethers.constants.MaxUint256.div(2);

  return {
    allowance: ethers.utils.formatUnits(allowance, token.decimals),
    allowanceRaw: allowance.toString(),
    isUnlimited: allowance.gte(unlimitedThreshold),
    token,
    spender: spenderAddress.trim(),
    owner: ownerAddress.trim(),
  };
}

export async function approveErc20Spender(
  token: TokenDefinition,
  spenderAddress: string,
  amount: string,
  chainId: number,
  provider: unknown,
  onStatusChange: (status: TxStatusMessage) => void,
): Promise<TransactionResult> {
  if (
    !Boolean(FEATURE_STATUS.web3.realExecutionEnabled as boolean) ||
    !Boolean(FEATURE_STATUS.web3.approvalsEnabled as boolean)
  ) {
    onStatusChange('failed');
    return {
      status: 'blocked',
      txHash: null,
      explorerUrl: null,
      errorCode: 'WEB3_APPROVAL_DISABLED',
      errorMessage:
        'Las aprobaciones ERC-20 reales estan deshabilitadas por configuracion. No se firmo ninguna transaccion.',
    };
  }

  try {
    assertErc20Token(token);
    const contractAddress = token.contractAddress;
    if (!contractAddress) {
      throw new Web3ValidationError('TOKEN_NOT_SUPPORTED');
    }

    if (!provider || typeof provider !== 'object') {
      throw new Web3ValidationError('PROVIDER_NOT_FOUND');
    }

    const ethers = await getEthersRuntime();
    const web3Provider = new ethers.providers.Web3Provider(provider as any, 'any');
    const network = await web3Provider.getNetwork();
    if (network.chainId !== chainId) {
      throw new Web3ValidationError('CHAIN_MISMATCH');
    }

    const signer = web3Provider.getSigner();
    const data = buildErc20ApproveData(spenderAddress, amount, token.decimals);

    onStatusChange('waiting_wallet_confirmation');
    const response = await signer.sendTransaction({
      to: contractAddress,
      data,
      value: 0,
    });
    onStatusChange('tx_sent');

    return {
      status: 'success',
      txHash: response.hash,
      explorerUrl: getExplorerTxUrl(chainId, response.hash),
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
