import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { WalletPinSheet } from '../../../components/wallet/WalletPinSheet';
import { WalletSeedSecurityScreen } from '../../../components/wallet/WalletSeedSecurityScreen';
import { FONT, RADII, SPACING, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { TwoFactorSetupSheet } from '../../components/security/TwoFactorSetupSheet';
import { useSecurityCenter } from '../../hooks/useSecurityCenter';
import type { AutoLockMinutes } from '../../types';

type SeedModalMode = 'reveal' | 'export' | 'backup';

const AUTO_LOCK_OPTIONS: AutoLockMinutes[] = [1, 5, 15, 30];

function SectionCard({
  children,
  colors,
}: {
  children: ReactNode;
  colors: {
    background: string;
    border: string;
  };
}) {
  return (
    <View
      style={[
        styles.sectionCard,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
      ]}
    >
      {children}
    </View>
  );
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: 'positive' | 'warning' | 'critical' | 'neutral';
}) {
  const { colors } = useAppTheme();
  const palette =
    tone === 'positive'
      ? { border: withOpacity(colors.profit, 0.32), background: withOpacity(colors.profit, 0.14), text: colors.profit }
      : tone === 'warning'
        ? { border: withOpacity(colors.warning, 0.34), background: withOpacity(colors.warning, 0.14), text: colors.warning }
        : tone === 'critical'
          ? { border: withOpacity(colors.loss, 0.34), background: withOpacity(colors.loss, 0.14), text: colors.loss }
          : { border: colors.border, background: colors.fieldBackground, text: colors.textSoft };

  return (
    <View
      style={[
        styles.badge,
        {
          borderColor: palette.border,
          backgroundColor: palette.background,
        },
      ]}
    >
      <Text style={[styles.badgeLabel, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

function ChecklistChip({
  label,
  ok,
  helper,
}: {
  label: string;
  ok: boolean;
  helper: string;
}) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.checklistChip,
        {
          backgroundColor: colors.fieldBackground,
          borderColor: ok ? withOpacity(colors.profit, 0.28) : colors.border,
        },
      ]}
    >
      <View style={styles.checklistTopRow}>
        <View
          style={[
            styles.checkIconWrap,
            {
              backgroundColor: ok ? withOpacity(colors.profit, 0.16) : withOpacity(colors.loss, 0.12),
            },
          ]}
        >
          <Ionicons name={ok ? 'checkmark' : 'close'} size={12} color={ok ? colors.profit : colors.loss} />
        </View>
        <Text style={[styles.checklistLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <Text style={[styles.checklistHelper, { color: colors.textMuted }]}>{helper}</Text>
    </View>
  );
}

function MetricPill({
  title,
  value,
  tone,
  icon,
}: {
  title: string;
  value: string;
  tone: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.metricPill,
        {
          backgroundColor: colors.fieldBackground,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={[styles.metricIcon, { backgroundColor: withOpacity(tone, 0.14) }]}>
        <Ionicons name={icon} size={15} color={tone} />
      </View>
      <View style={styles.metricCopy}>
        <Text style={[styles.metricTitle, { color: colors.textMuted }]}>{title}</Text>
        <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

export default function SecurityScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const securityCenter = useSecurityCenter();
  const [pinSheetVisible, setPinSheetVisible] = useState(false);
  const [seedModalVisible, setSeedModalVisible] = useState(false);
  const [seedModalMode, setSeedModalMode] = useState<SeedModalMode>('reveal');
  const [twoFactorVisible, setTwoFactorVisible] = useState(false);

  const securityTone =
    securityCenter.summary.level === 'Alto'
      ? 'positive'
      : securityCenter.summary.level === 'Medio'
        ? 'warning'
        : 'critical';

  const seedSection = useMemo(() => {
    if (!securityCenter.isWalletReady) {
      return {
        badge: 'Sin billetera',
        badgeTone: 'warning' as const,
        title: 'Frase semilla',
        body: 'Crea una billetera OrbitX para generar tu frase semilla y proteger tus fondos.',
        primaryLabel: 'Crear billetera',
        secondaryLabel: undefined,
        primaryAction: async () => {
          await securityCenter.actions.createWallet();
        },
        secondaryAction: undefined,
      };
    }

    if (!securityCenter.securityStatus.seedPhraseConfirmedAt) {
      return {
        badge: 'Pendiente',
        badgeTone: 'warning' as const,
        title: 'Frase semilla',
        body: 'Tu frase semilla ya existe, pero aun no confirmaste su respaldo fuera de linea.',
        primaryLabel: 'Respaldar ahora',
        secondaryLabel: 'Ver semilla',
        primaryAction: async () => {
          setSeedModalMode('backup');
          setSeedModalVisible(true);
        },
        secondaryAction: () => {
          setSeedModalMode('reveal');
          setSeedModalVisible(true);
        },
      };
    }

    return {
      badge: 'Respaldada',
      badgeTone: 'positive' as const,
      title: 'Frase semilla',
      body: 'Tu billetera ya cuenta con un respaldo confirmado. Solo revela o exporta si estas en un lugar privado.',
      primaryLabel: 'Ver semilla',
      secondaryLabel: 'Exportar copia',
      primaryAction: async () => {
        setSeedModalMode('reveal');
        setSeedModalVisible(true);
      },
      secondaryAction: () => {
        setSeedModalMode('export');
        setSeedModalVisible(true);
      },
    };
  }, [securityCenter]);

  const securityAction = async () => {
    if (!securityCenter.pendingAction) {
      return;
    }

    if (securityCenter.pendingAction.kind === 'verify_email') {
      await securityCenter.actions.resendConfirmationEmail();
      return;
    }

    if (securityCenter.pendingAction.kind === 'backup_seed') {
      setSeedModalMode('backup');
      setSeedModalVisible(true);
      return;
    }

    setTwoFactorVisible(true);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.background }]} />
      <LinearGradient
        colors={[withOpacity(colors.primary, 0.16), withOpacity(colors.background, 0)]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={styles.heroGlow}
      />
      <LinearGradient
        colors={[withOpacity(colors.primary, 0.18), withOpacity(colors.background, 0)]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.bottomGlow}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.headerButton, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}
          >
            <Ionicons name="chevron-back" size={18} color={colors.text} />
          </Pressable>

          <View style={styles.headerCopy}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Seguridad</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              Protege tu cuenta y tus fondos
            </Text>
          </View>

          <View
            style={[
              styles.shieldButton,
              {
                backgroundColor: withOpacity(colors.primary, 0.14),
                borderColor: withOpacity(colors.primary, 0.22),
              },
            ]}
          >
            <Ionicons name="shield" size={18} color={colors.primary} />
          </View>
        </View>

        <LinearGradient
          colors={[withOpacity(colors.primary, 0.2), withOpacity(colors.card, 0.98)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.summaryCard, { borderColor: withOpacity(colors.primary, 0.22) }]}
        >
          <View style={styles.summaryHeader}>
            <View style={[styles.summaryIcon, { backgroundColor: withOpacity(colors.primary, 0.14) }]}>
              <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
            </View>

            <View style={styles.summaryCopy}>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>
                Nivel de seguridad: <Text style={{ color: securityCenter.metricsTone }}>{securityCenter.summary.level}</Text>
              </Text>
              <Text style={[styles.summaryBody, { color: colors.textSoft }]}>
                {securityCenter.summary.level === 'Alto'
                  ? 'Tu cuenta esta bien protegida. Sigue asi.'
                  : securityCenter.summary.level === 'Medio'
                    ? 'Tu cuenta va por buen camino, pero aun puedes reforzarla.'
                    : 'Tu cuenta necesita proteccion adicional para operar con tranquilidad.'}
              </Text>
            </View>
          </View>

          <View style={[styles.progressTrack, { backgroundColor: withOpacity(colors.text, 0.08) }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.round(securityCenter.summary.progress * 100)}%`,
                  backgroundColor: securityCenter.metricsTone,
                },
              ]}
            />
          </View>

          <View style={styles.checklistGrid}>
            {securityCenter.checklist.map((item) => (
              <ChecklistChip key={item.key} label={item.label} ok={item.ok} helper={item.helper} />
            ))}
          </View>
        </LinearGradient>

        {securityCenter.pendingAction ? (
          <SectionCard colors={{ background: colors.card, border: withOpacity(colors.primary, 0.22) }}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeaderCopy}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {securityCenter.pendingAction.title}
                </Text>
                <Text style={[styles.sectionBody, { color: colors.textMuted }]}>
                  {securityCenter.pendingAction.body}
                </Text>
              </View>
              <StatusBadge label="Pendiente" tone="warning" />
            </View>

            <PrimaryButton
              label={securityCenter.pendingAction.actionLabel}
              onPress={() => void securityAction()}
            />
          </SectionCard>
        ) : null}

        <SectionCard colors={{ background: colors.card, border: colors.border }}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderCopy}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Frase semilla</Text>
              <Text style={[styles.sectionBody, { color: colors.textMuted }]}>{seedSection.body}</Text>
            </View>
            <StatusBadge label={seedSection.badge} tone={seedSection.badgeTone} />
          </View>

          <View style={styles.actionRow}>
            <PrimaryButton label={seedSection.primaryLabel} onPress={() => void seedSection.primaryAction()} />
            {seedSection.secondaryLabel ? (
              <PrimaryButton
                label={seedSection.secondaryLabel}
                variant="secondary"
                onPress={() => seedSection.secondaryAction?.()}
              />
            ) : null}
          </View>

          <Text style={[styles.caption, { color: colors.textMuted }]}>
            Ultima confirmacion: {securityCenter.formatted.seedConfirmedAt}
          </Text>
        </SectionCard>

        <SectionCard colors={{ background: colors.card, border: colors.border }}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderCopy}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Autenticacion en dos factores (2FA)</Text>
              <Text style={[styles.sectionBody, { color: colors.textMuted }]}>
                Añade una capa extra con codigos temporales desde Google Authenticator o Authy.
              </Text>
            </View>
            <StatusBadge label={securityCenter.twoFactor.enabled ? 'Activo' : 'Desactivado'} tone={securityCenter.twoFactor.enabled ? 'positive' : 'warning'} />
          </View>

          <MetricPill
            title="Proveedor"
            value={
              securityCenter.twoFactor.enabled
                ? securityCenter.twoFactor.provider === 'authy'
                  ? 'Authy'
                  : 'Google Authenticator'
                : 'Sin configurar'
            }
            tone={securityCenter.metricsTone}
            icon="key-outline"
          />

          <Text style={[styles.caption, { color: colors.textMuted }]}>
            Configurado: {securityCenter.formatted.twoFactorConfiguredAt}
          </Text>

          {securityCenter.twoFactor.enabled ? (
            <PrimaryButton
              label="Desactivar 2FA"
              variant="ghost"
              onPress={() => void securityCenter.actions.disableTwoFactor()}
            />
          ) : (
            <PrimaryButton label="Activar" onPress={() => setTwoFactorVisible(true)} />
          )}
        </SectionCard>

        <SectionCard colors={{ background: colors.card, border: colors.border }}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderCopy}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Dispositivos y sesiones</Text>
              <Text style={[styles.sectionBody, { color: colors.textMuted }]}>
                Administra que dispositivos siguen teniendo acceso a tu cuenta.
              </Text>
            </View>
            <StatusBadge label={securityCenter.sessionCountLabel} tone="neutral" />
          </View>

          <View style={styles.sessionsList}>
            {securityCenter.activeSessions.map((session) => (
              <View
                key={session.id}
                style={[
                  styles.sessionRow,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.fieldBackground,
                  },
                ]}
              >
                <View style={[styles.sessionIcon, { backgroundColor: withOpacity(colors.primary, 0.14) }]}>
                  <Ionicons
                    name={session.platform === 'ios' ? 'phone-portrait-outline' : session.platform === 'android' ? 'phone-portrait' : 'globe-outline'}
                    size={16}
                    color={colors.primary}
                  />
                </View>

                <View style={styles.sessionCopy}>
                  <View style={styles.sessionTitleRow}>
                    <Text style={[styles.sessionTitle, { color: colors.text }]}>{session.deviceLabel}</Text>
                    {session.current ? <StatusBadge label="Este dispositivo" tone="neutral" /> : null}
                  </View>
                  <Text style={[styles.sessionBody, { color: colors.textMuted }]}>
                    {session.locationLabel} · {new Date(session.lastSeenAt).toLocaleString('es-PE', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                {session.current ? (
                  <View style={styles.currentDotWrap}>
                    <View style={[styles.currentDot, { backgroundColor: colors.profit }]} />
                  </View>
                ) : (
                  <Pressable
                    onPress={() => securityCenter.actions.revokeSession(session.id)}
                    style={[styles.sessionCloseButton, { backgroundColor: colors.lossSoft }]}
                  >
                    <Ionicons name="close" size={16} color={colors.loss} />
                  </Pressable>
                )}
              </View>
            ))}
          </View>

          <PrimaryButton
            label="Cerrar todas las demas sesiones"
            variant="ghost"
            onPress={securityCenter.actions.revokeOtherSessions}
          />
        </SectionCard>

        <SectionCard colors={{ background: colors.card, border: colors.border }}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderCopy}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Verificacion de email</Text>
              <Text style={[styles.sectionBody, { color: colors.textMuted }]}>
                Tu correo sirve para recuperar acceso y validar cambios sensibles.
              </Text>
            </View>
            <StatusBadge
              label={securityCenter.checklist.find((item) => item.key === 'email')?.ok ? 'Verificado' : 'Pendiente'}
              tone={securityCenter.checklist.find((item) => item.key === 'email')?.ok ? 'positive' : 'warning'}
            />
          </View>

          {!securityCenter.checklist.find((item) => item.key === 'email')?.ok ? (
            <PrimaryButton label="Reenviar correo" onPress={() => void securityCenter.actions.resendConfirmationEmail()} />
          ) : (
            <Text style={[styles.caption, { color: colors.textMuted }]}>
              Tu correo ya esta verificado y listo para recuperar acceso sin friccion.
            </Text>
          )}
        </SectionCard>

        <SectionCard colors={{ background: colors.card, border: colors.border }}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderCopy}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Bloqueo y proteccion</Text>
              <Text style={[styles.sectionBody, { color: colors.textMuted }]}>
                Protege el acceso a la app con PIN, biometria y auto-bloqueo.
              </Text>
            </View>
            <Text style={[styles.trailingLabel, { color: colors.textMuted }]}>Configurar</Text>
          </View>

          <View style={styles.metricsRow}>
            <MetricPill
              title="PIN"
              value={securityCenter.securityStatus.pinEnabled ? 'Activado' : 'Configurar'}
              tone={securityCenter.securityStatus.pinEnabled ? colors.profit : colors.warning}
              icon="lock-closed-outline"
            />
            <MetricPill
              title="Biometria"
              value={securityCenter.securityStatus.biometricsEnabled ? 'Activa' : 'Opcional'}
              tone={securityCenter.securityStatus.biometricsEnabled ? colors.profit : colors.textMuted}
              icon="finger-print-outline"
            />
            <MetricPill
              title="Auto-bloqueo"
              value={`${securityCenter.autoLockMinutes} min`}
              tone={colors.primary}
              icon="time-outline"
            />
          </View>

          <View style={styles.actionRow}>
            <PrimaryButton label="PIN" variant="secondary" onPress={() => setPinSheetVisible(true)} />
            <PrimaryButton
              label={securityCenter.securityStatus.biometricsEnabled ? 'Desactivar biometria' : 'Activar biometria'}
              variant="secondary"
              onPress={() => void securityCenter.actions.toggleBiometrics()}
            />
          </View>

          <View style={styles.chipRow}>
            {AUTO_LOCK_OPTIONS.map((minutes) => (
              <Pressable
                key={minutes}
                onPress={() => securityCenter.actions.setAutoLock(minutes)}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor:
                      securityCenter.autoLockMinutes === minutes
                        ? withOpacity(colors.primary, 0.16)
                        : colors.fieldBackground,
                    borderColor:
                      securityCenter.autoLockMinutes === minutes
                        ? withOpacity(colors.primary, 0.28)
                        : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.optionChipLabel,
                    {
                      color:
                        securityCenter.autoLockMinutes === minutes ? colors.primary : colors.textSoft,
                    },
                  ]}
                >
                  {minutes}m
                </Text>
              </Pressable>
            ))}
          </View>
        </SectionCard>

        <SectionCard colors={{ background: colors.card, border: colors.border }}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderCopy}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Alertas de seguridad</Text>
              <Text style={[styles.sectionBody, { color: colors.textMuted }]}>
                Recibe avisos cuando ocurra algo importante en tu cuenta.
              </Text>
            </View>
            <Text style={[styles.trailingLabel, { color: colors.textMuted }]}>Configurar</Text>
          </View>

          <View style={styles.chipGrid}>
            {[
              { key: 'login', label: 'Inicios de sesion' },
              { key: 'withdrawal', label: 'Retiros' },
              { key: 'settings', label: 'Cambios de cuenta' },
            ].map((item) => {
              const enabled = securityCenter.alertPreferences[item.key as keyof typeof securityCenter.alertPreferences];
              return (
                <Pressable
                  key={item.key}
                  onPress={() => securityCenter.actions.toggleAlert(item.key as 'login' | 'withdrawal' | 'settings')}
                  style={[
                    styles.alertChip,
                    {
                      backgroundColor: enabled ? withOpacity(colors.profit, 0.14) : colors.fieldBackground,
                      borderColor: enabled ? withOpacity(colors.profit, 0.24) : colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={enabled ? 'checkmark-circle' : 'ellipse-outline'}
                    size={16}
                    color={enabled ? colors.profit : colors.textMuted}
                  />
                  <Text style={[styles.alertChipLabel, { color: enabled ? colors.text : colors.textSoft }]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </SectionCard>

        {securityCenter.walletError ? (
          <SectionCard colors={{ background: colors.lossSoft, border: withOpacity(colors.loss, 0.28) }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Necesitamos tu atencion</Text>
            <Text style={[styles.sectionBody, { color: colors.textSoft }]}>
              {securityCenter.walletError}
            </Text>
          </SectionCard>
        ) : null}

        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          La seguridad de tu cuenta es nuestra prioridad. 💜
        </Text>
      </ScrollView>

      <WalletPinSheet
        visible={pinSheetVisible}
        onClose={() => {
          setPinSheetVisible(false);
          void securityCenter.actions.refreshSecurityStatus();
        }}
        onSaved={() => {
          void securityCenter.actions.refreshSecurityStatus();
        }}
      />

      <WalletSeedSecurityScreen
        visible={seedModalVisible}
        mode={seedModalMode}
        biometricsEnabled={securityCenter.securityStatus.biometricsEnabled}
        pinEnabled={securityCenter.securityStatus.pinEnabled}
        onClose={() => {
          setSeedModalVisible(false);
          void securityCenter.actions.refreshSecurityStatus();
        }}
        onRequirePinSetup={() => {
          setSeedModalVisible(false);
          setPinSheetVisible(true);
        }}
        onConfirmed={() => {
          void securityCenter.actions.refreshSecurityStatus();
        }}
      />

      <TwoFactorSetupSheet
        visible={twoFactorVisible}
        pendingSetup={securityCenter.pendingTwoFactorSetup}
        onClose={() => {
          setTwoFactorVisible(false);
          securityCenter.actions.dismissTwoFactorSetup();
        }}
        onStart={securityCenter.actions.startTwoFactor}
        onConfirm={securityCenter.actions.confirmTwoFactor}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  heroGlow: {
    position: 'absolute',
    top: -80,
    left: 0,
    right: 0,
    height: 300,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -120,
    left: 0,
    right: 0,
    height: 260,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: RADII.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: 24,
  },
  headerSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 12,
  },
  shieldButton: {
    width: 42,
    height: 42,
    borderRadius: RADII.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 14,
    overflow: 'hidden',
  },
  summaryHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryIcon: {
    width: 50,
    height: 50,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCopy: {
    flex: 1,
    gap: 4,
  },
  summaryTitle: {
    fontFamily: FONT.semibold,
    fontSize: 18,
  },
  summaryBody: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  progressTrack: {
    height: 8,
    borderRadius: RADII.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: RADII.pill,
  },
  checklistGrid: {
    gap: 10,
  },
  checklistChip: {
    borderWidth: 1,
    borderRadius: RADII.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 6,
  },
  checklistTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklistLabel: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  checklistHelper: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  sectionHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  sectionTitle: {
    fontFamily: FONT.semibold,
    fontSize: 16,
  },
  sectionBody: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADII.pill,
    borderWidth: 1,
  },
  badgeLabel: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  caption: {
    fontFamily: FONT.regular,
    fontSize: 11,
  },
  metricPill: {
    flex: 1,
    minWidth: 92,
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricCopy: {
    flex: 1,
    gap: 2,
  },
  metricTitle: {
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  metricValue: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  sessionsList: {
    gap: 10,
  },
  sessionRow: {
    borderWidth: 1,
    borderRadius: RADII.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  sessionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionCopy: {
    flex: 1,
    gap: 4,
  },
  sessionTitleRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  sessionTitle: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  sessionBody: {
    fontFamily: FONT.regular,
    fontSize: 11,
  },
  currentDotWrap: {
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
  },
  sessionCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trailingLabel: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: RADII.pill,
    borderWidth: 1,
  },
  optionChipLabel: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  chipGrid: {
    gap: 10,
  },
  alertChip: {
    borderWidth: 1,
    borderRadius: RADII.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alertChipLabel: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  footerText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});
