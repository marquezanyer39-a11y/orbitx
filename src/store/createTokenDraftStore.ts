import { create } from 'zustand';

export type TokenType = 'standard' | 'memecoin';
export type TokenNetwork = 'ethereum' | 'bnb' | 'solana' | 'polygon' | 'base';
export type PairAsset = 'SOL' | 'USDT' | 'USDC' | 'ETH' | 'BNB' | 'MATIC';
export type LiquidityDex =
  | 'raydium'
  | 'jupiter'
  | 'orca'
  | 'uniswap'
  | 'pancakeswap'
  | 'quickswap';
export type LockDuration = '3m' | '6m' | '12m' | 'custom';
export type AirdropDistributionType = 'equal' | 'firstCome' | 'volume';
export type VisibilityLevel = 'basic' | 'community' | 'featured';

export type AirdropRequirements = {
  verifiedAccount: boolean;
  followProject: boolean;
  minimumBalance: boolean;
  makeOperation: boolean;
  inviteFriends: boolean;
};

export type LiquidityConfig = {
  enabled: boolean;
  tokenAmount: string;
  pairAsset: PairAsset;
  pairAmount: string;
  dex: LiquidityDex;
  lockDuration: LockDuration;
  customUnlockDate: string | null;
  estimatedLiquidityUsd: number | null;
  initialPrice: number | null;
  estimatedGas: string | null;
  orbitxFee: string | null;
  totalEstimatedCost: string | null;
};

export type AirdropConfig = {
  enabled: boolean;
  totalTokens: string;
  maxParticipants: string;
  tokensPerUser: string;
  distributionType: AirdropDistributionType;
  requirements: AirdropRequirements;
  dates: {
    start: 'onPublish';
    closeAfterDays: number;
    claim: 'afterCampaign';
  };
  estimatedFee: string | null;
};

export type PublicationConfig = {
  enabled: boolean;
  visibilityLevel: VisibilityLevel;
  projectName: string;
  shortDescription: string;
  website: string;
  twitter: string;
  telegramOrDiscord: string;
  whitepaper: string;
  badges: {
    lockedLiquidity: boolean;
    communityActive: boolean;
    airdrop: boolean;
    newProject: boolean;
    inReview: boolean;
  };
  acceptedRules: boolean;
  estimatedFee: number;
};

export type CreatedTokenResult = {
  success: true;
  tokenId: string;
  name: string;
  symbol: string;
  network: TokenNetwork;
  supply: string;
  contractAddress: string | null;
  explorerUrl: string | null;
  createdAt: string;
  isMock: boolean;
  transactionHash?: string | null;
  deploymentStatus?: 'simulated' | 'pending' | 'confirmed' | 'failed';
  chainId?: number;
  deployerAddress?: string;
  launchStatus: {
    token: 'Completado';
    liquidity: 'Completado' | 'Pendiente' | 'Omitida';
    airdrop: 'Configurado' | 'Omitido';
    publication: 'En revisión' | 'En revision' | 'Omitida';
    audit: 'Próximamente' | 'Proximamente';
  };
};

export type CreateTokenDraft = {
  tokenType: TokenType;
  network: TokenNetwork;
  name: string;
  symbol: string;
  decimals: string;
  supply: string;
  description: string;
  logoUri: string | null;
  options: {
    lockLiquidity: boolean;
    prepareAirdrop: boolean;
    prepareListing: boolean;
    audit: false;
  };
  liquidityConfig: LiquidityConfig | null;
  airdropConfig: AirdropConfig | null;
  publicationConfig: PublicationConfig | null;
};

type CreateTokenDraftState = {
  draft: CreateTokenDraft;
  createdTokenResult: CreatedTokenResult | null;
  setBaseDraft: (draft: Omit<CreateTokenDraft, 'liquidityConfig' | 'airdropConfig' | 'publicationConfig'>) => void;
  setLiquidityConfig: (config: LiquidityConfig) => void;
  setAirdropConfig: (config: AirdropConfig) => void;
  setPublicationConfig: (config: PublicationConfig) => void;
  setCreatedTokenResult: (result: CreatedTokenResult) => void;
  resetDraft: () => void;
  updateOptions: (options: Partial<CreateTokenDraft['options']>) => void;
};

export const DEFAULT_CREATE_TOKEN_DRAFT: CreateTokenDraft = {
  tokenType: 'standard',
  network: 'solana',
  name: '',
  symbol: '',
  decimals: '9',
  supply: '',
  description: '',
  logoUri: null,
  options: {
    lockLiquidity: true,
    prepareAirdrop: false,
    prepareListing: false,
    audit: false,
  },
  liquidityConfig: null,
  airdropConfig: null,
  publicationConfig: null,
};

export const useCreateTokenDraftStore = create<CreateTokenDraftState>((set) => ({
  draft: DEFAULT_CREATE_TOKEN_DRAFT,
  createdTokenResult: null,
  setBaseDraft: (draft) =>
    set((state) => ({
      draft: {
        ...state.draft,
        ...draft,
        options: {
          ...state.draft.options,
          ...draft.options,
          audit: false,
        },
      },
    })),
  setLiquidityConfig: (config) =>
    set((state) => ({
      draft: {
        ...state.draft,
        liquidityConfig: config,
        options: {
          ...state.draft.options,
          lockLiquidity: config.enabled,
        },
      },
    })),
  setAirdropConfig: (config) =>
    set((state) => ({
      draft: {
        ...state.draft,
        airdropConfig: config,
        options: {
          ...state.draft.options,
          prepareAirdrop: config.enabled,
        },
      },
    })),
  setPublicationConfig: (config) =>
    set((state) => ({
      draft: {
        ...state.draft,
        publicationConfig: config,
        options: {
          ...state.draft.options,
          prepareListing: config.enabled,
        },
      },
    })),
  setCreatedTokenResult: (result) =>
    set(() => ({
      createdTokenResult: result,
    })),
  resetDraft: () =>
    set(() => ({
      draft: DEFAULT_CREATE_TOKEN_DRAFT,
      createdTokenResult: null,
    })),
  updateOptions: (options) =>
    set((state) => ({
      draft: {
        ...state.draft,
        options: {
          ...state.draft.options,
          ...options,
          audit: false,
        },
      },
    })),
}));
