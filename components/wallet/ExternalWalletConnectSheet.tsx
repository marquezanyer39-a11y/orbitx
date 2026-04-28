import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, SPACING, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useExternalWallet } from '../../src/hooks/useExternalWallet';
import { useWalletStore } from '../../src/store/walletStore';
import { PrimaryButton } from '../common/PrimaryButton';

interface ExternalWalletConnectSheetProps {
  visible: boolean;
  onClose: () => void;
}

const supportedWallets = [
  { title: 'MetaMask', icon: 'wallet-outline' as const },
  { title: 'Trust Wallet', icon: 'shield-checkmark-outline' as const },
  { title: 'Coinbase Wallet', icon: 'card-outline' as const },
  { title: 'WalletConnect', icon: 'link-outline' as const },
];

function maskAddress(address?: string) {
  if (!address) {
    return '';
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function selectedNetworkLabel(network: ReturnType<typeof useWalletStore.getState>['selectedNetwork']) {
  if (network === 'bnb') {
    return 'BNB Chain';
  }

  if (network === 'ethereum') {
    return 'Ethereum';
  }

  return 'Base';
}

export function ExternalWalletConnectSheet({
  visible,
  onClose,
}: ExternalWalletConnectSheetProps) {
  const { colors } = useAppTheme();
  const selectedNetwork = useWalletStore((state) => state.selectedNetwork);
  const {
    address,
    chainLabel,
    configured,
    connect,
    disconnect,
    disabledReason,
    isBusy,
    isConnected,
    lastError,
    orbitNetwork,
    provider,
    runtimeSupported,
    signMessage,
    signature,
    switchToNetwork,
    walletName,
  } = useExternalWallet();
  const canSwitchToSelectedNetwork =
    isConnected &&
    selectedNetwork !== 'solana' &&
    selectedNetwork !== orbitNetwork;

  useEffect(() => {
    if (visible && isConnected) {
      onClose();
    }
  }, [isConnected, onClose, visible]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: withOpacity(colors.background, 0.86) }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: withOpacity(colors.text, 0.12) }]} />

          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={[styles.eyebrow, { color: colors.textMuted }]}>WalletConnect</Text>
              <Text style={[styles.title, { color: colors.text }]}>Conectar wallet externa</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Usa MetaMask, Trust Wallet, Coinbase Wallet u otra wallet compatible.
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.fieldBackground }]}
            >
              <Ionicons name="close" size={18} color={colors.text} />
            </Pressable>
          </View>

          <View
            style={[
              styles.helperCard,
              { backgroundColor: colors.fieldBackground, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.helperTitle, { color: colors.text }]}>
              Wallet externa conectada con aprobacion real
            </Text>
            <Text style={[styles.helperBody, { color: colors.textMuted }]}>
              OrbitX no guarda tu frase semilla. Las aprobaciones y firmas se hacen desde tu
              wallet.
            </Text>
          </View>

          <View style={styles.list}>
            {supportedWallets.map((wallet) => (
              <View
                key={wallet.title}
                style={[
                  styles.walletRow,
                  {
                    backgroundColor: colors.fieldBackground,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.walletIcon,
                    { backgroundColor: withOpacity(colors.primary, 0.12) },
                  ]}
                >
                  <Ionicons name={wallet.icon} size={16} color={colors.text} />
                </View>
                <Text style={[styles.walletName, { color: colors.text }]}>{wallet.title}</Text>
              </View>
            ))}
          </View>

          {!configured || !runtimeSupported ? (
            <View
              style={[
                styles.stateCard,
                {
                  backgroundColor: withOpacity(colors.loss, 0.08),
                  borderColor: withOpacity(colors.loss, 0.32),
                },
              ]}
            >
              <Text style={[styles.stateTitle, { color: colors.text }]}>
                WalletConnect no disponible
              </Text>
              <Text style={[styles.stateBody, { color: colors.textMuted }]}>
                {disabledReason}
              </Text>
            </View>
          ) : null}

          {isConnected ? (
            <View
              style={[
                styles.stateCard,
                {
                  backgroundColor: withOpacity(colors.profit, 0.08),
                  borderColor: withOpacity(colors.profit, 0.26),
                },
              ]}
            >
              <View style={styles.stateHeaderRow}>
                <Text style={[styles.stateTitle, { color: colors.text }]}>Wallet externa conectada</Text>
                <View
                  style={[
                    styles.statusChip,
                    { backgroundColor: withOpacity(colors.profit, 0.14) },
                  ]}
                >
                  <Text style={[styles.statusChipLabel, { color: colors.profit }]}>Conectada</Text>
                </View>
              </View>

              <Text style={[styles.stateBody, { color: colors.textMuted }]}>
                {walletName ?? provider ?? 'WalletConnect'}
              </Text>
              <Text style={[styles.connectionMeta, { color: colors.textSoft }]}>
                {maskAddress(address)}
              </Text>
              <Text style={[styles.connectionMeta, { color: colors.textMuted }]}>
                Red actual: {chainLabel}
              </Text>
              {signature ? (
                <Text style={[styles.signaturePreview, { color: colors.textMuted }]}>
                  Ultima firma: {`${signature.slice(0, 10)}...${signature.slice(-10)}`}
                </Text>
              ) : null}
              {canSwitchToSelectedNetwork ? (
                <Text style={[styles.switchHint, { color: colors.warning }]}>
                  La wallet esta en {chainLabel}. Puedes cambiarla a{' '}
                  {selectedNetworkLabel(selectedNetwork)}.
                </Text>
              ) : null}
            </View>
          ) : null}

          {lastError ? (
            <View
              style={[
                styles.errorCard,
                {
                  backgroundColor: withOpacity(colors.loss, 0.08),
                  borderColor: withOpacity(colors.loss, 0.26),
                },
              ]}
            >
              <Text style={[styles.errorText, { color: colors.loss }]}>{lastError}</Text>
            </View>
          ) : null}

          {!isConnected ? (
            <PrimaryButton
              label={isBusy ? 'Abriendo wallets...' : 'Conectar wallet externa'}
              onPress={() => void connect()}
              disabled={isBusy || !configured || !runtimeSupported}
              style={isBusy || !configured || !runtimeSupported ? styles.disabledAction : undefined}
            />
          ) : (
            <View style={styles.actionStack}>
              <PrimaryButton
                label={isBusy ? 'Solicitando firma...' : 'Firmar mensaje de prueba'}
                variant="secondary"
                onPress={() => void signMessage()}
                disabled={isBusy}
                style={isBusy ? styles.disabledAction : undefined}
              />

              {canSwitchToSelectedNetwork ? (
                <PrimaryButton
                  label={`Cambiar a ${selectedNetworkLabel(selectedNetwork)}`}
                  variant="secondary"
                  onPress={() => void switchToNetwork(selectedNetwork)}
                  disabled={isBusy}
                  style={isBusy ? styles.disabledAction : undefined}
                />
              ) : null}

              <PrimaryButton
                label="Desconectar wallet"
                variant="ghost"
                onPress={() => void disconnect()}
                disabled={isBusy}
                style={isBusy ? styles.disabledAction : undefined}
              />
            </View>
          )}

          <PrimaryButton label="Cerrar" variant="ghost" onPress={onClose} style={styles.closeAction} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    gap: 12,
  },
  grabber: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: RADII.pill,
    marginBottom: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
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
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: RADII.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  helperTitle: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  helperBody: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  list: {
    gap: 8,
  },
  walletRow: {
    borderWidth: 1,
    borderRadius: RADII.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  walletIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletName: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  stateCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  stateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  stateTitle: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  stateBody: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  statusChip: {
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusChipLabel: {
    fontFamily: FONT.semibold,
    fontSize: 10,
  },
  connectionMeta: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  signaturePreview: {
    fontFamily: FONT.regular,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  switchHint: {
    fontFamily: FONT.medium,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  errorCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    fontFamily: FONT.medium,
    fontSize: 11,
    lineHeight: 16,
  },
  actionStack: {
    gap: 10,
  },
  closeAction: {
    minHeight: 40,
  },
  disabledAction: {
    opacity: 0.45,
  },
});
