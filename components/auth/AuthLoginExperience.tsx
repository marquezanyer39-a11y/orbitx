import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuthStore } from '../../src/store/authStore';
import { useUiStore } from '../../src/store/uiStore';
import { useAppTheme } from '../../hooks/useAppTheme';
import { FONT, RADII, withOpacity } from '../../constants/theme';
import { AuthScreenShell } from './AuthScreenShell';

interface AuthLoginExperienceProps {
  showBack?: boolean;
}

const PROVIDER_ROWS = [
  { key: 'google', label: 'Google', icon: 'logo-google' as const },
  { key: 'x', label: 'X', icon: 'logo-twitter' as const },
  { key: 'apple', label: 'Apple', icon: 'logo-apple' as const },
] as const;

const QVEX_PRIMARY = '#00E5FF';
const QVEX_PANEL = '#0D1220';
const QVEX_TEXT = '#F8FBFF';
const QVEX_MUTED = '#8A94A6';

function QvexMark({ compact = false }: { compact?: boolean }) {
  const size = compact ? 62 : 92;
  const ringSize = compact ? 28 : 40;

  return (
    <LinearGradient
      colors={['rgba(14, 20, 33, 0.98)', 'rgba(7, 13, 25, 0.94)', 'rgba(13, 18, 32, 0.98)']}
      start={{ x: 0.15, y: 0.15 }}
      end={{ x: 0.85, y: 0.85 }}
      style={[
        styles.markShell,
        {
          width: size,
          height: size,
          borderRadius: compact ? 18 : 24,
          borderColor: withOpacity(QVEX_PRIMARY, compact ? 0.2 : 0.28),
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(0,229,255,0.18)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View
        style={[
          styles.markRing,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize,
            borderColor: QVEX_PRIMARY,
          },
        ]}
      />
      <View
        style={[
          styles.markTail,
          {
            width: compact ? 14 : 18,
            left: compact ? 33 : 47,
            top: compact ? 34 : 50,
            backgroundColor: QVEX_PRIMARY,
          },
        ]}
      />
    </LinearGradient>
  );
}

function ProviderPill({ label, icon, onPress }: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.providerPill}>
      <Ionicons name={icon} size={22} color={withOpacity(QVEX_TEXT, 0.68)} />
      <Text style={styles.providerLabel}>{label}</Text>
    </Pressable>
  );
}

function AuthActionButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.actionButton,
        isPrimary ? styles.actionButtonPrimary : styles.actionButtonSecondary,
        disabled && styles.actionButtonDisabled,
      ]}
    >
      <Text style={[styles.actionButtonText, isPrimary ? styles.actionButtonTextPrimary : styles.actionButtonTextSecondary]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function AuthLoginExperience({ showBack = false }: AuthLoginExperienceProps) {
  const signIn = useAuthStore((state) => state.signIn);
  const resendConfirmationEmail = useAuthStore((state) => state.resendConfirmationEmail);
  const sessionStatus = useAuthStore((state) => state.session.status);
  const showToast = useUiStore((state) => state.showToast);
  const { colors } = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resendingConfirmation, setResendingConfirmation] = useState(false);
  const [inlineError, setInlineError] = useState('');
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [successTarget, setSuccessTarget] = useState<string | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLanding = !showBack;

  const completeAuthSuccess = useCallback(() => {
    setSuccessTarget((currentTarget) => {
      if (!currentTarget) {
        return currentTarget;
      }

      router.replace(currentTarget);
      return null;
    });
  }, []);

  useEffect(() => {
    if (!successTarget) {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
        successTimerRef.current = null;
      }
      return;
    }

    successTimerRef.current = setTimeout(() => {
      completeAuthSuccess();
    }, 950);

    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
        successTimerRef.current = null;
      }
    };
  }, [completeAuthSuccess, successTarget]);

  useEffect(() => {
    if (sessionStatus === 'signed_out' || successTarget) {
      return;
    }

    router.replace('/home');
  }, [sessionStatus, successTarget]);

  const topSlot = showBack ? (
    <View style={styles.topBar}>
      <Pressable
        onPress={() => router.back()}
        style={[
          styles.backButton,
          {
            backgroundColor: withOpacity(colors.fieldBackground, 0.92),
            borderColor: withOpacity(QVEX_PRIMARY, 0.18),
          },
        ]}
      >
        <Ionicons name="chevron-back" size={18} color={colors.text} />
      </Pressable>
      <Text style={styles.topModeLabel}>Acceso seguro QVEX</Text>
    </View>
  ) : null;

  const runLogin = async () => {
    setInlineError('');
    setConfirmationEmail('');
    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);
    if (result.ok) {
      setSuccessTarget('/home');
      return;
    }

    if (result.code === 'email_not_confirmed') {
      setConfirmationEmail(email.trim().toLowerCase());
    }

    setInlineError(result.message);
  };

  return (
    <AuthScreenShell topSlot={topSlot}>
      {isLanding ? (
        <View style={styles.landingContent}>
          <View style={styles.heroBlock}>
            <View style={styles.brandRow}>
              <QvexMark />
              <View style={styles.brandCopy}>
                <Text style={styles.wordmark}>QVEX</Text>
                <Text style={styles.eyebrow}>CRYPTO SUPER APP</Text>
              </View>
            </View>

            <View style={styles.heroCopyWrap}>
              <Text style={styles.heroTitle}>Crypto, IA y finanzas en una sola app</Text>
              <Text style={styles.heroSubtitle}>
                Opera, guarda, crea tokens, recibe alertas inteligentes y conecta con la comunidad desde QVEX.
              </Text>
            </View>
          </View>

          <View style={styles.ctaPanel}>
            <AuthActionButton label="Crear cuenta" onPress={() => router.push('/register')} />
            <AuthActionButton
              label="Iniciar sesión"
              variant="secondary"
              onPress={() => router.push('/login')}
            />

            <View style={styles.providerSection}>
              <View style={styles.separatorRow}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>O CONTINUA CON</Text>
                <View style={styles.separatorLine} />
              </View>

              <View style={styles.providerRow}>
                {PROVIDER_ROWS.map((provider) => (
                  <ProviderPill
                    key={provider.key}
                    icon={provider.icon}
                    label={provider.label}
                    onPress={() =>
                      showToast('Usa correo y contraseña mientras activamos este acceso.', 'info')
                    }
                  />
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.legalText}>
            Al continuar aceptas los <Text style={styles.legalAccent}>Términos</Text> y la{' '}
            <Text style={styles.legalAccent}>Política de Privacidad</Text>.
          </Text>
        </View>
      ) : (
        <View style={styles.loginContent}>
          <View style={styles.loginHero}>
            <QvexMark compact />
            <Text style={styles.loginEyebrow}>QVEX</Text>
            <Text style={styles.loginTitle}>Iniciar sesión</Text>
            <Text style={styles.loginSubtitle}>
              Entra a tu cuenta con el flujo existente, sin OAuth nuevo ni backend adicional.
            </Text>
          </View>

          <View style={styles.loginCard}>
            <View
              style={[
                styles.inputShell,
                {
                  borderColor: withOpacity(QVEX_PRIMARY, 0.14),
                  backgroundColor: withOpacity(colors.fieldBackground, 0.82),
                },
              ]}
            >
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Correo electrónico"
                placeholderTextColor={QVEX_MUTED}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                style={[styles.input, { color: QVEX_TEXT }]}
              />
              <Ionicons name="mail" size={17} color={QVEX_MUTED} />
            </View>

            <View
              style={[
                styles.inputShell,
                {
                  borderColor: withOpacity(QVEX_PRIMARY, 0.14),
                  backgroundColor: withOpacity(colors.fieldBackground, 0.82),
                },
              ]}
            >
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Contraseña"
                placeholderTextColor={QVEX_MUTED}
                autoCapitalize="none"
                secureTextEntry={!showPassword}
                autoComplete="password"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={async () => {
                  if (submitting || successTarget) {
                    return;
                  }
                  await runLogin();
                }}
                style={[styles.input, { color: QVEX_TEXT }]}
              />
              <Pressable onPress={() => setShowPassword((current) => !current)} hitSlop={10}>
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={17}
                  color={QVEX_MUTED}
                />
              </Pressable>
            </View>

            {confirmationEmail ? (
              <View style={[styles.messageCard, styles.confirmationCard]}>
                <Text style={styles.messageTitle}>Confirma tu correo</Text>
                <Text style={styles.messageText}>
                  Necesitas confirmar {confirmationEmail} antes de ingresar.
                </Text>
                <AuthActionButton
                  label={resendingConfirmation ? 'Enviando...' : 'Reenviar confirmación'}
                  variant="secondary"
                  disabled={resendingConfirmation || submitting || Boolean(successTarget)}
                  onPress={async () => {
                    setResendingConfirmation(true);
                    const result = await resendConfirmationEmail(confirmationEmail);
                    setResendingConfirmation(false);
                    if (!result.ok) {
                      setInlineError(result.message);
                    }
                  }}
                />
              </View>
            ) : null}

            {inlineError ? (
              <View style={[styles.messageCard, styles.errorCard]}>
                <Text style={[styles.messageText, styles.errorText]}>{inlineError}</Text>
              </View>
            ) : null}

            <AuthActionButton
              label={submitting ? 'Ingresando...' : 'Iniciar sesión'}
              disabled={submitting || Boolean(successTarget)}
              onPress={() => {
                void runLogin();
              }}
            />

            <View style={styles.loginFooterRow}>
              <Pressable onPress={() => router.push('/register')} style={styles.footerLinkHit}>
                <Text style={styles.footerLink}>Crear cuenta</Text>
              </Pressable>
              <Pressable onPress={() => router.push('/auth/reset')} style={styles.footerLinkHit}>
                <Text style={styles.footerLink}>Olvidé mi contraseña</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 22,
    justifyContent: 'center',
    minHeight: 64,
    paddingHorizontal: 18,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonPrimary: {
    backgroundColor: QVEX_PRIMARY,
    shadowColor: QVEX_PRIMARY,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 9,
  },
  actionButtonSecondary: {
    backgroundColor: 'rgba(13,18,32,0.88)',
    borderColor: withOpacity(QVEX_PRIMARY, 0.18),
    borderWidth: 1,
  },
  actionButtonText: {
    fontFamily: FONT.semibold,
    fontSize: 17,
  },
  actionButtonTextPrimary: {
    color: '#071014',
  },
  actionButtonTextSecondary: {
    color: QVEX_TEXT,
  },
  backButton: {
    alignItems: 'center',
    borderRadius: RADII.pill,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  brandCopy: {
    gap: 8,
  },
  brandRow: {
    alignItems: 'center',
    gap: 18,
    justifyContent: 'center',
  },
  confirmationCard: {
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderColor: withOpacity(QVEX_PRIMARY, 0.22),
  },
  ctaPanel: {
    gap: 14,
    marginTop: 'auto',
    width: '100%',
  },
  errorCard: {
    backgroundColor: 'rgba(255, 82, 82, 0.08)',
    borderColor: 'rgba(255, 82, 82, 0.28)',
  },
  errorText: {
    color: '#FF9898',
  },
  eyebrow: {
    color: QVEX_PRIMARY,
    fontFamily: FONT.medium,
    fontSize: 15,
    letterSpacing: 7.5,
  },
  footerLink: {
    color: QVEX_MUTED,
    fontFamily: FONT.medium,
    fontSize: 13,
  },
  footerLinkHit: {
    paddingVertical: 6,
  },
  heroBlock: {
    alignItems: 'center',
    gap: 26,
    justifyContent: 'center',
    marginTop: 26,
    paddingHorizontal: 4,
  },
  heroCopyWrap: {
    gap: 16,
  },
  heroSubtitle: {
    color: QVEX_MUTED,
    fontFamily: FONT.regular,
    fontSize: 19,
    lineHeight: 33,
    textAlign: 'center',
  },
  heroTitle: {
    color: QVEX_TEXT,
    fontFamily: FONT.bold,
    fontSize: 34,
    letterSpacing: -1.2,
    lineHeight: 42,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.38)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  input: {
    flex: 1,
    fontFamily: FONT.medium,
    fontSize: 15,
    minHeight: 48,
    paddingVertical: 0,
  },
  inputShell: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  landingContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingTop: 18,
  },
  legalAccent: {
    color: QVEX_PRIMARY,
    fontFamily: FONT.semibold,
  },
  legalText: {
    color: QVEX_MUTED,
    fontFamily: FONT.medium,
    fontSize: 13,
    letterSpacing: 0.3,
    lineHeight: 22,
    paddingHorizontal: 18,
    textAlign: 'center',
  },
  loginCard: {
    backgroundColor: withOpacity(QVEX_PANEL, 0.86),
    borderColor: withOpacity(QVEX_PRIMARY, 0.14),
    borderRadius: 28,
    borderWidth: 1,
    gap: 12,
    marginTop: 12,
    padding: 18,
  },
  loginContent: {
    flexGrow: 1,
    gap: 22,
    justifyContent: 'center',
    paddingBottom: 18,
    paddingTop: 10,
  },
  loginEyebrow: {
    color: QVEX_PRIMARY,
    fontFamily: FONT.medium,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  loginFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    paddingTop: 2,
  },
  loginHero: {
    alignItems: 'center',
    gap: 10,
  },
  loginSubtitle: {
    color: QVEX_MUTED,
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 20,
    maxWidth: 300,
    textAlign: 'center',
  },
  loginTitle: {
    color: QVEX_TEXT,
    fontFamily: FONT.bold,
    fontSize: 28,
    letterSpacing: -0.8,
  },
  markRing: {
    borderWidth: 3,
  },
  markShell: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: QVEX_PRIMARY,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
  },
  markTail: {
    borderRadius: 999,
    height: 3,
    position: 'absolute',
    transform: [{ rotate: '47deg' }],
  },
  messageCard: {
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  messageText: {
    color: '#DCE6F2',
    fontFamily: FONT.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  messageTitle: {
    color: QVEX_TEXT,
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  providerLabel: {
    color: 'transparent',
    fontSize: 0,
    height: 0,
    width: 0,
  },
  providerPill: {
    alignItems: 'center',
    backgroundColor: 'rgba(11, 17, 30, 0.92)',
    borderColor: withOpacity(QVEX_PRIMARY, 0.16),
    borderRadius: 22,
    borderWidth: 1,
    height: 98,
    justifyContent: 'center',
    minWidth: 100,
    width: 100,
  },
  providerRow: {
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'center',
    marginTop: 18,
  },
  providerSection: {
    gap: 8,
    marginTop: 8,
  },
  separatorLine: {
    backgroundColor: withOpacity('#32445B', 0.7),
    flex: 1,
    height: 1,
  },
  separatorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  separatorText: {
    color: withOpacity(QVEX_MUTED, 0.9),
    fontFamily: FONT.medium,
    fontSize: 11,
    letterSpacing: 4,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  topModeLabel: {
    color: QVEX_MUTED,
    fontFamily: FONT.medium,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  wordmark: {
    color: QVEX_TEXT,
    fontFamily: FONT.bold,
    fontSize: 56,
    letterSpacing: -2.5,
    lineHeight: 60,
    textShadowColor: 'rgba(0,0,0,0.38)',
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 14,
  },
});
