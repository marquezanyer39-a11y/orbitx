import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONT, ORBITX_COLORS, RADII, withOpacity } from '../../../constants/theme';
import { FEATURE_STATUS } from '../../constants/featureStatus';
import { copyToClipboard } from '../../utils/copyToClipboard';

const COLORS = {
  ...ORBITX_COLORS,
  text: ORBITX_COLORS.textPrimary,
  textSecondary: ORBITX_COLORS.textSecondary,
  textMuted: ORBITX_COLORS.textMuted,
  greenBright: ORBITX_COLORS.green,
  blue: ORBITX_COLORS.web3Blue,
};

const EXCHANGE_RATE = 3.755;

const DEPOSIT_DETAILS = [
  {
    key: 'bank',
    label: 'Banco aliado',
    value: 'BCP',
    icon: 'business-outline' as const,
  },
  {
    key: 'account',
    label: 'Cuenta virtual',
    value: '191-76234567-0-12',
    icon: 'card-outline' as const,
  },
  {
    key: 'cci',
    label: 'CCI',
    value: '002-191-176234567012-58',
    icon: 'key-outline' as const,
  },
  {
    key: 'reference',
    label: 'Referencia',
    value: 'ORBT-7X9A-KL2M',
    icon: 'grid-outline' as const,
  },
] as const;

const PRIMARY_ACTIONS = [
  { key: 'deposit', label: 'Depositar', icon: 'add-circle-outline' as const, route: '/receive' },
  { key: 'withdraw', label: 'Retirar', icon: 'arrow-up-circle-outline' as const, route: '/send' },
  { key: 'transfer', label: 'Transferir', icon: 'swap-horizontal-outline' as const, route: '/convert' },
  { key: 'qr', label: 'Pagar QR', icon: 'qr-code-outline' as const },
] as const;

const MONEY_IN_METHODS = [
  {
    title: 'Transferencia bancaria',
    subtitle: 'Desde tu banco o app bancaria',
    icon: 'business-outline' as const,
    color: COLORS.blue,
  },
  {
    title: 'Depósito por QR',
    subtitle: 'Genera un QR y paga desde tu banco o billetera',
    icon: 'qr-code-outline' as const,
    color: COLORS.purpleSoft,
  },
  {
    title: 'Tarjeta o débito',
    subtitle: 'Usa tu tarjeta para depositar al instante',
    icon: 'card-outline' as const,
    color: COLORS.warning,
  },
] as const;

const SERVICES = [
  {
    title: 'Pagar servicios',
    subtitle: 'Luz, agua, internet y otros servicios',
    icon: 'receipt-outline' as const,
    state: 'Próximamente',
  },
  {
    title: 'Recargas',
    subtitle: 'Celular y paquetes móviles',
    icon: 'phone-portrait-outline' as const,
    state: 'Próximamente',
  },
  {
    title: 'Comercios',
    subtitle: 'Pagos con QR y consumo local',
    icon: 'storefront-outline' as const,
    state: 'Disponible según proveedor',
  },
] as const;

const MOVEMENTS = [
  {
    title: 'Depósito pendiente',
    date: '22 Oct, 10:45 AM',
    amount: 'S/ 150.00',
    status: 'Pendiente',
    tone: 'pending' as const,
    icon: 'time-outline' as const,
  },
  {
    title: 'Transferencia recibida',
    date: '21 Oct, 03:20 PM',
    amount: '+S/ 200.00',
    status: 'Completado',
    tone: 'positive' as const,
    icon: 'add-outline' as const,
  },
  {
    title: 'Pago QR',
    date: '20 Oct, 08:12 PM',
    amount: '-S/ 45.00',
    status: 'Completado',
    tone: 'negative' as const,
    icon: 'qr-code-outline' as const,
  },
] as const;

function formatPen(value: number) {
  return `S/ ${new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)}`;
}

function formatUsd(value: number) {
  return `USD ${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)}`;
}

function depositDetailsText() {
  return DEPOSIT_DETAILS.map((item) => `${item.label}: ${item.value}`).join('\n');
}

function goBackToWallet() {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace('/wallet');
}

function Header({ onHelp }: { onHelp: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={goBackToWallet} style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
      </Pressable>

      <View style={styles.headerCopy}>
        <Text style={styles.headerTitle}>Cuenta Local</Text>
        <Text style={styles.headerSubtitle}>Modulo local pendiente de proveedor bancario</Text>
      </View>

      <Pressable onPress={onHelp} style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}>
        <Ionicons name="help-circle-outline" size={23} color={COLORS.textSecondary} />
      </Pressable>
    </View>
  );
}

function LocalBalanceHero({ penBalance, usdBalance }: { penBalance: number; usdBalance: number }) {
  return (
    <LinearGradient
      colors={[COLORS.surfaceElevated, COLORS.surface, COLORS.surfaceSoft]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <View style={styles.heroGlow} pointerEvents="none" />
      <View style={styles.heroTopRow}>
        <Text style={styles.heroEyebrow}>SALDO DEMO</Text>
        <View style={styles.activeBadge}>
          <View style={styles.activeDot} />
          <Text style={styles.activeBadgeText}>Cuenta demo</Text>
        </View>
      </View>

      <View style={styles.heroBalanceRow}>
        <View style={styles.heroBalanceCopy}>
          <View style={styles.amountRow}>
            <Text style={styles.heroAmount}>{formatPen(penBalance)}</Text>
            <Ionicons name="eye-outline" size={18} color={COLORS.textMuted} />
          </View>
          <Text style={styles.heroUsd}>≈ {formatUsd(usdBalance)}</Text>
        </View>

        <Pressable style={({ pressed }) => [styles.currencySelector, pressed && styles.pressed]}>
          <View style={styles.flagPeru}>
            <View style={styles.flagRed} />
            <View style={styles.flagWhite} />
            <View style={styles.flagRed} />
          </View>
          <Text style={styles.currencyText}>PEN</Text>
          <Ionicons name="chevron-down" size={14} color={COLORS.textSecondary} />
        </Pressable>
      </View>
    </LinearGradient>
  );
}

function PrimaryActions({ onQr, onUnavailable }: { onQr: () => void; onUnavailable: () => void }) {
  return (
    <View style={styles.primaryActions}>
      {PRIMARY_ACTIONS.map((action) => (
        <Pressable
          key={action.key}
          onPress={() => {
            if (action.key === 'qr') {
              onQr();
              return;
            }

            onUnavailable();
          }}
          style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
        >
          <View style={styles.actionIconWrap}>
            <Ionicons name={action.icon} size={24} color={COLORS.purpleSoft} />
          </View>
          <Text style={styles.actionLabel} numberOfLines={1}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function DemoNoticeCard() {
  return (
    <View style={styles.demoNoticeCard}>
      <Ionicons name="warning-outline" size={18} color={COLORS.warning} />
      <Text style={styles.demoNoticeText}>{FEATURE_STATUS.localAccount.notice}</Text>
    </View>
  );
}

function DepositDetailsCard({
  onShowQr,
}: {
  onShowQr: () => void;
}) {
  return (
    <View style={styles.depositCard}>
      <View style={styles.depositHeader}>
        <View>
          <Text style={styles.depositTitle}>Datos para depositar</Text>
          <Text style={styles.depositSubtitle}>Ejemplo visual, proveedor real pendiente</Text>
        </View>
      </View>

      <View style={styles.depositRows}>
        {DEPOSIT_DETAILS.map((item) => (
          <View key={item.key} style={styles.depositRow}>
            <Ionicons name={item.icon} size={19} color={COLORS.textMuted} />
            <View style={styles.depositCopy}>
              <Text style={styles.depositLabel}>{item.label}</Text>
              <Text style={styles.depositValue} numberOfLines={1} adjustsFontSizeToFit>
                {item.value}
              </Text>
            </View>
            <Pressable
              onPress={() => void copyToClipboard(item.value)}
              style={({ pressed }) => [styles.copyButton, pressed && styles.pressed]}
            >
              <Ionicons name="copy-outline" size={18} color={COLORS.greenBright} />
            </Pressable>
          </View>
        ))}
      </View>

      <View style={styles.depositButtons}>
        <Pressable onPress={onShowQr} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
          <Ionicons name="qr-code-outline" size={17} color={COLORS.text} />
          <Text style={styles.secondaryButtonText}>Ver demo QR</Text>
        </Pressable>

        <Pressable
          onPress={() => void copyToClipboard(depositDetailsText())}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <Ionicons name="copy-outline" size={17} color={COLORS.background} />
          <Text style={styles.primaryButtonText}>Copiar ejemplo</Text>
        </Pressable>
      </View>
    </View>
  );
}

function InfoCard({ showQr }: { showQr: boolean }) {
  return (
    <View style={[styles.infoCard, showQr && styles.qrInfoCard]}>
      <Ionicons
        name={showQr ? 'qr-code-outline' : 'information-circle-outline'}
        size={18}
        color={showQr ? COLORS.purpleSoft : COLORS.greenBright}
      />
      <Text style={styles.infoText}>
        {showQr
          ? 'QR demo preparado. La integracion con proveedor de pagos se conectara en una fase posterior.'
          : 'Modulo en preparacion: todavia no acepta transferencias reales.'}
      </Text>
    </View>
  );
}

function ListRow({
  title,
  subtitle,
  icon,
  color,
  rightLabel,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  rightLabel?: string;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.listRow, pressed && styles.pressed]}>
      <View style={[styles.listIcon, { backgroundColor: withOpacity(color, 0.14) }]}>
        <Ionicons name={icon} size={21} color={color} />
      </View>
      <View style={styles.listCopy}>
        <Text style={styles.listTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.listSubtitle} numberOfLines={1}>{subtitle}</Text>
      </View>
      {rightLabel ? <Text style={styles.rightPill} numberOfLines={1}>{rightLabel}</Text> : null}
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </Pressable>
  );
}

function MovementRow({ item }: { item: (typeof MOVEMENTS)[number] }) {
  const toneColor =
    item.tone === 'positive'
      ? COLORS.greenBright
      : item.tone === 'negative'
        ? COLORS.red
        : COLORS.warning;

  return (
    <Pressable style={({ pressed }) => [styles.movementRow, pressed && styles.pressed]}>
      <View style={[styles.movementIcon, { backgroundColor: withOpacity(toneColor, 0.14) }]}>
        <Ionicons name={item.icon} size={19} color={toneColor} />
      </View>
      <View style={styles.movementCopy}>
        <Text style={styles.movementTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.movementDate} numberOfLines={1}>{item.date}</Text>
      </View>
      <View style={styles.movementRight}>
        <Text style={[styles.movementAmount, { color: toneColor }]} numberOfLines={1}>{item.amount}</Text>
        <Text style={[styles.movementStatus, { color: toneColor }]} numberOfLines={1}>{item.status}</Text>
      </View>
    </Pressable>
  );
}

export default function LocalAccountScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [showQrNotice, setShowQrNotice] = useState(false);
  const [showHelpNotice, setShowHelpNotice] = useState(false);
  const isSmallPhone = width < 380;

  const usdLocalBalance = 0;
  const penBalance = usdLocalBalance * EXCHANGE_RATE;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          isSmallPhone && styles.contentSmall,
          { paddingBottom: Math.max(insets.bottom, 10) + 118 },
        ]}
      >
        <Header onHelp={() => setShowHelpNotice((value) => !value)} />
        <LocalBalanceHero penBalance={penBalance} usdBalance={usdLocalBalance} />
        <DemoNoticeCard />
        <PrimaryActions
          onQr={() => setShowQrNotice((value) => !value)}
          onUnavailable={() => setShowHelpNotice(true)}
        />
        <DepositDetailsCard onShowQr={() => setShowQrNotice((value) => !value)} />
        <InfoCard showQr={showQrNotice} />

        {showHelpNotice ? (
          <View style={styles.helpCard}>
            <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.greenBright} />
            <Text style={styles.helpText}>
              Cuenta Local está en modo demo hasta conectar un proveedor bancario real.
            </Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cómo ingresar dinero</Text>
          <View style={styles.listCard}>
            {MONEY_IN_METHODS.map((item, index) => (
              <View key={item.title}>
                <ListRow
                  title={item.title}
                  subtitle={item.subtitle}
                  icon={item.icon}
                  color={item.color}
                />
                {index < MONEY_IN_METHODS.length - 1 ? <View style={styles.listDivider} /> : null}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Servicios y pagos</Text>
          <View style={styles.listCard}>
            {SERVICES.map((item, index) => (
              <View key={item.title}>
                <ListRow
                  title={item.title}
                  subtitle={item.subtitle}
                  icon={item.icon}
                  color={index === 0 ? COLORS.greenBright : index === 1 ? COLORS.purpleSoft : COLORS.warning}
                  rightLabel={item.state}
                />
                {index < SERVICES.length - 1 ? <View style={styles.listDivider} /> : null}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Movimientos recientes</Text>
            <Pressable onPress={() => router.push('/history')} hitSlop={8}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </Pressable>
          </View>

          <View style={styles.movementCard}>
            {MOVEMENTS.map((item, index) => (
              <View key={item.title}>
                <MovementRow item={item} />
                {index < MOVEMENTS.length - 1 ? <View style={styles.listDivider} /> : null}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 18,
  },
  contentSmall: {
    paddingHorizontal: 14,
    gap: 16,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
  header: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 18,
    lineHeight: 22,
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 11.5,
    lineHeight: 16,
  },
  hero: {
    width: '100%',
    minHeight: 132,
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: withOpacity(COLORS.purple, 0.28),
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    width: 170,
    height: 2,
    borderRadius: 2,
    right: -22,
    top: 54,
    backgroundColor: withOpacity(COLORS.purpleSoft, 0.13),
    transform: [{ rotate: '-18deg' }],
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroEyebrow: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
    letterSpacing: 1.8,
  },
  activeBadge: {
    minHeight: 26,
    borderRadius: RADII.pill,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: withOpacity(COLORS.green, 0.14),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.green, 0.35),
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.greenBright,
  },
  activeBadgeText: {
    color: COLORS.greenBright,
    fontFamily: FONT.bold,
    fontSize: 10.5,
  },
  heroBalanceRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  heroBalanceCopy: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  heroAmount: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 25,
    lineHeight: 31,
  },
  heroUsd: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 14,
  },
  currencySelector: {
    minHeight: 42,
    borderRadius: 10,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  flagPeru: {
    width: 19,
    height: 19,
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: withOpacity('#FFFFFF', 0.16),
  },
  flagRed: {
    flex: 1,
    backgroundColor: '#D91023',
  },
  flagWhite: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  currencyText: {
    color: COLORS.text,
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  primaryActions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  primaryAction: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  actionIconWrap: {
    width: 52,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: withOpacity('#FFFFFF', 0.08),
  },
  actionLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  demoNoticeCard: {
    width: '100%',
    minHeight: 58,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: withOpacity(COLORS.warning, 0.08),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.warning, 0.24),
  },
  demoNoticeText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 17,
  },
  depositCard: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  depositHeader: {
    minHeight: 58,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  depositTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  depositSubtitle: {
    color: COLORS.warning,
    fontFamily: FONT.medium,
    fontSize: 11,
    marginTop: 3,
  },
  depositRows: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 15,
  },
  depositRow: {
    minHeight: 45,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  depositCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  depositLabel: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  depositValue: {
    color: COLORS.text,
    fontFamily: FONT.semibold,
    fontSize: 14,
    letterSpacing: -0.1,
  },
  copyButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  depositButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  primaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.green,
  },
  primaryButtonText: {
    color: COLORS.background,
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  infoCard: {
    width: '100%',
    minHeight: 58,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qrInfoCard: {
    borderColor: withOpacity(COLORS.purple, 0.34),
    backgroundColor: withOpacity(COLORS.purple, 0.08),
  },
  infoText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 13,
    lineHeight: 19,
  },
  helpCard: {
    width: '100%',
    minHeight: 68,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: withOpacity(COLORS.textSecondary, 0.22),
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surfaceSoft,
  },
  helpText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  section: {
    width: '100%',
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  sectionTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  seeAllText: {
    color: COLORS.greenBright,
    fontFamily: FONT.bold,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  listCard: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  listRow: {
    minHeight: 73,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  listTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 15,
  },
  listSubtitle: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 11.5,
  },
  rightPill: {
    maxWidth: 96,
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 10.5,
    textAlign: 'right',
  },
  listDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 70,
  },
  movementCard: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  movementRow: {
    minHeight: 73,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  movementIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  movementCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  movementTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 15,
  },
  movementDate: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  movementRight: {
    alignItems: 'flex-end',
    gap: 4,
    minWidth: 112,
  },
  movementAmount: {
    fontFamily: FONT.bold,
    fontSize: 15,
  },
  movementStatus: {
    fontFamily: FONT.medium,
    fontSize: 11,
  },
});
