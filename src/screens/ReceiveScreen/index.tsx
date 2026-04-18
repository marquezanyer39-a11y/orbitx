import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { SectionHeader } from '../../components/common/SectionHeader';
import { useWallet } from '../../hooks/useWallet';
import { copyToClipboard } from '../../utils/copyToClipboard';

const NETWORKS = ['base', 'ethereum', 'bnb', 'solana'] as const;

export default function ReceiveScreen() {
  const params = useLocalSearchParams<{ network?: string }>();
  const { colors } = useAppTheme();
  const wallet = useWallet();
  const initialNetwork = NETWORKS.includes(params.network as (typeof NETWORKS)[number])
    ? (params.network as (typeof NETWORKS)[number])
    : wallet.selectedNetwork;
  const [selectedNetwork, setSelectedNetwork] = useState<(typeof NETWORKS)[number]>(initialNetwork);

  const address = wallet.isWalletReady
    ? wallet.receiveAddresses[selectedNetwork] || wallet.walletAddress
    : '';
  const qrUri = useMemo(
    () =>
      address
        ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(address)}`
        : '',
    [address],
  );

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <SectionHeader
        title="Recibir"
        subtitle="Comparte una direccion real de tu billetera Web3 segun la red elegida."
      />

      <View style={styles.networkRow}>
        {NETWORKS.map((network) => {
          const active = selectedNetwork === network;
          return (
            <Pressable
              key={network}
              onPress={() => {
                setSelectedNetwork(network);
                wallet.setSelectedNetwork(network);
              }}
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

      <View style={[styles.card, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}>
        {qrUri ? <Image source={{ uri: qrUri }} style={styles.qr} /> : null}
        <Text style={[styles.address, { color: colors.text }]}>
          {address || 'Crea o importa tu billetera para generar una direccion.'}
        </Text>
        <PrimaryButton
          label="Copiar direccion"
          tone="secondary"
          onPress={async () => {
            if (!address) {
              return;
            }
            await copyToClipboard(address);
          }}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  networkRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
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
  card: {
    borderWidth: 1,
    borderRadius: RADII.lg,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  qr: {
    width: 220,
    height: 220,
    borderRadius: 18,
    backgroundColor: '#fff',
  },
  address: {
    fontFamily: FONT.medium,
    fontSize: 12,
    textAlign: 'center',
  },
});
