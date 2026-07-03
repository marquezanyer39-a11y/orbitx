import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AUTH_COLORS, BrandLogoHeader, CinematicBackground } from '../components/auth/AuthShared';
import { FONT, withOpacity } from '../constants/theme';
import { useI18n } from '../hooks/useI18n';
import { useAuthStore } from '../src/store/authStore';
import { useUiStore } from '../src/store/uiStore';
import { getOrbitAuthMeta } from '../utils/orbitAuth';

const { bg, border, primary, textPrimary, textMuted } = AUTH_COLORS;
const isIos = Platform.OS === 'ios';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const signUp = useAuthStore((state) => state.signUp);
  const resendConfirmationEmail = useAuthStore((state) => state.resendConfirmationEmail);
  const sessionStatus = useAuthStore((state) => state.session.status);
  const showToast = useUiStore((state) => state.showToast);
  const { t } = useI18n();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resendingConfirmation, setResendingConfirmation] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [inlineError, setInlineError] = useState('');
  const [successTarget, setSuccessTarget] = useState<string | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
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

  const runRegister = async () => {
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
  };

  return (
    <View style={styles.root}>
      <CinematicBackground variant="form" />

      <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
        <KeyboardAvoidingView
          style={styles.keyboardAvoider}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          enabled={Platform.OS === 'ios'}
          pointerEvents="box-none"
        >
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 20) + 16 },
            ]}
          >
            {/* Top bar */}
            <View style={styles.topBar}>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [styles.backButton, pressed && styles.btnPressed]}
              >
                <Ionicons name="chevron-back" size={18} color={textPrimary} />
              </Pressable>
            </View>

            {/* Header logo (compact) */}
            <View style={styles.header}>
              <BrandLogoHeader compact />
            </View>

            {/* Form card */}
            <View style={styles.formCard}>
              <View style={styles.formHeadline}>
                <Text style={styles.formTitle}>{t('authFlow.createAccount')}</Text>
                <Text style={styles.formSubtitle}>{t('authFlow.activateTitle')}</Text>
              </View>

              {/* Confirmation notice */}
              {confirmationEmail ? (
                <View style={styles.noticeCard}>
                  <Text style={styles.noticeTitle}>{t('auth.checkEmailTitle')}</Text>
                  <Text style={styles.noticeBody}>
                    {t('auth.checkEmailBody')} {confirmationEmail}
                  </Text>
                  <Pressable
                    onPress={async () => {
                      setResendingConfirmation(true);
                      const result = await resendConfirmationEmail(confirmationEmail);
                      setResendingConfirmation(false);
                      if (!result.ok) {
                        setInlineError(result.message);
                      }
                    }}
                    disabled={resendingConfirmation || Boolean(successTarget)}
                    style={styles.noticeCta}
                  >
                    <Text style={styles.noticeCtaText}>
                      {resendingConfirmation ? 'Enviando...' : 'Reenviar confirmación'}
                    </Text>
                  </Pressable>
                </View>
              ) : null}

              {/* Error notice */}
              {inlineError ? (
                <View style={styles.errorCard}>
                  <Text style={styles.errorText}>{inlineError}</Text>
                </View>
              ) : null}

              {/* Name field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{t('common.name').toUpperCase()}</Text>
                <View style={styles.inputShell}>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Ana Rivera"
                    placeholderTextColor={withOpacity(textMuted, 0.5)}
                    autoCapitalize="words"
                    autoCorrect={false}
                    autoComplete="name"
                    textContentType={isIos ? 'name' : 'none'}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    style={styles.input}
                    onSubmitEditing={() => emailInputRef.current?.focus()}
                  />
                </View>
              </View>

              {/* Email field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{t('common.email').toUpperCase()}</Text>
                <View style={styles.inputShell}>
                  <TextInput
                    ref={emailInputRef}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="correo@ejemplo.com"
                    placeholderTextColor={withOpacity(textMuted, 0.5)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    keyboardType="email-address"
                    autoComplete="email"
                    textContentType={isIos ? 'emailAddress' : 'none'}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    style={styles.input}
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                  />
                </View>
              </View>

              {/* Password field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{t('common.password').toUpperCase()}</Text>
                <View style={styles.inputShell}>
                  <TextInput
                    ref={passwordInputRef}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t('auth.passwordHint')}
                    placeholderTextColor={withOpacity(textMuted, 0.5)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    secureTextEntry={!showPassword}
                    autoComplete="new-password"
                    textContentType={isIos ? 'newPassword' : 'none'}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    style={[styles.input, styles.inputFlex]}
                    onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
                  />
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={10}
                    accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={textMuted}
                    />
                  </Pressable>
                </View>
              </View>

              {/* Confirm password field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{t('common.confirmPassword').toUpperCase()}</Text>
                <View style={styles.inputShell}>
                  <TextInput
                    ref={confirmPasswordInputRef}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder={t('authFlow.confirmPasswordPlaceholder')}
                    placeholderTextColor={withOpacity(textMuted, 0.5)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    secureTextEntry={!showConfirmPassword}
                    autoComplete="new-password"
                    textContentType={isIos ? 'newPassword' : 'none'}
                    returnKeyType="done"
                    blurOnSubmit={false}
                    style={[styles.input, styles.inputFlex]}
                    onSubmitEditing={() => {
                      if (!submitting && !successTarget) void runRegister();
                    }}
                  />
                  <Pressable
                    onPress={() => setShowConfirmPassword((v) => !v)}
                    hitSlop={10}
                    accessibilityLabel={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={textMuted}
                    />
                  </Pressable>
                </View>
              </View>

              {/* Submit */}
              <Pressable
                onPress={() => {
                  void runRegister();
                }}
                disabled={submitting || Boolean(successTarget)}
                style={({ pressed }) => [
                  styles.btnPrimary,
                  (submitting || Boolean(successTarget)) && styles.btnDisabled,
                  pressed && styles.btnPressed,
                ]}
                accessibilityRole="button"
              >
                <Text style={styles.btnPrimaryText}>
                  {submitting ? t('authFlow.creatingAccount') : t('common.register')}
                </Text>
              </Pressable>

              {/* Login link */}
              <View style={styles.signupRow}>
                <Text style={styles.signupBody}>{t('authFlow.haveAccount')}</Text>
                <Pressable onPress={() => router.replace('/login')} disabled={Boolean(successTarget)}>
                  <Text style={styles.signupLink}>{t('common.login')}</Text>
                </Pressable>
              </View>

              <Text style={styles.meta}>
                {authMeta.configured ? t('auth.providerLiveBody') : t('auth.providerLocalBody')}
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: bg,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoider: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 16,
  },
  topBar: {
    alignItems: 'flex-start',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: withOpacity(border, 0.8),
    backgroundColor: 'rgba(13,18,32,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: 4,
  },
  formCard: {
    backgroundColor: 'rgba(13,18,32,0.78)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: withOpacity(border, 0.7),
    padding: 20,
    gap: 16,
  },
  formHeadline: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  formTitle: {
    fontFamily: FONT.bold,
    fontSize: 24,
    color: textPrimary,
    letterSpacing: -0.4,
  },
  formSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: textMuted,
  },
  noticeCard: {
    backgroundColor: withOpacity(primary, 0.07),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: withOpacity(primary, 0.2),
    padding: 12,
    gap: 6,
  },
  noticeTitle: {
    fontFamily: FONT.semibold,
    fontSize: 13,
    color: textPrimary,
  },
  noticeBody: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: textMuted,
    lineHeight: 17,
  },
  noticeCta: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  noticeCtaText: {
    fontFamily: FONT.semibold,
    fontSize: 12,
    color: primary,
  },
  errorCard: {
    backgroundColor: 'rgba(255,82,82,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,82,82,0.26)',
    padding: 10,
  },
  errorText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: '#FF9898',
    lineHeight: 17,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: FONT.medium,
    fontSize: 10,
    color: textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginLeft: 2,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: withOpacity(border, 0.8),
    backgroundColor: 'rgba(13,18,32,0.7)',
    paddingHorizontal: 14,
    gap: 8,
  },
  input: {
    fontFamily: FONT.regular,
    fontSize: 15,
    color: textPrimary,
    flex: 1,
    paddingVertical: 0,
  },
  inputFlex: {
    flex: 1,
  },
  btnPrimary: {
    height: 56,
    borderRadius: 14,
    backgroundColor: primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.976 }],
  },
  btnPrimaryText: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: bg,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  signupBody: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: textMuted,
  },
  signupLink: {
    fontFamily: FONT.semibold,
    fontSize: 14,
    color: primary,
  },
  meta: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    color: textMuted,
    marginTop: 2,
  },
});
