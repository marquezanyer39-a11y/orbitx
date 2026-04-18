import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../../src/store/authStore';
import { useUiStore } from '../../src/store/uiStore';
import { useAppTheme } from '../../hooks/useAppTheme';
import { FONT, RADII, withOpacity } from '../../constants/theme';
import { AuthScreenShell } from './AuthScreenShell';
import { PrimaryButton } from '../common/PrimaryButton';
import { OrbitLogo } from '../common/OrbitLogo';

interface AuthLoginExperienceProps {
  showBack?: boolean;
}

const PROVIDER_ROWS = [
  { key: 'google', label: 'Continuar con Google', icon: 'logo-google' as const },
  { key: 'apple', label: 'Continuar con Apple', icon: 'logo-apple' as const },
  { key: 'telegram', label: 'Continuar con Telegram', icon: 'paper-plane' as const },
] as const;

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
            borderColor: colors.border,
          },
        ]}
      >
        <Ionicons name="chevron-back" size={18} color={colors.text} />
      </Pressable>
    </View>
  ) : null;

  return (
    <AuthScreenShell topSlot={topSlot}>
      <View style={styles.content}>
        <View style={styles.heroBlock}>
          <View
            style={[
              styles.ringHalo,
              { borderColor: withOpacity(colors.primary, 0.24) },
            ]}
          />
          <View
            style={[
              styles.heroStage,
              {
                borderColor: withOpacity(colors.primary, 0.18),
                backgroundColor: withOpacity(colors.backgroundAlt, 0.52),
              },
            ]}
          >
            <View style={[styles.heroCoreGlow, { backgroundColor: withOpacity(colors.primary, 0.16) }]} />
            <OrbitLogo size={128} animated showWordmark={false} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Bienvenido a OrbitX</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Accede rapido a mercados, trading y Web3 desde una entrada segura.
          </Text>
        </View>

        <View style={styles.formBlock}>
          <View
            style={[
              styles.inputShell,
              {
                borderColor: colors.border,
                backgroundColor: withOpacity(colors.fieldBackground, 0.82),
              },
            ]}
          >
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Correo electronico"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              style={[styles.input, { color: colors.text }]}
            />
            <Ionicons name="mail" size={17} color={colors.textMuted} />
          </View>
          <View
            style={[
              styles.inputShell,
              {
                borderColor: colors.border,
                backgroundColor: withOpacity(colors.fieldBackground, 0.82),
              },
            ]}
          >
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Contrasena"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              secureTextEntry={!showPassword}
              autoComplete="password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={async () => {
                if (submitting || successTarget) {
                  return;
                }

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
              }}
              style={[styles.input, { color: colors.text }]}
            />
            <Pressable onPress={() => setShowPassword((current) => !current)} hitSlop={10}>
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={17}
                color={colors.textMuted}
              />
            </Pressable>
          </View>

          {confirmationEmail ? (
            <View
              style={[
                styles.messageCard,
                { backgroundColor: colors.profitSoft, borderColor: colors.profit },
              ]}
            >
              <Text style={[styles.messageTitle, { color: colors.text }]}>Confirma tu correo</Text>
              <Text style={[styles.messageText, { color: colors.textSoft }]}>
                Necesitas confirmar {confirmationEmail} antes de ingresar.
              </Text>
              <PrimaryButton
                label={resendingConfirmation ? 'Enviando...' : 'Reenviar confirmacion'}
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
            <View
              style={[
                styles.messageCard,
                { backgroundColor: colors.lossSoft, borderColor: colors.loss },
              ]}
            >
              <Text style={[styles.messageText, { color: colors.loss }]}>{inlineError}</Text>
            </View>
          ) : null}

          <PrimaryButton
            label={submitting ? 'Ingresando...' : 'Iniciar sesion'}
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            disabled={submitting || Boolean(successTarget)}
            onPress={async () => {
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
            }}
          />
        </View>

        <View style={styles.providersBlock}>
          <View style={styles.separatorRow}>
            <View style={[styles.separatorLine, { backgroundColor: withOpacity(colors.border, 0.9) }]} />
            <Text style={[styles.separatorText, { color: colors.textMuted }]}>O continuar con</Text>
            <View style={[styles.separatorLine, { backgroundColor: withOpacity(colors.border, 0.9) }]} />
          </View>

          {PROVIDER_ROWS.map((provider) => (
            <Pressable
              key={provider.key}
              onPress={() => showToast('Usa tu correo y contrasena mientras activamos este acceso.', 'info')}
              style={[
                styles.providerRow,
                {
                  borderColor: colors.border,
                  backgroundColor: withOpacity(colors.fieldBackground, 0.78),
                },
              ]}
            >
              <Ionicons
                name={provider.icon}
                size={18}
                color={provider.key === 'google' ? '#EA4335' : colors.text}
              />
              <Text style={[styles.providerText, { color: colors.textSoft }]}>{provider.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.footerRow}>
          <Pressable onPress={() => router.push('/register')} style={styles.footerLinkHit}>
            <Text style={[styles.footerLink, { color: colors.textMuted }]}>Crear cuenta</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/forgot-password')} style={styles.footerLinkHit}>
            <Text style={[styles.footerLink, { color: colors.textMuted }]}>Olvide mi contrasena</Text>
          </Pressable>
        </View>
      </View>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    gap: 14,
    paddingTop: 2,
    paddingBottom: 8,
  },
  topBar: {
    alignItems: 'flex-start',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: RADII.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBlock: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 2,
    paddingBottom: 4,
  },
  ringHalo: {
    position: 'absolute',
    top: 18,
    width: 320,
    height: 320,
    borderRadius: 999,
    borderWidth: 1,
    opacity: 0.72,
    transform: [{ rotate: '-14deg' }],
  },
  heroStage: {
    width: 304,
    height: 286,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 17,
    lineHeight: 22,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  formBlock: {
    gap: 10,
  },
  heroCoreGlow: {
    position: 'absolute',
    width: 168,
    height: 168,
    borderRadius: 999,
  },
  inputShell: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 48,
    fontFamily: FONT.medium,
    fontSize: 14,
    paddingVertical: 0,
  },
  messageCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  messageTitle: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  messageText: {
    fontFamily: FONT.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 13,
  },
  providersBlock: {
    gap: 8,
  },
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  separatorLine: {
    flex: 1,
    height: 1,
  },
  separatorText: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  providerRow: {
    minHeight: 44,
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    opacity: 0.92,
  },
  providerText: {
    fontFamily: FONT.medium,
    fontSize: 14,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 2,
  },
  footerLinkHit: {
    paddingVertical: 6,
  },
  footerLink: {
    fontFamily: FONT.medium,
    fontSize: 13,
  },
});
