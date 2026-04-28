import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { useOrbitStore } from '../../store/useOrbitStore';
import { useAuthStore } from './authStore';
import { useUiStore } from './uiStore';
import type {
  CreatedTokenStatus,
  ExternalWalletConnection,
  ExternalWalletProvider,
  SecurityStatus,
  SupportedNetwork,
  WalletAccount,
  WalletAsset,
} from '../types';
import { createWallet } from '../services/wallet/createWallet';
import { importWallet } from '../services/wallet/importWallet';
import { devWarn } from '../utils/devLog';
import {
  clearSecureWallet,
  getSecureWallet,
  getWalletSecurityStatus,
} from '../services/wallet/secureWalletStorage';
import { maskAddress } from '../../utils/wallet';
import { getWalletBalanceSnapshot } from '../services/wallet/walletBalances';
import {
  buildWalletAccountFromRemoteProfile,
  getRemoteWalletProfile,
  syncRemoteWalletProfile,
  walletAccountMatchesRemoteProfile,
} from '../services/wallet/walletProfile';

interface SpotBalance {
  symbol: string;
  amount: number;
}

interface WalletHistoryEntry {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

type WalletSource = 'empty' | 'local' | 'remote';
type WalletWeb3Phase = 'idle' | 'restoring' | 'wallet' | 'balances' | 'details' | 'ready' | 'error';

interface WalletNetworkSyncState {
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
  updatedAt?: string;
  assetCount: number;
}

type WalletNetworkSyncMap = Record<SupportedNetwork, WalletNetworkSyncState>;

const EMPTY_NETWORK_SYNC_STATE: WalletNetworkSyncMap = {
  ethereum: { status: 'idle', assetCount: 0 },
  base: { status: 'idle', assetCount: 0 },
  bnb: { status: 'idle', assetCount: 0 },
  solana: { status: 'idle', assetCount: 0 },
};

interface WalletState {
  hasHydrated: boolean;
  walletAddress: string;
  receiveAddresses: WalletAccount['receiveAddresses'];
  mnemonicStored: boolean;
  walletSource: WalletSource;
  selectedNetwork: SupportedNetwork;
  balances: WalletAsset[];
  assets: WalletAsset[];
  isWalletReady: boolean;
  walletType: WalletAccount['walletType'] | null;
  securityStatus: SecurityStatus;
  externalWallet: ExternalWalletConnection;
  spotBalances: SpotBalance[];
  history: WalletHistoryEntry[];
  createdTokens: CreatedTokenStatus[];
  loading: boolean;
  error: string | null;
  web3Phase: WalletWeb3Phase;
  networkSyncState: WalletNetworkSyncMap;
  lastBalanceSyncAt?: string;
  showingCachedBalances: boolean;
  hydrateWallet: () => Promise<void>;
  createWallet: () => Promise<WalletAccount | null>;
  importWallet: (seedPhrase: string) => Promise<WalletAccount | null>;
  logoutWallet: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  refreshSecurityStatus: () => Promise<void>;
  clearSessionWalletState: () => void;
  updateExternalWalletState: (patch: Partial<ExternalWalletConnection>) => void;
  setExternalWalletConnection: (
    connection: ExternalWalletConnection,
    options?: {
      suppressHistory?: boolean;
      historyTitle?: string;
      historyBody?: string;
      toastMessage?: string;
      toastTone?: 'success' | 'error' | 'info';
    },
  ) => Promise<void>;
  connectExternalWallet: (
    provider: ExternalWalletProvider,
    address?: string,
  ) => Promise<boolean>;
  disconnectExternalWallet: () => void;
  setSelectedNetwork: (network: SupportedNetwork) => void;
  depositToSpot: (symbol: string, amount: number) => void;
  withdrawFromSpot: (symbol: string, amount: number) => boolean;
  upsertSpotAsset: (asset: WalletAsset) => void;
  consumeSpotQuote: (symbol: string, amount: number) => boolean;
  creditSpotBase: (asset: WalletAsset) => void;
  debitSpotBase: (symbol: string, amount: number) => boolean;
  syncCreatedTokens: () => void;
}

const EMPTY_RECEIVE_ADDRESSES: WalletAccount['receiveAddresses'] = {
  ethereum: '',
  base: '',
  bnb: '',
  solana: '',
};

function createEmptyExternalWalletConnection(): ExternalWalletConnection {
  return {
    provider: null,
    address: '',
    signingReady: false,
    status: 'disconnected',
  };
}

function buildHistoryEntry(title: string, body: string): WalletHistoryEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    title,
    body,
    createdAt: new Date().toISOString(),
  };
}

function mergeSpotBalance(items: SpotBalance[], symbol: string, amountDelta: number) {
  const normalized = symbol.toUpperCase();
  const next = [...items];
  const index = next.findIndex((item) => item.symbol === normalized);

  if (index === -1) {
    if (amountDelta <= 0) {
      return next;
    }

    next.push({ symbol: normalized, amount: amountDelta });
    return next;
  }

  next[index] = {
    ...next[index],
    amount: Math.max(next[index].amount + amountDelta, 0),
  };

  return next;
}

function syncOrbitWalletFutureWallet(
  wallet: Pick<WalletAccount, 'receiveAddresses'> | null,
  options?: {
    simulated?: boolean;
  },
) {
  const receiveAddresses = wallet?.receiveAddresses ?? EMPTY_RECEIVE_ADDRESSES;
  const simulated = options?.simulated ?? !wallet;

  useOrbitStore.setState((state) => ({
    walletFuture: {
      ...state.walletFuture,
      receiveAddresses,
      simulated,
      lastWalletInitAt: wallet ? new Date().toISOString() : state.walletFuture.lastWalletInitAt,
    },
  }));
}

function syncOrbitWalletFutureExternalWallet(connection: ExternalWalletConnection) {
  useOrbitStore.setState((state) => ({
    walletFuture: {
      ...state.walletFuture,
      externalWallet: {
        provider: connection.provider,
        address: connection.address,
        chainId: connection.chainId,
        walletName: connection.walletName,
        sessionTopic: connection.sessionTopic,
        simulated: !connection.address,
        connectedAt: connection.connectedAt,
        signingReady: connection.signingReady,
        status: connection.status,
        lastError: connection.lastError,
      },
    },
  }));
}

function mapCreatedTokens(): CreatedTokenStatus[] {
  const tokens = useOrbitStore.getState().tokens.filter((token) => token.isUserCreated);
  return tokens.map((token) => ({
    id: token.id,
    name: token.name,
    symbol: token.symbol,
    network: (token.chain ?? 'ethereum') as SupportedNetwork,
    status:
      token.listingStatus === 'orbitx_listed'
        ? 'orbitx'
        : token.listingStatus === 'external_listing_selected'
          ? 'listada'
          : token.listingStatus === 'orbitx_listing_pending_liquidity'
            ? 'pendiente'
            : token.liquidity
              ? 'con_liquidez'
              : token.contractAddress
                ? 'desplegada'
                : 'creada',
    contractAddress: token.contractAddress ?? undefined,
    updatedAt: token.updatedAt,
  }));
}

function mapExternalWalletState(): ExternalWalletConnection {
  const externalWallet = useOrbitStore.getState().walletFuture.externalWallet;
  const parsedChainId =
    typeof externalWallet.chainId === 'number'
      ? externalWallet.chainId
      : typeof externalWallet.chainId === 'string'
        ? Number(externalWallet.chainId)
        : undefined;

  return {
    provider: externalWallet.provider,
    address: externalWallet.address || '',
    chainId: Number.isFinite(parsedChainId) ? parsedChainId : undefined,
    walletName: externalWallet.walletName?.trim() || undefined,
    sessionTopic: externalWallet.sessionTopic?.trim() || undefined,
    connectedAt: externalWallet.connectedAt,
    signingReady: Boolean(externalWallet.signingReady),
    status: externalWallet.status ?? (externalWallet.address ? 'connected' : 'disconnected'),
    lastError: externalWallet.lastError?.trim() || undefined,
  };
}

function recordAstraWalletFlow(
  guideId: 'create_wallet' | 'import_wallet' | 'connect_external_wallet',
  status: 'started' | 'failed' | 'completed',
  error?: string,
) {
  try {
    const { useAstraStore } = require('./astraStore') as typeof import('./astraStore');
    useAstraStore.getState().recordWalletFlow(guideId, status, error);
  } catch (astraError) {
    devWarn('[OrbitX][Wallet] Astra wallet flow bridge failed', astraError);
  }
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      walletAddress: '',
      receiveAddresses: {
        ethereum: '',
        base: '',
        bnb: '',
        solana: '',
      },
      mnemonicStored: false,
      walletSource: 'empty',
      selectedNetwork: 'base',
      balances: [],
      assets: [],
      isWalletReady: false,
      walletType: null,
      securityStatus: {
        biometricsEnabled: false,
        pinEnabled: false,
      },
      externalWallet: createEmptyExternalWalletConnection(),
      hasHydrated: false,
      spotBalances: [],
      history: [],
      createdTokens: mapCreatedTokens(),
      loading: false,
      error: null,
      web3Phase: 'idle',
      networkSyncState: EMPTY_NETWORK_SYNC_STATE,
      lastBalanceSyncAt: undefined,
      showingCachedBalances: false,

      hydrateWallet: async () => {
        if (get().hasHydrated) {
          return;
        }

        set({ loading: true, error: null, web3Phase: 'restoring' });
        try {
          const authState = useAuthStore.getState();
          const isAuthenticated = authState.session.status === 'authenticated';
          const [localWallet, securityStatus, remoteWalletProfile] = await Promise.all([
            getSecureWallet(),
            getWalletSecurityStatus(),
            isAuthenticated ? getRemoteWalletProfile() : Promise.resolve(null),
          ]);
          const localExternalWallet = mapExternalWalletState();

          if (
            isAuthenticated &&
            localWallet &&
            !remoteWalletProfile
          ) {
            try {
              await syncRemoteWalletProfile({
                wallet: localWallet,
                externalWallet: localExternalWallet,
              });
            } catch (syncError) {
              devWarn('[OrbitX][Wallet] remote wallet association sync failed', syncError);
            }
          }

          const resolvedRemoteWalletProfile =
            isAuthenticated ? (await getRemoteWalletProfile()) ?? remoteWalletProfile : null;

          const useLocalWallet =
            localWallet !== null &&
            (!resolvedRemoteWalletProfile ||
              walletAccountMatchesRemoteProfile(localWallet, resolvedRemoteWalletProfile));

          const wallet = useLocalWallet
            ? localWallet
            : resolvedRemoteWalletProfile
              ? buildWalletAccountFromRemoteProfile(resolvedRemoteWalletProfile)
              : null;

          const externalWallet = resolvedRemoteWalletProfile?.externalWallet ??
            (wallet ? localExternalWallet : createEmptyExternalWalletConnection());
          const walletSource: WalletSource = wallet
            ? useLocalWallet
              ? 'local'
              : 'remote'
            : 'empty';

          syncOrbitWalletFutureExternalWallet(externalWallet);

          if (!wallet) {
            syncOrbitWalletFutureWallet(null, { simulated: true });
            set({
              walletAddress: '',
              receiveAddresses: EMPTY_RECEIVE_ADDRESSES,
              mnemonicStored: false,
              walletSource,
              isWalletReady: false,
              walletType: null,
              securityStatus,
              externalWallet,
              createdTokens: mapCreatedTokens(),
              hasHydrated: true,
              loading: false,
              web3Phase: 'idle',
              networkSyncState: EMPTY_NETWORK_SYNC_STATE,
              showingCachedBalances: false,
            });
            return;
          }

          syncOrbitWalletFutureWallet(wallet, { simulated: false });
          const hasCachedBalances = get().assets.length > 0;
          set({
            walletAddress: wallet.address,
            receiveAddresses: wallet.receiveAddresses,
            mnemonicStored: wallet.mnemonicStored,
            walletSource,
            selectedNetwork: wallet.selectedNetwork,
            isWalletReady: true,
            walletType: wallet.walletType,
            securityStatus,
            externalWallet,
            createdTokens: mapCreatedTokens(),
            hasHydrated: true,
            loading: false,
            web3Phase: hasCachedBalances ? 'balances' : 'wallet',
            showingCachedBalances: hasCachedBalances,
          });

          await get().refreshBalances();
        } catch (error) {
          devWarn('[OrbitX][Wallet] hydrateWallet failed', error);
          set({
            hasHydrated: true,
            loading: false,
            web3Phase: 'error',
            error: error instanceof Error ? error.message : 'No se pudo restaurar la billetera.',
          });
        }
      },

      createWallet: async () => {
        set({ loading: true, error: null });
        recordAstraWalletFlow('create_wallet', 'started');
        try {
          const wallet = await createWallet();
          const securityStatus = await getWalletSecurityStatus();
          const externalWallet = get().externalWallet;
          syncOrbitWalletFutureWallet(wallet, { simulated: false });
          set((state) => ({
            walletAddress: wallet.address,
            receiveAddresses: wallet.receiveAddresses,
            mnemonicStored: wallet.mnemonicStored,
            walletSource: 'local',
            selectedNetwork: wallet.selectedNetwork,
            isWalletReady: true,
            walletType: wallet.walletType,
            securityStatus,
            externalWallet,
            history: [
              buildHistoryEntry('Billetera creada', 'Tu billetera OrbitX quedo lista para operar.'),
              ...state.history,
            ].slice(0, 24),
            hasHydrated: true,
            loading: false,
            web3Phase: 'wallet',
            showingCachedBalances: false,
          }));
          try {
            await syncRemoteWalletProfile({
              wallet,
              externalWallet,
            });
          } catch (syncError) {
            devWarn('[OrbitX][Wallet] remote wallet sync after create failed', syncError);
          }
          recordAstraWalletFlow('create_wallet', 'completed');
          await get().refreshBalances();
          return wallet;
        } catch (error) {
          devWarn('[OrbitX][Wallet] createWallet failed', error);
          const message =
            error instanceof Error ? error.message : 'No se pudo crear la billetera.';
          set({
            loading: false,
            error: message,
          });
          recordAstraWalletFlow('create_wallet', 'failed', message);
          return null;
        }
      },

      importWallet: async (seedPhrase) => {
        set({ loading: true, error: null });
        recordAstraWalletFlow('import_wallet', 'started');
        try {
          const wallet = await importWallet(seedPhrase);
          const securityStatus = await getWalletSecurityStatus();
          const externalWallet = get().externalWallet;
          syncOrbitWalletFutureWallet(wallet, { simulated: false });
          set((state) => ({
            walletAddress: wallet.address,
            receiveAddresses: wallet.receiveAddresses,
            mnemonicStored: wallet.mnemonicStored,
            walletSource: 'local',
            selectedNetwork: wallet.selectedNetwork,
            isWalletReady: true,
            walletType: wallet.walletType,
            securityStatus,
            externalWallet,
            history: [
              buildHistoryEntry('Billetera importada', 'La frase semilla se guardo de forma segura.'),
              ...state.history,
            ].slice(0, 24),
            hasHydrated: true,
            loading: false,
            web3Phase: 'wallet',
            showingCachedBalances: false,
          }));
          try {
            await syncRemoteWalletProfile({
              wallet,
              externalWallet,
            });
          } catch (syncError) {
            devWarn('[OrbitX][Wallet] remote wallet sync after import failed', syncError);
          }
          recordAstraWalletFlow('import_wallet', 'completed');
          await get().refreshBalances();
          return wallet;
        } catch (error) {
          devWarn('[OrbitX][Wallet] importWallet failed', error);
          const message =
            error instanceof Error ? error.message : 'No se pudo importar la billetera.';
          set({
            loading: false,
            error: message,
          });
          recordAstraWalletFlow('import_wallet', 'failed', message);
          return null;
        }
      },

      logoutWallet: async () => {
        await clearSecureWallet();
        syncOrbitWalletFutureWallet(null, { simulated: true });
        syncOrbitWalletFutureExternalWallet(createEmptyExternalWalletConnection());
        set({
          walletAddress: '',
          receiveAddresses: EMPTY_RECEIVE_ADDRESSES,
          mnemonicStored: false,
          walletSource: 'empty',
          isWalletReady: false,
          walletType: null,
          balances: [],
          assets: [],
          hasHydrated: true,
          web3Phase: 'idle',
          networkSyncState: EMPTY_NETWORK_SYNC_STATE,
          showingCachedBalances: false,
          securityStatus: {
            biometricsEnabled: false,
            pinEnabled: false,
          },
          externalWallet: createEmptyExternalWalletConnection(),
        });
      },

      refreshBalances: async () => {
        if (!get().isWalletReady || !Object.values(get().receiveAddresses).some(Boolean)) {
          return;
        }

        const existingAssets = get().assets;
        set({
          loading: true,
          error: null,
          web3Phase: existingAssets.length ? 'details' : 'balances',
          showingCachedBalances: existingAssets.length > 0,
          networkSyncState: {
            ethereum: { status: 'loading', assetCount: 0 },
            base: { status: 'loading', assetCount: 0 },
            bnb: { status: 'loading', assetCount: 0 },
            solana: { status: 'loading', assetCount: 0 },
          },
        });
        try {
          const snapshot = await getWalletBalanceSnapshot(get().receiveAddresses);
          set((state) => ({
            balances: snapshot.assets,
            assets: snapshot.assets,
            createdTokens: mapCreatedTokens(),
            loading: false,
            web3Phase: snapshot.failedNetworks.length ? 'details' : 'ready',
            networkSyncState: snapshot.networkStates,
            lastBalanceSyncAt: snapshot.fetchedAt,
            showingCachedBalances: false,
            history:
              snapshot.assets.length &&
              !state.history.some((entry) => entry.title === 'Balances actualizados')
                ? [
                    buildHistoryEntry('Balances actualizados', 'OrbitX refresco tus activos on-chain.'),
                    ...state.history,
                  ].slice(0, 24)
                : state.history,
            error:
              snapshot.failedNetworks.length > 0
                ? `No se pudo actualizar ${snapshot.failedNetworks.length} red${snapshot.failedNetworks.length > 1 ? 'es' : ''}.`
                : null,
          }));
        } catch (error) {
          devWarn('[OrbitX][Wallet] refreshBalances failed', error);
          set({
            loading: false,
            web3Phase: 'error',
            networkSyncState: {
              ethereum: { status: 'error', assetCount: 0 },
              base: { status: 'error', assetCount: 0 },
              bnb: { status: 'error', assetCount: 0 },
              solana: { status: 'error', assetCount: 0 },
            },
            error: error instanceof Error ? error.message : 'No se pudo leer el balance on-chain.',
          });
        }
      },

      refreshSecurityStatus: async () => {
        try {
          const securityStatus = await getWalletSecurityStatus();
          set({ securityStatus, error: null });
        } catch (error) {
          devWarn('[OrbitX][Wallet] refreshSecurityStatus failed', error);
          set({
            error:
              error instanceof Error
                ? error.message
                : 'No se pudo actualizar el estado de seguridad.',
          });
        }
      },

      clearSessionWalletState: () => {
        syncOrbitWalletFutureWallet(null, { simulated: true });
        syncOrbitWalletFutureExternalWallet(createEmptyExternalWalletConnection());
        set((state) => ({
          walletAddress: '',
          receiveAddresses: EMPTY_RECEIVE_ADDRESSES,
          mnemonicStored: false,
          walletSource: 'empty',
          balances: [],
          assets: [],
          isWalletReady: false,
          walletType: null,
          externalWallet: createEmptyExternalWalletConnection(),
          loading: false,
          error: null,
          hasHydrated: false,
          web3Phase: 'idle',
          networkSyncState: EMPTY_NETWORK_SYNC_STATE,
          lastBalanceSyncAt: undefined,
          showingCachedBalances: false,
          createdTokens: mapCreatedTokens(),
          securityStatus: {
            biometricsEnabled: false,
            pinEnabled: false,
          },
          history: state.history,
        }));
      },

      updateExternalWalletState: (patch) => {
        set((state) => {
          const nextExternalWallet: ExternalWalletConnection = {
            ...state.externalWallet,
            ...patch,
            status:
              patch.status ??
              state.externalWallet.status ??
              (patch.address || state.externalWallet.address ? 'connected' : 'disconnected'),
            signingReady:
              patch.signingReady ?? state.externalWallet.signingReady ?? false,
          };

          syncOrbitWalletFutureExternalWallet(nextExternalWallet);

          return {
            externalWallet: nextExternalWallet,
          };
        });
      },

      setExternalWalletConnection: async (connection, options) => {
        const previousConnection = get().externalWallet;
        const normalizedConnection: ExternalWalletConnection = {
          ...createEmptyExternalWalletConnection(),
          ...connection,
          address: connection.address.trim(),
          walletName: connection.walletName?.trim() || undefined,
          sessionTopic: connection.sessionTopic?.trim() || undefined,
          lastError: connection.lastError?.trim() || undefined,
          status:
            connection.status ??
            (connection.address ? 'connected' : 'disconnected'),
          signingReady: Boolean(connection.signingReady),
        };
        const changed =
          previousConnection.provider !== normalizedConnection.provider ||
          previousConnection.address !== normalizedConnection.address ||
          previousConnection.chainId !== normalizedConnection.chainId ||
          previousConnection.walletName !== normalizedConnection.walletName ||
          previousConnection.sessionTopic !== normalizedConnection.sessionTopic ||
          previousConnection.signingReady !== normalizedConnection.signingReady ||
          previousConnection.status !== normalizedConnection.status ||
          previousConnection.lastError !== normalizedConnection.lastError;

        syncOrbitWalletFutureExternalWallet(normalizedConnection);

        set((state) => {
          if (!changed) {
            return {
              externalWallet: normalizedConnection,
              loading: false,
              error:
                normalizedConnection.status === 'error'
                  ? normalizedConnection.lastError ?? state.error
                  : state.error,
            };
          }

          const nextHistory = options?.suppressHistory
            ? state.history
            : [
                buildHistoryEntry(
                  options?.historyTitle ?? 'Wallet externa actualizada',
                  options?.historyBody ??
                    `${normalizedConnection.walletName ?? 'Wallet externa'} quedo ${
                      normalizedConnection.status === 'connected'
                        ? 'conectada'
                        : normalizedConnection.status === 'connecting'
                          ? 'en proceso de conexion'
                          : normalizedConnection.status === 'error'
                            ? 'con incidencia'
                            : 'desconectada'
                    }.`,
                ),
                ...state.history,
              ].slice(0, 24);

          return {
            externalWallet: normalizedConnection,
            loading: false,
            error:
              normalizedConnection.status === 'error'
                ? normalizedConnection.lastError ?? state.error
                : state.error,
            history: nextHistory,
          };
        });

        if (options?.toastMessage) {
          useUiStore.getState().showToast(options.toastMessage, options.toastTone ?? 'info');
        }

        if (changed && get().isWalletReady) {
          try {
            await syncRemoteWalletProfile({
              wallet: {
                address: get().walletAddress,
                mnemonicStored: get().mnemonicStored,
                walletType: get().walletType === 'imported' ? 'imported' : 'orbitx',
                receiveAddresses: get().receiveAddresses,
                selectedNetwork: get().selectedNetwork,
              },
              externalWallet: normalizedConnection,
            });
          } catch (syncError) {
            devWarn('[OrbitX][Wallet] remote external wallet sync failed', syncError);
          }
        }
      },

      connectExternalWallet: async (provider, address) => {
        set({ loading: true, error: null });
        recordAstraWalletFlow('connect_external_wallet', 'started');

        try {
          const result = await useOrbitStore.getState().connectExternalWallet(provider, address);
          if (!result.ok) {
            const normalizedMessage =
              result.message === 'WalletConnect not ready yet'
                ? 'WalletConnect quedo desactivado hasta que la integracion de sesion este lista.'
                : result.message === 'External wallet address required'
                  ? 'Pega una direccion publica valida para continuar.'
                  : result.message === 'Invalid external wallet address'
                    ? 'La direccion publica no es valida para MetaMask.'
                    : result.message || 'No se pudo vincular la billetera externa en este momento.';

            set({
              loading: false,
              error: normalizedMessage,
            });
            recordAstraWalletFlow('connect_external_wallet', 'failed', normalizedMessage);
            return false;
          }

          const externalWallet = mapExternalWalletState();
          const addressLabel = maskAddress(externalWallet.address) || 'direccion lista para usar';
          syncOrbitWalletFutureExternalWallet(externalWallet);
          set((state) => ({
            externalWallet,
            loading: false,
            error: null,
            history: [
              buildHistoryEntry(
                'Billetera externa vinculada',
                `${externalWallet.walletName ?? (externalWallet.provider === 'metamask' ? 'MetaMask' : 'WalletConnect')} quedo vinculada con ${addressLabel}.`,
              ),
              ...state.history,
            ].slice(0, 24),
          }));
          if (get().isWalletReady) {
            try {
              await syncRemoteWalletProfile({
                wallet: {
                  address: get().walletAddress,
                  mnemonicStored: get().mnemonicStored,
                  walletType:
                    get().walletType === 'imported' ? 'imported' : 'orbitx',
                  receiveAddresses: get().receiveAddresses,
                  selectedNetwork: get().selectedNetwork,
                },
                externalWallet,
              });
            } catch (syncError) {
              devWarn('[OrbitX][Wallet] remote external wallet sync failed', syncError);
            }
          }
          recordAstraWalletFlow('connect_external_wallet', 'completed');
          return true;
        } catch (error) {
          devWarn('[OrbitX][Wallet] connectExternalWallet failed', error);
          const message =
            error instanceof Error
              ? error.message
              : 'No se pudo vincular la billetera externa.';
          set({
            loading: false,
            error: message,
          });
          recordAstraWalletFlow('connect_external_wallet', 'failed', message);
          return false;
        }
      },

      disconnectExternalWallet: () => {
        useOrbitStore.getState().disconnectExternalWallet();
        const emptyExternalWallet = createEmptyExternalWalletConnection();
        syncOrbitWalletFutureExternalWallet(emptyExternalWallet);
        set((state) => ({
          externalWallet: emptyExternalWallet,
          error: null,
          history: [
            buildHistoryEntry(
              'Billetera externa desconectada',
              'La conexion externa se elimino sin afectar tu billetera OrbitX.',
            ),
            ...state.history,
          ].slice(0, 24),
        }));
        if (get().isWalletReady) {
          void syncRemoteWalletProfile({
            wallet: {
              address: get().walletAddress,
              mnemonicStored: get().mnemonicStored,
              walletType: get().walletType === 'imported' ? 'imported' : 'orbitx',
              receiveAddresses: get().receiveAddresses,
              selectedNetwork: get().selectedNetwork,
            },
            externalWallet: emptyExternalWallet,
          }).catch((syncError) => {
            devWarn('[OrbitX][Wallet] remote external wallet disconnect sync failed', syncError);
          });
        }
      },

      setSelectedNetwork: (selectedNetwork) => set({ selectedNetwork }),

      depositToSpot: (symbol, amount) => {
        if (amount <= 0) {
          return;
        }

        set((state) => ({
          spotBalances: mergeSpotBalance(state.spotBalances, symbol, amount),
          history: [
            buildHistoryEntry('Saldo Spot recibido', `${amount} ${symbol.toUpperCase()} ingresaron a tu cuenta Spot.`),
            ...state.history,
          ].slice(0, 24),
        }));
      },

      withdrawFromSpot: (symbol, amount) => {
        const current = get().spotBalances.find((item) => item.symbol === symbol.toUpperCase());
        if (!current || current.amount < amount || amount <= 0) {
          return false;
        }

        set((state) => ({
          spotBalances: mergeSpotBalance(state.spotBalances, symbol, -amount),
          history: [
            buildHistoryEntry('Salida desde Spot', `${amount} ${symbol.toUpperCase()} salieron de tu cuenta Spot.`),
            ...state.history,
          ].slice(0, 24),
        }));
        return true;
      },

      upsertSpotAsset: (asset) => {
        if (asset.amount <= 0) {
          return;
        }

        set((state) => ({
          spotBalances: mergeSpotBalance(state.spotBalances, asset.symbol, asset.amount),
        }));
      },

      consumeSpotQuote: (symbol, amount) => {
        const current = get().spotBalances.find((item) => item.symbol === symbol.toUpperCase());
        if (!current || current.amount < amount) {
          return false;
        }

        set((state) => ({
          spotBalances: mergeSpotBalance(state.spotBalances, symbol, -amount),
        }));
        return true;
      },

      creditSpotBase: (asset) => {
        set((state) => ({
          spotBalances: mergeSpotBalance(state.spotBalances, asset.symbol, asset.amount),
        }));
      },

      debitSpotBase: (symbol, amount) => {
        const current = get().spotBalances.find((item) => item.symbol === symbol.toUpperCase());
        if (!current || current.amount < amount) {
          return false;
        }

        set((state) => ({
          spotBalances: mergeSpotBalance(state.spotBalances, symbol, -amount),
        }));
        return true;
      },

      syncCreatedTokens: () => {
        set({ createdTokens: mapCreatedTokens() });
      },
    }),
    {
      name: 'orbitx-wallet-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedNetwork: state.selectedNetwork,
        spotBalances: state.spotBalances,
        history: state.history,
        assets: state.assets,
        lastBalanceSyncAt: state.lastBalanceSyncAt,
      }),
    },
  ),
);
