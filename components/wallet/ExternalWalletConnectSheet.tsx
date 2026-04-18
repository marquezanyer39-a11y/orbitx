import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { ExternalWalletProvider } from '../../types';
import { FONT, RADII, SPACING, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { isValidWalletAddress } from '../../utils/validation';
import { OrbitInput } from '../forms/OrbitInput';
import { PrimaryButton } from '../common/PrimaryButton';

interface ExternalWalletConnectSheetProps {
  visible: boolean;
  loading?: boolean;
  currentProvider?: ExternalWalletProvider | null;
  currentAddress?: string;
  onClose: () => void;
  onSelect: (provider: ExternalWalletProvider, address?: string) => void;
}

const providers: Array<{
  value: ExternalWalletProvider;
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  {
    value: 'metamask',
    title: 'MetaMask',
    body: 'Usa una billetera que ya controlas como opcion adicional dentro de OrbitX.',
    icon: 'wallet-outline',
  },
  {
    value: 'walletconnect',
    title: 'WalletConnect',
    body: 'Disponible en una siguiente fase de OrbitX.',
    icon: 'link-outline',
  },
];

export function ExternalWalletConnectSheet({
  visible,
  loading = false,
  currentProvider,
  currentAddress = '',
  onClose,
  onSelect,
}: ExternalWalletConnectSheetProps) {
  const { colors } = useAppTheme();
  const [selectedProvider, setSelectedProvider] = useState<ExternalWalletProvider>('metamask');
  const [address, setAddress] = useState(currentAddress);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setSelectedProvider(currentProvider ?? 'metamask');
    setAddress(currentAddress);
  }, [currentAddress, currentProvider, visible]);

  const selectedCard = useMemo(
    () => providers.find((provider) => provider.value === selectedProvider) ?? providers[0],
    [selectedProvider],
  );
  const validEvmAddress = isValidWalletAddress(address, 'ethereum');

  async function openMetaMask() {
    try {
      const deepLink = 'metamask://';
      const appLink = 'https://metamask.app.link/';
      const canUseDeepLink = await Linking.canOpenURL(deepLink);

      await Linking.openURL(canUseDeepLink ? deepLink : appLink);
    } catch {
      // Keep the flow resilient even if the device cannot open the scheme.
    }
  }

  async function pasteAddress() {
    const clipboard = (await Clipboard.getStringAsync()).trim();
    if (clipboard) {
      setAddress(clipboard);
    }
  }

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: withOpacity(colors.background, 0.84) }]}>
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
              <Text style={[styles.eyebrow, { color: colors.textMuted }]}>Billetera externa</Text>
              <Text style={[styles.title, { color: colors.text }]}>Conectar una billetera</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Vincula una direccion publica para usarla como opcion adicional en OrbitX.
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.fieldBackground }]}
            >
              <Ionicons name="close" size={18} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.list}>
            {providers.map((provider) => {
              const active = provider.value === selectedProvider;
              const connected = provider.value === currentProvider;
              const disabled = provider.value === 'walletconnect';

              return (
                <Pressable
                  key={provider.value}
                  onPress={() => {
                    if (disabled) {
                      return;
                    }

                    setSelectedProvider(provider.value);
                  }}
                  disabled={loading || disabled}
                  style={[
                    styles.providerCard,
                    {
                      backgroundColor: colors.fieldBackground,
                      borderColor: active ? colors.primary : colors.border,
                      opacity: disabled ? 0.68 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.providerIcon,
                      {
                        backgroundColor: active
                          ? withOpacity(colors.primary, 0.14)
                          : withOpacity(colors.text, 0.08),
                      },
                    ]}
                  >
                    <Ionicons name={provider.icon} size={16} color={colors.text} />
                  </View>

                  <View style={styles.providerCopy}>
                    <Text style={[styles.providerTitle, { color: colors.text }]}>
                      {provider.title}
                    </Text>
                    <Text style={[styles.providerBody, { color: colors.textMuted }]}>
                      {provider.body}
                    </Text>
                  </View>

                  {connected ? (
                    <Text style={[styles.badge, { color: colors.profit }]}>Vinculada</Text>
                  ) : disabled ? (
                    <Text style={[styles.badge, { color: colors.textMuted }]}>Pronto</Text>
                  ) : (
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  )}
                </Pressable>
              );
            })}
          </View>

          <View
            style={[
              styles.helperCard,
              { backgroundColor: colors.fieldBackground, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.providerTitle, { color: colors.text }]}>
              {selectedCard.title}
            </Text>
            <Text style={[styles.providerBody, { color: colors.textMuted }]}>
              Puedes vincular tu direccion publica ahora mismo. La firma directa desde OrbitX se activara cuando esta integracion quede lista.
            </Text>
          </View>

          <PrimaryButton
            label="Abrir MetaMask"
            variant="secondary"
            onPress={() => void openMetaMask()}
          />

          <PrimaryButton
            label="Pegar desde portapapeles"
            variant="ghost"
            onPress={() => void pasteAddress()}
          />

          <OrbitInput
            label="Direccion publica"
            value={address}
            onChangeText={setAddress}
            placeholder="0x..."
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[styles.helperText, { color: colors.textMuted }]}>
            Pega una direccion publica valida para vincular tu billetera.
          </Text>

          <PrimaryButton
            label={loading ? 'Guardando...' : 'Guardar conexion'}
            disabled={!validEvmAddress || loading}
            style={!validEvmAddress || loading ? styles.disabledAction : undefined}
            onPress={() => onSelect('metamask', address)}
          />

          <PrimaryButton
            label="Cerrar"
            variant="ghost"
            onPress={onClose}
            style={styles.closeAction}
          />
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.sm,
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
    lineHeight: 17,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: 8,
  },
  helperCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 12,
    gap: 5,
  },
  providerCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  providerIcon: {
    width: 32,
    height: 32,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerCopy: {
    flex: 1,
    gap: 2,
  },
  providerTitle: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  providerBody: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 15,
  },
  badge: {
    fontFamily: FONT.semibold,
    fontSize: 10,
  },
  closeAction: {
    minHeight: 40,
  },
  helperText: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 15,
  },
  disabledAction: {
    opacity: 0.45,
  },
});
