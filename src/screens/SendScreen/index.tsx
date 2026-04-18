import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { FONT, RADII } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useUiStore } from '../../store/uiStore';
import { useWallet } from '../../hooks/useWallet';
import { sendWalletAsset } from '../../services/wallet/walletSend';
import { validateAddress, validateAmount } from '../../utils/validators';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { SectionHeader } from '../../components/common/SectionHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';

const NETWORKS = ['base', 'ethereum', 'bnb', 'solana'] as const;

function tokenIdFromNetwork(network: (typeof NETWORKS)[number]) {
  if (network === 'bnb') {
    return 'bnb';
  }
  if (network === 'solana') {
    return 'sol';
  }
  return 'eth';
}

export default function SendScreen() {
  const { colors } = useAppTheme();
  const wallet = useWallet();
  const showToast = useUiStore((state) => state.showToast);
  const [selectedNetwork, setSelectedNetwork] = useState<(typeof NETWORKS)[number]>('base');
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedAsset = useMemo(
    () =>
      wallet.assets.find((asset) => asset.network === selectedNetwork && ['ETH', 'BNB', 'SOL'].includes(asset.symbol)),
    [selectedNetwork, wallet.assets],
  );

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <SectionHeader
        title="Enviar"
        subtitle="Valida destino, monto y red antes de firmar."
      />

      <View style={styles.networkRow}>
        {NETWORKS.map((network) => {
          const active = selectedNetwork === network;
          return (
            <Pressable
              key={network}
              onPress={() => setSelectedNetwork(network)}
              style={[
                styles.networkChip,
                {
                  backgroundColor: active ? colors.primarySoft : colors.fieldBackground,
                  borderColor: active ? colors.borderStrong : colors.border,
                },
              ]}
            >
              <Text style={[styles.networkLabel, { color: active ? colors.text : colors.textMuted }]}>
                {network.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.fieldShell, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}>
        <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Dirección destino</Text>
        <TextInput
          value={destination}
          onChangeText={setDestination}
          placeholder="0x... o dirección Solana"
          placeholderTextColor={colors.textMuted}
          style={[styles.fieldInput, { color: colors.text }]}
        />
      </View>

      <View style={[styles.fieldShell, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}>
        <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Monto</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
          style={[styles.fieldInput, { color: colors.text }]}
        />
      </View>

      <Text style={[styles.helper, { color: colors.textMuted }]}>
        Disponible: {selectedAsset ? `${selectedAsset.amount.toFixed(6)} ${selectedAsset.symbol}` : 'Sin saldo nativo en esta red'}
      </Text>

      <PrimaryButton
        label={submitting ? 'Enviando...' : 'Confirmar envío'}
        disabled={submitting}
        onPress={async () => {
          if (!validateAddress(destination, selectedNetwork)) {
            showToast('La dirección no es válida para la red seleccionada.', 'error');
            return;
          }

          if (!validateAmount(amount)) {
            showToast('Ingresa un monto válido.', 'error');
            return;
          }

          setSubmitting(true);
          try {
            const result = await sendWalletAsset(
              tokenIdFromNetwork(selectedNetwork),
              destination,
              Number(amount),
            );
            showToast(`Envío confirmado: ${result.hash.slice(0, 10)}...`, 'success');
            await wallet.refreshBalances();
          } catch (error) {
            showToast(error instanceof Error ? error.message : 'No se pudo enviar el activo.', 'error');
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
  networkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  networkChip: {
    minHeight: 34,
    borderWidth: 1,
    borderRadius: RADII.pill,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkLabel: {
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
});
