import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONT, ORBITX_COLORS, RADII, withOpacity } from '../../../constants/theme';
import {
  useCreateTokenDraftStore,
  type CreatedTokenResult,
  type TokenNetwork,
} from '../../store/createTokenDraftStore';

const COLORS = {
  ...ORBITX_COLORS,
  text: ORBITX_COLORS.textPrimary,
  textSecondary: ORBITX_COLORS.textSecondary,
  textMuted: ORBITX_COLORS.textMuted,
  greenBright: ORBITX_COLORS.green,
};

const NETWORK_LABELS: Record<TokenNetwork, string> = {
  ethereum: 'Ethereum',
  bnb: 'BNB Chain',
  solana: 'Solana',
  polygon: 'Polygon',
  base: 'Base',
};

type TokenCreatedViewResult = Omit<CreatedTokenResult, 'deploymentStatus' | 'launchStatus' | 'success'> & {
  success: boolean;
  deploymentStatus?: CreatedTokenResult['deploymentStatus'] | 'preview';
  launchStatus: {
    token: CreatedTokenResult['launchStatus']['token'] | 'Token no desplegado';
    liquidity: CreatedTokenResult['launchStatus']['liquidity'];
    airdrop: CreatedTokenResult['launchStatus']['airdrop'];
    publication: CreatedTokenResult['launchStatus']['publication'];
    audit: CreatedTokenResult['launchStatus']['audit'];
  };
};

function abbreviateAddress(address: string | null) {
  if (!address) return 'Sin contrato en blockchain';
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function statusColor(status: string) {
  if (status === 'Completado' || status === 'Configurado') return COLORS.greenBright;
  if (status === 'Simulación' || status === 'Borrador' || status === 'Token no desplegado') return COLORS.warning;
  if (status === 'En revisión' || status === 'Pendiente') return COLORS.warning;
  if (status === 'Próximamente') return COLORS.purpleSoft;
  return COLORS.textMuted;
}

function fallbackResult(symbol: string, name: string, network: TokenNetwork, supply: string): TokenCreatedViewResult {
  return {
    success: false,
    tokenId: `draft-${symbol.toLowerCase()}`,
    name,
    symbol,
    network,
    supply,
    contractAddress: null,
    explorerUrl: null,
    createdAt: new Date().toISOString(),
    isMock: true,
    deploymentStatus: 'preview',
    launchStatus: {
      token: 'Token no desplegado',
      liquidity: 'Pendiente',
      airdrop: 'Omitido',
      publication: 'Omitida',
      audit: 'Próximamente',
    },
  };
}

function Header({ onShare, isPreview }: { onShare: () => void; isPreview: boolean }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}>
        <Ionicons name="close-outline" size={24} color={COLORS.purpleSoft} />
      </Pressable>
      <View style={styles.headerCopy}>
        <Text style={styles.headerTitle}>{isPreview ? 'Vista previa generada' : 'Token creado'}</Text>
        <Text style={styles.headerSubtitle}>{isPreview ? 'Token no desplegado' : 'Resultado on-chain confirmado'}</Text>
      </View>
      <Pressable onPress={onShare} style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}>
        <Ionicons name="share-social-outline" size={21} color={COLORS.purpleSoft} />
      </Pressable>
    </View>
  );
}

function TokenLogo({ logoUri, symbol, size = 54 }: { logoUri: string | null; symbol: string; size?: number }) {
  return (
    <View style={[styles.tokenLogo, { width: size, height: size, borderRadius: size / 3 }]}>
      {logoUri ? (
        <Image source={{ uri: logoUri }} style={styles.tokenLogoImage} />
      ) : (
        <Text style={styles.tokenLogoText}>{symbol.slice(0, 3)}</Text>
      )}
    </View>
  );
}

function Chip({ label, tone = 'purple' }: { label: string; tone?: 'purple' | 'green' | 'warning' }) {
  const color = tone === 'green' ? COLORS.greenBright : tone === 'warning' ? COLORS.warning : COLORS.purpleSoft;

  return (
    <View style={[styles.chip, { borderColor: withOpacity(color, 0.3), backgroundColor: withOpacity(color, 0.1) }]}>
      <Text style={[styles.chipText, { color }]}>{label}</Text>
    </View>
  );
}

function LaunchStatusRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.launchRow}>
      <View style={[styles.launchDot, { backgroundColor: statusColor(value) }]} />
      <Text style={styles.launchLabel}>{label}</Text>
      <Text style={[styles.launchValue, { color: statusColor(value) }]}>{value}</Text>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
      <Ionicons name={icon} size={20} color={COLORS.purpleSoft} />
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function NextStepRow({
  title,
  subtitle,
  disabled,
}: {
  title: string;
  subtitle: string;
  disabled?: boolean;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.nextStepRow, disabled && styles.disabledBlock, pressed && styles.pressed]}>
      <View style={styles.nextStepIcon}>
        <Ionicons name={disabled ? 'ellipse-outline' : 'arrow-forward-outline'} size={16} color={COLORS.purpleSoft} />
      </View>
      <View style={styles.nextStepCopy}>
        <Text style={styles.nextStepTitle}>{title}</Text>
        <Text style={styles.nextStepSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color={COLORS.textMuted} />
    </Pressable>
  );
}

export function TokenCreatedScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isSmallPhone = width < 380;
  const draft = useCreateTokenDraftStore((state) => state.draft);
  const createdTokenResult = useCreateTokenDraftStore((state) => state.createdTokenResult);
  const resetDraft = useCreateTokenDraftStore((state) => state.resetDraft);
  const [feedback, setFeedback] = useState('');
  const symbol = (draft.symbol.trim() || createdTokenResult?.symbol || 'ANYR').toUpperCase();
  const name = draft.name.trim() || createdTokenResult?.name || 'Anyer Token';
  const supply = draft.supply.trim() || createdTokenResult?.supply || '100,000,000';
  const result = useMemo(
    () => createdTokenResult ?? fallbackResult(symbol, name, draft.network, supply),
    [createdTokenResult, draft.network, name, supply, symbol],
  );
  const publicationLabel = result.launchStatus.publication;
  const contractLabel = abbreviateAddress(result.contractAddress);

  const isControlledPreview = result.isMock || !result.contractAddress;
  const shareMessage = isControlledPreview
    ? `Vista previa del token en QVEX: ${result.symbol} en ${NETWORK_LABELS[result.network]}.`
    : `Nuevo token creado en QVEX: ${result.symbol} en ${NETWORK_LABELS[result.network]}.`;

  const copyContract = async () => {
    if (!result.contractAddress) {
      setFeedback('Sin contrato en blockchain: esta vista previa no fue desplegada.');
      return;
    }
    await Clipboard.setStringAsync(result.contractAddress);
    setFeedback('Contrato copiado.');
  };

  const shareToken = async () => {
    await Share.share({ message: shareMessage });
  };

  const openExplorer = async () => {
    if (!result.explorerUrl) {
      setFeedback('Sin txHash real: no hay explorador disponible para esta vista previa.');
      return;
    }
    router.push({
      pathname: '/browser',
      params: {
        initialUrl: result.explorerUrl,
        title: `${result.symbol} explorador`,
        source: 'explorer',
      },
    });
  };

  const handleRestart = () => {
    resetDraft();
    router.replace('/create-token' as never);
  };

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
        <Header onShare={shareToken} isPreview={isControlledPreview} />

        <LinearGradient colors={[COLORS.surfaceSoft, COLORS.surface]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={30} color={COLORS.background} />
          </View>
          <Text style={styles.heroTitle}>
            {isControlledPreview ? 'Vista previa generada' : 'Token creado con éxito'}
          </Text>
          <Text style={styles.heroBody}>
            {isControlledPreview
              ? `${result.symbol} es una vista previa controlada. Sin contrato en blockchain y sin txHash real.`
              : `${result.symbol} ya está disponible en tu billetera y listo para los siguientes pasos.`}
          </Text>
          <View style={styles.chipRow}>
            <Chip label={NETWORK_LABELS[result.network]} />
            <Chip label={isControlledPreview ? 'Token no desplegado' : 'Contrato creado'} tone={isControlledPreview ? 'warning' : 'green'} />
            <Chip label={publicationLabel} tone={publicationLabel === 'En revisión' ? 'warning' : 'purple'} />
          </View>
        </LinearGradient>

        <View style={styles.tokenCard}>
          <View style={styles.tokenCardHeader}>
            <TokenLogo logoUri={draft.logoUri} symbol={result.symbol} />
            <View style={styles.tokenCopy}>
              <Text style={styles.tokenName}>{result.name}</Text>
              <Text style={styles.tokenMeta}>{result.symbol} · {NETWORK_LABELS[result.network]}</Text>
            </View>
            <Pressable onPress={copyContract} style={({ pressed }) => [styles.copyButton, pressed && styles.pressed]}>
              <Ionicons name="copy-outline" size={18} color={COLORS.purpleSoft} />
            </Pressable>
          </View>

          <View style={styles.tokenGrid}>
            <View style={styles.tokenInfoItem}>
              <Text style={styles.tokenInfoLabel}>Supply total</Text>
              <Text style={styles.tokenInfoValue}>{result.supply} {result.symbol}</Text>
            </View>
            <View style={styles.tokenInfoItem}>
              <Text style={styles.tokenInfoLabel}>Tipo</Text>
              <Text style={styles.tokenInfoValue}>{draft.tokenType === 'memecoin' ? 'Memecoin' : 'Token estándar'}</Text>
            </View>
            <View style={styles.tokenInfoItemWide}>
              <Text style={styles.tokenInfoLabel}>Contrato</Text>
              <Text style={styles.tokenInfoValue}>{contractLabel}</Text>
            </View>
            {result.transactionHash ? (
              <View style={styles.tokenInfoItemWide}>
                <Text style={styles.tokenInfoLabel}>Hash de transacción</Text>
                <Text style={styles.tokenInfoValue}>{result.transactionHash}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.launchCard}>
          <Text style={styles.sectionTitle}>Estado del lanzamiento</Text>
          <LaunchStatusRow label="Deploy del token" value={isControlledPreview ? 'Token no desplegado' : result.launchStatus.token} />
          <LaunchStatusRow label="Liquidez configurada" value={result.launchStatus.liquidity} />
          <LaunchStatusRow label="Airdrop" value={result.launchStatus.airdrop} />
          <LaunchStatusRow label="Publicación QVEX" value={result.launchStatus.publication} />
          <LaunchStatusRow label="Auditoría" value={result.launchStatus.audit} />
        </View>

        <View style={styles.actionsGrid}>
          <ActionButton icon="eye-outline" label="Ver token" onPress={() => setFeedback('Detalle del token pendiente de conectar.')} />
          <ActionButton icon="copy-outline" label="Copiar contrato" onPress={copyContract} />
          <ActionButton icon="share-social-outline" label="Compartir" onPress={shareToken} />
          <ActionButton icon="open-outline" label="Abrir explorador" onPress={openExplorer} />
        </View>

        <View style={styles.nextStepsCard}>
          <Text style={styles.sectionTitle}>Siguientes pasos</Text>
          <NextStepRow title="Añadir liquidez" subtitle="Completa o ajusta la liquidez inicial." disabled={!draft.liquidityConfig?.enabled} />
          <View style={styles.divider} />
          <NextStepRow title="Lanzar airdrop" subtitle="Activa la campaña cuando estés listo." disabled={!draft.airdropConfig?.enabled} />
          <View style={styles.divider} />
          <NextStepRow title="Ver publicación" subtitle="Revisa el estado dentro de QVEX." disabled={!draft.publicationConfig?.enabled} />
          <View style={styles.divider} />
          <NextStepRow title="Promocionar proyecto" subtitle="Comparte tu token con tu comunidad." />
        </View>

        <View style={styles.shareCard}>
          <Text style={styles.sectionTitle}>Vista para compartir</Text>
          <View style={styles.sharePreview}>
            <TokenLogo logoUri={draft.logoUri} symbol={result.symbol} size={46} />
            <View style={styles.shareCopy}>
              <Text style={styles.shareTitle}>{result.symbol}</Text>
              <Text style={styles.shareSubtitle}>
                {isControlledPreview ? 'Vista previa del token en QVEX' : 'Nuevo token creado en QVEX'} · {NETWORK_LABELS[result.network]}
              </Text>
              <View style={styles.shareBadgeRow}>
                {draft.liquidityConfig?.enabled ? <Text style={styles.shareBadge}>Liquidez bloqueada</Text> : null}
                <Text style={styles.shareBadgeMuted}>Nuevo</Text>
              </View>
            </View>
          </View>
          <Pressable onPress={shareToken} style={({ pressed }) => [styles.shareLinkButton, pressed && styles.pressed]}>
            <Text style={styles.shareLinkText}>Compartir enlace</Text>
          </Pressable>
        </View>

        <View style={styles.safetyCard}>
          <Ionicons name="warning-outline" size={18} color={COLORS.warning} />
          <Text style={styles.safetyText}>
            {isControlledPreview
              ? 'Vista previa controlada: no hay contrato en blockchain, no hay txHash real y no se ejecutó deploy.'
              : 'Recuerda: QVEX no garantiza el valor, liquidez ni adopción de ningún token. Comparte información clara con tu comunidad.'}
          </Text>
        </View>

        {feedback ? (
          <View style={styles.feedbackCard}>
            <Ionicons name="information-circle-outline" size={17} color={COLORS.purpleSoft} />
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        ) : null}

        <View style={styles.ctaBlock}>
          <Pressable onPress={() => setFeedback('Detalle del token pendiente de conectar.')} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <LinearGradient colors={[COLORS.purple, COLORS.purpleSoft]} style={styles.primaryGradient}>
              <Text style={styles.primaryButtonText}>{isControlledPreview ? 'Ver vista previa' : 'Ver mi token'}</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={handleRestart} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <Text style={styles.secondaryButtonText}>Volver a crear tokens</Text>
          </Pressable>
          <Pressable onPress={() => router.replace('/home' as never)} style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}>
            <Text style={styles.linkButtonText}>Ir a inicio</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default TokenCreatedScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 16, paddingTop: 8, gap: 16 },
  contentSmall: { paddingHorizontal: 14, gap: 14 },
  pressed: { opacity: 0.84, transform: [{ scale: 0.99 }] },
  disabledBlock: { opacity: 0.54 },
  header: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.surfaceElevated, 0.8),
    borderWidth: 1,
    borderColor: COLORS.border,
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
  headerSubtitle: { color: COLORS.textMuted, fontFamily: FONT.medium, fontSize: 11 },
  hero: {
    width: '100%',
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  successIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.greenBright,
    shadowColor: COLORS.greenBright,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  heroTitle: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 22, textAlign: 'center' },
  heroBody: { color: COLORS.textSecondary, fontFamily: FONT.medium, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  chip: { minHeight: 26, borderRadius: RADII.pill, paddingHorizontal: 10, justifyContent: 'center', borderWidth: 1 },
  chipText: { fontFamily: FONT.bold, fontSize: 10, textTransform: 'uppercase' },
  tokenCard: {
    width: '100%',
    borderRadius: 20,
    padding: 15,
    gap: 14,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tokenCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tokenLogo: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.purple, 0.18),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.purpleSoft, 0.34),
    overflow: 'hidden',
  },
  tokenLogoImage: { width: '100%', height: '100%' },
  tokenLogoText: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 12 },
  tokenCopy: { flex: 1, minWidth: 0 },
  tokenName: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 16 },
  tokenMeta: { color: COLORS.textMuted, fontFamily: FONT.medium, fontSize: 12 },
  copyButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tokenGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tokenInfoItem: {
    flex: 1,
    minWidth: '46%',
    borderRadius: 14,
    padding: 10,
    backgroundColor: withOpacity('#FFFFFF', 0.04),
    borderWidth: 1,
    borderColor: withOpacity('#FFFFFF', 0.06),
  },
  tokenInfoItemWide: {
    width: '100%',
    borderRadius: 14,
    padding: 10,
    backgroundColor: withOpacity('#FFFFFF', 0.04),
    borderWidth: 1,
    borderColor: withOpacity('#FFFFFF', 0.06),
  },
  tokenInfoLabel: { color: COLORS.textMuted, fontFamily: FONT.medium, fontSize: 10.5, marginBottom: 4 },
  tokenInfoValue: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 12 },
  launchCard: {
    width: '100%',
    borderRadius: 18,
    padding: 15,
    gap: 11,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 15 },
  launchRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  launchDot: { width: 8, height: 8, borderRadius: 4 },
  launchLabel: { flex: 1, color: COLORS.textSecondary, fontFamily: FONT.medium, fontSize: 12 },
  launchValue: { fontFamily: FONT.bold, fontSize: 11.5 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionButton: {
    width: '47.8%',
    minHeight: 72,
    borderRadius: 16,
    padding: 12,
    gap: 7,
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionLabel: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 12.5 },
  nextStepsCard: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  nextStepRow: { minHeight: 68, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 11 },
  nextStepIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.purple, 0.12),
  },
  nextStepCopy: { flex: 1, minWidth: 0 },
  nextStepTitle: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 13 },
  nextStepSubtitle: { color: COLORS.textMuted, fontFamily: FONT.medium, fontSize: 10.5, lineHeight: 15 },
  divider: { height: 1, backgroundColor: COLORS.border },
  shareCard: {
    width: '100%',
    borderRadius: 18,
    padding: 15,
    gap: 12,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sharePreview: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  shareCopy: { flex: 1, minWidth: 0, gap: 3 },
  shareTitle: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 16 },
  shareSubtitle: { color: COLORS.textSecondary, fontFamily: FONT.medium, fontSize: 11.5 },
  shareBadgeRow: { flexDirection: 'row', gap: 7, flexWrap: 'wrap' },
  shareBadge: { color: COLORS.greenBright, fontFamily: FONT.bold, fontSize: 9, textTransform: 'uppercase' },
  shareBadgeMuted: { color: COLORS.textMuted, fontFamily: FONT.bold, fontSize: 9, textTransform: 'uppercase' },
  shareLinkButton: {
    minHeight: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.purple, 0.18),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.purpleSoft, 0.36),
  },
  shareLinkText: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 13 },
  safetyCard: {
    width: '100%',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    gap: 9,
    backgroundColor: withOpacity(COLORS.warning, 0.08),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.warning, 0.22),
  },
  safetyText: { flex: 1, color: COLORS.textSecondary, fontFamily: FONT.medium, fontSize: 12, lineHeight: 17 },
  feedbackCard: {
    minHeight: 44,
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
  feedbackText: { flex: 1, color: COLORS.textSecondary, fontFamily: FONT.medium, fontSize: 12, lineHeight: 17 },
  ctaBlock: { width: '100%', gap: 10 },
  primaryButton: { width: '100%', minHeight: 52, borderRadius: 14, overflow: 'hidden' },
  primaryGradient: { minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 15 },
  secondaryButton: {
    width: '100%',
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: { color: COLORS.textSecondary, fontFamily: FONT.bold, fontSize: 14 },
  linkButton: { minHeight: 38, alignItems: 'center', justifyContent: 'center' },
  linkButtonText: { color: COLORS.purpleSoft, fontFamily: FONT.bold, fontSize: 13 },
});
