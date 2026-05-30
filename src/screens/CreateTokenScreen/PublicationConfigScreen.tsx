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
  type PublicationConfig,
  type TokenNetwork,
  type VisibilityLevel,
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

const VISIBILITY_LEVELS: Array<{
  key: VisibilityLevel;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: string;
}> = [
  {
    key: 'basic',
    title: 'Básico',
    subtitle: 'Aparece en tu perfil y enlaces compartidos.',
    icon: 'eye-outline',
  },
  {
    key: 'community',
    title: 'Comunidad',
    subtitle: 'Visible para holders y campañas.',
    icon: 'people-outline',
  },
  {
    key: 'featured',
    title: 'Destacado',
    subtitle: 'Requiere revisión y criterios adicionales.',
    icon: 'star-outline',
    badge: 'Revisión requerida',
  },
];

function Header() {
  return (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}>
        <Ionicons name="arrow-back" size={23} color={COLORS.purpleSoft} />
      </Pressable>

      <View style={styles.headerCopy}>
        <Text style={styles.headerTitle}>Publicación QVEX</Text>
        <Text style={styles.headerSubtitle}>Paso 4 de 5 · Visibilidad del proyecto</Text>
      </View>

      <Pressable style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}>
        <Ionicons name="information-circle-outline" size={22} color={COLORS.purpleSoft} />
      </Pressable>
    </View>
  );
}

function StepIndicator() {
  return (
    <View style={styles.stepBlock}>
      <View style={styles.stepTopRow}>
        <Text style={styles.stepLabel}>Paso 4 de 5</Text>
        <Text style={styles.stepTitle}>Publicación</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>
      <View style={styles.stepChips}>
        <View style={[styles.stepChip, styles.stepChipActive]}>
          <Text style={[styles.stepChipText, styles.stepChipTextActive]}>Visibilidad en QVEX</Text>
        </View>
        <View style={styles.stepChip}>
          <Text style={styles.stepChipText}>Revisión final</Text>
        </View>
      </View>
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
  liquidityStatus,
  airdropStatus,
}: {
  symbol: string;
  network: TokenNetwork;
  liquidityStatus: string;
  airdropStatus: string;
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
          <Text style={styles.summarySubtitle}>{NETWORK_LABELS[network]} · Pendiente de publicación</Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>Pendiente</Text>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <SummaryItem label="Liquidez" value={liquidityStatus} />
        <SummaryItem label="Airdrop" value={airdropStatus} />
        <SummaryItem label="Estado" value="Solicitud" />
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

function PublicationStatusCard({
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
          <Ionicons name="planet-outline" size={22} color={COLORS.purpleSoft} />
        </View>
        <View style={styles.statusCopy}>
          <Text style={styles.statusTitle}>Publicar en QVEX</Text>
          <Text style={styles.statusSubtitle}>
            Solicita que tu token sea visible dentro del ecosistema QVEX.
          </Text>
        </View>
        <Pressable onPress={onToggle} style={({ pressed }) => [styles.switchPressable, pressed && styles.pressed]}>
          <SwitchControl active={enabled} />
        </Pressable>
      </View>
      <View style={[styles.stateLine, enabled ? styles.stateLineActive : styles.stateLineMuted]}>
        <View style={[styles.stateDot, enabled && styles.stateDotActive]} />
        <Text style={[styles.stateText, enabled && styles.stateTextActive]}>
          {enabled ? 'Solicitud activa' : 'Puedes crear tu token sin publicarlo en QVEX.'}
        </Text>
      </View>
    </View>
  );
}

function VisibilityCard({
  item,
  active,
  disabled,
  onPress,
}: {
  item: (typeof VISIBILITY_LEVELS)[number];
  active: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.visibilityCard,
        active && styles.visibilityCardActive,
        disabled && styles.disabledBlock,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.visibilityTop}>
        <View style={styles.visibilityIcon}>
          <Ionicons name={item.icon} size={18} color={active ? COLORS.purpleSoft : COLORS.textMuted} />
        </View>
        <View style={styles.visibilityCopy}>
          <View style={styles.visibilityTitleRow}>
            <Text style={styles.visibilityTitle}>{item.title}</Text>
            {item.badge ? <Text style={styles.visibilityBadge}>{item.badge}</Text> : null}
          </View>
          <Text style={styles.visibilitySubtitle}>{item.subtitle}</Text>
        </View>
        <Ionicons
          name={active ? 'radio-button-on' : 'radio-button-off'}
          size={20}
          color={active ? COLORS.purpleSoft : COLORS.textMuted}
        />
      </View>
    </Pressable>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  editable = true,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  editable?: boolean;
  error?: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor={withOpacity(COLORS.textSecondary, 0.48)}
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          !editable && styles.inputDisabled,
          error && styles.inputError,
        ]}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

function ChecklistRow({ label, done }: { label: string; done: boolean }) {
  return (
    <View style={styles.checkRow}>
      <Ionicons
        name={done ? 'checkmark-circle' : 'ellipse-outline'}
        size={17}
        color={done ? COLORS.greenBright : COLORS.warning}
      />
      <Text style={styles.checkLabel}>{label}</Text>
      <Text style={[styles.checkState, done ? styles.checkDone : styles.checkPending]}>
        {done ? 'Listo' : 'Pendiente'}
      </Text>
    </View>
  );
}

function BadgePreview({ label, active }: { label: string; active: boolean }) {
  return (
    <View style={[styles.badgePreview, active && styles.badgePreviewActive]}>
      <Text style={[styles.badgePreviewText, active && styles.badgePreviewTextActive]}>{label}</Text>
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

export function PublicationConfigScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isSmallPhone = width < 380;
  const draft = useCreateTokenDraftStore((state) => state.draft);
  const setPublicationConfig = useCreateTokenDraftStore((state) => state.setPublicationConfig);
  const updateOptions = useCreateTokenDraftStore((state) => state.updateOptions);
  const tokenSymbol = (draft.symbol.trim() || 'ANYR').toUpperCase();
  const tokenName = draft.name.trim() || 'Anyer Token';
  const network = draft.network || 'solana';
  const savedConfig = draft.publicationConfig;
  const [enabled, setEnabled] = useState(savedConfig?.enabled ?? true);
  const [visibilityLevel, setVisibilityLevel] = useState<VisibilityLevel>(
    savedConfig?.visibilityLevel ?? 'community',
  );
  const [projectName, setProjectName] = useState(savedConfig?.projectName || tokenName);
  const [shortDescription, setShortDescription] = useState(
    savedConfig?.shortDescription || draft.description || 'Proyecto Web3 preparado para QVEX.',
  );
  const [website, setWebsite] = useState(savedConfig?.website ?? '');
  const [twitter, setTwitter] = useState(savedConfig?.twitter ?? '');
  const [telegramOrDiscord, setTelegramOrDiscord] = useState(savedConfig?.telegramOrDiscord ?? '');
  const [whitepaper, setWhitepaper] = useState(savedConfig?.whitepaper ?? '');
  const [acceptedRules, setAcceptedRules] = useState(savedConfig?.acceptedRules ?? false);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');

  const liquidityLocked = Boolean(draft.liquidityConfig?.enabled);
  const logoLoaded = Boolean(draft.logoUri);
  const descriptionComplete = shortDescription.trim().length >= 12;
  const officialLinks = Boolean(website.trim() || twitter.trim() || telegramOrDiscord.trim() || whitepaper.trim());
  const airdropReady = draft.airdropConfig ? (draft.airdropConfig.enabled ? 'Configurado' : 'Omitido') : 'Pendiente';
  const badges = useMemo(
    () => ({
      lockedLiquidity: liquidityLocked,
      communityActive: visibilityLevel !== 'basic',
      airdrop: Boolean(draft.airdropConfig?.enabled),
      newProject: true,
      inReview: enabled,
    }),
    [draft.airdropConfig?.enabled, enabled, liquidityLocked, visibilityLevel],
  );

  const errors = useMemo(() => {
    const nextErrors: Partial<Record<'projectName' | 'shortDescription' | 'featuredLinks', string>> = {};
    if (!enabled) return nextErrors;
    if (!projectName.trim()) nextErrors.projectName = 'Agrega el nombre del proyecto.';
    if (!shortDescription.trim()) nextErrors.shortDescription = 'Agrega una descripción corta.';
    if (visibilityLevel === 'featured' && (!website.trim() || !whitepaper.trim())) {
      nextErrors.featuredLinks = 'Destacado requiere sitio web y documento del proyecto.';
    }
    return nextErrors;
  }, [enabled, projectName, shortDescription, visibilityLevel, website, whitepaper]);

  const hasErrors = Object.keys(errors).length > 0;

  const buildPublicationConfig = (configEnabled: boolean): PublicationConfig => ({
    enabled: configEnabled,
    visibilityLevel,
    projectName,
    shortDescription,
    website,
    twitter,
    telegramOrDiscord,
    whitepaper,
    badges: {
      ...badges,
      inReview: configEnabled,
    },
    acceptedRules,
    estimatedFee: 0,
  });

  const handleSave = () => {
    setSubmitted(true);
    if (enabled && hasErrors) {
      setFeedback('Revisa los datos recomendados antes de guardar la publicación.');
      return;
    }

    setPublicationConfig(buildPublicationConfig(enabled));
    updateOptions({ prepareListing: enabled });
    setFeedback(
      enabled
        ? 'Publicación guardada. Siguiente paso: Revisión final.'
        : 'Publicación omitida. Siguiente paso: Revisión final.',
    );
    router.push('/create-token-review' as never);
  };

  const handleSkip = () => {
    setEnabled(false);
    setPublicationConfig(buildPublicationConfig(false));
    updateOptions({ prepareListing: false });
    setFeedback('Publicación omitida. Siguiente paso: Revisión final.');
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
          { paddingBottom: Math.max(insets.bottom, 10) + 120 },
        ]}
      >
        <Header />
        <StepIndicator />
        <TokenDraftSummary
          symbol={tokenSymbol}
          network={network}
          liquidityStatus={liquidityLocked ? 'Bloqueada' : 'Omitida'}
          airdropStatus={airdropReady}
        />

        <PublicationStatusCard enabled={enabled} onToggle={() => setEnabled((value) => !value)} />

        <View style={[styles.section, !enabled && styles.disabledBlock]}>
          <SectionTitle title="Nivel de visibilidad" />
          <View style={styles.visibilityList}>
            {VISIBILITY_LEVELS.map((item) => (
              <VisibilityCard
                key={item.key}
                item={item}
                active={visibilityLevel === item.key}
                disabled={!enabled}
                onPress={() => setVisibilityLevel(item.key)}
              />
            ))}
          </View>
        </View>

        <View style={[styles.section, !enabled && styles.disabledBlock]}>
          <SectionTitle title="Datos del proyecto" hint="Ayudan a evaluar el proyecto." />
          <View style={styles.formCard}>
            <Field
              label="Nombre del proyecto"
              value={projectName}
              onChangeText={setProjectName}
              placeholder="Anyer Protocol"
              editable={enabled}
              error={submitted ? errors.projectName : undefined}
            />
            <Field
              label="Descripción corta"
              value={shortDescription}
              onChangeText={setShortDescription}
              placeholder="Describe el propósito del token..."
              multiline
              editable={enabled}
              error={submitted ? errors.shortDescription : undefined}
            />
            <Field label="Sitio web" value={website} onChangeText={setWebsite} placeholder="https://" editable={enabled} />
            <View style={styles.twoColumns}>
              <Field label="X / Twitter" value={twitter} onChangeText={setTwitter} placeholder="@proyecto" editable={enabled} />
              <Field
                label="Telegram / Discord"
                value={telegramOrDiscord}
                onChangeText={setTelegramOrDiscord}
                placeholder="https://"
                editable={enabled}
              />
            </View>
            <Field
              label="Whitepaper o documento"
              value={whitepaper}
              onChangeText={setWhitepaper}
              placeholder="https://docs.proyecto.io"
              editable={enabled}
              error={submitted ? errors.featuredLinks : undefined}
            />
          </View>
        </View>

        <View style={[styles.section, !enabled && styles.disabledBlock]}>
          <SectionTitle title="Requisitos de confianza" />
          <View style={styles.checkCard}>
            <ChecklistRow label="Liquidez bloqueada" done={liquidityLocked} />
            <ChecklistRow label="Logo cargado" done={logoLoaded} />
            <ChecklistRow label="Descripción completa" done={descriptionComplete} />
            <ChecklistRow label="Enlaces oficiales" done={officialLinks} />
            <ChecklistRow label="Airdrop configurado u omitido" done={Boolean(draft.airdropConfig)} />
            <Pressable onPress={() => setAcceptedRules((value) => !value)} style={({ pressed }) => [pressed && styles.pressed]}>
              <ChecklistRow label="Riesgos aceptados" done={acceptedRules} />
            </Pressable>
          </View>
        </View>

        <View style={[styles.section, !enabled && styles.disabledBlock]}>
          <SectionTitle title="Badges visibles" hint="Preview visual" />
          <View style={styles.badgesRow}>
            <BadgePreview label="Liquidez bloqueada" active={badges.lockedLiquidity} />
            <BadgePreview label="Comunidad activa" active={badges.communityActive} />
            <BadgePreview label="Airdrop" active={badges.airdrop} />
            <BadgePreview label="Nuevo proyecto" active={badges.newProject} />
            <BadgePreview label="En revisión" active={badges.inReview} />
          </View>
        </View>

        <View style={[styles.previewCard, !enabled && styles.disabledBlock]}>
          <Text style={styles.previewTitle}>Vista previa en QVEX</Text>
          <View style={styles.marketPreview}>
            <View style={styles.previewLogo}>
              <Text style={styles.previewLogoText}>{tokenSymbol.slice(0, 3)}</Text>
            </View>
            <View style={styles.previewCopy}>
              <Text style={styles.previewToken}>{tokenSymbol} / {projectName || tokenName}</Text>
              <Text style={styles.previewNetwork}>Red {NETWORK_LABELS[network]}</Text>
              <View style={styles.previewBadgeRow}>
                <Text style={styles.previewBadge}>Liquidez bloqueada</Text>
                <Text style={styles.previewBadgeMuted}>Nuevo</Text>
              </View>
            </View>
            <Text style={styles.previewStatus}>{enabled ? 'En revisión' : 'Omitido'}</Text>
          </View>
        </View>

        <View style={styles.rulesCard}>
          <Ionicons name="warning-outline" size={18} color={COLORS.warning} />
          <View style={styles.rulesCopy}>
            <Text style={styles.rulesTitle}>QVEX revisa los proyectos antes de destacarlos</Text>
            <Text style={styles.rulesBody}>
              La publicación puede requerir validación de datos, revisión de riesgos y cumplimiento de requisitos mínimos.
            </Text>
          </View>
        </View>

        <View style={styles.costCard}>
          <CostRow label="Solicitud de publicación" value="Gratis" />
          <CostRow label="Revisión destacada" value="Próximamente" />
          <CostRow label="Comisión QVEX" value="0.000 SOL" />
          <View style={styles.costDivider} />
          <CostRow label="Total aproximado" value="0.000 SOL" strong />
          <Text style={styles.costNote}>Los costos pueden cambiar si eliges servicios adicionales.</Text>
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
              <Text style={styles.primaryButtonText}>Guardar publicación</Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={handleSkip} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <Text style={styles.secondaryButtonText}>Omitir publicación</Text>
          </Pressable>

          <Text style={styles.ctaHint}>
            Podrás revisar todo nuevamente antes de confirmar la creación del token.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default PublicationConfigScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 16, paddingTop: 8, gap: 16 },
  contentSmall: { paddingHorizontal: 14, gap: 14 },
  pressed: { opacity: 0.84, transform: [{ scale: 0.99 }] },
  disabledBlock: { opacity: 0.58 },
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
  headerSubtitle: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  stepBlock: { gap: 9 },
  stepTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  stepLabel: { color: COLORS.purpleSoft, fontFamily: FONT.bold, fontSize: 12 },
  stepTitle: { color: COLORS.textSecondary, fontFamily: FONT.semibold, fontSize: 12 },
  progressTrack: { height: 4, borderRadius: 999, backgroundColor: COLORS.surfaceElevated, overflow: 'hidden' },
  progressFill: { width: '80%', height: '100%', borderRadius: 999, backgroundColor: COLORS.purpleSoft },
  stepChips: { flexDirection: 'row', gap: 8 },
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
  stepChipText: { color: COLORS.textMuted, fontFamily: FONT.medium, fontSize: 10.5 },
  stepChipTextActive: { color: COLORS.text },
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
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
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
  tokenBadgeText: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 13 },
  summaryTitleCopy: { flex: 1, minWidth: 0 },
  summaryTitle: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 17 },
  summarySubtitle: { color: COLORS.textMuted, fontFamily: FONT.medium, fontSize: 11.5 },
  statusPill: {
    minHeight: 26,
    borderRadius: RADII.pill,
    paddingHorizontal: 9,
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.warning, 0.12),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.warning, 0.28),
  },
  statusPillText: { color: COLORS.warning, fontFamily: FONT.bold, fontSize: 9, textTransform: 'uppercase' },
  summaryGrid: { flexDirection: 'row', gap: 8 },
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
  summaryLabel: { color: COLORS.textMuted, fontFamily: FONT.medium, fontSize: 10, marginBottom: 4 },
  summaryValue: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 12 },
  statusCard: {
    width: '100%',
    borderRadius: 20,
    padding: 15,
    gap: 13,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
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
  statusCopy: { flex: 1, minWidth: 0, gap: 4 },
  statusTitle: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 16 },
  statusSubtitle: { color: COLORS.textSecondary, fontFamily: FONT.medium, fontSize: 12, lineHeight: 18 },
  switchPressable: { padding: 4 },
  stateLine: {
    alignSelf: 'flex-start',
    minHeight: 26,
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  stateLineActive: { backgroundColor: withOpacity(COLORS.green, 0.1) },
  stateLineMuted: { backgroundColor: withOpacity('#FFFFFF', 0.05) },
  stateDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.textMuted },
  stateDotActive: { backgroundColor: COLORS.greenBright },
  stateText: {
    color: COLORS.textMuted,
    fontFamily: FONT.bold,
    fontSize: 10.5,
    textTransform: 'uppercase',
  },
  stateTextActive: { color: COLORS.greenBright },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 3,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  switchTrackActive: { backgroundColor: withOpacity(COLORS.purple, 0.48), borderColor: withOpacity(COLORS.purpleSoft, 0.7) },
  switchKnob: { width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.textMuted },
  switchKnobActive: { transform: [{ translateX: 18 }], backgroundColor: COLORS.text },
  section: { width: '100%', gap: 10 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sectionTitle: {
    color: COLORS.textMuted,
    fontFamily: FONT.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionHint: { flex: 1, color: COLORS.textMuted, fontFamily: FONT.medium, fontSize: 11, textAlign: 'right' },
  visibilityList: { gap: 9 },
  visibilityCard: {
    width: '100%',
    borderRadius: 16,
    padding: 13,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  visibilityCardActive: { backgroundColor: withOpacity(COLORS.purple, 0.18), borderColor: withOpacity(COLORS.purpleSoft, 0.64) },
  visibilityTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  visibilityIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.purple, 0.13),
  },
  visibilityCopy: { flex: 1, minWidth: 0, gap: 2 },
  visibilityTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  visibilityTitle: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 13 },
  visibilityBadge: {
    color: COLORS.warning,
    fontFamily: FONT.bold,
    fontSize: 8,
    textTransform: 'uppercase',
    backgroundColor: withOpacity(COLORS.warning, 0.12),
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADII.pill,
  },
  visibilitySubtitle: { color: COLORS.textMuted, fontFamily: FONT.medium, fontSize: 10.5, lineHeight: 15 },
  formCard: { width: '100%', gap: 12 },
  fieldWrap: { flex: 1, gap: 6 },
  fieldLabel: { color: COLORS.textSecondary, fontFamily: FONT.medium, fontSize: 12, marginLeft: 2 },
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
  inputMultiline: { minHeight: 82, paddingTop: 13, textAlignVertical: 'top' },
  inputDisabled: { opacity: 0.58 },
  inputError: { borderColor: withOpacity(COLORS.warning, 0.78) },
  fieldError: { color: COLORS.warning, fontFamily: FONT.medium, fontSize: 11 },
  twoColumns: { flexDirection: 'row', gap: 10 },
  checkCard: {
    width: '100%',
    borderRadius: 18,
    padding: 14,
    gap: 12,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  checkLabel: { flex: 1, color: COLORS.textSecondary, fontFamily: FONT.semibold, fontSize: 12 },
  checkState: { fontFamily: FONT.bold, fontSize: 10, textTransform: 'uppercase' },
  checkDone: { color: COLORS.greenBright },
  checkPending: { color: COLORS.warning },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badgePreview: {
    minHeight: 28,
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgePreviewActive: { backgroundColor: withOpacity(COLORS.purple, 0.18), borderColor: withOpacity(COLORS.purpleSoft, 0.36) },
  badgePreviewText: { color: COLORS.textMuted, fontFamily: FONT.bold, fontSize: 10.5 },
  badgePreviewTextActive: { color: COLORS.text },
  previewCard: {
    width: '100%',
    borderRadius: 20,
    padding: 15,
    gap: 12,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewTitle: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 15 },
  marketPreview: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  previewLogo: {
    width: 46,
    height: 46,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.purple, 0.16),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.purpleSoft, 0.32),
  },
  previewLogoText: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 12 },
  previewCopy: { flex: 1, minWidth: 0, gap: 3 },
  previewToken: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 14 },
  previewNetwork: { color: COLORS.textMuted, fontFamily: FONT.medium, fontSize: 11 },
  previewBadgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  previewBadge: {
    color: COLORS.greenBright,
    fontFamily: FONT.bold,
    fontSize: 8,
    textTransform: 'uppercase',
  },
  previewBadgeMuted: { color: COLORS.textSecondary, fontFamily: FONT.bold, fontSize: 8, textTransform: 'uppercase' },
  previewStatus: { color: COLORS.warning, fontFamily: FONT.bold, fontSize: 11 },
  rulesCard: {
    width: '100%',
    borderRadius: 15,
    padding: 13,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: withOpacity(COLORS.warning, 0.08),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.warning, 0.22),
  },
  rulesCopy: { flex: 1, minWidth: 0, gap: 4 },
  rulesTitle: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 13 },
  rulesBody: { color: COLORS.textSecondary, fontFamily: FONT.medium, fontSize: 11.5, lineHeight: 17 },
  costCard: {
    width: '100%',
    borderRadius: 18,
    padding: 16,
    gap: 10,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  costLabel: { color: COLORS.textSecondary, fontFamily: FONT.medium, fontSize: 12 },
  costLabelStrong: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 15 },
  costValue: { color: COLORS.text, fontFamily: FONT.semibold, fontSize: 12 },
  costValueStrong: { color: COLORS.purpleSoft, fontFamily: FONT.bold, fontSize: 16 },
  costDivider: { height: 1, backgroundColor: COLORS.border },
  costNote: { color: COLORS.warning, fontFamily: FONT.medium, fontSize: 11, lineHeight: 16 },
  ctaBlock: { width: '100%', gap: 10 },
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
  feedbackError: { backgroundColor: withOpacity(COLORS.warning, 0.08), borderColor: withOpacity(COLORS.warning, 0.22) },
  feedbackReady: { backgroundColor: withOpacity(COLORS.green, 0.08), borderColor: withOpacity(COLORS.green, 0.22) },
  feedbackText: { flex: 1, color: COLORS.textSecondary, fontFamily: FONT.medium, fontSize: 12, lineHeight: 17 },
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
  ctaHint: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
