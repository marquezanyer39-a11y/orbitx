import { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { FONT, RADII } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useUiStore } from '../../store/uiStore';
import { FEATURE_STATUS } from '../../constants/featureStatus';
import { useWallet } from '../../hooks/useWallet';
import { useExternalWallet } from '../../hooks/useExternalWallet';
import { useExternalWalletBalances } from '../../hooks/useExternalWalletBalances';
import { getSendableTokens, type TokenDefinition } from '../../services/wallet/tokenRegistry';
import {
  estimateErc20TransferGas,
  estimateNativeTransferGas,
  sendErc20Transaction,
  sendNativeTransaction,
  TX_STATUS_LABELS,
  type GasEstimate,
  type TxStatusMessage,
  waitForExternalTransactionConfirmation,
} from '../../services/web3/web3TransactionService';
import { SAFE_LAUNCH_DISABLE_REOWN } from '../../services/walletConnectService';
import { getChainConfig, getChainConfigById } from '../../services/web3/web3NetworkConfig';
import { normalizeWeb3Error } from '../../services/web3/web3Errors';
import { validateAddress, validateAmount } from '../../utils/validators';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { SectionHeader } from '../../components/common/SectionHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';

const LOCAL_NETWORKS = ['base', 'ethereum', 'bnb', 'solana'] as const;
const EXTERNAL_NETWORKS = ['ethereum', 'base', 'bnb', 'polygon'] as const;
const SEND_SOURCES = ['local', 'external'] as const;

type SendSource = (typeof SEND_SOURCES)[number];
type LocalNetwork = (typeof LOCAL_NETWORKS)[number];
type ExternalNetwork = (typeof EXTERNAL_NETWORKS)[number];

interface ExternalSendReceipt {
  hash: string;
  explorerUrl?: string;
  status: 'sent' | 'confirmed';
}

function tokenKey(token: TokenDefinition) {
  return token.isNative ? 'native' : `${token.chainId}:${token.contractAddress?.toLowerCase()}`;
}

function maskAddress(address?: string | null) {
  const normalized = address?.trim() ?? '';
  if (!normalized) {
    return '--';
  }

  return `${normalized.slice(0, 6)}...${normalized.slice(-4)}`;
}

function statusLabel(status: TxStatusMessage) {
  return TX_STATUS_LABELS[status];
}

function isLocalNetwork(value: string | undefined): value is LocalNetwork {
  return Boolean(value && LOCAL_NETWORKS.includes(value as LocalNetwork));
}

function isExternalNetwork(value: string | undefined): value is ExternalNetwork {
  return Boolean(value && EXTERNAL_NETWORKS.includes(value as ExternalNetwork));
}

export default function SendScreen() {
  const params = useLocalSearchParams<{ network?: string; source?: string }>();
  const { colors } = useAppTheme();
  const wallet = useWallet();
  const externalWallet = useExternalWallet();
  const showToast = useUiStore((state) => state.showToast);
  const currentExternalChain = getChainConfigById(externalWallet.chainId);
  const initialSource: SendSource = params.source === 'external' ? 'external' : 'local';
  const [sendSource, setSendSource] = useState<SendSource>(initialSource);
  const [selectedNetwork, setSelectedNetwork] = useState<LocalNetwork>(
    isLocalNetwork(params.network) ? params.network : 'base',
  );
  const [selectedExternalNetwork, setSelectedExternalNetwork] = useState<ExternalNetwork>(
    isExternalNetwork(params.network) ? params.network : currentExternalChain?.key ?? 'base',
  );
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [externalReceipt, setExternalReceipt] = useState<ExternalSendReceipt | null>(null);
  const [selectedExternalTokenKey, setSelectedExternalTokenKey] = useState('native');
  const [gasEstimate, setGasEstimate] = useState<GasEstimate | null>(null);
  const [reviewVisible, setReviewVisible] = useState(false);

  const hasExternalWallet =
    externalWallet.isConnected &&
    Boolean(externalWallet.address?.trim()) &&
    Boolean(externalWallet.eip155Provider);
  const canUseExternalSource = hasExternalWallet && Boolean(currentExternalChain?.supportsSend);
  const externalExecutionEnabled =
    FEATURE_STATUS.web3.realExecutionEnabled &&
    FEATURE_STATUS.web3.sendEnabled &&
    FEATURE_STATUS.web3.externalSendEnabled;
  const selectedExternalConfig = getChainConfig(selectedExternalNetwork);
  const externalBalances = useExternalWalletBalances({
    address: externalWallet.address,
    chainId: currentExternalChain?.chainId,
    enabled: hasExternalWallet,
  });
  const sendableExternalTokens = useMemo(
    () => (currentExternalChain ? getSendableTokens(currentExternalChain.chainId) : []),
    [currentExternalChain],
  );
  const selectedExternalToken = useMemo(
    () =>
      sendableExternalTokens.find((token) => tokenKey(token) === selectedExternalTokenKey) ??
      sendableExternalTokens[0],
    [selectedExternalTokenKey, sendableExternalTokens],
  );
  const selectedExternalAsset = useMemo(() => {
    if (!selectedExternalToken) {
      return undefined;
    }

    return externalBalances.assets.find((asset) => {
      if (selectedExternalToken.isNative) {
        return asset.type === 'native' && asset.chainId === selectedExternalToken.chainId;
      }

      return (
        asset.type === 'erc20' &&
        asset.chainId === selectedExternalToken.chainId &&
        asset.contractAddress?.toLowerCase() ===
          selectedExternalToken.contractAddress?.toLowerCase()
      );
    });
  }, [externalBalances.assets, selectedExternalToken]);
  const selectedExternalBalance = selectedExternalAsset?.amount.toString() ?? '0';

  useEffect(() => {
    if (!selectedExternalToken) {
      return;
    }

    const nextKey = tokenKey(selectedExternalToken);
    if (nextKey !== selectedExternalTokenKey) {
      setSelectedExternalTokenKey(nextKey);
    }
  }, [selectedExternalToken, selectedExternalTokenKey]);

  const selectedLocalAsset = useMemo(
    () =>
      wallet.assets.find(
        (asset) =>
          asset.network === selectedNetwork && ['ETH', 'BNB', 'SOL'].includes(asset.symbol),
      ),
    [selectedNetwork, wallet.assets],
  );

  const helperText =
    sendSource === 'external'
      ? hasExternalWallet
        ? `Red actual: ${currentExternalChain?.name ?? 'No compatible'} · Token: ${selectedExternalToken?.symbol ?? '--'} · La transacción siempre se confirma desde tu wallet externa.`
        : 'Conecta una wallet externa EVM para enviar fondos reales desde MetaMask, Trust o Coinbase.'
      : `Disponible: ${selectedLocalAsset ? `${selectedLocalAsset.amount.toFixed(6)} ${selectedLocalAsset.symbol}` : 'Sin saldo nativo en esta red'}`;

  const submitLocalTransfer = async () => {
    setStatusMessage(
      'El envío desde wallet local QVEX no está habilitado en esta fase. Usa una wallet externa conectada.',
    );
    showToast('Envío local bloqueado por seguridad en esta fase.', 'info');
  };

  const openWalletConnectSafely = () => {
    const message = 'WalletConnect temporalmente no disponible en esta version de prueba.';

    if (SAFE_LAUNCH_DISABLE_REOWN || !FEATURE_STATUS.web3.allowWalletConnect) {
      setStatusMessage(message);
      showToast(message, 'info');
      return;
    }

    setStatusMessage(message);
    showToast(message, 'info');
  };

  const prepareExternalTransfer = async () => {
    if (!externalExecutionEnabled) {
      setStatusMessage(
        'El envio Web3 real esta deshabilitado por configuracion. No se firmo ni envio ninguna transaccion.',
      );
      throw new Error('WEB3_EXECUTION_DISABLED');
    }

    if (!hasExternalWallet || !externalWallet.address || !externalWallet.eip155Provider) {
      throw new Error('wallet not connected');
    }

    if (!currentExternalChain || !currentExternalChain.supportsSend) {
      throw new Error('unsupported chain');
    }

    if (selectedExternalNetwork !== currentExternalChain.key) {
      throw new Error('chain mismatch');
    }

    if (!selectedExternalToken) {
      throw new Error('token not supported');
    }

    const nextGasEstimate = selectedExternalToken.isNative
      ? await estimateNativeTransferGas({
          fromAddress: externalWallet.address,
          toAddress: destination,
          amount,
          chainId: currentExternalChain.chainId,
        })
      : await estimateErc20TransferGas({
          fromAddress: externalWallet.address,
          toAddress: destination,
          token: selectedExternalToken,
          amount,
          chainId: currentExternalChain.chainId,
        });

    if (!nextGasEstimate.canEstimate) {
      throw new Error(nextGasEstimate.errorMessage || 'gas estimation failed');
    }

    setGasEstimate(nextGasEstimate);
    setReviewVisible(true);
    setStatusMessage('Revisa el resumen antes de firmar. QVEX no firma por ti.');
  };

  const submitExternalTransfer = async () => {
    if (!externalExecutionEnabled) {
      throw new Error('WEB3_EXECUTION_DISABLED');
    }

    if (!hasExternalWallet || !externalWallet.address || !externalWallet.eip155Provider) {
      throw new Error('wallet not connected');
    }

    if (!currentExternalChain || !currentExternalChain.supportsSend) {
      throw new Error('unsupported chain');
    }

    if (!selectedExternalToken) {
      throw new Error('token not supported');
    }

    const handleStatus = (status: TxStatusMessage) => {
      setStatusMessage(statusLabel(status));
    };
    const result = selectedExternalToken.isNative
      ? await sendNativeTransaction(
          {
            provider: externalWallet.eip155Provider,
            fromAddress: externalWallet.address,
            toAddress: destination,
            amount,
            chainId: currentExternalChain.chainId,
          },
          handleStatus,
        )
      : await sendErc20Transaction(
          {
            provider: externalWallet.eip155Provider,
            fromAddress: externalWallet.address,
            toAddress: destination,
            token: selectedExternalToken,
            amount,
            chainId: currentExternalChain.chainId,
          },
          handleStatus,
        );

    if (result.status !== 'success' || !result.txHash) {
      throw new Error(result.errorMessage || 'transaction failed');
    }

    setExternalReceipt({
      hash: result.txHash,
      explorerUrl: result.explorerUrl ?? undefined,
      status: 'sent',
    });
    setReviewVisible(false);
    setStatusMessage('Transacción enviada. Esperando confirmación en blockchain...');
    showToast(`Transacción enviada: ${result.txHash.slice(0, 10)}...`, 'success');

    try {
      await waitForExternalTransactionConfirmation({
        provider: externalWallet.eip155Provider,
        hash: result.txHash,
      });
      setExternalReceipt((current) => (current ? { ...current, status: 'confirmed' } : current));
      setStatusMessage('Transacción confirmada en blockchain.');
      showToast('Transacción confirmada.', 'success');
    } catch (confirmationError) {
      const normalizedConfirmationError = normalizeWeb3Error(
        confirmationError,
        'La transacción fue enviada. La confirmación puede tardar unos minutos.',
      );
      setStatusMessage(normalizedConfirmationError.message);
    }
  };

  const resetPendingReview = () => {
    setReviewVisible(false);
    setGasEstimate(null);
    setExternalReceipt(null);
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <SectionHeader
        title="Enviar"
        subtitle={
          sendSource === 'external'
            ? 'Envía fondos desde tu wallet externa conectada con confirmación real.'
            : 'Valida destino, monto y red antes de firmar.'
        }
      />

      <View style={styles.sourceRow}>
        {SEND_SOURCES.map((source) => {
          const active = sendSource === source;
          const disabled = source === 'external' && !canUseExternalSource;
          return (
            <Pressable
              key={source}
              onPress={() => {
                if (disabled) {
                  showToast('Conecta una wallet externa EVM para usar este origen.', 'info');
                  return;
                }

                setSendSource(source);
                setStatusMessage(null);
                resetPendingReview();
              }}
              style={[
                styles.sourceChip,
                {
                  backgroundColor: active ? colors.primarySoft : colors.fieldBackground,
                  borderColor: active ? colors.borderStrong : colors.border,
                  opacity: disabled ? 0.55 : 1,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: active ? colors.text : colors.textMuted }]}>
                {source === 'external' ? 'Wallet externa conectada' : 'Wallet local QVEX'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.networkRow}>
        {(sendSource === 'external' ? EXTERNAL_NETWORKS : LOCAL_NETWORKS).map((network) => {
          const active =
            sendSource === 'external'
              ? selectedExternalNetwork === network
              : selectedNetwork === network;

          return (
            <Pressable
              key={network}
              onPress={() => {
                if (sendSource === 'external') {
                  setSelectedExternalNetwork(network as ExternalNetwork);
                  resetPendingReview();
                  return;
                }

                setSelectedNetwork(network as LocalNetwork);
                resetPendingReview();
              }}
              style={[
                styles.networkChip,
                {
                  backgroundColor: active ? colors.primarySoft : colors.fieldBackground,
                  borderColor: active ? colors.borderStrong : colors.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: active ? colors.text : colors.textMuted }]}>
                {(network === 'bnb' ? 'BNB' : network).toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {sendSource === 'external' ? (
        <View style={styles.tokenSection}>
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Token</Text>
          <View style={styles.networkRow}>
            {sendableExternalTokens.map((token) => {
              const active = selectedExternalToken && tokenKey(token) === tokenKey(selectedExternalToken);
              return (
                <Pressable
                  key={tokenKey(token)}
                  onPress={() => {
                    setSelectedExternalTokenKey(tokenKey(token));
                    resetPendingReview();
                  }}
                  style={[
                    styles.networkChip,
                    {
                      backgroundColor: active ? colors.primarySoft : colors.fieldBackground,
                      borderColor: active ? colors.borderStrong : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: active ? colors.text : colors.textMuted }]}>
                    {token.symbol}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={[styles.helper, { color: colors.textMuted }]}>
            Disponible: {selectedExternalBalance} {selectedExternalToken?.symbol ?? '--'}
          </Text>
        </View>
      ) : null}

      {sendSource === 'external' ? (
        <View style={[styles.statusCard, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}>
          <Text style={[styles.statusTitle, { color: colors.text }]}>Estado Web3</Text>
          <Text style={[styles.statusBody, { color: colors.textMuted }]}>
            {hasExternalWallet
              ? `Wallet ${maskAddress(externalWallet.address)} · Red actual: ${currentExternalChain?.name ?? 'No compatible'}`
              : 'Conecta una wallet externa EVM para enviar fondos reales desde tu proveedor preferido.'}
          </Text>
          {!hasExternalWallet ? (
            <Pressable onPress={openWalletConnectSafely} hitSlop={8}>
              <Text style={[styles.statusLink, { color: colors.primary }]}>Conectar wallet</Text>
            </Pressable>
          ) : null}
          {selectedExternalNetwork !== currentExternalChain?.key ? (
            <Text style={[styles.statusHint, { color: colors.warning }]}>
              La red seleccionada no coincide con la wallet. Cámbiala desde Web3 antes de enviar.
            </Text>
          ) : null}
          {!selectedExternalConfig.supportsSwitch ? (
            <Text style={[styles.statusHint, { color: colors.textMuted }]}>
              {selectedExternalConfig.readOnlyReason}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.fieldShell, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}>
        <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Dirección destino</Text>
        <TextInput
          value={destination}
          onChangeText={(value) => {
            setDestination(value);
            resetPendingReview();
          }}
          placeholder={sendSource === 'external' ? '0x... dirección EVM' : '0x... o dirección Solana'}
          placeholderTextColor={colors.textMuted}
          style={[styles.fieldInput, { color: colors.text }]}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={[styles.fieldShell, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}>
        <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Monto</Text>
        <TextInput
          value={amount}
          onChangeText={(value) => {
            setAmount(value);
            resetPendingReview();
          }}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
          style={[styles.fieldInput, { color: colors.text }]}
        />
      </View>

      <Text style={[styles.helper, { color: colors.textMuted }]}>{helperText}</Text>

      {reviewVisible && sendSource === 'external' && selectedExternalToken ? (
        <View style={[styles.statusCard, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}>
          <Text style={[styles.statusTitle, { color: colors.text }]}>Resumen antes de firmar</Text>
          <Text style={[styles.statusHint, { color: colors.warning }]}>
            Riesgo: transacciÃ³n irreversible. Revisa red, direcciÃ³n y monto antes de abrir tu wallet.
          </Text>
          <Text style={[styles.statusBody, { color: colors.text }]}>
            Enviando: {amount || '--'} {selectedExternalToken.symbol}
          </Text>
          <Text style={[styles.statusHint, { color: colors.textMuted }]}>
            Origen: Wallet externa
          </Text>
          <Text style={[styles.statusHint, { color: colors.textMuted }]}>
            From: {maskAddress(externalWallet.address)}
          </Text>
          <Text style={[styles.statusHint, { color: colors.textMuted }]}>
            Red: {currentExternalChain?.name ?? 'No compatible'}
          </Text>
          <Text style={[styles.statusHint, { color: colors.textMuted }]}>
            Destinatario: {maskAddress(destination)}
          </Text>
          <Text style={[styles.statusHint, { color: colors.textMuted }]}>
            Gas estimado: {gasEstimate?.estimatedCostNative ?? '--'}{' '}
            {currentExternalChain?.symbol ?? ''}
          </Text>
          <Text style={[styles.statusHint, { color: colors.textMuted }]}>
            Entiendo que esta transacciÃ³n se firma en mi wallet.
          </Text>
          <View style={styles.reviewActions}>
            <Pressable
              onPress={() => {
                setReviewVisible(false);
                setGasEstimate(null);
                setStatusMessage(null);
              }}
              style={[styles.reviewButton, { borderColor: colors.border }]}
            >
              <Text style={[styles.statusLink, { color: colors.textMuted }]}>Cancelar</Text>
            </Pressable>
            <Pressable
              disabled={submitting}
              onPress={async () => {
                setSubmitting(true);
                try {
                  await submitExternalTransfer();
                } catch (error) {
                  const normalizedError = normalizeWeb3Error(error, 'No se pudo enviar el activo.');
                  showToast(normalizedError.message, 'error');
                  setStatusMessage(normalizedError.message);
                } finally {
                  setSubmitting(false);
                }
              }}
              style={[styles.reviewButton, { borderColor: colors.borderStrong }]}
            >
              <Text style={[styles.statusLink, { color: colors.primary }]}>
                {submitting ? 'Esperando wallet...' : 'Confirmar y abrir wallet'}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {statusMessage ? (
        <View style={[styles.statusCard, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}>
          <Text style={[styles.statusBody, { color: colors.text }]}>{statusMessage}</Text>
          {externalReceipt?.hash ? (
            <>
              <Text style={[styles.statusHint, { color: colors.textMuted }]}>
                Hash real: {externalReceipt.hash.slice(0, 12)}...{externalReceipt.hash.slice(-8)}
              </Text>
              {externalReceipt.explorerUrl ? (
                <Pressable onPress={() => void Linking.openURL(externalReceipt.explorerUrl!)} hitSlop={8}>
                  <Text style={[styles.statusLink, { color: colors.primary }]}>Abrir explorador</Text>
                </Pressable>
              ) : null}
            </>
          ) : null}
        </View>
      ) : null}

      <PrimaryButton
        label={
          submitting
            ? sendSource === 'external'
              ? 'Esperando firma...'
              : 'Enviando...'
            : sendSource === 'external'
              ? !externalExecutionEnabled
                ? 'Envio Web3 deshabilitado'
                : reviewVisible
                ? 'Resumen listo'
                : 'Continuar'
              : 'Envío local bloqueado'
        }
        disabled={submitting || (sendSource === 'external' && reviewVisible)}
        onPress={async () => {
          const validationNetwork = sendSource === 'external' ? selectedExternalNetwork : selectedNetwork;

          if (!validateAddress(destination, validationNetwork)) {
            showToast('La dirección no es válida para la red seleccionada.', 'error');
            return;
          }

          if (!validateAmount(amount)) {
            showToast('Ingresa un monto válido.', 'error');
            return;
          }

          setSubmitting(true);
          setStatusMessage(null);
          setExternalReceipt(null);

          try {
            if (sendSource === 'external') {
              await prepareExternalTransfer();
            } else {
              await submitLocalTransfer();
            }
          } catch (error) {
            const normalizedError = normalizeWeb3Error(error, 'No se pudo enviar el activo.');
            showToast(normalizedError.message, 'error');
            setStatusMessage(normalizedError.message);
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  sourceRow: {
    gap: 8,
  },
  networkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sourceChip: {
    minHeight: 40,
    borderWidth: 1,
    borderRadius: RADII.pill,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkChip: {
    minHeight: 34,
    borderWidth: 1,
    borderRadius: RADII.pill,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenSection: {
    gap: 8,
  },
  chipText: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  fieldShell: {
    borderWidth: 1,
    borderRadius: RADII.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  fieldLabel: {
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  fieldInput: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  helper: {
    fontFamily: FONT.regular,
    fontSize: 11,
  },
  statusCard: {
    borderWidth: 1,
    borderRadius: RADII.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  statusTitle: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  statusBody: {
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  statusHint: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  statusLink: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 10,
  },
  reviewButton: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
