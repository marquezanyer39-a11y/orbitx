import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { ConnectionsController } from '@reown/appkit-core-react-native';
import {
  AppKit,
  AppKitProvider,
  useAccount,
  useAppKit,
  useAppKitEventSubscription,
  useWalletInfo,
} from '@reown/appkit-react-native';

import { useUiStore } from '../store/uiStore';
import { useWalletStore } from '../store/walletStore';
import type {
  ExternalWalletConnection,
  ExternalWalletStatus,
  SupportedNetwork,
} from '../types/wallet';
import {
  WALLETCONNECT_TEST_MESSAGE,
  getWalletConnectNetworkLabel,
  getWalletConnectTargetNetwork,
  isSupportedWalletConnectChain,
  mapWalletConnectChainToOrbitNetwork,
  resolveExternalWalletProvider,
  resolveWalletConnectChainId,
  walletConnectAppKit,
  walletConnectConfigured,
  walletConnectRuntimeSupported,
} from '../services/walletConnectService';

interface ExternalWalletContextValue {
  configured: boolean;
  runtimeSupported: boolean;
  disabledReason?: string;
  status: ExternalWalletStatus;
  isConnected: boolean;
  isBusy: boolean;
  address?: string;
  chainId?: number;
  chainLabel: string;
  walletName?: string;
  sessionTopic?: string;
  provider: ExternalWalletConnection['provider'];
  lastError?: string;
  signature?: string;
  orbitNetwork?: SupportedNetwork | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message?: string) => Promise<{ ok: boolean; message: string; signature?: string }>;
  switchToNetwork: (network: SupportedNetwork) => Promise<{ ok: boolean; message: string }>;
}

const disabledConfigMessage =
  'WalletConnect no esta configurado. Falta EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID.';
const expoGoMessage =
  'WalletConnect requiere development build o APK. Expo Go no soporta esta integracion.';

const defaultContextValue: ExternalWalletContextValue = {
  configured: walletConnectConfigured,
  runtimeSupported: walletConnectRuntimeSupported,
  disabledReason: !walletConnectConfigured
    ? disabledConfigMessage
    : !walletConnectRuntimeSupported
      ? expoGoMessage
      : undefined,
  status: 'disconnected',
  isConnected: false,
  isBusy: false,
  chainLabel: 'Sin red',
  provider: null,
  connect: async () => undefined,
  disconnect: async () => undefined,
  signMessage: async () => ({ ok: false, message: disabledConfigMessage }),
  switchToNetwork: async () => ({ ok: false, message: disabledConfigMessage }),
};

const ExternalWalletContext = createContext<ExternalWalletContextValue>(defaultContextValue);

function createEmptyConnection(): ExternalWalletConnection {
  return {
    provider: null,
    address: '',
    signingReady: false,
    status: 'disconnected',
  };
}

function normalizeWalletErrorMessage(error: unknown, fallback: string) {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : fallback;
  const normalized = raw.trim();
  const lower = normalized.toLowerCase();

  if (
    lower.includes('user rejected') ||
    lower.includes('rejected') ||
    lower.includes('cancel') ||
    lower.includes('denied') ||
    lower.includes('4001')
  ) {
    return 'El usuario rechazo la aprobacion desde la wallet externa.';
  }

  if (lower.includes('expired')) {
    return 'La sesion de la wallet externa expiro. Vuelve a conectarla.';
  }

  if (lower.includes('network')) {
    return 'La wallet externa no pudo completar la conexion por un problema de red.';
  }

  return normalized || fallback;
}

function getEventProperties(event: unknown) {
  if (
    event &&
    typeof event === 'object' &&
    'data' in event &&
    event.data &&
    typeof event.data === 'object' &&
    'properties' in event.data &&
    event.data.properties &&
    typeof event.data.properties === 'object'
  ) {
    return event.data.properties as Record<string, unknown>;
  }

  return {};
}

function ExternalWalletRuntimeProvider({ children }: { children: ReactNode }) {
  const { open, disconnect: appKitDisconnect, switchNetwork } = useAppKit();
  const { address, chainId, isConnected } = useAccount();
  const { walletInfo } = useWalletInfo();
  const storeExternalWallet = useWalletStore((state) => state.externalWallet);
  const setExternalWalletConnection = useWalletStore((state) => state.setExternalWalletConnection);
  const disconnectExternalWallet = useWalletStore((state) => state.disconnectExternalWallet);
  const updateExternalWalletState = useWalletStore((state) => state.updateExternalWalletState);
  const showToast = useUiStore((state) => state.showToast);
  const [busyAction, setBusyAction] = useState<'connect' | 'disconnect' | 'sign' | 'switch' | null>(null);
  const [signature, setSignature] = useState<string | undefined>();

  const chainIdNumber = resolveWalletConnectChainId(chainId);
  const provider = resolveExternalWalletProvider(walletInfo?.name);
  const walletName = walletInfo?.name?.trim() || undefined;
  const sessionTopic =
    ConnectionsController.state.connection?.properties?.sessionTopic?.trim() || undefined;
  const chainLabel = getWalletConnectNetworkLabel(chainIdNumber);
  const orbitNetwork = mapWalletConnectChainToOrbitNetwork(chainIdNumber);
  const hasSupportedNetwork = isSupportedWalletConnectChain(chainIdNumber);

  useEffect(() => {
    if (isConnected && address) {
      void setExternalWalletConnection(
        {
          provider,
          address,
          chainId: chainIdNumber,
          walletName,
          sessionTopic,
          connectedAt: storeExternalWallet.connectedAt ?? new Date().toISOString(),
          signingReady: true,
          status: 'connected',
          lastError: hasSupportedNetwork
            ? undefined
            : 'La red actual no es compatible con OrbitX para operaciones EVM.',
        },
        { suppressHistory: true },
      );
      return;
    }

    if (storeExternalWallet.address || storeExternalWallet.status !== 'disconnected') {
      void setExternalWalletConnection(createEmptyConnection(), { suppressHistory: true });
    }
  }, [
    address,
    chainIdNumber,
    hasSupportedNetwork,
    isConnected,
    provider,
    sessionTopic,
    setExternalWalletConnection,
    storeExternalWallet.address,
    storeExternalWallet.connectedAt,
    storeExternalWallet.status,
    walletName,
  ]);

  useAppKitEventSubscription('CONNECT_SUCCESS', (event: any) => {
    const properties = getEventProperties(event);
    const reconnect = properties.reconnect === true;
    const connectedWalletName =
      typeof properties.name === 'string' && properties.name.trim()
        ? properties.name.trim()
        : walletName;

    setBusyAction(null);
    setSignature(undefined);
    updateExternalWalletState({
      status: 'connected',
      lastError: undefined,
      signingReady: true,
    });
    if (!reconnect) {
      showToast(`${connectedWalletName || 'Wallet externa'} conectada`, 'success');
    }
  });

  useAppKitEventSubscription('CONNECT_ERROR', (event: any) => {
    const properties = getEventProperties(event);
    const message = normalizeWalletErrorMessage(
      properties.message,
      'No se pudo conectar la wallet externa.',
    );
    setBusyAction(null);
    updateExternalWalletState({
      status: 'error',
      lastError: message,
      signingReady: false,
    });
    showToast(message, 'error');
  });

  useAppKitEventSubscription('USER_REJECTED', (event: any) => {
    const properties = getEventProperties(event);
    const message = normalizeWalletErrorMessage(
      properties.message,
      'El usuario rechazo la accion desde la wallet externa.',
    );
    setBusyAction(null);
    updateExternalWalletState({
      status: isConnected ? 'connected' : 'disconnected',
      lastError: message,
    });
    showToast(message, 'error');
  });

  useAppKitEventSubscription('DISCONNECT_SUCCESS', () => {
    setBusyAction(null);
    setSignature(undefined);
    disconnectExternalWallet();
    showToast('Wallet externa desconectada', 'info');
  });

  useAppKitEventSubscription('DISCONNECT_ERROR', () => {
    setBusyAction(null);
    updateExternalWalletState({
      status: 'error',
      lastError: 'No se pudo cerrar la sesion de la wallet externa.',
    });
    showToast('No se pudo cerrar la sesion de la wallet externa.', 'error');
  });

  const connect = useCallback(async () => {
    setBusyAction('connect');
    setSignature(undefined);
    updateExternalWalletState({
      status: 'connecting',
      lastError: undefined,
      signingReady: false,
    });
    open();
  }, [open, updateExternalWalletState]);

  const disconnect = useCallback(async () => {
    setBusyAction('disconnect');

    try {
      await appKitDisconnect('eip155');
      setBusyAction(null);
    } catch (error) {
      const message = normalizeWalletErrorMessage(
        error,
        'No se pudo desconectar la wallet externa.',
      );
      setBusyAction(null);
      updateExternalWalletState({
        status: 'error',
        lastError: message,
      });
      showToast(message, 'error');
    }
  }, [appKitDisconnect, disconnectExternalWallet, showToast, updateExternalWalletState]);

  const signMessage = useCallback(
    async (message = WALLETCONNECT_TEST_MESSAGE) => {
      if (!address || !chainIdNumber) {
        return {
          ok: false,
          message: 'Conecta una wallet externa antes de firmar un mensaje.',
        };
      }

      const caipAddress = `eip155:${chainIdNumber}:${address}` as const;

      setBusyAction('sign');
      try {
        const nextSignature = await ConnectionsController.signMessage(caipAddress, message);
        setBusyAction(null);

        if (!nextSignature) {
          const response = {
            ok: false,
            message: 'La wallet externa no devolvio una firma valida.',
          };
          updateExternalWalletState({
            status: 'error',
            lastError: response.message,
          });
          showToast(response.message, 'error');
          return response;
        }

        setSignature(nextSignature);
        updateExternalWalletState({
          status: 'connected',
          signingReady: true,
          lastError: undefined,
        });
        showToast('Mensaje firmado desde tu wallet externa.', 'success');
        return {
          ok: true,
          message: 'Mensaje firmado correctamente.',
          signature: nextSignature,
        };
      } catch (error) {
        const normalizedMessage = normalizeWalletErrorMessage(
          error,
          'No se pudo firmar el mensaje desde la wallet externa.',
        );
        setBusyAction(null);
        updateExternalWalletState({
          status: 'error',
          lastError: normalizedMessage,
        });
        showToast(normalizedMessage, 'error');
        return {
          ok: false,
          message: normalizedMessage,
        };
      }
    },
    [address, chainIdNumber, showToast, updateExternalWalletState],
  );

  const switchToNetwork = useCallback(
    async (network: SupportedNetwork) => {
      if (network === 'solana') {
        return {
          ok: false,
          message: 'La wallet externa actual solo maneja redes EVM dentro de OrbitX.',
        };
      }

      setBusyAction('switch');
      try {
        const targetNetwork = getWalletConnectTargetNetwork(network);
        await switchNetwork(targetNetwork.caipNetworkId);
        setBusyAction(null);
        showToast(`Red cambiada a ${getWalletConnectNetworkLabel(targetNetwork.id)}`, 'success');
        return {
          ok: true,
          message: 'Red cambiada correctamente.',
        };
      } catch (error) {
        const message = normalizeWalletErrorMessage(
          error,
          'No se pudo cambiar la red desde la wallet externa.',
        );
        setBusyAction(null);
        updateExternalWalletState({
          status: 'error',
          lastError: message,
        });
        showToast(message, 'error');
        return {
          ok: false,
          message,
        };
      }
    },
    [showToast, switchNetwork, updateExternalWalletState],
  );

  const value = useMemo<ExternalWalletContextValue>(
    () => ({
      configured: walletConnectConfigured,
      runtimeSupported: walletConnectRuntimeSupported,
      status: storeExternalWallet.status,
      isConnected: Boolean(address && isConnected),
      isBusy: busyAction !== null,
      address,
      chainId: chainIdNumber,
      chainLabel,
      walletName,
      sessionTopic,
      provider: isConnected ? provider : storeExternalWallet.provider,
      lastError: storeExternalWallet.lastError,
      signature,
      orbitNetwork,
      connect,
      disconnect,
      signMessage,
      switchToNetwork,
    }),
    [
      address,
      busyAction,
      chainIdNumber,
      chainLabel,
      connect,
      disconnect,
      isConnected,
      orbitNetwork,
      provider,
      sessionTopic,
      signMessage,
      signature,
      storeExternalWallet.lastError,
      storeExternalWallet.status,
      switchToNetwork,
      walletName,
    ],
  );

  return (
    <ExternalWalletContext.Provider value={value}>
      {children}
      <AppKit />
    </ExternalWalletContext.Provider>
  );
}

export function ExternalWalletProvider({ children }: { children: ReactNode }) {
  if (!walletConnectConfigured) {
    return (
      <ExternalWalletContext.Provider
        value={{
          ...defaultContextValue,
          configured: false,
          runtimeSupported: walletConnectRuntimeSupported,
          disabledReason: disabledConfigMessage,
        }}
      >
        {children}
      </ExternalWalletContext.Provider>
    );
  }

  if (!walletConnectRuntimeSupported || !walletConnectAppKit) {
    return (
      <ExternalWalletContext.Provider
        value={{
          ...defaultContextValue,
          configured: walletConnectConfigured,
          runtimeSupported: false,
          disabledReason: expoGoMessage,
        }}
      >
        {children}
      </ExternalWalletContext.Provider>
    );
  }

  return (
    <AppKitProvider instance={walletConnectAppKit}>
      <ExternalWalletRuntimeProvider>{children}</ExternalWalletRuntimeProvider>
    </AppKitProvider>
  );
}

export function useExternalWalletContext() {
  return useContext(ExternalWalletContext);
}
