import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONT, ORBITX_COLORS, RADII, withOpacity } from '../../../constants/theme';
import { FEATURE_STATUS } from '../../constants/featureStatus';
import { useExternalWallet } from '../../hooks/useExternalWallet';
import {
  buildCreatedTokenResultFromDeployment,
  deployTokenWithExternalWallet,
  evaluateTokenDeploymentReadiness,
  getDeploymentErrorMessage,
  type DeploymentProgress,
} from '../../services/tokens/externalWalletTokenDeployment';
import {
  useCreateTokenDraftStore,
  type CreateTokenDraft,
} from '../../store/createTokenDraftStore';

const COLORS = {
  ...ORBITX_COLORS,
  text: ORBITX_COLORS.textPrimary,
  textSecondary: ORBITX_COLORS.textSecondary,
  textMuted: ORBITX_COLORS.textMuted,
  greenBright: ORBITX_COLORS.green,
};

const DEPLOY_PROGRESS_LABELS: Record<DeploymentProgress, string> = {
  validating: 'Validando datos y wallet...',
  estimating_gas: 'Estimando gas...',
  awaiting_signature: 'Esperando firma en tu wallet...',
  transaction_sent: 'Transacción enviada.',
  confirming: 'Confirmando en blockchain...',
  confirmed: 'Token creado correctamente.',
};

function formatNetwork(network: CreateTokenDraft['network']) {
  const labels: Record<CreateTokenDraft['network'], string> = {
    ethereum: 'Ethereum',
    bnb: 'BNB Chain',
    solana: 'Solana',
    polygon: 'Polygon',
    base: 'Base',
  };

  return labels[network] ?? 'Red no compatible';
}

function formatTokenType(type: CreateTokenDraft['tokenType']) {
  return type === 'memecoin' ? 'Memecoin' : 'Token estándar';
}

function formatAddress(address?: string) {
  if (!address) return 'No conectada';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function ReviewRow({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'success' | 'warning' | 'muted';
}) {
  const toneColor =
    tone === 'success'
      ? COLORS.greenBright
      : tone === 'warning'
        ? COLORS.warning
        : tone === 'muted'
          ? COLORS.textMuted
          : COLORS.text;

  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={[styles.reviewValue, { color: toneColor }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function ReviewCard({
  title,
  step,
  route,
  children,
}: {
  title: string;
  step: string;
  route: '/create-token' | '/create-token-liquidity' | '/create-token-airdrop' | '/create-token-publication';
  children: ReactNode;
}) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewCardHeader}>
        <View>
          <Text style={styles.reviewStep}>{step}</Text>
          <Text style={styles.reviewTitle}>{title}</Text>
        </View>
        <Pressable onPress={() => router.push(route as never)} style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}>
          <Ionicons name="create-outline" size={14} color={COLORS.purpleSoft} />
          <Text style={styles.editText}>Editar</Text>
        </Pressable>
      </View>
      <View style={styles.reviewRows}>{children}</View>
    </View>
  );
}

function CheckBox({ checked, onPress }: { checked: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.checkboxRow, pressed && styles.pressed]}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <Ionicons name="checkmark" size={16} color={COLORS.text} /> : null}
      </View>
      <Text style={styles.checkboxText}>
        Acepto desplegar un contrato real desde mi wallet conectada. QVEX no pedirá seed phrase ni private key.
      </Text>
    </Pressable>
  );
}

export function TokenReviewPlaceholderScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isSmallPhone = width < 380;
  const draft = useCreateTokenDraftStore((state) => state.draft);
  const setCreatedTokenResult = useCreateTokenDraftStore((state) => state.setCreatedTokenResult);
  const externalWallet = useExternalWallet();
  const [accepted, setAccepted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [deploying, setDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState('');
  const [pendingTxHash, setPendingTxHash] = useState<string | undefined>();

  const symbol = (draft.symbol.trim() || 'ORBX').toUpperCase();
  const tokenName = draft.name.trim() || 'Token sin nombre';
  const supply = draft.supply.trim() || '0';

  const liquidityState = draft.liquidityConfig?.enabled
    ? 'Configurada'
    : draft.liquidityConfig
      ? 'Omitida'
      : 'Pendiente';
  const airdropState = draft.airdropConfig?.enabled ? 'Configurado' : 'Omitido';
  const publicationState = draft.publicationConfig?.enabled ? 'En revisión' : 'Omitida';

  const activeOptions = useMemo(
    () =>
      [
        draft.options.lockLiquidity ? 'Liquidez' : null,
        draft.options.prepareAirdrop ? 'Airdrop' : null,
        draft.options.prepareListing ? 'Publicación' : null,
      ].filter(Boolean),
    [draft.options.lockLiquidity, draft.options.prepareAirdrop, draft.options.prepareListing],
  );

  const deploymentReadiness = useMemo(
    () =>
      evaluateTokenDeploymentReadiness(draft, {
        isConnected: externalWallet.isConnected,
        address: externalWallet.address,
        chainId: externalWallet.chainId,
        eip155Provider: externalWallet.eip155Provider,
      }),
    [
      draft,
      externalWallet.address,
      externalWallet.chainId,
      externalWallet.eip155Provider,
      externalWallet.isConnected,
    ],
  );
  const isRealDeployEnabled =
    Boolean(FEATURE_STATUS.web3.realExecutionEnabled as boolean) &&
    Boolean(FEATURE_STATUS.web3.tokenDeployEnabled as boolean);
  const canRequestRealDeploy = isRealDeployEnabled && deploymentReadiness.canDeploy;
  const deployBlockers = isRealDeployEnabled
    ? deploymentReadiness.blockers
    : [
        {
          code: 'deployment_not_enabled',
          message: 'Deploy real desactivado. Esta pantalla genera una vista previa sin contrato en blockchain.',
        },
      ];

  const executeRealDeploy = async () => {
    if (!isRealDeployEnabled) {
      setFeedback('Deploy real desactivado por configuración. No se abrirá la wallet.');
      return;
    }

    if (!externalWallet.address || !externalWallet.eip155Provider) {
      setFeedback('Conecta una wallet externa con provider EVM para desplegar.');
      return;
    }

    setDeploying(true);
    setFeedback('');
    setPendingTxHash(undefined);
    setDeployProgress('Preparando deploy real...');

    try {
      const deployment = await deployTokenWithExternalWallet({
        draft,
        wallet: {
          isConnected: externalWallet.isConnected,
          address: externalWallet.address,
          chainId: externalWallet.chainId,
          eip155Provider: externalWallet.eip155Provider,
        },
        onProgress: (progress, meta) => {
          setDeployProgress(DEPLOY_PROGRESS_LABELS[progress]);
          if (meta?.transactionHash) {
            setPendingTxHash(meta.transactionHash);
          }
        },
      });

      setCreatedTokenResult(buildCreatedTokenResultFromDeployment(draft, deployment));
      router.push('/create-token-created' as never);
    } catch (error) {
      setFeedback(getDeploymentErrorMessage(error));
    } finally {
      setDeploying(false);
    }
  };

  const handleRealDeploy = () => {
    if (!isRealDeployEnabled) {
      router.push('/create-token-created' as never);
      return;
    }

    if (!deploymentReadiness.canDeploy) {
      const firstBlocker = deploymentReadiness.blockers[0];
      if (firstBlocker?.code === 'wallet_not_connected') {
        void externalWallet.connect();
        return;
      }

      if (
        firstBlocker?.code === 'chain_mismatch' &&
        (draft.network === 'ethereum' || draft.network === 'bnb' || draft.network === 'base')
      ) {
        void externalWallet.switchToNetwork(draft.network).then((result) => {
          setFeedback(result.message);
        });
        return;
      }

      setFeedback(firstBlocker?.message ?? 'El deploy real aún no está listo.');
      return;
    }

    if (!accepted) {
      setFeedback('Acepta las condiciones para solicitar la firma en tu wallet.');
      return;
    }

    Alert.alert(
      'Confirmar deploy real',
      'QVEX abrirá tu wallet para firmar una transacción on-chain. No se pedirá seed phrase ni private key.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Firmar y desplegar', onPress: () => void executeRealDeploy() },
      ],
    );
  };

  const ctaLabel = !isRealDeployEnabled
    ? 'Vista previa'
    : deploymentReadiness.canDeploy
      ? deploying
        ? 'Procesando deploy...'
        : 'Firmar y desplegar token'
      : deploymentReadiness.blockers[0]?.code === 'wallet_not_connected'
        ? 'Conectar wallet'
        : deploymentReadiness.blockers[0]?.code === 'chain_mismatch' &&
            (draft.network === 'ethereum' || draft.network === 'bnb' || draft.network === 'base')
          ? 'Cambiar red en wallet'
          : 'Revisar requisitos';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          isSmallPhone && styles.contentSmall,
          { paddingBottom: Math.max(insets.bottom, 10) + 120 },
        ]}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}>
            <Ionicons name="arrow-back" size={23} color={COLORS.purpleSoft} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Revisión final</Text>
            <Text style={styles.headerSubtitle}>Paso 5 de 5 - Deploy real con wallet</Text>
          </View>
          <View style={styles.headerIconGhost}>
            <Ionicons name="shield-checkmark-outline" size={21} color={COLORS.textMuted} />
          </View>
        </View>

        <LinearGradient colors={[COLORS.surface, COLORS.surfaceSoft]} style={styles.heroCard}>
          <View style={styles.heroGlow} pointerEvents="none" />
          <Text style={styles.eyebrow}>Borrador listo para deploy</Text>
          <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
            {symbol}
          </Text>
          <Text style={styles.body}>
            Revisa datos, liquidez, airdrop y publicación. QVEX solo desplegará un contrato real cuando la
            ejecución on-chain esté habilitada y confirmada explícitamente.
          </Text>
          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{formatNetwork(draft.network)}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{activeOptions.length ? activeOptions.join(' - ') : 'Sin extras'}</Text>
            </View>
          </View>
        </LinearGradient>

        <ReviewCard title="Datos del token" step="Paso 1" route="/create-token">
          <ReviewRow label="Nombre" value={tokenName} />
          <ReviewRow label="Símbolo" value={symbol} />
          <ReviewRow label="Red" value={formatNetwork(draft.network)} />
          <ReviewRow label="Supply total" value={`${supply} ${symbol}`} />
          <ReviewRow label="Tipo" value={formatTokenType(draft.tokenType)} />
        </ReviewCard>

        <ReviewCard title="Liquidez" step="Paso 2" route="/create-token-liquidity">
          <ReviewRow
            label="Estado"
            value={liquidityState}
            tone={liquidityState === 'Configurada' ? 'success' : liquidityState === 'Pendiente' ? 'warning' : 'muted'}
          />
          <ReviewRow label="DEX" value={draft.liquidityConfig?.dex ?? 'Sin DEX configurado'} />
          <ReviewRow
            label="Par"
            value={
              draft.liquidityConfig?.enabled
                ? `${draft.liquidityConfig.tokenAmount || '--'} ${symbol} / ${draft.liquidityConfig.pairAmount || '--'} ${draft.liquidityConfig.pairAsset}`
                : 'No aplica'
            }
          />
        </ReviewCard>

        <ReviewCard title="Airdrop" step="Paso 3" route="/create-token-airdrop">
          <ReviewRow label="Estado" value={airdropState} tone={draft.airdropConfig?.enabled ? 'success' : 'muted'} />
          <ReviewRow
            label="Total"
            value={draft.airdropConfig?.enabled ? `${draft.airdropConfig.totalTokens || '--'} ${symbol}` : 'No aplica'}
          />
          <ReviewRow
            label="Participantes"
            value={draft.airdropConfig?.enabled ? draft.airdropConfig.maxParticipants || '--' : 'No aplica'}
          />
        </ReviewCard>

        <ReviewCard title="Publicación QVEX" step="Paso 4" route="/create-token-publication">
          <ReviewRow
            label="Estado"
            value={publicationState}
            tone={draft.publicationConfig?.enabled ? 'warning' : 'muted'}
          />
          <ReviewRow
            label="Visibilidad"
            value={draft.publicationConfig?.enabled ? draft.publicationConfig.visibilityLevel : 'No aplica'}
          />
          <ReviewRow
            label="Proyecto"
            value={draft.publicationConfig?.enabled ? draft.publicationConfig.projectName || tokenName : 'No aplica'}
          />
        </ReviewCard>

        <View style={styles.deploymentCard}>
          <View style={styles.deploymentHeader}>
            <View>
              <Text style={styles.reviewStep}>Deploy real</Text>
              <Text style={styles.reviewTitle}>Requisitos on-chain</Text>
            </View>
            <View style={[styles.statusBadge, canRequestRealDeploy ? styles.statusReady : styles.statusBlocked]}>
              <Text style={styles.statusBadgeText}>{canRequestRealDeploy ? 'Listo' : 'Bloqueado'}</Text>
            </View>
          </View>
          <View style={styles.reviewRows}>
            <ReviewRow label="Wallet externa" value={formatAddress(externalWallet.address)} tone={externalWallet.isConnected ? 'success' : 'warning'} />
            <ReviewRow
              label="Red objetivo"
              value={`${deploymentReadiness.expectedNetworkLabel ?? formatNetwork(draft.network)}${deploymentReadiness.expectedChainId ? ` (${deploymentReadiness.expectedChainId})` : ''}`}
            />
            <ReviewRow
              label="Red conectada"
              value={externalWallet.chainId ? `${externalWallet.chainLabel} (${externalWallet.chainId})` : 'Sin red'}
              tone={externalWallet.chainId === deploymentReadiness.expectedChainId ? 'success' : 'warning'}
            />
            <ReviewRow label="Provider" value={externalWallet.eip155Provider ? 'Transaccional disponible' : 'No disponible'} tone={externalWallet.eip155Provider ? 'success' : 'warning'} />
          </View>
          {deployBlockers.length ? (
            <View style={styles.blockerList}>
              {deployBlockers.map((blocker) => (
                <View key={`${blocker.code}-${blocker.message}`} style={styles.blockerRow}>
                  <Ionicons name="alert-circle-outline" size={15} color={COLORS.warning} />
                  <Text style={styles.blockerText}>{blocker.message}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.readyRow}>
              <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.greenBright} />
              <Text style={styles.readyText}>Todo listo para solicitar firma en tu wallet.</Text>
            </View>
          )}
        </View>

        <View style={styles.warningCard}>
          <Ionicons name="warning-outline" size={18} color={COLORS.warning} />
          <Text style={styles.warningText}>
            {isRealDeployEnabled
              ? FEATURE_STATUS.createToken.notice
              : 'Deploy real desactivado. Puedes revisar una vista previa, pero no se firmará ni enviará ninguna transacción.'}
          </Text>
        </View>

        {isRealDeployEnabled ? (
          <CheckBox checked={accepted} onPress={() => setAccepted((value) => !value)} />
        ) : null}

        {deployProgress ? (
          <View style={styles.progressCard}>
            <Ionicons name="sync-outline" size={17} color={COLORS.purpleSoft} />
            <View style={styles.progressCopy}>
              <Text style={styles.progressText}>{deployProgress}</Text>
              {pendingTxHash ? <Text style={styles.progressHash}>{pendingTxHash}</Text> : null}
            </View>
          </View>
        ) : null}

        {feedback ? (
          <View style={styles.feedbackCard}>
            <Ionicons name="alert-circle-outline" size={17} color={COLORS.warning} />
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        ) : null}

        <View style={styles.ctaBlock}>
          <Pressable
            disabled={deploying}
            onPress={handleRealDeploy}
            style={({ pressed }) => [styles.primaryButton, deploying && styles.primaryButtonDisabled, pressed && styles.pressed]}
          >
            <LinearGradient
              colors={
                !isRealDeployEnabled || (deploymentReadiness.canDeploy && accepted)
                  ? [COLORS.purple, COLORS.purpleSoft]
                  : [COLORS.surfaceElevated, COLORS.surfaceElevated]
              }
              style={styles.primaryGradient}
            >
              <Text style={[styles.primaryButtonText, (isRealDeployEnabled && (!deploymentReadiness.canDeploy || !accepted)) && styles.primaryButtonTextDisabled]}>
                {ctaLabel}
              </Text>
            </LinearGradient>
          </Pressable>
          <Text style={styles.ctaHint}>
            {isRealDeployEnabled
              ? 'Solo se mostrará Token creado cuando exista transacción real enviada y confirmada.'
              : 'La vista previa no crea contrato, no genera txHash y no abre tu wallet.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default TokenReviewPlaceholderScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 16, paddingTop: 8, gap: 16 },
  contentSmall: { paddingHorizontal: 14, gap: 14 },
  pressed: { opacity: 0.84, transform: [{ scale: 0.99 }] },
  header: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.surfaceElevated, 0.82),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerIconGhost: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1, minWidth: 0 },
  headerTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 19,
    lineHeight: 24,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  headerSubtitle: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroCard: {
    width: '100%',
    borderRadius: 20,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    right: -70,
    top: -80,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: withOpacity(COLORS.purpleSoft, 0.12),
  },
  eyebrow: { color: COLORS.purpleSoft, fontFamily: FONT.bold, fontSize: 11, textTransform: 'uppercase' },
  title: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 30, lineHeight: 36 },
  body: { color: COLORS.textSecondary, fontFamily: FONT.medium, fontSize: 13, lineHeight: 19 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: 28,
    borderRadius: RADII.pill,
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: withOpacity(COLORS.purple, 0.14),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.purpleSoft, 0.28),
  },
  chipText: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 11 },
  reviewCard: {
    width: '100%',
    borderRadius: 18,
    padding: 14,
    gap: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  reviewStep: { color: COLORS.textMuted, fontFamily: FONT.bold, fontSize: 10.5, textTransform: 'uppercase' },
  reviewTitle: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 16, marginTop: 2 },
  editButton: {
    minHeight: 32,
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: withOpacity(COLORS.purple, 0.12),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.purpleSoft, 0.24),
  },
  editText: { color: COLORS.purpleSoft, fontFamily: FONT.bold, fontSize: 11 },
  reviewRows: { gap: 10 },
  reviewRow: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  reviewLabel: { flex: 1, color: COLORS.textSecondary, fontFamily: FONT.medium, fontSize: 12 },
  reviewValue: {
    flex: 1.2,
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 12,
    textAlign: 'right',
    lineHeight: 17,
  },
  deploymentCard: {
    width: '100%',
    borderRadius: 18,
    padding: 14,
    gap: 12,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  deploymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusBadge: {
    minHeight: 28,
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderWidth: 1,
  },
  statusReady: {
    backgroundColor: withOpacity(COLORS.greenBright, 0.1),
    borderColor: withOpacity(COLORS.greenBright, 0.28),
  },
  statusBlocked: {
    backgroundColor: withOpacity(COLORS.warning, 0.09),
    borderColor: withOpacity(COLORS.warning, 0.28),
  },
  statusBadgeText: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 10.5, textTransform: 'uppercase' },
  blockerList: { gap: 8 },
  blockerRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  blockerText: { flex: 1, color: COLORS.textSecondary, fontFamily: FONT.medium, fontSize: 11.5, lineHeight: 16 },
  readyRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  readyText: { flex: 1, color: COLORS.textSecondary, fontFamily: FONT.medium, fontSize: 12, lineHeight: 17 },
  warningCard: {
    width: '100%',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    gap: 9,
    backgroundColor: withOpacity(COLORS.warning, 0.08),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.warning, 0.22),
  },
  warningText: { flex: 1, color: COLORS.textSecondary, fontFamily: FONT.medium, fontSize: 12, lineHeight: 17 },
  checkboxRow: {
    width: '100%',
    minHeight: 58,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.surfaceElevated,
  },
  checkboxChecked: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purpleSoft,
  },
  checkboxText: { flex: 1, color: COLORS.textSecondary, fontFamily: FONT.medium, fontSize: 12, lineHeight: 18 },
  progressCard: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: withOpacity(COLORS.purple, 0.1),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.purpleSoft, 0.24),
  },
  progressCopy: { flex: 1, minWidth: 0 },
  progressText: { color: COLORS.textSecondary, fontFamily: FONT.bold, fontSize: 12, lineHeight: 17 },
  progressHash: { color: COLORS.textMuted, fontFamily: FONT.medium, fontSize: 10.5, lineHeight: 15, marginTop: 2 },
  feedbackCard: {
    minHeight: 44,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: withOpacity(COLORS.warning, 0.08),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.warning, 0.22),
  },
  feedbackText: { flex: 1, color: COLORS.textSecondary, fontFamily: FONT.medium, fontSize: 12, lineHeight: 17 },
  ctaBlock: { width: '100%', gap: 10 },
  primaryButton: { width: '100%', minHeight: 52, borderRadius: 14, overflow: 'hidden' },
  primaryButtonDisabled: { opacity: 0.72 },
  primaryGradient: { minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 15 },
  primaryButtonTextDisabled: { color: COLORS.textMuted },
  ctaHint: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
