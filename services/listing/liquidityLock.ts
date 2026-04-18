import { ethers } from 'ethers';

import artifact from '../../contracts/artifacts/OrbitXLiquidityLocker.json';
import type { LaunchChain, TokenLiquidityLock } from '../../types';
import { getStoredWalletBundle } from '../../utils/wallet';

type SupportedLockChain = 'ethereum' | 'bnb';

const ERC20_ABI = [
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function balanceOf(address account) external view returns (uint256)',
];

const providerCache = new Map<SupportedLockChain, ethers.providers.StaticJsonRpcProvider>();

export const ORBITX_LOCK_DURATION_OPTIONS = [
  { label: '6 months', days: 180 },
  { label: '1 year', days: 365 },
  { label: '2 years', days: 730 },
  { label: '3 years', days: 1095 },
  { label: '5 years', days: 1825 },
] as const;

function assertSupportedLockChain(chain: LaunchChain): asserts chain is SupportedLockChain {
  if (chain !== 'ethereum' && chain !== 'bnb') {
    throw new Error('OrbitX protected liquidity lock is active first on Ethereum and BNB Chain.');
  }
}

function getProvider(chain: SupportedLockChain) {
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

async function getSigner(chain: SupportedLockChain) {
  const bundle = await getStoredWalletBundle();
  if (!bundle) {
    throw new Error('Primero crea o importa tu wallet OrbitX.');
  }

  const provider = getProvider(chain);
  return ethers.Wallet.fromMnemonic(bundle.mnemonic).connect(provider);
}

export async function createRealLiquidityLock(params: {
  chain: LaunchChain;
  poolAddress: string;
  lpTokenAmountRaw: string;
  liquidityAmountUsd: number;
  durationDays: number;
}): Promise<TokenLiquidityLock> {
  assertSupportedLockChain(params.chain);

  const signer = await getSigner(params.chain);
  const unlockTimestamp = Math.floor(Date.now() / 1000) + params.durationDays * 24 * 60 * 60;
  const lockerFactory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
  const locker = await lockerFactory.deploy(params.poolAddress, signer.address, unlockTimestamp);
  const lockerReceipt = await locker.deployTransaction.wait(1);

  const pairToken = new ethers.Contract(params.poolAddress, ERC20_ABI, signer);
  const lockedAmount = ethers.BigNumber.from(params.lpTokenAmountRaw);
  const currentLpBalance = await pairToken.balanceOf(signer.address);

  if (currentLpBalance.lt(lockedAmount)) {
    throw new Error('The LP token balance is lower than the amount that OrbitX needs to lock.');
  }

  const transferTx = await pairToken.transfer(locker.address, lockedAmount);
  const transferReceipt = await transferTx.wait(1);
  const lockStart = new Date().toISOString();
  const lockEnd = new Date(unlockTimestamp * 1000).toISOString();

  return {
    status: 'locked',
    lockerAddress: locker.address,
    poolAddress: params.poolAddress,
    creatorWallet: signer.address,
    lockStart,
    lockEnd,
    lockDurationDays: params.durationDays,
    lockedLiquidityAmount: ethers.utils.formatUnits(lockedAmount, 18),
    lockedLiquidityAmountUsd: params.liquidityAmountUsd,
    lpTokenAmount: ethers.utils.formatUnits(lockedAmount, 18),
    txHash: transferReceipt.transactionHash,
    deployTxHash: lockerReceipt.transactionHash,
  };
}
