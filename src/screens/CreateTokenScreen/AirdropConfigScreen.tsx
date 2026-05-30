import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONT, ORBITX_COLORS, RADII, withOpacity } from '../../../constants/theme';
import {
  useCreateTokenDraftStore,
  type AirdropConfig,
  type AirdropDistributionType,
  type AirdropRequirements,
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

const AIRDROP_FEES: Record<TokenNetwork, string> = {
  ethereum: '0.010 ETH',
  bnb: '0.040 BNB',
  solana: '0.050 SOL',
  polygon: '6.000 MATIC',
  base: '0.006 ETH',
};

const DISTRIBUTION_TYPES: Array<{
  key: AirdropDistributionType;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  {
    key: 'equal',
    title: 'Igual para todos',
    subtitle: 'Cada participante recibe la misma cantidad.',
    icon: 'people-outline',
  },
  {
    key: 'firstCome',
    title: 'Por orden de llegada',
    subtitle: 'Los primeros usuarios reciben cupo.',
    icon: 'timer-outline',
  },
  {
    key: 'volume',
    title: 'Por volumen',
    subtitle: 'Premia usuarios con más actividad.',
    icon: 'bar-chart-outline',
  },
];

const REQUIREMENT_OPTIONS: Array<{
  key: keyof AirdropRequirements;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  {
    key: 'verifiedAccount',
    title: 'Tener cuenta verificada',
    subtitle: 'Solo usuarios con verificación aprobada.',
    icon: 'shield-checkmark-outline',
  },
  {
    key: 'followProject',
    title: 'Seguir el proyecto',
    subtitle: 'El usuario debe seguir el token/proyecto.',
    icon: 'person-add-outline',
  },
  {
    key: 'minimumBalance',
    title: 'Mantener saldo mínimo',
    subtitle: 'Requiere saldo mínimo en QVEX.',
    icon: 'business-outline',
  },
  {
    key: 'makeOperation',
    title: 'Realizar una operación',
    subtitle: 'Compra, venta o transferencia en QVEX.',
    icon: 'swap-horizontal-outline',
  },
  {
    key: 'inviteFriends',
    title: 'Invitar amigos',
    subtitle: 'Participación mediante referidos.',
    icon: 'people-circle-outline',
  },
];

const DEFAULT_REQUIREMENTS: AirdropRequirements = {
  verifiedAccount: true,
  followProject: true,
  minimumBalance: false,
  makeOperation: false,
  inviteFriends: true,
};

function parseAmount(value: string) {
  const normalized = value.replace(/,/g, '').trim();
  const numericValue = Number(normalized);

  return Number.isFinite(numericValue) ? numericValue : 0;
}

function formatNumber(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
  }).format(value);
}

function formatPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) return '--';
  return `${value.toFixed(value >= 10 ? 1 : 2)}%`;
}

function countActiveRequirements(requirements: AirdropRequirements) {
  return Object.values(requirements).filter(Boolean).length;
}

function Header() {
  return (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}>
        <Ionicons name="arrow-back" size={23} color={COLORS.purpleSoft} />
      </Pressable>

      <View style={styles.headerCopy}>
        <Text style={styles.headerTitle}>Configurar airdrop</Text>
        <Text style={styles.headerSubtitle}>Paso 3 de 5 · Distribución comunitaria</Text>
      </View>

      <Pressable style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}>
        <Ionicons name="help-circle-outline" size={22} color={COLORS.purpleSoft} />
      </Pressable>
    </View>
  );
}

function StepIndicator() {
  const steps = ['Airdrop opcional', 'Publicación', 'Revisión final'];

  return (
    <View style={styles.stepBlock}>
      <View style={styles.stepTopRow}>
        <Text style={styles.stepLabel}>Paso 3 de 5</Text>
        <Text style={styles.stepTitle}>Airdrop</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stepChips}>
        {steps.map((step, index) => (
          <View key={step} style={[styles.stepChip, index === 0 && styles.stepChipActive]}>
            <Text style={[styles.stepChipText, index === 0 && styles.stepChipTextActive]}>{step}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
    </View>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

function TokenDraftSummary({
  symbol,
  network,
  supply,
  liquidityStatus,
}: {
  symbol: string;
  network: TokenNetwork;
  supply: string;
  liquidityStatus: string;
}) {
  return (
    <LinearGradient
      colors={[COLORS.surface, COLORS.surfaceSoft]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.summaryCard}
    >
      <View style={styles.summaryGlow} pointerEvents="none" />
      <View style={styles.summaryHeader}>
        <View style={styles.tokenBadge}>
          <Text style={styles.tokenBadgeText}>{symbol.slice(0, 4)}</Text>
        </View>
        <View style={styles.summaryTitleCopy}>
          <Text style={styles.summaryTitle}>{symbol}</Text>
          <Text style={styles.summarySubtitle}>{NETWORK_LABELS[network]} · {supply} supply</Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>Airdrop opcional</Text>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <SummaryItem label="Símbolo" value={symbol} />
        <SummaryItem label="Liquidez" value={liquidityStatus} />
        <SummaryItem label="Estado" value="Configurable" />
      </View>
    </LinearGradient>
  );
}

function SwitchControl({ active }: { active: boolean }) {
  return (
    <View style={[styles.switchTrack, active && styles.switchTrackActive]}>
      <View style={[styles.switchKnob, active && styles.switchKnobActive]} />
    </View>
  );
}

function AirdropStatusCard({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.statusCard}>
      <View style={styles.statusHeader}>
        <View style={styles.statusIcon}>
          <Ionicons name="gift-outline" size={22} color={COLORS.purpleSoft} />
        </View>
        <View style={styles.statusCopy}>
          <Text style={styles.statusTitle}>Campaña de airdrop</Text>
          <Text style={styles.statusSubtitle}>
            Distribuye tokens a usuarios que cumplan las reglas de participación.
          </Text>
        </View>
        <Pressable onPress={onToggle} style={({ pressed }) => [styles.switchPressable, pressed && styles.pressed]}>
          <SwitchControl active={enabled} />
        </Pressable>
      </View>
      <View style={[styles.stateLine, enabled ? styles.stateLineActive : styles.stateLineMuted]}>
        <View style={[styles.stateDot, enabled && styles.stateDotActive]} />
        <Text style={[styles.stateText, enabled && styles.stateTextActive]}>
          {enabled ? 'Airdrop activo' : 'Puedes omitir este paso y continuar.'}
        </Text>
      </View>
    </View>
  );
}

function UnitInput({
  label,
  value,
  onChangeText,
  unit,
  placeholder,
  error,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  unit: string;
  placeholder: string;
  error?: string;
  editable?: boolean;
}) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputShell, !editable && styles.inputShellDisabled, error && styles.inputShellError]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType="numeric"
          placeholder={placeholder}
          placeholderTextColor={withOpacity(COLORS.textSecondary, 0.48)}
          style={styles.input}
        />
        <Text style={styles.inputUnit}>{unit}</Text>
      </View>
      {error ? <Text style={styles.inputError}>{error}</Text> : null}
    </View>
  );
}

function CalculationRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.calcRow}>
      <Ionicons name={icon} size={15} color={COLORS.purpleSoft} />
      <Text style={styles.calcLabel}>{label}</Text>
      <Text style={styles.calcValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function DistributionTypeCard({
  item,
  active,
  disabled,
  onPress,
}: {
  item: (typeof DISTRIBUTION_TYPES)[number];
  active: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.distributionCard,
        active && styles.distributionCardActive,
        disabled && styles.disabledBlock,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name={item.icon} size={19} color={active ? COLORS.text : COLORS.textMuted} />
      <Text style={[styles.distributionTitle, active && styles.distributionTitleActive]}>{item.title}</Text>
      <Text style={styles.distributionSubtitle}>{item.subtitle}</Text>
    </Pressable>
  );
}

function RequirementRow({
  item,
  active,
  disabled,
  onPress,
}: {
  item: (typeof REQUIREMENT_OPTIONS)[number];
  active: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.requirementRow, disabled && styles.disabledBlock, pressed && styles.pressed]}
    >
      <View style={styles.requirementIcon}>
        <Ionicons name={item.icon} size={18} color={active ? COLORS.purpleSoft : COLORS.textMuted} />
      </View>
      <View style={styles.requirementCopy}>
        <Text style={styles.requirementTitle}>{item.title}</Text>
        <Text style={styles.requirementSubtitle}>{item.subtitle}</Text>
      </View>
      <SwitchControl active={active} />
    </Pressable>
  );
}

function DateRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.dateRow}>
      <Ionicons name={icon} size={17} color={COLORS.purpleSoft} />
      <View style={styles.dateCopy}>
        <Text style={styles.dateLabel}>{label}</Text>
        <Text style={styles.dateValue}>{value}</Text>
      </View>
    </View>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.airdropSummaryRow}>
      <Text style={[styles.airdropSummaryLabel, strong && styles.airdropSummaryLabelStrong]}>{label}</Text>
      <Text style={[styles.airdropSummaryValue, strong && styles.airdropSummaryValueStrong]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function getNextStepLabel(options: { prepareListing: boolean }) {
  if (options.prepareListing) return 'Publicación QVEX';
  return 'Revisión final';
}

function continueToNextStep(options: { prepareListing: boolean }) {
  if (options.prepareListing) {
    router.push('/create-token-publication' as never);
    return;
  }

  router.push('/create-token-review' as never);
}

export function AirdropConfigScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isSmallPhone = width < 380;
  const draft = useCreateTokenDraftStore((state) => state.draft);
  const setAirdropConfig = useCreateTokenDraftStore((state) => state.setAirdropConfig);
  const updateOptions = useCreateTokenDraftStore((state) => state.updateOptions);
  const tokenSymbol = (draft.symbol.trim() || 'ANYR').toUpperCase();
  const network = draft.network || 'solana';
  const supplyLabel = draft.supply.trim() || '100,000,000';
  const supplyNumber = parseAmount(supplyLabel) || 100000000;
  const liquidityAmount = draft.liquidityConfig?.enabled ? parseAmount(draft.liquidityConfig.tokenAmount) : 0;
  const availableAfterLiquidity = Math.max(supplyNumber - liquidityAmount, 0);
  const savedConfig = draft.airdropConfig;
  const [enabled, setEnabled] = useState(savedConfig?.enabled ?? true);
  const [totalTokens, setTotalTokens] = useState(savedConfig?.totalTokens ?? '2,000,000');
  const [maxParticipants, setMaxParticipants] = useState(savedConfig?.maxParticipants ?? '1,000');
  const [distributionType, setDistributionType] = useState<AirdropDistributionType>(
    savedConfig?.distributionType ?? 'equal',
  );
  const [requirements, setRequirements] = useState<AirdropRequirements>(
    savedConfig?.requirements ?? DEFAULT_REQUIREMENTS,
  );
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');

  const totalTokensNumber = useMemo(() => parseAmount(totalTokens), [totalTokens]);
  const maxParticipantsNumber = useMemo(() => parseAmount(maxParticipants), [maxParticipants]);
  const tokensPerUser = useMemo(() => {
    if (!totalTokensNumber || !maxParticipantsNumber) return 0;
    return totalTokensNumber / maxParticipantsNumber;
  }, [maxParticipantsNumber, totalTokensNumber]);
  const percentageSupply = useMemo(() => {
    if (!totalTokensNumber || !supplyNumber) return null;
    return (totalTokensNumber / supplyNumber) * 100;
  }, [supplyNumber, totalTokensNumber]);
  const activeRequirements = countActiveRequirements(requirements);
  const estimatedFee = AIRDROP_FEES[network];
  const nextStep = getNextStepLabel(draft.options);

  const errors = useMemo(() => {
    const nextErrors: Partial<Record<'totalTokens' | 'maxParticipants' | 'available', string>> = {};
    if (!enabled) return nextErrors;
    if (!totalTokensNumber || totalTokensNumber <= 0) {
      nextErrors.totalTokens = 'Ingresa una cantidad de tokens mayor a 0.';
    }
    if (!maxParticipantsNumber || maxParticipantsNumber <= 0) {
      nextErrors.maxParticipants = 'Ingresa un máximo de participantes válido.';
    }
    if (totalTokensNumber > availableAfterLiquidity) {
      nextErrors.available = 'El airdrop supera el supply disponible después de liquidez.';
    }
    return nextErrors;
  }, [availableAfterLiquidity, enabled, maxParticipantsNumber, totalTokensNumber]);

  const hasErrors = Object.keys(errors).length > 0;
  const liquidityStatus = draft.liquidityConfig?.enabled
    ? 'Configurada'
    : draft.liquidityConfig
      ? 'Omitida'
      : 'Pendiente';

  const buildAirdropConfig = (configEnabled: boolean): AirdropConfig => ({
    enabled: configEnabled,
    totalTokens,
    maxParticipants,
    tokensPerUser: tokensPerUser ? String(tokensPerUser) : '',
    distributionType,
    requirements,
    dates: {
      start: 'onPublish',
      closeAfterDays: 7,
      claim: 'afterCampaign',
    },
    estimatedFee,
  });

  const handleSave = () => {
    setSubmitted(true);
    if (enabled && hasErrors) {
      setFeedback('Revisa cantidad, participantes y supply disponible antes de guardar.');
      return;
    }

    setAirdropConfig(buildAirdropConfig(enabled));
    updateOptions({ prepareAirdrop: enabled });
    setFeedback(
      enabled
        ? `Airdrop guardado. Siguiente paso pendiente: ${nextStep}.`
        : `Airdrop omitido. Siguiente paso pendiente: ${nextStep}.`,
    );
    continueToNextStep(draft.options);
  };

  const handleSkip = () => {
    setEnabled(false);
    setAirdropConfig(buildAirdropConfig(false));
    updateOptions({ prepareAirdrop: false });
    setFeedback(`Airdrop omitido. Siguiente paso pendiente: ${nextStep}.`);
    continueToNextStep(draft.options);
  };

  const toggleRequirement = (key: keyof AirdropRequirements) => {
    setRequirements((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          isSmallPhone && styles.contentSmall,
          { paddingBottom: Math.max(insets.bottom, 10) + 120 },
        ]}
      >
        <Header />
        <StepIndicator />
        <TokenDraftSummary
          symbol={tokenSymbol}
          network={network}
          supply={formatNumber(supplyNumber, 0)}
          liquidityStatus={liquidityStatus}
        />

        <AirdropStatusCard enabled={enabled} onToggle={() => setEnabled((value) => !value)} />

        <View style={[styles.section, !enabled && styles.disabledBlock]}>
          <SectionTitle title="Cantidad a distribuir" />
          <View style={styles.formCard}>
            <UnitInput
              label="Tokens para airdrop"
              value={totalTokens}
              onChangeText={setTotalTokens}
              unit={tokenSymbol}
              placeholder="2,000,000"
              editable={enabled}
              error={submitted ? errors.totalTokens ?? errors.available : undefined}
            />
            <UnitInput
              label="Máximo de participantes"
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              unit="usuarios"
              placeholder="1,000"
              editable={enabled}
              error={submitted ? errors.maxParticipants : undefined}
            />

            <View style={styles.calculationCard}>
              <CalculationRow
                icon="person-outline"
                label="Tokens por usuario"
                value={tokensPerUser ? `${formatNumber(tokensPerUser, 4)} ${tokenSymbol}` : `-- ${tokenSymbol}`}
              />
              <CalculationRow
                icon="pie-chart-outline"
                label="Porcentaje del supply"
                value={formatPercent(percentageSupply)}
              />
              <CalculationRow
                icon="wallet-outline"
                label="Disponible después de liquidez"
                value={`${formatNumber(availableAfterLiquidity, 0)} ${tokenSymbol}`}
              />
            </View>
          </View>
        </View>

        <View style={[styles.section, !enabled && styles.disabledBlock]}>
          <SectionTitle title="Tipo de distribución" />
          <View style={styles.distributionGrid}>
            {DISTRIBUTION_TYPES.map((item) => (
              <DistributionTypeCard
                key={item.key}
                item={item}
                active={distributionType === item.key}
                disabled={!enabled}
                onPress={() => setDistributionType(item.key)}
              />
            ))}
          </View>
        </View>

        <View style={[styles.section, !enabled && styles.disabledBlock]}>
          <SectionTitle title="Requisitos" />
          <View style={styles.requirementsCard}>
            {REQUIREMENT_OPTIONS.map((item, index) => (
              <View key={item.key}>
                <RequirementRow
                  item={item}
                  active={requirements[item.key]}
                  disabled={!enabled}
                  onPress={() => toggleRequirement(item.key)}
                />
                {index < REQUIREMENT_OPTIONS.length - 1 ? <View style={styles.rowDivider} /> : null}
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, !enabled && styles.disabledBlock]}>
          <SectionTitle title="Fechas de campaña" hint="Editable después" />
          <View style={styles.datesCard}>
            <DateRow label="Inicio" value="Automático al publicar" icon="rocket-outline" />
            <View style={styles.rowDivider} />
            <DateRow label="Cierre" value="7 días después" icon="calendar-outline" />
            <View style={styles.rowDivider} />
            <DateRow label="Reclamo" value="Disponible al finalizar campaña" icon="checkmark-done-outline" />
          </View>
        </View>

        <LinearGradient
          colors={[withOpacity(COLORS.purple, 0.14), COLORS.surfaceSoft]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.benefitCard}
        >
          <View style={styles.benefitIcon}>
            <Ionicons name="gift-outline" size={24} color={COLORS.purpleSoft} />
          </View>
          <View style={styles.benefitCopy}>
            <Text style={styles.benefitTitle}>Un airdrop puede activar tu comunidad</Text>
            <Text style={styles.benefitBody}>
              Úsalo para atraer holders, generar participación inicial y dar visibilidad al token.
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.airdropSummaryCard}>
          <Text style={styles.airdropSummaryTitle}>Resumen del airdrop</Text>
          <SummaryRow label="Total a distribuir" value={`${formatNumber(totalTokensNumber, 0)} ${tokenSymbol}`} />
          <SummaryRow label="Participantes máximos" value={formatNumber(maxParticipantsNumber, 0)} />
          <SummaryRow
            label="Estimado por usuario"
            value={tokensPerUser ? `${formatNumber(tokensPerUser, 4)} ${tokenSymbol}` : `-- ${tokenSymbol}`}
          />
          <SummaryRow label="Requisitos activos" value={`${activeRequirements} reglas`} />
          <View style={styles.costDivider} />
          <SummaryRow label="Comisión QVEX" value={estimatedFee} strong />
          <Text style={styles.summaryNote}>
            Los costos pueden variar según la red y la cantidad de participantes.
          </Text>
        </View>

        <View style={styles.warningCard}>
          <Ionicons name="warning-outline" size={18} color={COLORS.warning} />
          <Text style={styles.warningText}>
            Una vez iniciado el airdrop, las reglas no podrán cambiarse para los participantes registrados.
          </Text>
        </View>

        <View style={styles.ctaBlock}>
          {feedback ? (
            <View style={[styles.feedbackCard, hasErrors && submitted ? styles.feedbackError : styles.feedbackReady]}>
              <Ionicons
                name={hasErrors && submitted ? 'alert-circle-outline' : 'checkmark-circle-outline'}
                size={17}
                color={hasErrors && submitted ? COLORS.warning : COLORS.greenBright}
              />
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>
          ) : null}

          <Pressable onPress={handleSave} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <LinearGradient colors={[COLORS.purple, COLORS.purpleSoft]} style={styles.primaryGradient}>
              <Text style={styles.primaryButtonText}>Guardar airdrop</Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={handleSkip} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <Text style={styles.secondaryButtonText}>Omitir airdrop</Text>
          </Pressable>

          <Text style={styles.ctaHint}>
            Podrás revisar todo nuevamente antes de confirmar la creación del token.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default AirdropConfigScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },
  contentSmall: {
    paddingHorizontal: 14,
    gap: 14,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
  disabledBlock: {
    opacity: 0.58,
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
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
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
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
  stepBlock: {
    gap: 9,
  },
  stepTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  stepLabel: {
    color: COLORS.purpleSoft,
    fontFamily: FONT.bold,
    fontSize: 12,
  },
  stepTitle: {
    color: COLORS.textSecondary,
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  progressTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceElevated,
    overflow: 'hidden',
  },
  progressFill: {
    width: '60%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.purpleSoft,
  },
  stepChips: {
    gap: 8,
    paddingRight: 16,
  },
  stepChip: {
    minHeight: 28,
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepChipActive: {
    borderColor: withOpacity(COLORS.purpleSoft, 0.52),
    backgroundColor: withOpacity(COLORS.purple, 0.18),
  },
  stepChipText: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 10.5,
  },
  stepChipTextActive: {
    color: COLORS.text,
  },
  summaryCard: {
    width: '100%',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    gap: 14,
  },
  summaryGlow: {
    position: 'absolute',
    right: -52,
    top: -58,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: withOpacity(COLORS.purpleSoft, 0.18),
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tokenBadge: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.purple, 0.22),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.purpleSoft, 0.36),
  },
  tokenBadgeText: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 13,
  },
  summaryTitleCopy: {
    flex: 1,
    minWidth: 0,
  },
  summaryTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 17,
  },
  summarySubtitle: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 11.5,
  },
  statusPill: {
    minHeight: 26,
    borderRadius: RADII.pill,
    paddingHorizontal: 9,
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.purple, 0.16),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.purpleSoft, 0.28),
  },
  statusPillText: {
    color: COLORS.purpleSoft,
    fontFamily: FONT.bold,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryItem: {
    flex: 1,
    minHeight: 58,
    borderRadius: 14,
    padding: 10,
    justifyContent: 'center',
    backgroundColor: withOpacity('#FFFFFF', 0.04),
    borderWidth: 1,
    borderColor: withOpacity('#FFFFFF', 0.06),
  },
  summaryLabel: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 10,
    marginBottom: 4,
  },
  summaryValue: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 12,
  },
  statusCard: {
    width: '100%',
    borderRadius: 20,
    padding: 15,
    gap: 13,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.purple, 0.16),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.purpleSoft, 0.28),
  },
  statusCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  statusTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 16,
  },
  statusSubtitle: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  switchPressable: {
    padding: 4,
  },
  stateLine: {
    alignSelf: 'flex-start',
    minHeight: 26,
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  stateLineActive: {
    backgroundColor: withOpacity(COLORS.green, 0.1),
  },
  stateLineMuted: {
    backgroundColor: withOpacity('#FFFFFF', 0.05),
  },
  stateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textMuted,
  },
  stateDotActive: {
    backgroundColor: COLORS.greenBright,
  },
  stateText: {
    color: COLORS.textMuted,
    fontFamily: FONT.bold,
    fontSize: 10.5,
    textTransform: 'uppercase',
  },
  stateTextActive: {
    color: COLORS.greenBright,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 3,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  switchTrackActive: {
    backgroundColor: withOpacity(COLORS.purple, 0.48),
    borderColor: withOpacity(COLORS.purpleSoft, 0.7),
  },
  switchKnob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.textMuted,
  },
  switchKnobActive: {
    transform: [{ translateX: 18 }],
    backgroundColor: COLORS.text,
  },
  section: {
    width: '100%',
    gap: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontFamily: FONT.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionHint: {
    flex: 1,
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 11,
    textAlign: 'right',
  },
  formCard: {
    width: '100%',
    gap: 12,
  },
  inputWrap: {
    gap: 6,
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
    marginLeft: 2,
  },
  inputShell: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: withOpacity('#FFFFFF', 0.08),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  inputShellDisabled: {
    backgroundColor: withOpacity(COLORS.surface, 0.62),
  },
  inputShellError: {
    borderColor: withOpacity(COLORS.warning, 0.78),
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: COLORS.text,
    fontFamily: FONT.medium,
    fontSize: 14,
    paddingVertical: 0,
  },
  inputUnit: {
    color: COLORS.purpleSoft,
    fontFamily: FONT.bold,
    fontSize: 12,
    marginLeft: 8,
  },
  inputError: {
    color: COLORS.warning,
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  calculationCard: {
    width: '100%',
    borderRadius: 16,
    padding: 12,
    gap: 10,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  calcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calcLabel: {
    flex: 1,
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  calcValue: {
    maxWidth: '52%',
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 12,
    textAlign: 'right',
  },
  distributionGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  distributionCard: {
    flex: 1,
    minHeight: 104,
    borderRadius: 15,
    padding: 11,
    gap: 5,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  distributionCardActive: {
    backgroundColor: withOpacity(COLORS.purple, 0.24),
    borderColor: withOpacity(COLORS.purpleSoft, 0.74),
  },
  distributionTitle: {
    color: COLORS.textSecondary,
    fontFamily: FONT.bold,
    fontSize: 11.5,
    lineHeight: 15,
  },
  distributionTitleActive: {
    color: COLORS.text,
  },
  distributionSubtitle: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 9.5,
    lineHeight: 13,
  },
  requirementsCard: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  requirementRow: {
    minHeight: 70,
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  requirementIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.purple, 0.12),
  },
  requirementCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  requirementTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 13,
  },
  requirementSubtitle: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 10.5,
    lineHeight: 14,
  },
  rowDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  datesCard: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  dateRow: {
    minHeight: 58,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  dateCopy: {
    flex: 1,
    minWidth: 0,
  },
  dateLabel: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 10.5,
    textTransform: 'uppercase',
  },
  dateValue: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 13,
  },
  benefitCard: {
    width: '100%',
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  benefitIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.purple, 0.18),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.purpleSoft, 0.28),
  },
  benefitCopy: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  benefitTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 15,
  },
  benefitBody: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  airdropSummaryCard: {
    width: '100%',
    borderRadius: 18,
    padding: 16,
    gap: 10,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  airdropSummaryTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 15,
    marginBottom: 2,
  },
  airdropSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  airdropSummaryLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  airdropSummaryLabelStrong: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  airdropSummaryValue: {
    maxWidth: '50%',
    color: COLORS.text,
    fontFamily: FONT.semibold,
    fontSize: 12,
    textAlign: 'right',
  },
  airdropSummaryValueStrong: {
    color: COLORS.greenBright,
    fontFamily: FONT.bold,
    fontSize: 15,
  },
  costDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  summaryNote: {
    color: COLORS.warning,
    fontFamily: FONT.medium,
    fontSize: 11,
    lineHeight: 16,
  },
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
  warningText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 17,
  },
  ctaBlock: {
    width: '100%',
    gap: 10,
  },
  feedbackCard: {
    minHeight: 44,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 1,
  },
  feedbackError: {
    backgroundColor: withOpacity(COLORS.warning, 0.08),
    borderColor: withOpacity(COLORS.warning, 0.22),
  },
  feedbackReady: {
    backgroundColor: withOpacity(COLORS.green, 0.08),
    borderColor: withOpacity(COLORS.green, 0.22),
  },
  feedbackText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 17,
  },
  primaryButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: 14,
    overflow: 'hidden',
  },
  primaryGradient: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 15,
  },
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
  secondaryButtonText: {
    color: COLORS.textSecondary,
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  ctaHint: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
