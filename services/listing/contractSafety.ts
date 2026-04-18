import { ethers } from 'ethers';

import artifact from '../../contracts/artifacts/OrbitXMemecoin.json';
import type { ContractSafetyReport, LaunchChain } from '../../types';

type SupportedProtectedChain = 'ethereum' | 'bnb';

const ERC20_METADATA_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
];

const providerCache = new Map<SupportedProtectedChain, ethers.providers.StaticJsonRpcProvider>();

function normalizeReason(message: string) {
  if (message.includes('unsupported')) {
    return 'OrbitX protected listing is active first on Ethereum and BNB Chain.';
  }

  return message;
}

function assertSupportedProtectedChain(chain: LaunchChain): asserts chain is SupportedProtectedChain {
  if (chain !== 'ethereum' && chain !== 'bnb') {
    throw new Error('unsupported_chain');
  }
}

function getProvider(chain: SupportedProtectedChain) {
  const cached = providerCache.get(chain);
  if (cached) {
    return cached;
  }

  const rpcMap = {
    ethereum: process.env.EXPO_PUBLIC_ETHEREUM_RPC_URL || 'https://ethereum-rpc.publicnode.com',
    bnb: process.env.EXPO_PUBLIC_BNB_RPC_URL || 'https://bsc-dataseed.bnbchain.org',
  };
  const chainIds = {
    ethereum: 1,
    bnb: 56,
  } as const;

  const provider = new ethers.providers.StaticJsonRpcProvider(rpcMap[chain], chainIds[chain]);
  providerCache.set(chain, provider);
  return provider;
}

export async function runContractSafetyChecks(
  chain: LaunchChain,
  contractAddress: string,
): Promise<ContractSafetyReport> {
  const baseReport: ContractSafetyReport = {
    status: 'failed',
    checkedAt: new Date().toISOString(),
    network: chain,
    contractAddress,
    runtimeCodeHash: '',
    expectedRuntimeCodeHash: artifact.runtimeHash,
    codeVerified: false,
    templateMatched: false,
    reasons: [],
    warnings: [],
  };

  try {
    assertSupportedProtectedChain(chain);
    const provider = getProvider(chain);
    const runtimeCode = await provider.getCode(contractAddress);

    if (!runtimeCode || runtimeCode === '0x') {
      return {
        ...baseReport,
        reasons: ['No runtime code was found for this contract on-chain.'],
      };
    }

    const runtimeCodeHash = ethers.utils.keccak256(runtimeCode);
    const templateMatched = runtimeCodeHash === artifact.runtimeHash;
    const contract = new ethers.Contract(contractAddress, ERC20_METADATA_ABI, provider);

    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply(),
    ]);

    const reasons: string[] = [];
    const warnings: string[] = [];

    if (!templateMatched) {
      reasons.push(
        'The deployed runtime code does not match the official OrbitX safe template, so OrbitX cannot approve a protected listing.',
      );
    }

    if (!name || !symbol || Number(totalSupply.toString()) <= 0) {
      reasons.push('The token metadata or supply could not be validated on-chain.');
    }

    if (Number(decimals) !== 18) {
      reasons.push('The current OrbitX protected template only supports 18 decimals.');
    }

    return {
      ...baseReport,
      status: reasons.length ? 'failed' : 'passed',
      runtimeCodeHash,
      codeVerified: templateMatched,
      templateMatched,
      reasons,
      warnings,
    };
  } catch (error) {
    return {
      ...baseReport,
      reasons: [
        normalizeReason(
          error instanceof Error ? error.message : 'OrbitX could not validate this contract.',
        ),
      ],
    };
  }
}
