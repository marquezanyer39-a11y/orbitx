import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatCurrencyByLanguage } from '../../../constants/i18n';
import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useOrbitStore } from '../../../store/useOrbitStore';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { navigateToTrade } from '../../navigation/AppNavigator';

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active
            ? withOpacity(colors.primary, 0.14)
            : withOpacity(colors.surfaceElevated, 0.84),
          borderColor: active
            ? withOpacity(colors.primary, 0.28)
            : withOpacity(colors.borderStrong, 0.24),
        },
      ]}
    >
      <Text style={[styles.chipLabel, { color: active ? colors.primary : colors.textSoft }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function StatusBadge({
  icon,
  label,
  tone = 'default',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tone?: 'default' | 'warning' | 'profit';
}) {
  const { colors } = useAppTheme();
  const tint =
    tone === 'warning' ? colors.warning : tone === 'profit' ? colors.profit : colors.primary;

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: withOpacity(tint, 0.12),
          borderColor: withOpacity(tint, 0.22),
        },
      ]}
    >
      <Ionicons name={icon} size={14} color={tint} />
      <Text style={[styles.statusBadgeLabel, { color: tint }]}>{label}</Text>
    </View>
  );
}

function MetricCard({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'profit' | 'warning';
}) {
  const { colors } = useAppTheme();
  const valueColor =
    tone === 'profit' ? colors.profit : tone === 'warning' ? colors.warning : colors.text;

  return (
    <View
      style={[
        styles.metricCard,
        {
          backgroundColor: withOpacity(colors.surfaceElevated, 0.88),
          borderColor: withOpacity(colors.borderStrong, 0.22),
        },
      ]}
    >
      <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: valueColor }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function SectionShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.sectionShell,
        {
          backgroundColor: withOpacity(colors.card, 0.96),
          borderColor: withOpacity(colors.borderStrong, 0.18),
        },
      ]}
    >
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      </View>
      {children}
    </View>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function CollapseHeader({
  title,
  subtitle,
  expanded,
  onPress,
}: {
  title: string;
  subtitle: string;
  expanded: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable onPress={onPress} style={styles.collapseHeader}>
      <View style={styles.collapseCopy}>
        <Text style={[styles.collapseTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.collapseSubtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      </View>
      <View
        style={[
          styles.collapseIconWrap,
          {
            backgroundColor: withOpacity(colors.surfaceElevated, 0.88),
            borderColor: withOpacity(colors.borderStrong, 0.2),
          },
        ]}
      >
        <Ionicons
          name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'}
          size={16}
          color={colors.text}
        />
      </View>
    </Pressable>
  );
}

export default function BotTraderScreen() {
  const { colors } = useAppTheme();
  const language = useOrbitStore((state) => state.settings.language);
  const bot = useOrbitStore((state) => state.bot);
  const tokens = useOrbitStore((state) => state.tokens);
  const assets = useOrbitStore((state) => state.assets);
  const showToast = useOrbitStore((state) => state.showToast);
  const setBotEnabled = useOrbitStore((state) => state.setBotEnabled);
  const setBotMarketType = useOrbitStore((state) => state.setBotMarketType);
  const setBotRisk = useOrbitStore((state) => state.setBotRisk);
  const setBotTargetToken = useOrbitStore((state) => state.setBotTargetToken);
  const setBotQuoteAsset = useOrbitStore((state) => state.setBotQuoteAsset);
  const setBotAllocationPct = useOrbitStore((state) => state.setBotAllocationPct);
  const activateBot = useOrbitStore((state) => state.activateBot);

  const [futuresLeverage, setFuturesLeverage] = useState<3 | 5 | 10>(5);
  const [futuresProtection, setFuturesProtection] = useState(true);
  const [setupExpanded, setSetupExpanded] = useState(true);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);

  const isSpanish = language === 'es';
  const isFuturesMode = bot.marketType === 'futures';
  const selectedToken = tokens.find((token) => token.id === bot.selectedTokenId) ?? null;
  const selectedQuoteAsset =
    assets.find((asset) => asset.tokenId === bot.selectedQuoteAssetId) ?? null;
  const tradeableTokens = tokens.filter((token) => token.isTradeable).slice(0, 8);
  const quoteAssets = assets.filter(
    (asset) => asset.tokenId === 'usd' || asset.tokenId === 'usdt' || asset.amount > 0,
  );
  const availableFuturesQuotes = quoteAssets.filter(
    (asset) => asset.tokenId === 'usdt' || asset.tokenId === 'usd',
  );
  const leverageOptions: Array<3 | 5 | 10> = [3, 5, 10];
  const allocationOptions = [10, 25, 50, 75, 100];

  const pairLabel = selectedToken
    ? `${selectedToken.symbol}/${bot.selectedQuoteAssetId.toUpperCase()}`
    : '--';
  const marketModeLabel = isFuturesMode
    ? isSpanish
      ? 'Futuros'
      : 'Futures'
    : 'Spot';
  const statusLabel = bot.enabled
    ? isSpanish
      ? 'Bot activo'
      : 'Bot active'
    : isSpanish
      ? 'Bot en pausa'
      : 'Bot paused';
  const allocationLabel =
    bot.allocatedUsd > 0
      ? `${formatCurrencyByLanguage(language, bot.allocatedUsd, 'USD')} | ${bot.allocationPct}%`
      : `${bot.allocationPct}%`;
  const dailyPnlLabel = `${formatCurrencyByLanguage(language, bot.dailyPnlUsd, 'USD')} | ${
    bot.dailyGainPct >= 0 ? '+' : ''
  }${bot.dailyGainPct.toFixed(2)}%`;
  const quoteBalance = selectedQuoteAsset?.amount ?? 0;
  const quoteBalanceLabel = `${formatCurrencyByLanguage(language, quoteBalance, 'USD')} ${bot.selectedQuoteAssetId.toUpperCase()}`;

  const riskOptions = [
    {
      id: 'conservative' as const,
      label: isSpanish ? 'Conservador' : 'Conservative',
    },
    {
      id: 'balanced' as const,
      label: isSpanish ? 'Moderado' : 'Balanced',
    },
    {
      id: 'aggressive' as const,
      label: isSpanish ? 'Agresivo' : 'Aggressive',
    },
  ];

  const riskLabel =
    bot.risk === 'conservative'
      ? isSpanish
        ? 'Conservador'
        : 'Conservative'
      : bot.risk === 'aggressive'
        ? isSpanish
          ? 'Agresivo'
          : 'Aggressive'
        : isSpanish
          ? 'Moderado'
          : 'Balanced';

  const handlePrimaryAction = () => {
    if (bot.enabled) {
      setBotEnabled(false);
      return;
    }

    if (isFuturesMode && !availableFuturesQuotes.length) {
      showToast(
        isSpanish
          ? 'Necesitas USDT o USD disponible para activar el bot de futuros.'
          : 'You need available USDT or USD to activate the futures bot.',
        'error',
      );
      return;
    }

    activateBot();
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.backButton,
            {
              backgroundColor: withOpacity(colors.surfaceElevated, 0.88),
              borderColor: withOpacity(colors.borderStrong, 0.26),
            },
          ]}
        >
          <Ionicons name="chevron-back" size={18} color={colors.text} />
        </Pressable>

        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: colors.text }]}>Bot Trader</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {isSpanish
              ? 'Panel ejecutivo para controlar Spot o Futuros con una lectura mas clara y compacta.'
              : 'Executive panel to control Spot or Futures with a clearer, more compact reading.'}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: withOpacity(colors.card, 0.98),
            borderColor: withOpacity(isFuturesMode ? colors.warning : colors.primary, 0.2),
          },
        ]}
      >
        <View style={styles.heroTopRow}>
          <View style={styles.heroTitleWrap}>
            <Text style={[styles.heroEyebrow, { color: colors.textMuted }]}>
              {isSpanish ? 'Panel central del bot' : 'Bot central panel'}
            </Text>
            <Text style={[styles.heroPair, { color: colors.text }]}>{pairLabel}</Text>
            <Text style={[styles.heroSummary, { color: colors.textSoft }]}>
              {isSpanish
                ? `${marketModeLabel} | Riesgo ${riskLabel.toLowerCase()} | Capital ${allocationLabel}`
                : `${marketModeLabel} | ${riskLabel} risk | Capital ${allocationLabel}`}
            </Text>
          </View>

          <View style={styles.heroBadgeColumn}>
            <StatusBadge
              icon={bot.enabled ? 'pulse-outline' : 'pause-outline'}
              label={statusLabel}
              tone={bot.enabled ? 'profit' : 'warning'}
            />
            <StatusBadge
              icon={isFuturesMode ? 'flash-outline' : 'swap-horizontal-outline'}
              label={marketModeLabel}
              tone={isFuturesMode ? 'warning' : 'default'}
            />
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard label={isSpanish ? 'Estado' : 'Status'} value={statusLabel} tone={bot.enabled ? 'profit' : 'warning'} />
          <MetricCard label={isSpanish ? 'Riesgo' : 'Risk'} value={riskLabel} tone={isFuturesMode ? 'warning' : 'default'} />
          <MetricCard label={isSpanish ? 'Capital' : 'Capital'} value={allocationLabel} />
          <MetricCard
            label={isSpanish ? 'PnL diario' : 'Daily PnL'}
            value={dailyPnlLabel}
            tone={bot.dailyPnlUsd >= 0 ? 'profit' : 'warning'}
          />
        </View>

        <View
          style={[
            styles.astraCard,
            {
              backgroundColor: withOpacity(colors.surfaceElevated, 0.86),
              borderColor: withOpacity(colors.borderStrong, 0.2),
            },
          ]}
        >
          <View style={styles.astraHeader}>
            <View
              style={[
                styles.astraIconWrap,
                { backgroundColor: withOpacity(colors.primary, 0.12) },
              ]}
            >
              <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
            </View>
            <View style={styles.astraCopy}>
              <Text style={[styles.astraTitle, { color: colors.text }]}>Astra Live</Text>
              <Text style={[styles.astraBody, { color: colors.textMuted }]}>
                {isSpanish
                  ? 'Sesgo tecnico estable. Astra prefiere confirmar estructura antes de ampliar exposicion.'
                  : 'Technical bias remains stable. Astra prefers structure confirmation before expanding exposure.'}
              </Text>
            </View>
          </View>
          <Text style={[styles.astraHint, { color: colors.textSoft }]}>
            {isSpanish
              ? 'Sugerencia actual: entrada conservadora, riesgo contenido y salida parcial si el impulso se extiende.'
              : 'Current guidance: conservative entry, controlled risk, and partial exit if momentum extends.'}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            onPress={handlePrimaryAction}
            style={[
              styles.primaryButton,
              {
                backgroundColor: bot.enabled
                  ? withOpacity(colors.loss, 0.16)
                  : withOpacity(isFuturesMode ? colors.warning : colors.primary, 0.16),
                borderColor: bot.enabled
                  ? withOpacity(colors.loss, 0.28)
                  : withOpacity(isFuturesMode ? colors.warning : colors.primary, 0.3),
              },
            ]}
          >
            <Ionicons
              name={bot.enabled ? 'pause-circle-outline' : 'play-circle-outline'}
              size={18}
              color={bot.enabled ? colors.loss : isFuturesMode ? colors.warning : colors.primary}
            />
            <Text
              style={[
                styles.primaryButtonLabel,
                {
                  color: bot.enabled
                    ? colors.loss
                    : isFuturesMode
                      ? colors.warning
                      : colors.primary,
                },
              ]}
            >
              {bot.enabled
                ? isSpanish
                  ? `Pausar Bot ${isFuturesMode ? 'de Futuros' : 'Spot'}`
                  : `Pause ${isFuturesMode ? 'Futures' : 'Spot'} Bot`
                : isSpanish
                  ? `Activar Bot ${isFuturesMode ? 'de Futuros' : 'Spot'}`
                  : `Activate ${isFuturesMode ? 'Futures' : 'Spot'} Bot`}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigateToTrade(router)}
            style={[
              styles.secondaryButton,
              {
                backgroundColor: withOpacity(colors.surfaceElevated, 0.88),
                borderColor: withOpacity(colors.borderStrong, 0.22),
              },
            ]}
          >
            <Ionicons name="analytics-outline" size={15} color={colors.text} />
            <Text style={[styles.secondaryButtonLabel, { color: colors.text }]}>
              {isSpanish ? 'Abrir mercado' : 'Open market'}
            </Text>
          </Pressable>
        </View>
      </View>

      <SectionShell
        title={isSpanish ? 'Setup actual' : 'Current setup'}
        subtitle={
          isSpanish
            ? 'Configuracion principal del bot, compacta y visible.'
            : 'Main bot configuration, compact and visible.'
        }
      >
        <CollapseHeader
          title={isSpanish ? 'Parametros operativos' : 'Operating parameters'}
          subtitle={
            isSpanish
              ? 'Modo, riesgo, activo principal y capital base.'
              : 'Mode, risk, primary asset and base capital.'
          }
          expanded={setupExpanded}
          onPress={() => setSetupExpanded((current) => !current)}
        />

        {setupExpanded ? (
          <View style={styles.sectionBody}>
            <View style={styles.compactGrid}>
              <MetricCard label={isSpanish ? 'Modo' : 'Mode'} value={marketModeLabel} tone={isFuturesMode ? 'warning' : 'default'} />
              <MetricCard label={isSpanish ? 'Activo' : 'Primary asset'} value={selectedToken?.symbol ?? '--'} />
              <MetricCard label={isSpanish ? 'Capital base' : 'Base capital'} value={bot.selectedQuoteAssetId.toUpperCase()} />
              <MetricCard label={isSpanish ? 'Limite diario' : 'Daily limit'} value={String(bot.maxDailyTrades)} />
            </View>

            <InfoRow
              label={isSpanish ? 'Balance disponible' : 'Available balance'}
              value={quoteBalanceLabel}
            />

            <View style={styles.controlBlock}>
              <Text style={[styles.inlineLabel, { color: colors.textSoft }]}>
                {isSpanish ? 'Modo del bot' : 'Bot mode'}
              </Text>
              <View style={styles.chipRow}>
                <Chip label="Spot" active={!isFuturesMode} onPress={() => setBotMarketType('spot')} />
                <Chip
                  label={isSpanish ? 'Futuros' : 'Futures'}
                  active={isFuturesMode}
                  onPress={() => setBotMarketType('futures')}
                />
              </View>
            </View>

            <View style={styles.controlBlock}>
              <Text style={[styles.inlineLabel, { color: colors.textSoft }]}>
                {isSpanish ? 'Riesgo' : 'Risk'}
              </Text>
              <View style={styles.chipRow}>
                {riskOptions.map((option) => (
                  <Chip
                    key={option.id}
                    label={option.label}
                    active={bot.risk === option.id}
                    onPress={() => setBotRisk(option.id)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.controlBlock}>
              <Text style={[styles.inlineLabel, { color: colors.textSoft }]}>
                {isSpanish ? 'Activo principal' : 'Primary asset'}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipScroller}
              >
                {tradeableTokens.map((token) => (
                  <Chip
                    key={token.id}
                    label={token.symbol}
                    active={bot.selectedTokenId === token.id}
                    onPress={() => setBotTargetToken(token.id)}
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.controlBlock}>
              <Text style={[styles.inlineLabel, { color: colors.textSoft }]}>
                {isSpanish ? 'Capital y asignacion' : 'Capital and allocation'}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipScroller}
              >
                {quoteAssets.map((asset) => (
                  <Chip
                    key={asset.tokenId}
                    label={asset.tokenId.toUpperCase()}
                    active={bot.selectedQuoteAssetId === asset.tokenId}
                    onPress={() => setBotQuoteAsset(asset.tokenId)}
                  />
                ))}
              </ScrollView>
              <View style={styles.chipRow}>
                {allocationOptions.map((option) => (
                  <Chip
                    key={option}
                    label={`${option}%`}
                    active={bot.allocationPct === option}
                    onPress={() => setBotAllocationPct(option)}
                  />
                ))}
              </View>
            </View>
          </View>
        ) : null}
      </SectionShell>

      <SectionShell
        title={isSpanish ? 'Controles secundarios' : 'Secondary controls'}
        subtitle={
          isSpanish
            ? 'Ajustes de futuros y limites operativos en un bloque mas discreto.'
            : 'Futures settings and execution limits in a cleaner secondary block.'
        }
      >
        <CollapseHeader
          title={isSpanish ? 'Ajustes avanzados' : 'Advanced settings'}
          subtitle={
            isSpanish
              ? 'Solo se expanden cuando realmente los necesitas.'
              : 'Expanded only when you really need them.'
          }
          expanded={advancedExpanded}
          onPress={() => setAdvancedExpanded((current) => !current)}
        />

        {advancedExpanded ? (
          <View style={styles.sectionBody}>
            {isFuturesMode ? (
              <View
                style={[
                  styles.inlinePanel,
                  {
                    backgroundColor: withOpacity(colors.surfaceElevated, 0.84),
                    borderColor: withOpacity(colors.warning, 0.22),
                  },
                ]}
              >
                <Text style={[styles.inlinePanelTitle, { color: colors.text }]}>
                  {isSpanish ? 'Panel de futuros' : 'Futures panel'}
                </Text>
                <Text style={[styles.inlinePanelBody, { color: colors.textMuted }]}>
                  {isSpanish
                    ? 'Control de apalancamiento y proteccion para la version futures del bot.'
                    : 'Leverage and protection controls for the futures version of the bot.'}
                </Text>

                <View style={styles.controlBlock}>
                  <Text style={[styles.inlineLabel, { color: colors.textSoft }]}>
                    {isSpanish ? 'Apalancamiento' : 'Leverage'}
                  </Text>
                  <View style={styles.chipRow}>
                    {leverageOptions.map((option) => (
                      <Chip
                        key={option}
                        label={`${option}x`}
                        active={futuresLeverage === option}
                        onPress={() => setFuturesLeverage(option)}
                      />
                    ))}
                  </View>
                </View>

                <View style={styles.controlBlock}>
                  <Text style={[styles.inlineLabel, { color: colors.textSoft }]}>
                    {isSpanish ? 'Proteccion' : 'Protection'}
                  </Text>
                  <View style={styles.chipRow}>
                    <Chip
                      label={isSpanish ? 'Reducir riesgo' : 'Reduce risk'}
                      active={futuresProtection}
                      onPress={() => setFuturesProtection(true)}
                    />
                    <Chip
                      label={isSpanish ? 'Mas agresivo' : 'More aggressive'}
                      active={!futuresProtection}
                      onPress={() => setFuturesProtection(false)}
                    />
                  </View>
                </View>
              </View>
            ) : (
              <View
                style={[
                  styles.inlinePanel,
                  {
                    backgroundColor: withOpacity(colors.surfaceElevated, 0.84),
                    borderColor: withOpacity(colors.borderStrong, 0.2),
                  },
                ]}
              >
                <Text style={[styles.inlinePanelTitle, { color: colors.text }]}>
                  {isSpanish ? 'Spot estable' : 'Stable spot'}
                </Text>
                <Text style={[styles.inlinePanelBody, { color: colors.textMuted }]}>
                  {isSpanish
                    ? 'En modo spot el bot mantiene una configuracion mas simple y controlada.'
                    : 'In spot mode the bot keeps a simpler, more controlled configuration.'}
                </Text>
              </View>
            )}

            <InfoRow
              label={isSpanish ? 'Max trades por dia' : 'Max trades per day'}
              value={String(bot.maxDailyTrades)}
            />

            <Text style={[styles.bottomNote, { color: colors.textMuted }]}>
              {isSpanish
                ? isFuturesMode
                  ? `Configuracion actual: ${futuresLeverage}x y ${futuresProtection ? 'proteccion reforzada' : 'sesgo agresivo'}.`
                  : 'Spot mantiene una ruta base mas estable para el bot.'
                : isFuturesMode
                  ? `Current setup: ${futuresLeverage}x and ${futuresProtection ? 'reinforced protection' : 'aggressive bias'}.`
                  : 'Spot keeps a more stable base route for the bot.'}
            </Text>
          </View>
        ) : null}
      </SectionShell>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: RADII.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 24,
    lineHeight: 30,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 18,
    gap: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  heroTitleWrap: {
    flex: 1,
    gap: 5,
  },
  heroEyebrow: {
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  heroPair: {
    fontFamily: FONT.bold,
    fontSize: 30,
    lineHeight: 34,
  },
  heroSummary: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  heroBadgeColumn: {
    gap: 8,
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderRadius: RADII.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusBadgeLabel: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    minWidth: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  metricLabel: {
    fontFamily: FONT.medium,
    fontSize: 11,
    lineHeight: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metricValue: {
    fontFamily: FONT.semibold,
    fontSize: 15,
    lineHeight: 20,
  },
  astraCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  astraHeader: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  astraIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  astraCopy: {
    flex: 1,
    gap: 4,
  },
  astraTitle: {
    fontFamily: FONT.semibold,
    fontSize: 14,
    lineHeight: 18,
  },
  astraBody: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  astraHint: {
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'stretch',
  },
  primaryButton: {
    flex: 1,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 18,
  },
  primaryButtonLabel: {
    fontFamily: FONT.semibold,
    fontSize: 15,
    lineHeight: 20,
  },
  secondaryButton: {
    minWidth: 142,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  secondaryButtonLabel: {
    fontFamily: FONT.medium,
    fontSize: 13,
  },
  sectionShell: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 14,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    fontFamily: FONT.semibold,
    fontSize: 17,
    lineHeight: 22,
  },
  sectionSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  collapseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  collapseCopy: {
    flex: 1,
    gap: 3,
  },
  collapseTitle: {
    fontFamily: FONT.semibold,
    fontSize: 14,
    lineHeight: 18,
  },
  collapseSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  collapseIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionBody: {
    gap: 14,
  },
  compactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoLabel: {
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  infoValue: {
    flex: 1,
    textAlign: 'right',
    fontFamily: FONT.semibold,
    fontSize: 13,
    lineHeight: 18,
  },
  controlBlock: {
    gap: 8,
  },
  inlineLabel: {
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chipScroller: {
    gap: 10,
    paddingRight: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: RADII.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipLabel: {
    fontFamily: FONT.medium,
    fontSize: 13,
    lineHeight: 16,
  },
  inlinePanel: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  inlinePanelTitle: {
    fontFamily: FONT.semibold,
    fontSize: 14,
    lineHeight: 18,
  },
  inlinePanelBody: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  bottomNote: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
});
