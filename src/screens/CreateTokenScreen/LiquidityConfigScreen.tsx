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
  type LiquidityConfig,
  type LiquidityDex,
  type LockDuration,
  type PairAsset,
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

const PAIR_OPTIONS: Record<TokenNetwork, PairAsset[]> = {
  ethereum: ['ETH', 'USDT', 'USDC'],
  bnb: ['BNB', 'USDT', 'USDC'],
  solana: ['SOL', 'USDT', 'USDC'],
  polygon: ['MATIC', 'USDT', 'USDC'],
  base: ['ETH', 'USDC', 'USDT'],
};

const DEFAULT_PAIR: Record<TokenNetwork, PairAsset> = {
  ethereum: 'ETH',
  bnb: 'BNB',
  solana: 'SOL',
  polygon: 'MATIC',
  base: 'ETH',
};

const DEX_OPTIONS: Record<TokenNetwork, Array<{ key: LiquidityDex; label: string; subtitle: string }>> = {
  ethereum: [{ key: 'uniswap', label: 'Uniswap', subtitle: 'EVM' }],
  bnb: [{ key: 'pancakeswap', label: 'PancakeSwap', subtitle: 'BNB Chain' }],
  solana: [
    { key: 'raydium', label: 'Raydium', subtitle: 'Liquidez AMM' },
    { key: 'jupiter', label: 'Jupiter', subtitle: 'Agregador' },
    { key: 'orca', label: 'Orca', subtitle: 'Whirlpool' },
  ],
  polygon: [
    { key: 'uniswap', label: 'Uniswap', subtitle: 'Polygon' },
    { key: 'quickswap', label: 'QuickSwap', subtitle: 'Polygon' },
  ],
  base: [{ key: 'uniswap', label: 'Uniswap', subtitle: 'Base' }],
};

const DEFAULT_DEX: Record<TokenNetwork, LiquidityDex> = {
  ethereum: 'uniswap',
  bnb: 'pancakeswap',
  solana: 'raydium',
  polygon: 'uniswap',
  base: 'uniswap',
};

const ASSET_REFERENCE_PRICE_USD: Record<PairAsset, number> = {
  SOL: 170,
  ETH: 3200,
  BNB: 600,
  MATIC: 0.8,
  USDT: 1,
  USDC: 1,
};

const COSTS: Record<TokenNetwork, { gas: string; fee: string; total: string }> = {
  ethereum: { gas: '0.006 ETH', fee: '0.020 ETH', total: '0.026 ETH' },
  bnb: { gas: '0.010 BNB', fee: '0.080 BNB', total: '0.090 BNB' },
  solana: { gas: '0.024 SOL', fee: '0.100 SOL', total: '0.124 SOL' },
  polygon: { gas: '0.600 MATIC', fee: '12.000 MATIC', total: '12.600 MATIC' },
  base: { gas: '0.001 ETH', fee: '0.010 ETH', total: '0.011 ETH' },
};

function parseAmount(value: string) {
  const normalized = value.replace(/,/g, '').trim();
  const numericValue = Number(normalized);

  return Number.isFinite(numericValue) ? numericValue : 0;
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: value >= 1000 ? 0 : 4,
  }).format(value);
}

function formatPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) return '--';
  return `${value.toFixed(value >= 10 ? 1 : 2)}%`;
}

function formatInitialPrice(value: number | null, pairAsset: PairAsset, tokenSymbol: string) {
  if (value === null || !Number.isFinite(value) || value <= 0) return `1 ${tokenSymbol} ≈ -- ${pairAsset}`;
  return `1 ${tokenSymbol} ≈ ${value.toPrecision(4)} ${pairAsset}`;
}

function addMonths(baseDate: Date, months: number) {
  const nextDate = new Date(baseDate);
  nextDate.setMonth(nextDate.getMonth() + months);

  return nextDate;
}

function formatUnlockDate(duration: LockDuration) {
  const months = duration === '3m' ? 3 : duration === '12m' ? 12 : duration === '6m' ? 6 : null;
  if (!months) return 'Pendiente de elegir fecha';

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
    .format(addMonths(new Date(), months))
    .replace('.', '');
}

function Header() {
  return (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}>
        <Ionicons name="arrow-back" size={23} color={COLORS.purpleSoft} />
      </Pressable>

      <View style={styles.headerCopy}>
        <Text style={styles.headerTitle}>Configurar liquidez</Text>
        <Text style={styles.headerSubtitle}>Paso 2 de 5 · Bloqueo inicial</Text>
      </View>

      <Pressable style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}>
        <Ionicons name="help-circle-outline" size={22} color={COLORS.purpleSoft} />
      </Pressable>
    </View>
  );
}

function StepIndicator() {
  const steps = ['Liquidez', 'Airdrop', 'Publicación', 'Revisión final'];

  return (
    <View style={styles.stepBlock}>
      <View style={styles.stepTopRow}>
        <Text style={styles.stepLabel}>Paso 2 de 5</Text>
        <Text style={styles.stepTitle}>Liquidez</Text>
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
  name,
  symbol,
  network,
  supply,
}: {
  name: string;
  symbol: string;
  network: TokenNetwork;
  supply: string;
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
          <Text style={styles.summaryTitle}>{name}</Text>
          <Text style={styles.summarySubtitle}>{NETWORK_LABELS[network]} · Supply guardado</Text>
        </View>
        <View style={styles.statusPill}>
          <Ionicons name="checkmark-circle" size={13} color={COLORS.greenBright} />
          <Text style={styles.statusPillText}>Datos base guardados</Text>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <SummaryItem label="Token" value={symbol} />
        <SummaryItem label="Red" value={NETWORK_LABELS[network]} />
        <SummaryItem label="Supply total" value={`${supply} ${symbol}`} />
      </View>
    </LinearGradient>
  );
}

function UnitInput({
  label,
  value,
  onChangeText,
  unit,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  unit: string;
  placeholder: string;
  error?: string;
}) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputShell, error && styles.inputShellError]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
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

function ChipSelector<T extends string>({
  items,
  value,
  onChange,
}: {
  items: Array<{ key: T; label: string; subtitle?: string; disabled?: boolean }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
      {items.map((item) => {
        const active = item.key === value;

        return (
          <Pressable
            key={item.key}
            disabled={item.disabled}
            onPress={() => onChange(item.key)}
            style={({ pressed }) => [
              styles.optionChip,
              active && styles.optionChipActive,
              item.disabled && styles.optionChipDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>{item.label}</Text>
            {item.subtitle ? <Text style={styles.optionChipSubtitle}>{item.subtitle}</Text> : null}
          </Pressable>
        );
      })}
    </ScrollView>
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

function CostRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.costRow}>
      <Text style={[styles.costLabel, strong && styles.costLabelStrong]}>{label}</Text>
      <Text style={[styles.costValue, strong && styles.costValueStrong]}>{value}</Text>
    </View>
  );
}

function getNextStepLabel(options: { prepareAirdrop: boolean; prepareListing: boolean }) {
  if (options.prepareAirdrop) return 'Airdrop';
  if (options.prepareListing) return 'Publicación QVEX';
  return 'Revisión final';
}

function continueToNextStep(options: { prepareAirdrop: boolean; prepareListing: boolean }) {
  if (options.prepareAirdrop) {
    router.push('/create-token-airdrop' as never);
    return;
  }

  if (options.prepareListing) {
    router.push('/create-token-publication' as never);
    return;
  }

  router.push('/create-token-review' as never);
}

export function LiquidityConfigScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isSmallPhone = width < 380;
  const draft = useCreateTokenDraftStore((state) => state.draft);
  const setLiquidityConfig = useCreateTokenDraftStore((state) => state.setLiquidityConfig);
  const updateOptions = useCreateTokenDraftStore((state) => state.updateOptions);
  const tokenSymbol = (draft.symbol.trim() || 'ANYR').toUpperCase();
  const tokenName = draft.name.trim() || 'Token ANYR';
  const network = draft.network || 'solana';
  const supplyLabel = draft.supply.trim() || '100,000,000';
  const supplyNumber = parseAmount(supplyLabel) || 100000000;
  const networkDexOptions = DEX_OPTIONS[network];
  const [tokenAmount, setTokenAmount] = useState(draft.liquidityConfig?.tokenAmount ?? '10,000,000');
  const [pairAsset, setPairAsset] = useState<PairAsset>(
    draft.liquidityConfig?.pairAsset ?? DEFAULT_PAIR[network],
  );
  const [pairAmount, setPairAmount] = useState(draft.liquidityConfig?.pairAmount ?? '25');
  const [dex, setDex] = useState<LiquidityDex>(draft.liquidityConfig?.dex ?? DEFAULT_DEX[network]);
  const [lockDuration, setLockDuration] = useState<LockDuration>(
    draft.liquidityConfig?.lockDuration ?? '6m',
  );
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');

  const tokenAmountNumber = useMemo(() => parseAmount(tokenAmount), [tokenAmount]);
  const pairAmountNumber = useMemo(() => parseAmount(pairAmount), [pairAmount]);
  const percentageSupply = useMemo(() => {
    if (!tokenAmountNumber || !supplyNumber) return null;
    return (tokenAmountNumber / supplyNumber) * 100;
  }, [supplyNumber, tokenAmountNumber]);
  const initialPrice = useMemo(() => {
    if (!pairAmountNumber || !tokenAmountNumber) return null;
    return pairAmountNumber / tokenAmountNumber;
  }, [pairAmountNumber, tokenAmountNumber]);
  const estimatedLiquidityUsd = useMemo(() => {
    if (!pairAmountNumber) return null;
    return pairAmountNumber * ASSET_REFERENCE_PRICE_USD[pairAsset];
  }, [pairAmountNumber, pairAsset]);
  const costs = COSTS[network];

  const errors = useMemo(() => {
    const nextErrors: Partial<Record<'tokenAmount' | 'pairAmount' | 'supply', string>> = {};
    if (!tokenAmountNumber || tokenAmountNumber <= 0) {
      nextErrors.tokenAmount = 'Ingresa una cantidad de tokens mayor a 0.';
    }
    if (!pairAmountNumber || pairAmountNumber <= 0) {
      nextErrors.pairAmount = 'Ingresa un monto del activo par mayor a 0.';
    }
    if (tokenAmountNumber > supplyNumber) {
      nextErrors.supply = 'Los tokens a aportar no pueden superar el supply total.';
    }
    return nextErrors;
  }, [pairAmountNumber, supplyNumber, tokenAmountNumber]);

  const hasErrors = Object.keys(errors).length > 0;
  const unlockDate = formatUnlockDate(lockDuration);
  const nextStep = getNextStepLabel(draft.options);

  const buildLiquidityConfig = (enabled: boolean): LiquidityConfig => ({
    enabled,
    tokenAmount,
    pairAsset,
    pairAmount,
    dex,
    lockDuration,
    customUnlockDate: lockDuration === 'custom' ? null : unlockDate,
    estimatedLiquidityUsd,
    initialPrice,
    estimatedGas: costs.gas,
    orbitxFee: costs.fee,
    totalEstimatedCost: costs.total,
  });

  const handleSave = () => {
    setSubmitted(true);
    if (hasErrors) {
      setFeedback('Revisa los montos antes de guardar la configuración.');
      return;
    }

    setLiquidityConfig(buildLiquidityConfig(true));
    updateOptions({ lockLiquidity: true });
    setFeedback(`Configuración guardada. Siguiente paso pendiente: ${nextStep}.`);
    continueToNextStep(draft.options);
  };

  const handleSkip = () => {
    setLiquidityConfig(buildLiquidityConfig(false));
    updateOptions({ lockLiquidity: false });
    setFeedback(`Liquidez desactivada para el borrador. Siguiente paso pendiente: ${nextStep}.`);
    continueToNextStep(draft.options);
  };

  const handlePairChange = (nextPair: PairAsset) => {
    setPairAsset(nextPair);
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
        <TokenDraftSummary name={tokenName} symbol={tokenSymbol} network={network} supply={supplyLabel} />

        <View style={styles.section}>
          <SectionTitle title="Liquidez inicial" />
          <View style={styles.formCard}>
            <UnitInput
              label="Tokens a aportar"
              value={tokenAmount}
              onChangeText={setTokenAmount}
              unit={tokenSymbol}
              placeholder="10,000,000"
              error={submitted ? errors.tokenAmount ?? errors.supply : undefined}
            />

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Activo par</Text>
              <ChipSelector
                items={PAIR_OPTIONS[network].map((item) => ({ key: item, label: item }))}
                value={pairAsset}
                onChange={handlePairChange}
              />
            </View>

            <UnitInput
              label="Monto del activo par"
              value={pairAmount}
              onChangeText={setPairAmount}
              unit={pairAsset}
              placeholder="25"
              error={submitted ? errors.pairAmount : undefined}
            />

            <View style={styles.calculationCard}>
              <CalculationRow
                icon="pie-chart-outline"
                label="Porcentaje del supply"
                value={formatPercent(percentageSupply)}
              />
              <CalculationRow
                icon="cash-outline"
                label="Liquidez estimada"
                value={estimatedLiquidityUsd ? `≈ USD ${formatCompactNumber(estimatedLiquidityUsd)}` : '≈ USD --'}
              />
              <CalculationRow
                icon="analytics-outline"
                label="Precio inicial"
                value={formatInitialPrice(initialPrice, pairAsset, tokenSymbol)}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle title="DEX destino" hint="Disponible según la red." />
          <ChipSelector
            items={networkDexOptions.map((item) => ({
              key: item.key,
              label: item.label,
              subtitle: item.subtitle,
            }))}
            value={dex}
            onChange={setDex}
          />
          <Text style={styles.sectionNote}>
            Esta selección define dónde se preparará la liquidez inicial. La publicación dentro de QVEX se revisa después.
          </Text>
        </View>

        <View style={styles.section}>
          <SectionTitle title="Duración del bloqueo" />
          <ChipSelector
            items={[
              { key: '3m', label: '3m' },
              { key: '6m', label: '6m' },
              { key: '12m', label: '12m' },
              { key: 'custom', label: 'Personalizado', subtitle: 'Próximamente' },
            ]}
            value={lockDuration}
            onChange={setLockDuration}
          />
          <View style={styles.unlockCard}>
            <View style={styles.unlockIcon}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.purpleSoft} />
            </View>
            <View style={styles.unlockCopy}>
              <Text style={styles.unlockLabel}>Fecha de desbloqueo</Text>
              <Text style={styles.unlockValue}>{unlockDate}</Text>
            </View>
          </View>
          <Text style={styles.sectionNote}>La liquidez no podrá retirarse antes del vencimiento.</Text>
        </View>

        <LinearGradient
          colors={[withOpacity(COLORS.purple, 0.14), COLORS.surfaceSoft]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.trustCard}
        >
          <View style={styles.trustIcon}>
            <Ionicons name="shield-checkmark-outline" size={23} color={COLORS.purpleSoft} />
          </View>
          <View style={styles.trustCopy}>
            <Text style={styles.trustTitle}>Bloquear liquidez genera confianza</Text>
            <Text style={styles.trustBody}>
              Los usuarios podrán ver que la liquidez está protegida durante el periodo seleccionado.
              Reduce el riesgo percibido de rug-pull.
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.costCard}>
          <Text style={styles.costEyebrow}>Resumen de costos</Text>
          <CostRow label="Gas estimado" value={costs.gas} />
          <CostRow label="Comisión QVEX" value={costs.fee} />
          <CostRow label="Bloqueo de liquidez" value="Incluido" />
          <View style={styles.costDivider} />
          <CostRow label="Total aproximado" value={costs.total} strong />
          <Text style={styles.costNote}>Los costos pueden variar según la red y congestión.</Text>
        </View>

        <View style={styles.warningCard}>
          <Ionicons name="warning-outline" size={18} color={COLORS.warning} />
          <Text style={styles.warningText}>
            Revisa bien los montos. Una vez bloqueada, la liquidez no podrá retirarse hasta la fecha de desbloqueo.
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
              <Text style={styles.primaryButtonText}>Guardar configuración</Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={handleSkip} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <Text style={styles.secondaryButtonText}>Continuar sin bloquear</Text>
          </Pressable>

          <Text style={styles.ctaHint}>
            Podrás revisar todo nuevamente antes de confirmar la creación del token.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default LiquidityConfigScreen;

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
    width: '40%',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: withOpacity(COLORS.green, 0.1),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.green, 0.22),
  },
  statusPillText: {
    color: COLORS.greenBright,
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
  chipScroll: {
    gap: 9,
    paddingRight: 16,
  },
  optionChip: {
    minHeight: 44,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionChipActive: {
    backgroundColor: withOpacity(COLORS.purple, 0.22),
    borderColor: withOpacity(COLORS.purpleSoft, 0.72),
  },
  optionChipDisabled: {
    opacity: 0.56,
  },
  optionChipText: {
    color: COLORS.textSecondary,
    fontFamily: FONT.bold,
    fontSize: 13,
  },
  optionChipTextActive: {
    color: COLORS.text,
  },
  optionChipSubtitle: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 9.5,
    marginTop: 2,
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
    maxWidth: '48%',
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 12,
    textAlign: 'right',
  },
  sectionNote: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 11.5,
    lineHeight: 17,
  },
  unlockCard: {
    width: '100%',
    minHeight: 58,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unlockIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.purple, 0.14),
  },
  unlockCopy: {
    flex: 1,
    minWidth: 0,
  },
  unlockLabel: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  unlockValue: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  trustCard: {
    width: '100%',
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  trustIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.purple, 0.18),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.purpleSoft, 0.28),
  },
  trustCopy: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  trustTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 15,
  },
  trustBody: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  costCard: {
    width: '100%',
    borderRadius: 18,
    padding: 16,
    gap: 10,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  costEyebrow: {
    color: COLORS.textMuted,
    fontFamily: FONT.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  costLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  costLabelStrong: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 15,
  },
  costValue: {
    color: COLORS.text,
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  costValueStrong: {
    color: COLORS.purpleSoft,
    fontFamily: FONT.bold,
    fontSize: 16,
  },
  costDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  costNote: {
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
