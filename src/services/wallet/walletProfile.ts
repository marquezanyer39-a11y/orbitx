import type {
  ExternalWalletConnection,
  SupportedNetwork,
  WalletAccount,
  WalletType,
} from '../../types';
import {
  getOrbitAuthMeta,
  getOrbitAuthSession,
  getOrbitAuthUserMetadata,
  mergeOrbitAuthUserMetadata,
} from '../../../utils/orbitAuth';

const REMOTE_WALLET_PROFILE_KEY = 'orbitx_wallet_profile_v1';

const EMPTY_RECEIVE_ADDRESSES: Record<SupportedNetwork, string> = {
  ethereum: '',
  base: '',
  bnb: '',
  solana: '',
};

export interface OrbitWalletRemoteProfile {
  version: 1;
  primaryAddress: string;
  receiveAddresses: Record<SupportedNetwork, string>;
  selectedNetwork: SupportedNetwork;
  walletType: Extract<WalletType, 'orbitx' | 'imported'>;
  externalWallet: ExternalWalletConnection;
  linkedAt: string;
  updatedAt: string;
}

function normalizeAddress(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeNetwork(value: unknown): SupportedNetwork {
  return value === 'ethereum' || value === 'bnb' || value === 'solana' ? value : 'base';
}

function normalizeExternalWallet(value: unknown): ExternalWalletConnection {
  if (!value || typeof value !== 'object') {
    return {
      provider: null,
      address: '',
      signingReady: false,
    };
  }

  const candidate = value as Record<string, unknown>;
  const provider =
    candidate.provider === 'metamask' || candidate.provider === 'walletconnect'
      ? candidate.provider
      : null;

  return {
    provider,
    address: normalizeAddress(candidate.address),
    connectedAt:
      typeof candidate.connectedAt === 'string' ? candidate.connectedAt : undefined,
    signingReady: Boolean(candidate.signingReady),
  };
}

function normalizeReceiveAddresses(
  value: unknown,
): Record<SupportedNetwork, string> {
  if (!value || typeof value !== 'object') {
    return { ...EMPTY_RECEIVE_ADDRESSES };
  }

  const candidate = value as Record<string, unknown>;
  return {
    ethereum: normalizeAddress(candidate.ethereum),
    base: normalizeAddress(candidate.base),
    bnb: normalizeAddress(candidate.bnb),
    solana: normalizeAddress(candidate.solana),
  };
}

export function normalizeRemoteWalletProfile(
  value: unknown,
): OrbitWalletRemoteProfile | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const receiveAddresses = normalizeReceiveAddresses(candidate.receiveAddresses);
  const primaryAddress =
    normalizeAddress(candidate.primaryAddress) ||
    receiveAddresses.base ||
    receiveAddresses.ethereum ||
    '';

  if (!primaryAddress) {
    return null;
  }

  return {
    version: 1,
    primaryAddress,
    receiveAddresses,
    selectedNetwork: normalizeNetwork(candidate.selectedNetwork),
    walletType: candidate.walletType === 'imported' ? 'imported' : 'orbitx',
    externalWallet: normalizeExternalWallet(candidate.externalWallet),
    linkedAt:
      typeof candidate.linkedAt === 'string' ? candidate.linkedAt : new Date().toISOString(),
    updatedAt:
      typeof candidate.updatedAt === 'string' ? candidate.updatedAt : new Date().toISOString(),
  };
}

export function buildWalletAccountFromRemoteProfile(
  profile: OrbitWalletRemoteProfile,
): WalletAccount {
  return {
    address: profile.primaryAddress,
    mnemonicStored: false,
    walletType: 'linked',
    receiveAddresses: profile.receiveAddresses,
    selectedNetwork: profile.selectedNetwork,
  };
}

export function walletAccountMatchesRemoteProfile(
  wallet: Pick<WalletAccount, 'address' | 'receiveAddresses'>,
  profile: OrbitWalletRemoteProfile,
) {
  return (
    normalizeAddress(wallet.address).toLowerCase() ===
      normalizeAddress(profile.primaryAddress).toLowerCase() &&
    (['ethereum', 'base', 'bnb', 'solana'] as const).every(
      (network) =>
        normalizeAddress(wallet.receiveAddresses[network]).toLowerCase() ===
        normalizeAddress(profile.receiveAddresses[network]).toLowerCase(),
    )
  );
}

export async function getRemoteWalletProfile() {
  const authMeta = getOrbitAuthMeta();
  const session = await getOrbitAuthSession();

  if (!authMeta.configured || !session) {
    return null;
  }

  const metadata = await getOrbitAuthUserMetadata();
  if (!metadata) {
    return null;
  }

  return normalizeRemoteWalletProfile(metadata[REMOTE_WALLET_PROFILE_KEY]);
}

export async function syncRemoteWalletProfile(params: {
  wallet: WalletAccount;
  externalWallet: ExternalWalletConnection;
}) {
  const authMeta = getOrbitAuthMeta();
  const session = await getOrbitAuthSession();

  if (!authMeta.configured || !session) {
    return {
      ok: false,
      message: 'No hay una sesion remota para vincular la wallet.',
      code: 'wallet_remote_unavailable',
    };
  }

  const current = await getRemoteWalletProfile();
  const timestamp = new Date().toISOString();

  const nextProfile: OrbitWalletRemoteProfile = {
    version: 1,
    primaryAddress:
      params.wallet.address ||
      params.wallet.receiveAddresses.base ||
      params.wallet.receiveAddresses.ethereum ||
      '',
    receiveAddresses: {
      ethereum: normalizeAddress(params.wallet.receiveAddresses.ethereum),
      base: normalizeAddress(params.wallet.receiveAddresses.base),
      bnb: normalizeAddress(params.wallet.receiveAddresses.bnb),
      solana: normalizeAddress(params.wallet.receiveAddresses.solana),
    },
    selectedNetwork: params.wallet.selectedNetwork,
    walletType: params.wallet.walletType === 'imported' ? 'imported' : 'orbitx',
    externalWallet: {
      provider: params.externalWallet.provider,
      address: normalizeAddress(params.externalWallet.address),
      connectedAt: params.externalWallet.connectedAt,
      signingReady: Boolean(params.externalWallet.signingReady),
    },
    linkedAt: current?.linkedAt ?? timestamp,
    updatedAt: timestamp,
  };

  return mergeOrbitAuthUserMetadata({
    [REMOTE_WALLET_PROFILE_KEY]: nextProfile,
  });
}
