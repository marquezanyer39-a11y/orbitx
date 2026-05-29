import { ethers } from 'ethers';

import artifact from '../../../contracts/artifacts/OrbitXMemecoin.json';
import { FEATURE_STATUS } from '../../constants/featureStatus';
import type { WalletConnectRequestProvider } from '../walletConnectService';
import type {
  CreatedTokenResult,
  CreateTokenDraft,
  TokenNetwork,
} from '../../store/createTokenDraftStore';

type EvmDeployNetwork = Extract<TokenNetwork, 'ethereum' | 'bnb' | 'polygon' | 'base'>;

export type DeploymentProgress =
  | 'validating'
  | 'estimating_gas'
  | 'awaiting_signature'
  | 'transaction_sent'
  | 'confirming'
  | 'confirmed';

export type DeploymentBlockerCode =
  | 'deployment_not_enabled'
  | 'invalid_token_data'
  | 'unsupported_network'
  | 'wallet_not_connected'
  | 'wallet_address_missing'
  | 'wallet_provider_missing'
  | 'chain_mismatch'
  | 'invalid_decimals'
  | 'insufficient_gas';

export type DeploymentBlocker = {
  code: DeploymentBlockerCode;
  message: string;
};

export type DeploymentReadiness = {
  canDeploy: boolean;
  expectedChainId?: number;
  expectedNetworkLabel?: string;
  blockers: DeploymentBlocker[];
};

type ExternalWalletSnapshot = {
  isConnected: boolean;
  address?: string;
  chainId?: number;
  eip155Provider?: WalletConnectRequestProvider;
};

type DeploymentResult = {
  contractAddress: string;
  transactionHash: string;
  network: EvmDeployNetwork;
  chainId: number;
  deployerAddress: string;
  gasUsed?: string;
};

class TokenDeploymentError extends Error {
  code: DeploymentBlockerCode | 'user_rejected' | 'rpc_error';

  constructor(code: TokenDeploymentError['code'], message: string) {
    super(message);
    this.name = 'TokenDeploymentError';
    this.code = code;
  }
}

const DEPLOY_NETWORKS: Record<EvmDeployNetwork, {
  chainId: number;
  label: string;
  nativeSymbol: string;
  explorerTxBaseUrl: string;
  explorerAddressBaseUrl: string;
}> = {
  ethereum: {
    chainId: 1,
    label: 'Ethereum',
    nativeSymbol: 'ETH',
    explorerTxBaseUrl: 'https://etherscan.io/tx',
    explorerAddressBaseUrl: 'https://etherscan.io/address',
  },
  bnb: {
    chainId: 56,
    label: 'BNB Chain',
    nativeSymbol: 'BNB',
    explorerTxBaseUrl: 'https://bscscan.com/tx',
    explorerAddressBaseUrl: 'https://bscscan.com/address',
  },
  polygon: {
    chainId: 137,
    label: 'Polygon',
    nativeSymbol: 'POL',
    explorerTxBaseUrl: 'https://polygonscan.com/tx',
    explorerAddressBaseUrl: 'https://polygonscan.com/address',
  },
  base: {
    chainId: 8453,
    label: 'Base',
    nativeSymbol: 'ETH',
    explorerTxBaseUrl: 'https://basescan.org/tx',
    explorerAddressBaseUrl: 'https://basescan.org/address',
  },
};

function normalizeNumberInput(value: string) {
  return value.replace(/,/g, '').trim();
}

function isPositiveNumberString(value: string) {
  const normalized = normalizeNumberInput(value);
  const parsed = Number(normalized);
  return Boolean(normalized) && Number.isFinite(parsed) && parsed > 0;
}

function isEvmDeployNetwork(network: TokenNetwork): network is EvmDeployNetwork {
  return network === 'ethereum' || network === 'bnb' || network === 'polygon' || network === 'base';
}

function normalizeDeploymentError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'No se pudo completar el deploy real del token.';
  const lower = message.toLowerCase();

  if (
    lower.includes('user rejected') ||
    lower.includes('rejected') ||
    lower.includes('denied') ||
    lower.includes('cancel') ||
    lower.includes('4001')
  ) {
    return new TokenDeploymentError('user_rejected', 'Transaccion rechazada desde la wallet.');
  }

  if (error instanceof TokenDeploymentError) {
    return error;
  }

  return new TokenDeploymentError('rpc_error', message);
}

function getDeploymentConfig(network: TokenNetwork) {
  if (!isEvmDeployNetwork(network)) {
    return null;
  }

  return DEPLOY_NETWORKS[network];
}

function validateDraft(draft: CreateTokenDraft): DeploymentBlocker[] {
  const blockers: DeploymentBlocker[] = [];

  if (!draft.name.trim() || !draft.symbol.trim() || !isPositiveNumberString(draft.supply)) {
    blockers.push({
      code: 'invalid_token_data',
      message: 'Completa nombre, simbolo y supply mayor a 0.',
    });
  }

  const decimals = Number(draft.decimals);
  if (!Number.isInteger(decimals) || decimals !== 18) {
    blockers.push({
      code: 'invalid_decimals',
      message: 'El deploy EVM real de esta plantilla usa exactamente 18 decimales.',
    });
  }

  return blockers;
}

export function evaluateTokenDeploymentReadiness(
  draft: CreateTokenDraft,
  wallet: ExternalWalletSnapshot,
): DeploymentReadiness {
  const config = getDeploymentConfig(draft.network);
  const blockers: DeploymentBlocker[] = [...validateDraft(draft)];

  if (!config) {
    blockers.push({
      code: 'unsupported_network',
      message: 'El deploy real actual esta disponible solo para Ethereum, BNB Chain, Polygon y Base.',
    });
  }

  if (!wallet.isConnected) {
    blockers.push({
      code: 'wallet_not_connected',
      message: 'Conecta MetaMask u otra wallet externa por WalletConnect.',
    });
  }

  if (!wallet.address?.trim()) {
    blockers.push({
      code: 'wallet_address_missing',
      message: 'No se recibio una address publica de la wallet conectada.',
    });
  }

  if (!wallet.eip155Provider) {
    blockers.push({
      code: 'wallet_provider_missing',
      message: 'No hay provider EVM transaccional disponible para firmar el deploy.',
    });
  }

  if (config && wallet.chainId && wallet.chainId !== config.chainId) {
    blockers.push({
      code: 'chain_mismatch',
      message: `Cambia la wallet a ${config.label} para desplegar en esa red.`,
    });
  }

  return {
    canDeploy: blockers.length === 0,
    expectedChainId: config?.chainId,
    expectedNetworkLabel: config?.label,
    blockers,
  };
}

export async function deployTokenWithExternalWallet({
  draft,
  wallet,
  onProgress,
}: {
  draft: CreateTokenDraft;
  wallet: Required<Pick<ExternalWalletSnapshot, 'address' | 'eip155Provider'>> & ExternalWalletSnapshot;
  onProgress?: (progress: DeploymentProgress, meta?: { transactionHash?: string }) => void;
}): Promise<DeploymentResult> {
  if (
    !Boolean(FEATURE_STATUS.web3.realExecutionEnabled as boolean) ||
    !Boolean(FEATURE_STATUS.web3.tokenDeployEnabled as boolean)
  ) {
    throw new TokenDeploymentError(
      'deployment_not_enabled',
      'El deploy real de tokens esta deshabilitado por configuracion.',
    );
  }

  const readiness = evaluateTokenDeploymentReadiness(draft, wallet);
  if (!readiness.canDeploy) {
    throw new TokenDeploymentError(
      readiness.blockers[0]?.code ?? 'invalid_token_data',
      readiness.blockers[0]?.message ?? 'El deploy real no esta listo.',
    );
  }

  const config = getDeploymentConfig(draft.network);
  if (!config) {
    throw new TokenDeploymentError('unsupported_network', 'Red no compatible para deploy real.');
  }

  try {
    onProgress?.('validating');

    const web3Provider = new ethers.providers.Web3Provider(wallet.eip155Provider as ethers.providers.ExternalProvider, 'any');
    const network = await web3Provider.getNetwork();
    if (network.chainId !== config.chainId) {
      throw new TokenDeploymentError('chain_mismatch', `La wallet esta en Chain ${network.chainId}, pero el borrador usa ${config.label}.`);
    }

    const signer = web3Provider.getSigner(wallet.address);
    const deployerAddress = await signer.getAddress();
    if (deployerAddress.toLowerCase() !== wallet.address.toLowerCase()) {
      throw new TokenDeploymentError('wallet_address_missing', 'La wallet conectada no coincide con el signer activo.');
    }

    const name = draft.name.trim();
    const symbol = draft.symbol.trim().toUpperCase();
    const initialSupply = ethers.utils.parseUnits(normalizeNumberInput(draft.supply), 18);
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
    const deployTx = factory.getDeployTransaction(name, symbol, initialSupply, deployerAddress);

    onProgress?.('estimating_gas');
    const [gasLimit, feeData, balance] = await Promise.all([
      signer.estimateGas(deployTx),
      web3Provider.getFeeData(),
      web3Provider.getBalance(deployerAddress),
    ]);
    const gasPrice = feeData.maxFeePerGas ?? feeData.gasPrice;
    if (gasPrice) {
      const estimatedCost = gasLimit.mul(gasPrice);
      if (balance.lt(estimatedCost)) {
        throw new TokenDeploymentError(
          'insufficient_gas',
          `Saldo insuficiente para gas en ${config.nativeSymbol}.`,
        );
      }
    }

    onProgress?.('awaiting_signature');
    const contract = await factory.deploy(name, symbol, initialSupply, deployerAddress);
    const transactionHash = contract.deployTransaction.hash;
    onProgress?.('transaction_sent', { transactionHash });
    onProgress?.('confirming', { transactionHash });
    const receipt = await contract.deployTransaction.wait(1);
    onProgress?.('confirmed', { transactionHash });

    return {
      contractAddress: contract.address,
      transactionHash: receipt.transactionHash,
      network: draft.network as EvmDeployNetwork,
      chainId: config.chainId,
      deployerAddress,
      gasUsed: receipt.gasUsed?.toString(),
    };
  } catch (error) {
    throw normalizeDeploymentError(error);
  }
}

export function buildCreatedTokenResultFromDeployment(
  draft: CreateTokenDraft,
  deployment: DeploymentResult,
): CreatedTokenResult {
  const config = DEPLOY_NETWORKS[deployment.network];
  const symbol = draft.symbol.trim().toUpperCase();

  return {
    success: true,
    tokenId: `${deployment.network}-${deployment.contractAddress.toLowerCase()}`,
    name: draft.name.trim(),
    symbol,
    network: deployment.network,
    supply: draft.supply.trim(),
    contractAddress: deployment.contractAddress,
    explorerUrl: `${config.explorerTxBaseUrl}/${deployment.transactionHash}`,
    createdAt: new Date().toISOString(),
    isMock: false,
    transactionHash: deployment.transactionHash,
    deploymentStatus: 'confirmed',
    chainId: deployment.chainId,
    deployerAddress: deployment.deployerAddress,
    launchStatus: {
      token: 'Completado',
      liquidity: draft.liquidityConfig?.enabled ? 'Pendiente' : 'Omitida',
      airdrop: draft.airdropConfig?.enabled ? 'Configurado' : 'Omitido',
      publication: draft.publicationConfig?.enabled ? 'En revision' : 'Omitida',
      audit: 'Proximamente',
    },
  };
}

export function getDeploymentErrorMessage(error: unknown) {
  const normalized = normalizeDeploymentError(error);
  return normalized.message;
}
