export type SupportedNetwork = 'ethereum' | 'base' | 'bnb' | 'solana';
export type WalletType = 'orbitx' | 'imported' | 'external' | 'linked';
export type WalletEnvironment = 'spot' | 'web3';
export type ExternalWalletProvider = 'metamask' | 'walletconnect';

export interface WalletAccount {
  address: string;
  mnemonicStored: boolean;
  walletType: WalletType;
  receiveAddresses: Record<SupportedNetwork, string>;
  selectedNetwork: SupportedNetwork;
}

export interface WalletBalance {
  network: SupportedNetwork;
  symbol: string;
  amount: number;
  usdValue: number;
}

export interface WalletAsset {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  usdValue: number;
  network: SupportedNetwork | 'spot';
  environment: WalletEnvironment;
  image?: string;
  coingeckoId?: string;
}

export interface SecurityStatus {
  biometricsEnabled: boolean;
  pinEnabled: boolean;
  seedPhraseConfirmedAt?: string;
  seedPhraseRevealedAt?: string;
}

export interface ExternalWalletConnection {
  provider: ExternalWalletProvider | null;
  address: string;
  connectedAt?: string;
  signingReady: boolean;
}

export interface CreatedTokenStatus {
  id: string;
  name: string;
  symbol: string;
  network: SupportedNetwork | 'ethereum';
  status:
    | 'creada'
    | 'desplegada'
    | 'pendiente'
    | 'con_liquidez'
    | 'listada'
    | 'orbitx'
    | 'no_listada';
  contractAddress?: string;
  updatedAt?: string;
}
