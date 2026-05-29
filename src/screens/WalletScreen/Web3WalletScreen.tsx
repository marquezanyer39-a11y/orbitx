import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExternalWalletConnectSheet } from '../../../components/wallet/ExternalWalletConnectSheet';
import { FEATURE_STATUS } from '../../constants/featureStatus';
import { withOpacity } from '../../../constants/theme';
import {
  ACTIVITY,
  COLORS,
  NETWORKS,
  type NetworkLabel,
  Web3AssetList,
  Web3ExternalWalletCard,
  Web3LocalWalletCard,
  Web3NetworkCard,
  Web3RefreshStatus,
  Web3WalletHeader,
  formatUsd,
  getToneColor,
  maskAddress,
  styles,
  useWeb3WalletViewModel,
  type Web3ActivityItem,
} from './web3';

function goBackToWallet() {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace('/wallet');
}

function Web3Hero({
  address,
  canCopyAddress,
  currentNetwork,
  isLoading,
  sourceLabel,
  totalUsd,
  onCopyAddress,
}: {
  address: string;
  canCopyAddress: boolean;
  currentNetwork: string;
  isLoading: boolean;
  sourceLabel: string;
  totalUsd: number;
  onCopyAddress: () => void;
}) {
  return (
    <LinearGradient
      colors={[COLORS.surfaceElevated, COLORS.surface, COLORS.surfaceSoft]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <View style={styles.heroGlow} pointerEvents="none" />
      <View style={styles.heroTopRow}>
        <View style={styles.activeBadge}>
          <View style={styles.activeDot} />
          <Text style={styles.activeBadgeText}>{sourceLabel}</Text>
        </View>
        <View style={styles.networkPill}>
          <View style={styles.networkDot} />
          <Text style={styles.networkPillText} numberOfLines={1}>{currentNetwork}</Text>
        </View>
      </View>

      <Text style={styles.heroLabel}>Balance Web3</Text>
      <Text style={styles.heroValue} numberOfLines={1} adjustsFontSizeToFit>
        {isLoading && totalUsd === 0 ? 'Actualizando...' : formatUsd(totalUsd)}
      </Text>

      <Pressable
        disabled={!canCopyAddress}
        onPress={onCopyAddress}
        style={({ pressed }) => [
          styles.addressPill,
          !canCopyAddress && styles.disabledAction,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.addressText} numberOfLines={1}>{maskAddress(address)}</Text>
        <Ionicons name="copy-outline" size={14} color={COLORS.textSecondary} />
      </Pressable>
    </LinearGradient>
  );
}

function QuickActions({
  onOpenReceive,
  onOpenSend,
  onOpenSwap,
  onOpenDapps,
}: {
  onOpenReceive: () => void;
  onOpenSend: () => void;
  onOpenSwap: () => void;
  onOpenDapps: () => void;
}) {
  const actions = [
    { label: 'Recibir', icon: 'arrow-down-outline' as const, onPress: onOpenReceive },
    { label: 'Enviar', icon: 'send-outline' as const, onPress: onOpenSend },
    { label: 'Intercambiar', icon: 'swap-horizontal-outline' as const, onPress: onOpenSwap },
    { label: 'DApps', icon: 'apps-outline' as const, onPress: onOpenDapps },
  ];

  return (
    <View style={styles.quickActions}>
      {actions.map((action) => (
        <Pressable
          key={action.label}
          onPress={action.onPress}
          style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}
        >
          <View style={styles.quickIcon}>
            <Ionicons name={action.icon} size={23} color={COLORS.purpleSoft} />
          </View>
          <Text style={styles.quickLabel} numberOfLines={1}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function SecurityCard({ onOpenSecurity }: { onOpenSecurity: () => void }) {
  return (
    <View style={styles.securityCard}>
      <View style={styles.securityIcon}>
        <Ionicons name="lock-closed-outline" size={24} color={COLORS.purpleSoft} />
      </View>
      <View style={styles.securityCopy}>
        <Text style={styles.securityTitle}>Tu frase semilla está protegida</Text>
        <Text style={styles.securityBody}>Nunca compartas tus claves privadas.</Text>
      </View>
      <Pressable
        onPress={onOpenSecurity}
        style={({ pressed }) => [styles.securityButton, pressed && styles.pressed]}
      >
        <Text style={styles.securityButtonText}>Ver seguridad</Text>
      </Pressable>
    </View>
  );
}

function NetworkChips({
  activeNetwork,
  onSelectNetwork,
}: {
  activeNetwork: NetworkLabel;
  onSelectNetwork: (network: NetworkLabel) => void;
}) {
  return (
    <View style={styles.networkRow}>
      {NETWORKS.map((network) => {
        const active = network === activeNetwork;
        return (
          <Pressable
            key={network}
            onPress={() => onSelectNetwork(network)}
            style={({ pressed }) => [
              styles.networkChip,
              active && styles.networkChipActive,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.networkChipText, active && styles.networkChipTextActive]}>
              {network}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function DappsCard({ onOpenHub }: { onOpenHub: () => void }) {
  return (
    <LinearGradient
      colors={[COLORS.surface, COLORS.surfaceSoft]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.dappsCard}
    >
      <View style={styles.dappsCopy}>
        <Text style={styles.dappsTitle}>Explora Web3</Text>
        <Text style={styles.dappsBody}>Catálogo de DApps verificadas con advertencias de seguridad</Text>
        <Pressable
          onPress={onOpenHub}
          style={({ pressed }) => [styles.dappsButton, pressed && styles.pressed]}
        >
          <Text style={styles.dappsButtonText}>Abrir DApps Hub</Text>
        </Pressable>
      </View>
      <View style={styles.dappsOrb}>
        <Ionicons name="share-social-outline" size={54} color={withOpacity(COLORS.purpleSoft, 0.82)} />
      </View>
    </LinearGradient>
  );
}

function SwapComingSoonModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.swapOverlay}>
        <View style={styles.swapModal}>
          <View style={styles.swapIcon}>
            <Ionicons name="swap-horizontal-outline" size={28} color={COLORS.web3Blue} />
          </View>
          <Text style={styles.swapTitle}>Swap Web3 próximamente</Text>
          <Text style={styles.swapBody}>
            QVEX preparará swaps con proveedor seguro, cotización verificable, slippage visible,
            resumen antes de firma y aprobación exacta de tokens. En esta fase no hay cotizaciones
            reales ni ejecución de swap.
          </Text>
          <View style={styles.swapChecklist}>
            <Text style={styles.swapItem}>• Sin swap real activado</Text>
            <Text style={styles.swapItem}>• Sin approvals ilimitados</Text>
            <Text style={styles.swapItem}>• Sin firma sin confirmación</Text>
          </View>
          <Pressable onPress={onClose} style={({ pressed }) => [styles.swapButton, pressed && styles.pressed]}>
            <Text style={styles.swapButtonText}>Entendido</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function ActivityRow({ item }: { item: Web3ActivityItem }) {
  const toneColor = getToneColor(item.tone);

  return (
    <Pressable style={({ pressed }) => [styles.activityRow, pressed && styles.pressed]}>
      <View style={[styles.activityIcon, { backgroundColor: withOpacity(toneColor, 0.14) }]}>
        <Ionicons name={item.icon} size={18} color={toneColor} />
      </View>
      <View style={styles.activityCopy}>
        <Text style={styles.activityTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.activityStatus, { color: toneColor }]}>{item.status}</Text>
      </View>
      <Text style={styles.activityValue} numberOfLines={1}>{item.value}</Text>
    </Pressable>
  );
}

export default function Web3WalletScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const viewModel = useWeb3WalletViewModel();
  const [swapModalVisible, setSwapModalVisible] = useState(false);
  const isSmallPhone = width < 380;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          isSmallPhone && styles.contentSmall,
          { paddingBottom: Math.max(insets.bottom, 10) + 112 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Web3WalletHeader
          onBack={goBackToWallet}
          onHelp={() => viewModel.setMessage('Billetera Web3 usa solo lectura pública de address y redes.')}
          onConnect={() => viewModel.setConnectSheetVisible(true)}
        />

        <Web3Hero
          address={viewModel.displayAddress}
          canCopyAddress={Boolean(viewModel.displayAddress)}
          currentNetwork={viewModel.chainLabel}
          isLoading={viewModel.balances.isLoading}
          sourceLabel={viewModel.walletSourceLabel}
          totalUsd={viewModel.totalUsd}
          onCopyAddress={viewModel.handleCopyAddress}
        />

        <QuickActions
          onOpenReceive={() => router.push('/receive')}
          onOpenSend={() =>
            router.push(
              viewModel.externalAddress
                ? { pathname: '/send', params: { source: 'external' } }
                : '/send',
            )
          }
          onOpenSwap={() =>
            FEATURE_STATUS.web3.showSwapComingSoon
              ? setSwapModalVisible(true)
              : viewModel.setMessage('Swap no está disponible en esta versión.')
          }
          onOpenDapps={() => router.push('/dapps')}
        />

        <View style={styles.walletStatusCard}>
          <Web3LocalWalletCard
            balanceUsd={viewModel.localBalanceUsd}
            localAddress={viewModel.localAddress}
          />
          <Web3ExternalWalletCard
            balanceUsd={viewModel.externalBalanceUsd}
            externalAddress={viewModel.externalAddress}
          />
          <Web3NetworkCard
            chainId={viewModel.externalChainId}
            externalAddress={viewModel.externalAddress}
            isRefreshing={viewModel.isRefreshing}
            isSwitchingNetwork={viewModel.isSwitchingNetwork}
            networkName={viewModel.externalChainName}
            onRefresh={viewModel.handleRefreshBalances}
            onShowSwitchHint={() =>
              viewModel.setMessage('Selecciona Ethereum, Base o BNB Chain desde los chips para cambiar de red.')
            }
          />
        </View>

        <Web3RefreshStatus
          isError={viewModel.balances.status === 'error'}
          message={viewModel.helperMessage ?? undefined}
        />

        <SecurityCard onOpenSecurity={() => router.push('/security')} />

        <NetworkChips
          activeNetwork={viewModel.activeNetwork}
          onSelectNetwork={viewModel.handleSwitchNetwork}
        />

        <Web3AssetList
          assets={viewModel.filteredAssets}
          activeFilter={viewModel.activeFilter}
          onSetFilter={viewModel.setActiveFilter}
        />

        <DappsCard
          onOpenHub={() => router.push('/dapps')}
        />

        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Actividad on-chain</Text>
            <Pressable onPress={() => viewModel.setMessage('Historial on-chain completo próximamente.')} hitSlop={8}>
              <Text style={styles.seeAllText}>Ver todo</Text>
            </Pressable>
          </View>

          <View style={styles.activityList}>
            {FEATURE_STATUS.web3.showDemoActivity ? (
              ACTIVITY.map((item) => (
                <ActivityRow key={item.id} item={item} />
              ))
            ) : (
              <Text style={styles.emptyActivityText}>
                Sin actividad on-chain real confirmada. La vista demo esta oculta por seguridad.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      <ExternalWalletConnectSheet
        visible={viewModel.connectSheetVisible}
        onClose={() => viewModel.setConnectSheetVisible(false)}
      />
      <SwapComingSoonModal visible={swapModalVisible} onClose={() => setSwapModalVisible(false)} />
    </SafeAreaView>
  );
}
