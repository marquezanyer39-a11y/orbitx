import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONT, ORBITX_COLORS, RADII, withOpacity } from '../../constants/theme';
import { FEATURE_STATUS } from '../../src/constants/featureStatus';
import {
  useCreateTokenDraftStore,
  type CreateTokenDraft,
  type TokenNetwork,
  type TokenType,
} from '../../src/store/createTokenDraftStore';

interface CreateTokenWizardProps {
  standalone?: boolean;
}

type DraftField = Omit<CreateTokenDraft, 'liquidityConfig' | 'airdropConfig' | 'publicationConfig'>;

const COLORS = {
  ...ORBITX_COLORS,
  text: ORBITX_COLORS.textPrimary,
  textSecondary: ORBITX_COLORS.textSecondary,
  textMuted: ORBITX_COLORS.textMuted,
  greenBright: ORBITX_COLORS.green,
};

const TOKEN_TYPES: Array<{
  key: TokenType;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  {
    key: 'standard',
    title: 'Token estándar',
    subtitle: 'Proyectos, utilidad',
    icon: 'cube-outline',
  },
  {
    key: 'memecoin',
    title: 'Memecoin',
    subtitle: 'Viral, comunidad',
    icon: 'rocket-outline',
  },
];

const NETWORKS: Array<{
  key: TokenNetwork;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  decimals: string;
}> = [
  { key: 'ethereum', title: 'Ethereum', icon: 'diamond-outline', color: '#3BA7FF', decimals: '18' },
  { key: 'bnb', title: 'BNB Chain', icon: 'logo-bitcoin', color: '#F3BA2F', decimals: '18' },
  { key: 'solana', title: 'Solana', icon: 'git-network-outline', color: '#14F195', decimals: '9' },
  { key: 'polygon', title: 'Polygon', icon: 'analytics-outline', color: COLORS.purpleSoft, decimals: '18' },
  { key: 'base', title: 'Base', icon: 'layers-outline', color: '#3BA7FF', decimals: '18' },
];

const ADVANCED_OPTIONS: Array<{
  key: 'lockLiquidity' | 'prepareAirdrop' | 'prepareListing';
  title: string;
  subtitle: string;
  helper: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  {
    key: 'lockLiquidity',
    title: 'Bloquear liquidez',
    subtitle: 'Recomendado para generar confianza.',
    helper: 'Después de los datos base, podrás definir monto, par, DEX y tiempo de bloqueo.',
    icon: 'lock-closed-outline',
  },
  {
    key: 'prepareAirdrop',
    title: 'Preparar airdrop',
    subtitle: 'Distribución comunitaria.',
    helper: 'Después podrás definir cantidad, requisitos y participantes del airdrop.',
    icon: 'gift-outline',
  },
  {
    key: 'prepareListing',
    title: 'Publicación QVEX',
    subtitle: 'Solicita visibilidad dentro de QVEX.',
    helper: 'Después podrás revisar requisitos para solicitar visibilidad en QVEX.',
    icon: 'list-outline',
  },
];

const COSTS: Record<TokenNetwork, { gas: string; fee: string; total: string }> = {
  ethereum: { gas: '0.006 ETH', fee: '0.020 ETH', total: '0.026 ETH' },
  bnb: { gas: '0.010 BNB', fee: '0.080 BNB', total: '0.090 BNB' },
  solana: { gas: '0.024 SOL', fee: '0.100 SOL', total: '0.124 SOL' },
  polygon: { gas: '0.600 MATIC', fee: '12.000 MATIC', total: '12.600 MATIC' },
  base: { gas: '0.001 ETH', fee: '0.010 ETH', total: '0.011 ETH' },
};

function isPositiveNumber(value: string) {
  const normalized = value.replace(/,/g, '').trim();
  const numberValue = Number(normalized);

  return Number.isFinite(numberValue) && numberValue > 0;
}

function Header() {
  return (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}>
        <Ionicons name="arrow-back" size={23} color={COLORS.purpleSoft} />
      </Pressable>

      <View style={styles.headerCopy}>
        <Text style={styles.headerTitle}>Crear token</Text>
        <Text style={styles.headerSubtitle}>Lanza tu proyecto en minutos</Text>
      </View>

      <Pressable style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}>
        <Ionicons name="help-circle-outline" size={22} color={COLORS.purpleSoft} />
      </Pressable>
    </View>
  );
}

function StepIndicator() {
  const steps = ['Datos del token', 'Liquidez', 'Airdrop', 'Publicación', 'Revisión final'];

  return (
    <View style={styles.stepBlock}>
      <View style={styles.stepTopRow}>
        <Text style={styles.stepLabel}>Paso 1 de 5</Text>
        <Text style={styles.stepTitle}>Datos del token</Text>
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

function IntroCard() {
  return (
    <LinearGradient
      colors={[COLORS.surface, COLORS.surfaceSoft]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.introCard}
    >
      <View style={styles.introGlow} pointerEvents="none" />
      <View style={styles.chipRow}>
        <View style={[styles.tinyChip, { borderColor: withOpacity(COLORS.greenBright, 0.3) }]}>
          <Text style={[styles.tinyChipText, { color: COLORS.greenBright }]}>Web3</Text>
        </View>
        <View style={styles.tinyChip}>
          <Text style={styles.tinyChipText}>Sin código</Text>
        </View>
      </View>
      <Text style={styles.introTitle}>Crea tu token en QVEX</Text>
      <Text style={styles.introBody}>
        Configura los datos base de tu token. Luego podrás revisar liquidez, airdrop y publicación antes de confirmar.
      </Text>
      <Text style={styles.introHint}>Flujo guiado para crear tokens de forma simple y controlada.</Text>
      <View style={styles.demoInlineNotice}>
        <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.warning} />
        <Text style={styles.demoInlineText}>{FEATURE_STATUS.createToken.notice}</Text>
      </View>
    </LinearGradient>
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

function TypeSelector({
  value,
  onChange,
}: {
  value: TokenType;
  onChange: (value: TokenType) => void;
}) {
  return (
    <View style={styles.typeGrid}>
      {TOKEN_TYPES.map((item) => {
        const active = item.key === value;

        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            style={({ pressed }) => [
              styles.typeCard,
              active && styles.typeCardActive,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name={item.icon} size={24} color={active ? COLORS.text : COLORS.textMuted} />
            <Text style={[styles.typeTitle, active && styles.typeTitleActive]}>{item.title}</Text>
            <Text style={[styles.typeSubtitle, active && styles.typeSubtitleActive]}>{item.subtitle}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function NetworkSelector({
  value,
  onChange,
}: {
  value: TokenNetwork;
  onChange: (value: TokenNetwork) => void;
}) {
  return (
    <View style={styles.section}>
      <SectionTitle title="Red blockchain" hint="Las tarifas pueden variar según la red." />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.networkRow}>
        {NETWORKS.map((network) => {
          const active = network.key === value;

          return (
            <Pressable
              key={network.key}
              onPress={() => onChange(network.key)}
              style={({ pressed }) => [
                styles.networkChip,
                active && styles.networkChipActive,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.networkIcon, { backgroundColor: withOpacity(network.color, 0.14) }]}>
                <Ionicons name={network.icon} size={17} color={network.color} />
              </View>
              <Text style={[styles.networkText, active && styles.networkTextActive]}>{network.title}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'numeric';
  multiline?: boolean;
  error?: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={withOpacity(COLORS.textSecondary, 0.48)}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.input, multiline && styles.inputMultiline, error && styles.inputError]}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

function LogoUpload({
  logoUri,
  onUpload,
}: {
  logoUri: string | null;
  onUpload: () => void;
}) {
  return (
    <View style={styles.logoCard}>
      <View style={styles.logoPreview}>
        {logoUri ? (
          <Image source={{ uri: logoUri }} style={styles.logoImage} />
        ) : (
          <Ionicons name="image-outline" size={26} color={COLORS.textMuted} />
        )}
      </View>
      <View style={styles.logoCopy}>
        <Text style={styles.logoTitle}>Logo del token</Text>
        <Text style={styles.logoBody}>PNG, JPG o GIF. Recomendado 256x256 px.</Text>
        <Pressable onPress={onUpload} style={({ pressed }) => [styles.logoButton, pressed && styles.pressed]}>
          <Text style={styles.logoButtonText}>Subir imagen</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SwitchControl({ active }: { active: boolean }) {
  return (
    <View style={[styles.switchTrack, active && styles.switchTrackActive]}>
      <View style={[styles.switchKnob, active && styles.switchKnobActive]} />
    </View>
  );
}

function AdvancedOptions({
  values,
  onToggle,
}: {
  values: DraftField['options'];
  onToggle: (key: keyof Omit<DraftField['options'], 'audit'>) => void;
}) {
  return (
    <View style={styles.section}>
      <SectionTitle title="Opciones avanzadas" hint="Pasos futuros" />
      <View style={styles.advancedList}>
        {ADVANCED_OPTIONS.map((item) => {
          const active = values[item.key];

          return (
            <View key={item.key} style={[styles.advancedCard, active && styles.advancedCardActive]}>
              <Pressable
                onPress={() => onToggle(item.key)}
                style={({ pressed }) => [styles.advancedHeader, pressed && styles.pressed]}
              >
                <View style={styles.advancedLeft}>
                  <View style={styles.advancedIcon}>
                    <Ionicons name={item.icon} size={18} color={active ? COLORS.purpleSoft : COLORS.textMuted} />
                  </View>
                  <View style={styles.advancedCopy}>
                    <Text style={styles.advancedTitle}>{item.title}</Text>
                    <Text style={styles.advancedSubtitle}>{item.subtitle}</Text>
                    <Text style={styles.futureLabel}>Se configura después</Text>
                  </View>
                </View>
                <SwitchControl active={active} />
              </Pressable>

              {active ? (
                <View style={styles.advancedHelper}>
                  <Text style={styles.advancedHelperText}>{item.helper}</Text>
                </View>
              ) : null}
            </View>
          );
        })}

        <View style={[styles.advancedCard, styles.disabledCard]}>
          <View style={styles.advancedHeader}>
            <View style={styles.advancedLeft}>
              <View style={styles.advancedIcon}>
                <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.textMuted} />
              </View>
              <View style={styles.advancedCopy}>
                <Text style={styles.advancedTitleMuted}>Auditoría</Text>
                <Text style={styles.advancedSubtitle}>Verificación externa del contrato.</Text>
                <Text style={styles.disabledLabel}>Próximamente</Text>
              </View>
            </View>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} />
          </View>
        </View>
      </View>
    </View>
  );
}

function CostEstimate({ network }: { network: TokenNetwork }) {
  const cost = COSTS[network];

  return (
    <View style={styles.costCard}>
      <Text style={styles.costEyebrow}>Estimación de costos</Text>
      <View style={styles.costRows}>
        <CostRow label="Tarifa de gas estimada" value={cost.gas} />
        <CostRow label="Comisión QVEX" value={cost.fee} />
        <View style={styles.costDivider} />
        <CostRow label="Total aproximado" value={cost.total} strong />
      </View>
      <View style={styles.warningRow}>
        <Ionicons name="alert-circle-outline" size={15} color={COLORS.warning} />
        <Text style={styles.warningText}>Los costos pueden variar según la red y congestión.</Text>
      </View>
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

function ContinueBlock({
  disabled,
  message,
  onContinue,
}: {
  disabled: boolean;
  message: string;
  onContinue: () => void;
}) {
  return (
    <View style={styles.continueBlock}>
      {message ? (
        <View style={[styles.feedbackCard, disabled ? styles.feedbackError : styles.feedbackReady]}>
          <Ionicons
            name={disabled ? 'alert-circle-outline' : 'checkmark-circle-outline'}
            size={17}
            color={disabled ? COLORS.warning : COLORS.greenBright}
          />
          <Text style={styles.feedbackText}>{message}</Text>
        </View>
      ) : null}
      <Pressable onPress={onContinue} style={({ pressed }) => [styles.ctaButton, pressed && styles.pressed]}>
        <LinearGradient colors={[COLORS.purple, COLORS.purpleSoft]} style={styles.ctaGradient}>
          <Text style={styles.ctaText}>Continuar</Text>
        </LinearGradient>
      </Pressable>
      <Text style={styles.ctaHint}>
        Podrás revisar liquidez, airdrop, publicación y costos antes de confirmar.
      </Text>
    </View>
  );
}

export function CreateTokenWizard({ standalone = false }: CreateTokenWizardProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isSmallPhone = width < 380;
  const setBaseDraft = useCreateTokenDraftStore((state) => state.setBaseDraft);
  const [tokenType, setTokenType] = useState<TokenType>('standard');
  const [network, setNetwork] = useState<TokenNetwork>('solana');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [decimals, setDecimals] = useState('9');
  const [supply, setSupply] = useState('');
  const [description, setDescription] = useState('');
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [lockLiquidity, setLockLiquidity] = useState(true);
  const [prepareAirdrop, setPrepareAirdrop] = useState(false);
  const [prepareListing, setPrepareListing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const targetDecimals = NETWORKS.find((item) => item.key === network)?.decimals ?? '18';
    setDecimals((current) => (current.trim() ? current : targetDecimals));
  }, [network]);

  const draft = useMemo<DraftField>(
    () => ({
      tokenType,
      network,
      name,
      symbol,
      decimals,
      supply,
      description,
      logoUri,
      options: {
        lockLiquidity,
        prepareAirdrop,
        prepareListing,
        audit: false,
      },
    }),
    [decimals, description, lockLiquidity, logoUri, name, network, prepareAirdrop, prepareListing, supply, symbol, tokenType],
  );

  const errors = useMemo(() => {
    const nextErrors: Partial<Record<'name' | 'symbol' | 'decimals' | 'supply', string>> = {};

    if (!name.trim()) nextErrors.name = 'El nombre es requerido.';
    if (!symbol.trim()) nextErrors.symbol = 'El símbolo es requerido.';
    if (!decimals.trim() || !Number.isInteger(Number(decimals)) || Number(decimals) < 0) {
      nextErrors.decimals = 'Usa un número entero válido.';
    }
    if (!supply.trim() || !isPositiveNumber(supply)) {
      nextErrors.supply = 'El supply debe ser un número positivo.';
    }

    return nextErrors;
  }, [decimals, name, supply, symbol]);

  const hasErrors = Object.keys(errors).length > 0;

  const handleNetworkChange = (nextNetwork: TokenNetwork) => {
    setNetwork(nextNetwork);
    setDecimals(NETWORKS.find((item) => item.key === nextNetwork)?.decimals ?? '18');
  };

  const handleLogoUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled) {
      setLogoUri(result.assets[0]?.uri ?? null);
      setFeedback('Logo agregado al borrador local.');
    }
  };

  const handleContinue = () => {
    setSubmitted(true);

    if (hasErrors) {
      setFeedback('Completa nombre, símbolo, decimales y supply para continuar.');
      return;
    }

    setBaseDraft(draft);
    const nextStep = lockLiquidity
      ? 'liquidez'
      : prepareAirdrop
        ? 'airdrop'
        : prepareListing
          ? 'publicación QVEX'
          : 'revisión final';
    setFeedback(`Borrador guardado localmente. El siguiente paso será ${nextStep}.`);

    if (lockLiquidity) {
      router.push('/create-token-liquidity' as never);
      return;
    }

    if (prepareAirdrop) {
      router.push('/create-token-airdrop' as never);
      return;
    }

    if (prepareListing) {
      router.push('/create-token-publication' as never);
      return;
    }

    router.push('/create-token-review' as never);
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
          { paddingBottom: Math.max(insets.bottom, 10) + (standalone ? 34 : 120) },
        ]}
      >
        <Header />
        <StepIndicator />
        <IntroCard />

        <View style={styles.section}>
          <SectionTitle title="Tipo de token" />
          <TypeSelector value={tokenType} onChange={setTokenType} />
        </View>

        <NetworkSelector value={network} onChange={handleNetworkChange} />

        <View style={styles.section}>
          <SectionTitle title="Datos del token" />
          <View style={styles.formCard}>
            <Field
              label="Nombre"
              value={name}
              onChangeText={setName}
              placeholder="Ej: QVEX Utility"
              error={submitted ? errors.name : undefined}
            />
            <Field
              label="Símbolo"
              value={symbol}
              onChangeText={(value) => setSymbol(value.toUpperCase().replace(/\s/g, ''))}
              placeholder="Ej: ORBX"
              error={submitted ? errors.symbol : undefined}
            />
            <Field
              label="Decimales"
              value={decimals}
              onChangeText={setDecimals}
              placeholder={network === 'solana' ? '9' : '18'}
              keyboardType="numeric"
              error={submitted ? errors.decimals : undefined}
            />
            <Field
              label="Supply total"
              value={supply}
              onChangeText={setSupply}
              placeholder="1,000,000,000"
              keyboardType="numeric"
              error={submitted ? errors.supply : undefined}
            />
            <Field
              label="Descripción corta"
              value={description}
              onChangeText={setDescription}
              placeholder="Describe brevemente el propósito de tu token..."
              multiline
            />
          </View>
        </View>

        <LogoUpload logoUri={logoUri} onUpload={handleLogoUpload} />

        <AdvancedOptions
          values={{
            lockLiquidity,
            prepareAirdrop,
            prepareListing,
            audit: false,
          }}
          onToggle={(key) => {
            if (key === 'lockLiquidity') setLockLiquidity((value) => !value);
            if (key === 'prepareAirdrop') setPrepareAirdrop((value) => !value);
            if (key === 'prepareListing') setPrepareListing((value) => !value);
          }}
        />

        <CostEstimate network={network} />

        <View style={styles.disclaimerCard}>
          <Ionicons name="warning-outline" size={17} color={COLORS.warning} />
          <Text style={styles.disclaimerText}>
            Crear un token implica riesgos. Revisa todos los datos antes de confirmar.
          </Text>
        </View>

        <ContinueBlock disabled={submitted && hasErrors} message={feedback} onContinue={handleContinue} />
      </ScrollView>
    </SafeAreaView>
  );
}

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
    letterSpacing: 1.4,
  },
  headerSubtitle: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 11,
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
    width: '20%',
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
  introCard: {
    width: '100%',
    minHeight: 138,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    gap: 8,
  },
  introGlow: {
    position: 'absolute',
    right: -54,
    top: -54,
    width: 154,
    height: 154,
    borderRadius: 77,
    backgroundColor: withOpacity(COLORS.purpleSoft, 0.16),
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tinyChip: {
    minHeight: 24,
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tinyChipText: {
    color: COLORS.purpleSoft,
    fontFamily: FONT.bold,
    fontSize: 10,
  },
  introTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 23,
    lineHeight: 29,
    marginTop: 4,
  },
  introBody: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 13.5,
    lineHeight: 20,
  },
  introHint: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 11.5,
    lineHeight: 16,
  },
  demoInlineNotice: {
    minHeight: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: withOpacity(COLORS.warning, 0.22),
    backgroundColor: withOpacity(COLORS.warning, 0.07),
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  demoInlineText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 10.5,
    lineHeight: 15,
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
    color: COLORS.warning,
    fontFamily: FONT.medium,
    fontSize: 11,
    textAlign: 'right',
  },
  typeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  typeCard: {
    flex: 1,
    minHeight: 94,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 5,
  },
  typeCardActive: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purpleSoft,
  },
  typeTitle: {
    color: COLORS.textSecondary,
    fontFamily: FONT.bold,
    fontSize: 15,
    textAlign: 'center',
  },
  typeTitleActive: {
    color: COLORS.text,
  },
  typeSubtitle: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 11,
    textAlign: 'center',
  },
  typeSubtitleActive: {
    color: withOpacity(COLORS.text, 0.82),
  },
  networkRow: {
    gap: 10,
    paddingRight: 16,
  },
  networkChip: {
    minHeight: 48,
    borderRadius: 13,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  networkChipActive: {
    borderColor: COLORS.purpleSoft,
    backgroundColor: withOpacity(COLORS.purple, 0.18),
  },
  networkIcon: {
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkText: {
    color: COLORS.textSecondary,
    fontFamily: FONT.bold,
    fontSize: 13,
  },
  networkTextActive: {
    color: COLORS.text,
  },
  formCard: {
    width: '100%',
    gap: 12,
  },
  fieldWrap: {
    gap: 6,
  },
  fieldLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
    marginLeft: 2,
  },
  input: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: withOpacity('#FFFFFF', 0.08),
    paddingHorizontal: 14,
    color: COLORS.text,
    fontFamily: FONT.medium,
    fontSize: 14,
  },
  inputMultiline: {
    minHeight: 84,
    paddingTop: 13,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: withOpacity(COLORS.warning, 0.78),
  },
  fieldError: {
    color: COLORS.warning,
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  logoCard: {
    width: '100%',
    minHeight: 108,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceSoft,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  logoPreview: {
    width: 64,
    height: 64,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: withOpacity('#FFFFFF', 0.18),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  logoTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 15,
  },
  logoBody: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 17,
  },
  logoButton: {
    alignSelf: 'flex-start',
    minHeight: 28,
    borderRadius: RADII.pill,
    paddingHorizontal: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.purple, 0.16),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.purpleSoft, 0.28),
  },
  logoButtonText: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 11,
  },
  advancedList: {
    gap: 9,
  },
  advancedCard: {
    width: '100%',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceSoft,
    overflow: 'hidden',
  },
  advancedCardActive: {
    borderColor: withOpacity(COLORS.purpleSoft, 0.72),
  },
  disabledCard: {
    opacity: 0.56,
  },
  advancedHeader: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 12,
  },
  advancedLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    minWidth: 0,
  },
  advancedIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.purple, 0.12),
  },
  advancedCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  advancedTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  advancedTitleMuted: {
    color: COLORS.textSecondary,
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  advancedSubtitle: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 11.5,
  },
  futureLabel: {
    color: COLORS.greenBright,
    fontFamily: FONT.bold,
    fontSize: 9.5,
    textTransform: 'uppercase',
  },
  disabledLabel: {
    color: COLORS.textMuted,
    fontFamily: FONT.bold,
    fontSize: 9.5,
    textTransform: 'uppercase',
  },
  advancedHelper: {
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  advancedHelperText: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 18,
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
    backgroundColor: withOpacity(COLORS.purple, 0.42),
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
  costCard: {
    width: '100%',
    borderRadius: 18,
    padding: 16,
    gap: 12,
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
  costRows: {
    gap: 10,
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
    color: '#D9C8FF',
    fontFamily: FONT.bold,
    fontSize: 16,
  },
  costDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  warningText: {
    flex: 1,
    color: COLORS.warning,
    fontFamily: FONT.medium,
    fontSize: 11,
    lineHeight: 15,
  },
  disclaimerCard: {
    width: '100%',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    gap: 9,
    backgroundColor: withOpacity(COLORS.warning, 0.08),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.warning, 0.2),
  },
  disclaimerText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 17,
  },
  continueBlock: {
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
  ctaButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: 14,
    overflow: 'hidden',
  },
  ctaGradient: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 15,
  },
  ctaHint: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 18,
  },
});
