import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ACTIVE_RECEIVE_NETWORKS } from '../../constants/networks';
import { FONT, RADII, SPACING, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getPortfolioAssets } from '../../store/selectors';
import { useOrbitStore } from '../../store/useOrbitStore';
import { formatCurrency, formatUnits } from '../../utils/format';
import { isValidWalletAddress } from '../../utils/validation';
import { maskAddress } from '../../utils/wallet';
import { canSendOrbitWalletToken, getOrbitWalletTransferSupport, sendOrbitWalletAsset } from '../../utils/walletSend';
import { PrimaryButton } from '../common/PrimaryButton';
import { TokenAvatar } from '../common/TokenAvatar';
import { OrbitInput } from '../forms/OrbitInput';

type Web3TransferMode = 'receive' | 'send';

interface Web3TransferSheetProps {
  visible: boolean;
  mode: Web3TransferMode;
  onClose: () => void;
}

function getTokenNetworkKey(tokenId: string) {
  if (tokenId === 'bnb') {
    return 'bnb' as const;
  }

  if (tokenId === 'sol') {
    return 'solana' as const;
  }

  return 'base' as const;
}

export function Web3TransferSheet({
  visible,
  mode,
  onClose,
}: Web3TransferSheetProps) {
  const { colors } = useAppTheme();
  const tokens = useOrbitStore((state) => state.tokens);
  const walletFuture = useOrbitStore((state) => state.walletFuture);
  const syncOnchainPortfolio = useOrbitStore((state) => state.syncOnchainPortfolio);
  const showToast = useOrbitStore((state) => state.showToast);
  const onchainAssets = useMemo(
    () => getPortfolioAssets(walletFuture.onchainAssets, tokens),
    [walletFuture.onchainAssets, tokens],
  );
  const sendableAssets = useMemo(
    () => onchainAssets.filter((asset) => canSendOrbitWalletToken(asset.tokenId) && asset.amount > 0),
    [onchainAssets],
  );
  const receiveNetworks = useMemo(
    () =>
      ACTIVE_RECEIVE_NETWORKS.map((network) => ({
        key: network.walletNetwork,
        label: network.label,
        body: network.helperText,
        address: walletFuture.receiveAddresses[network.walletNetwork],
      })),
    [walletFuture.receiveAddresses],
  );

  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    if (!visible) {
      setAmount('');
      setDestination('');
      setErrorText('');
      setStatusText('');
      return;
    }

    if (!selectedAssetId) {
      setSelectedAssetId(sendableAssets[0]?.tokenId ?? onchainAssets[0]?.tokenId ?? '');
    }
  }, [onchainAssets, selectedAssetId, sendableAssets, visible]);

  const selectedAsset = onchainAssets.find((asset) => asset.tokenId === selectedAssetId) ?? null;
  const supportState = getOrbitWalletTransferSupport(selectedAssetId);
  const destinationNetwork = getTokenNetworkKey(selectedAssetId || 'eth');

  async function handleCopyAddress(label: string, address?: string) {
    if (!address) {
      showToast('Activa tu wallet para generar una direccion.', 'info');
      return;
    }

    await Clipboard.setStringAsync(address);
    showToast(`${label} copiado`, 'success');
  }

  async function handleSend() {
    if (!selectedAsset) {
      setErrorText('No encontramos un activo on-chain para enviar.');
      return;
    }

    const parsedAmount = Number(amount);
    const nextDestination = destination.trim();

    if (!parsedAmount || parsedAmount <= 0) {
      setErrorText('Ingresa un monto valido.');
      return;
    }

    if (parsedAmount > selectedAsset.amount) {
      setErrorText('No tienes saldo suficiente en esta wallet.');
      return;
    }

    if (!nextDestination) {
      setErrorText('Ingresa la direccion destino.');
      return;
    }

    if (!isValidWalletAddress(nextDestination, destinationNetwork)) {
      setErrorText('La direccion no coincide con la red seleccionada.');
      return;
    }

    if (!supportState.supported) {
      setErrorText(supportState.message);
      return;
    }

    try {
      setLoading(true);
      setErrorText('');
      setStatusText('Esperando confirmacion on-chain...');

      const transfer = await sendOrbitWalletAsset(selectedAsset.tokenId, nextDestination, parsedAmount);

      setStatusText(`Transaccion confirmada: ${maskAddress(transfer.hash)}`);
      await syncOnchainPortfolio(true);
      showToast(`${selectedAsset.token.symbol} enviado`, 'success');
      onClose();
    } catch (error) {
      setStatusText('');
      setErrorText(
        error instanceof Error ? error.message : 'No se pudo enviar el activo desde tu wallet.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.backgroundAlt,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={[styles.eyebrow, { color: colors.textMuted }]}>Wallet Web3</Text>
              <Text style={[styles.title, { color: colors.text }]}>
                {mode === 'receive' ? 'Recibir fondos' : 'Enviar fondos'}
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.fieldBackground }]}
            >
              <Ionicons name="close" size={18} color={colors.text} />
            </Pressable>
          </View>

          {mode === 'receive' ? (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              {receiveNetworks.map((network) => (
                <View
                  key={network.key}
                  style={[
                    styles.receiveCard,
                    {
                      backgroundColor: colors.fieldBackground,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.receiveHeader}>
                    <View style={styles.receiveCopy}>
                      <Text style={[styles.receiveTitle, { color: colors.text }]}>{network.label}</Text>
                      <Text style={[styles.receiveBody, { color: colors.textMuted }]}>{network.body}</Text>
                    </View>

                    <Pressable
                      onPress={() => void handleCopyAddress(network.label, network.address)}
                      style={[styles.copyButton, { backgroundColor: colors.primarySoft }]}
                    >
                      <Text style={[styles.copyButtonLabel, { color: colors.text }]}>Copiar</Text>
                    </Pressable>
                  </View>

                  <Text style={[styles.addressValue, { color: colors.textSoft }]}>
                    {network.address ? maskAddress(network.address) : 'Direccion no disponible'}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              <View style={styles.assetSelector}>
                {onchainAssets.map((asset) => {
                  const active = asset.tokenId === selectedAssetId;
                  const sendSupport = getOrbitWalletTransferSupport(asset.tokenId);

                  return (
                    <Pressable
                      key={asset.tokenId}
                      onPress={() => {
                        setSelectedAssetId(asset.tokenId);
                        setErrorText('');
                        setStatusText('');
                      }}
                      style={[
                        styles.assetChip,
                        {
                          backgroundColor: active ? colors.primarySoft : colors.fieldBackground,
                          borderColor: active ? colors.primary : colors.border,
                          opacity: sendSupport.supported ? 1 : 0.82,
                        },
                      ]}
                    >
                      <TokenAvatar
                        label={asset.token.symbol}
                        color={asset.token.color}
                        logo={asset.token.logo}
                        size={30}
                      />
                      <View style={styles.assetChipCopy}>
                        <Text style={[styles.assetChipLabel, { color: colors.text }]}>
                          {asset.token.symbol}
                        </Text>
                        <Text style={[styles.assetChipAmount, { color: colors.textMuted }]}>
                          {formatUnits(asset.amount, asset.amount < 10 ? 6 : 4)}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {selectedAsset ? (
                <View
                  style={[
                    styles.helperCard,
                    { backgroundColor: colors.fieldBackground, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.helperTitle, { color: colors.text }]}>
                    {selectedAsset.token.name}
                  </Text>
                  <Text style={[styles.helperBody, { color: colors.textMuted }]}>
                    Disponible: {formatUnits(selectedAsset.amount, selectedAsset.amount < 10 ? 6 : 4)}{' '}
                    {selectedAsset.token.symbol} · {formatCurrency(selectedAsset.valueUsd)}
                  </Text>
                </View>
              ) : null}

              <OrbitInput
                label="Monto"
                value={amount}
                onChangeText={(value) => {
                  setErrorText('');
                  setStatusText('');
                  setAmount(value);
                }}
                placeholder="0.00"
                keyboardType="numeric"
                autoCapitalize="none"
              />

              <OrbitInput
                label="Direccion destino"
                value={destination}
                onChangeText={(value) => {
                  setErrorText('');
                  setStatusText('');
                  setDestination(value);
                }}
                placeholder={destinationNetwork === 'solana' ? 'Ej. 7X4n...gK9p' : '0x...'}
                autoCapitalize="none"
                autoCorrect={false}
              />

              {!supportState.supported ? (
                <View
                  style={[
                    styles.helperCard,
                    {
                      backgroundColor: withOpacity(colors.warning, 0.08),
                      borderColor: withOpacity(colors.warning, 0.16),
                    },
                  ]}
                >
                  <Text style={[styles.helperBody, { color: colors.textSoft }]}>{supportState.message}</Text>
                </View>
              ) : null}

              {statusText ? (
                <Text style={[styles.statusText, { color: colors.primary }]}>{statusText}</Text>
              ) : null}

              {errorText ? (
                <Text style={[styles.errorText, { color: colors.loss }]}>{errorText}</Text>
              ) : null}

              <PrimaryButton
                label={loading ? 'Enviando...' : `Enviar ${selectedAsset?.token.symbol ?? ''}`.trim()}
                onPress={() => void handleSend()}
                disabled={loading || !selectedAsset}
              />
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '86%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    fontFamily: FONT.medium,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 20,
    lineHeight: 24,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: 10,
    paddingBottom: SPACING.md,
  },
  receiveCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 10,
    gap: 6,
  },
  receiveHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  receiveCopy: {
    flex: 1,
    gap: 2,
  },
  receiveTitle: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  receiveBody: {
    fontFamily: FONT.regular,
    fontSize: 10,
    lineHeight: 14,
  },
  copyButton: {
    borderRadius: RADII.pill,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  copyButtonLabel: {
    fontFamily: FONT.semibold,
    fontSize: 10,
  },
  addressValue: {
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  assetSelector: {
    gap: 8,
  },
  assetChip: {
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assetChipCopy: {
    gap: 2,
  },
  assetChipLabel: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  assetChipAmount: {
    fontFamily: FONT.regular,
    fontSize: 10,
  },
  helperCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 10,
    gap: 4,
  },
  helperTitle: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  helperBody: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 15,
  },
  statusText: {
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  errorText: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
});
