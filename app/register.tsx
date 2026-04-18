import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AuthScreenShell } from '../components/auth/AuthScreenShell';
import { GlassCard } from '../components/common/GlassCard';
import { OrbitLogo } from '../components/common/OrbitLogo';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { OrbitInput } from '../components/forms/OrbitInput';
import { FONT, RADII, withOpacity } from '../constants/theme';
import { useAppTheme } from '../hooks/useAppTheme';
import { useI18n } from '../hooks/useI18n';
import { useAuthStore } from '../src/store/authStore';
import { useUiStore } from '../src/store/uiStore';
import { getOrbitAuthMeta } from '../utils/orbitAuth';

export default function RegisterScreen() {
  const signUp = useAuthStore((state) => state.signUp);
  const resendConfirmationEmail = useAuthStore((state) => state.resendConfirmationEmail);
  const sessionStatus = useAuthStore((state) => state.session.status);
  const showToast = useUiStore((state) => state.showToast);
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resendingConfirmation, setResendingConfirmation] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [inlineError, setInlineError] = useState('');
  const [successTarget, setSuccessTarget] = useState<string | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const authMeta = getOrbitAuthMeta();

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
    if (sessionStatus === 'signed_out' || confirmationEmail || successTarget) {
      return;
    }

    router.replace('/home');
  }, [confirmationEmail, sessionStatus, successTarget]);

  return (
    <AuthScreenShell
      topSlot={
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
      }
    >
      <View style={styles.content}>
        <View style={styles.heroBlock}>
          <View
            style={[
              styles.heroStage,
              {
                backgroundColor: withOpacity(colors.backgroundAlt, 0.56),
                borderColor: withOpacity(colors.primary, 0.2),
              },
            ]}
          >
            <View style={[styles.heroGlow, { backgroundColor: withOpacity(colors.primary, 0.16) }]} />
            <OrbitLogo size={120} animated showWordmark={false} />
          </View>
          <Text style={[styles.heroEyebrow, { color: colors.textMuted }]}>Crear cuenta</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Activa tu acceso OrbitX</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
            Crea tu cuenta con una entrada limpia, segura y lista para el mercado.
          </Text>
        </View>

        <GlassCard highlighted style={styles.formCard}>
          {confirmationEmail ? (
            <View
              style={[
                styles.noticeCard,
                { backgroundColor: colors.profitSoft, borderColor: colors.profit },
              ]}
            >
              <Text style={[styles.noticeTitle, { color: colors.text }]}>{t('auth.checkEmailTitle')}</Text>
              <Text style={[styles.noticeText, { color: colors.textSoft }]}>
                {t('auth.checkEmailBody')} {confirmationEmail}
              </Text>
              <PrimaryButton
                label={resendingConfirmation ? 'Enviando...' : 'Reenviar confirmacion'}
                variant="secondary"
                disabled={resendingConfirmation || Boolean(successTarget)}
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
                styles.noticeCard,
                { backgroundColor: colors.lossSoft, borderColor: colors.loss },
              ]}
            >
              <Text style={[styles.noticeText, { color: colors.loss }]}>{inlineError}</Text>
            </View>
          ) : null}

          <OrbitInput
            label={t('common.name')}
            value={name}
            onChangeText={setName}
            placeholder="Ana Rivera"
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
          />
          <OrbitInput
            label={t('common.email')}
            value={email}
            onChangeText={setEmail}
            placeholder="correo@ejemplo.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
          />
          <OrbitInput
            label={t('common.password')}
            value={password}
            onChangeText={setPassword}
            placeholder="Minimo 6 caracteres"
            autoCapitalize="none"
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <OrbitInput
            label={t('common.confirmPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repite tu contrasena"
            autoCapitalize="none"
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
          />

          <PrimaryButton
            label={submitting ? 'Creando cuenta...' : t('common.register')}
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            disabled={submitting || Boolean(successTarget)}
            onPress={async () => {
              setInlineError('');
              if (password !== confirmPassword) {
                const message = t('toast.invalidPasswordMatch');
                setInlineError(message);
                showToast(message, 'error');
                return;
              }

              setSubmitting(true);
              const result = await signUp(name, email, password);
              setSubmitting(false);
              if (result.ok) {
                setInlineError('');
                if (result.code === 'confirmation_required') {
                  setConfirmationEmail(email.trim().toLowerCase());
                  return;
                }

                setSuccessTarget('/home');
                return;
              }

              setInlineError(result.message);
            }}
          />

          <PrimaryButton
            label={t('common.login')}
            variant="secondary"
            style={styles.secondaryButton}
            disabled={Boolean(successTarget)}
            onPress={() => router.replace('/login')}
          />

          <Text style={[styles.meta, { color: colors.textMuted }]}>
            {authMeta.configured
              ? t('auth.providerLiveBody')
              : t('auth.providerLocalBody')}
          </Text>
        </GlassCard>
      </View>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    gap: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  heroBlock: {
    alignItems: 'center',
    gap: 8,
  },
  heroStage: {
    width: 246,
    height: 220,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 999,
  },
  heroEyebrow: {
    fontFamily: FONT.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
  heroTitle: {
    fontFamily: FONT.bold,
    fontSize: 25,
    lineHeight: 30,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 18,
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
  formCard: {
    marginTop: 4,
  },
  noticeCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  noticeTitle: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  noticeText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  meta: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 4,
  },
  primaryButton: {
    minHeight: 50,
  },
  secondaryButton: {
    minHeight: 48,
  },
});
