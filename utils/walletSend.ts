import { ONCHAIN_ASSET_SPECS, PUBLIC_RPC_URLS } from '../constants/onchain';
import type { WalletNetwork } from '../types';
import { getStoredWalletBundle } from './wallet';

const EVM_NATIVE_CHAIN_IDS = {
  ethereum: 1,
  base: 8453,
  bnb: 56,
} as const;

const ERC20_TRANSFER_ABI = ['function transfer(address to, uint256 amount) returns (bool)'];

export interface OrbitWalletTransferResult {
  hash: string;
  network: WalletNetwork;
  tokenId: string;
}

let ethersRuntimePromise: Promise<typeof import('ethers').ethers> | null = null;
const providerCache = new Map<'ethereum' | 'base' | 'bnb', import('ethers').ethers.providers.StaticJsonRpcProvider>();

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

async function getEvmProvider(network: 'ethereum' | 'base' | 'bnb') {
  const cached = providerCache.get(network);
  if (cached) {
    return cached;
  }

  const ethers = await getEthersRuntime();
  const provider = new ethers.providers.StaticJsonRpcProvider(
    PUBLIC_RPC_URLS[network],
    EVM_NATIVE_CHAIN_IDS[network],
  );

  providerCache.set(network, provider);
  return provider;
}

export function canSendOrbitWalletToken(tokenId: string) {
  return tokenId === 'eth' || tokenId === 'usd' || tokenId === 'bnb';
}

export function getOrbitWalletTransferSupport(tokenId: string) {
  if (tokenId === 'sol') {
    return {
      supported: false,
      message: 'Los envios de Solana quedan preparados para la siguiente fase real.',
    };
  }

  if (!canSendOrbitWalletToken(tokenId)) {
    return {
      supported: false,
      message: 'Este token todavia no puede enviarse desde OrbitX Wallet.',
    };
  }

  return { supported: true, message: '' };
}

export async function sendOrbitWalletAsset(
  tokenId: string,
  destination: string,
  amount: number,
): Promise<OrbitWalletTransferResult> {
  const support = getOrbitWalletTransferSupport(tokenId);
  if (!support.supported) {
    throw new Error(support.message);
  }

  if (amount <= 0) {
    throw new Error('Ingresa un monto valido.');
  }

  const bundle = await getStoredWalletBundle();
  if (!bundle) {
    throw new Error('Primero crea o importa tu wallet OrbitX.');
  }

  const spec = ONCHAIN_ASSET_SPECS.find((item) => item.tokenId === tokenId);
  if (!spec || spec.network === 'solana') {
    throw new Error('Este activo todavia no tiene envio habilitado.');
  }

  const ethers = await getEthersRuntime();
  const provider = await getEvmProvider(spec.network);
  const signer = ethers.Wallet.fromMnemonic(bundle.mnemonic).connect(provider);

  if (spec.standard === 'native') {
    const transaction = await signer.sendTransaction({
      to: destination.trim(),
      value: ethers.utils.parseUnits(String(amount), spec.decimals),
    });

    await transaction.wait(1);

    return {
      hash: transaction.hash,
      network: spec.network,
      tokenId,
    };
  }

  if (!spec.contractAddress) {
    throw new Error('No encontramos el contrato del token para enviarlo.');
  }

  const contract = new ethers.Contract(spec.contractAddress, ERC20_TRANSFER_ABI, signer);
  const transaction = await contract.transfer(
    destination.trim(),
    ethers.utils.parseUnits(String(amount), spec.decimals),
  );

  await transaction.wait(1);

  return {
    hash: transaction.hash,
    network: spec.network,
    tokenId,
  };
}
