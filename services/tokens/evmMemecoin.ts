import { ethers } from 'ethers';

import artifact from '../../contracts/artifacts/OrbitXMemecoin.json';
import type { LaunchChain } from '../../types';
import { getStoredWalletBundle } from '../../utils/wallet';

type EvmLaunchChain = 'ethereum' | 'base' | 'bnb';

const RPC_BY_CHAIN: Record<EvmLaunchChain, { url: string; chainId: number }> = {
  ethereum: {
    url: process.env.EXPO_PUBLIC_ETHEREUM_RPC_URL || 'https://ethereum-rpc.publicnode.com',
    chainId: 1,
  },
  base: {
    url: process.env.EXPO_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
    chainId: 8453,
  },
  bnb: {
    url: process.env.EXPO_PUBLIC_BNB_RPC_URL || 'https://bsc-dataseed.bnbchain.org',
    chainId: 56,
  },
};

export interface RealMemecoinDraft {
  name: string;
  symbol: string;
  supply: string;
  decimals: number;
}

export interface RealMemecoinEstimate {
  deployerAddress: string;
  gasLimit: string;
  nativeCostEstimate: number;
  usdCostEstimate: number;
}

export interface RealMemecoinDeploymentResult extends RealMemecoinEstimate {
  contractAddress: string;
  transactionHash: string;
  network: EvmLaunchChain;
}

function assertEvmChain(chain: LaunchChain): asserts chain is EvmLaunchChain {
  if (chain !== 'ethereum' && chain !== 'base' && chain !== 'bnb') {
    throw new Error('La creacion real de memecoins queda activa primero en Ethereum, Base y BNB Chain.');
  }
}

function getProvider(chain: EvmLaunchChain) {
  const config = RPC_BY_CHAIN[chain];
  return new ethers.providers.StaticJsonRpcProvider(config.url, config.chainId);
}

function validateDraft(draft: RealMemecoinDraft) {
  const name = draft.name.trim();
  const symbol = draft.symbol.trim().toUpperCase();
  const supply = draft.supply.trim();
  const decimals = Number(draft.decimals);

  if (!name || symbol.length < 2 || !supply) {
    throw new Error('Completa nombre, simbolo y supply antes de crear el token.');
  }

  if (!Number.isInteger(decimals) || decimals !== 18) {
    throw new Error('La plantilla segura actual de OrbitX usa 18 decimales.');
  }

  return { name, symbol, supply, decimals };
}

async function getSigner(chain: EvmLaunchChain) {
  const bundle = await getStoredWalletBundle();
  if (!bundle) {
    throw new Error('Primero crea o importa tu wallet OrbitX.');
  }

  const provider = getProvider(chain);
  const signer = ethers.Wallet.fromMnemonic(bundle.mnemonic).connect(provider);

  return {
    bundle,
    provider,
    signer,
  };
}

async function buildFactory(
  chain: EvmLaunchChain,
  draft: RealMemecoinDraft,
) {
  const { signer } = await getSigner(chain);
  const normalized = validateDraft(draft);
  const initialSupply = ethers.utils.parseUnits(normalized.supply, 18);
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);

  return {
    signer,
    normalized,
    initialSupply,
    factory,
  };
}

export async function estimateRealMemecoinDeployment(
  chain: LaunchChain,
  draft: RealMemecoinDraft,
  nativeTokenPriceUsd: number,
): Promise<RealMemecoinEstimate> {
  assertEvmChain(chain);
  const { signer, normalized, initialSupply, factory } = await buildFactory(chain, draft);
  const feeData = await signer.provider.getFeeData();
  const deployTx = factory.getDeployTransaction(
    normalized.name,
    normalized.symbol,
    initialSupply,
    signer.address,
  );

  const gasLimit = await signer.estimateGas(deployTx);
  const gasPrice = feeData.maxFeePerGas ?? feeData.gasPrice ?? ethers.utils.parseUnits('1', 'gwei');
  const nativeCostEstimate = Number(ethers.utils.formatEther(gasLimit.mul(gasPrice)));
  const usdCostEstimate = nativeCostEstimate * Math.max(nativeTokenPriceUsd, 0);

  return {
    deployerAddress: signer.address,
    gasLimit: gasLimit.toString(),
    nativeCostEstimate,
    usdCostEstimate,
  };
}

export async function deployRealMemecoin(
  chain: LaunchChain,
  draft: RealMemecoinDraft,
  nativeTokenPriceUsd: number,
): Promise<RealMemecoinDeploymentResult> {
  assertEvmChain(chain);
  const { signer, normalized, initialSupply, factory } = await buildFactory(chain, draft);
  const estimate = await estimateRealMemecoinDeployment(chain, draft, nativeTokenPriceUsd);

  const contract = await factory.deploy(
    normalized.name,
    normalized.symbol,
    initialSupply,
    signer.address,
  );

  const receipt = await contract.deployTransaction.wait(1);

  return {
    ...estimate,
    contractAddress: contract.address,
    transactionHash: receipt.transactionHash,
    network: chain,
  };
}

export function supportsRealMemecoinCreation(chain: LaunchChain) {
  return chain === 'ethereum' || chain === 'base' || chain === 'bnb';
}
