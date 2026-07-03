import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { FONT, withOpacity } from '../../constants/theme';
import { useI18n } from '../../hooks/useI18n';
import { useAuthStore } from '../../src/store/authStore';
import { useUiStore } from '../../src/store/uiStore';
import {
  AUTH_COLORS,
  BrandLogoHeader,
  CinematicBackground,
  SocialButtonsRow,
  SocialSeparator,
} from './AuthShared';

const { bg, border, primary, textPrimary, textMuted } = AUTH_COLORS;

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const signIn = useAuthStore((state) => state.signIn);
  const resendConfirmationEmail = useAuthStore((state) => state.resendConfirmationEmail);
  const sessionStatus = useAuthStore((state) => state.session.status);
  const showToast = useUiStore((state) => state.showToast);
  const { t } = useI18n();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState('');
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [successTarget, setSuccessTarget] = useState<string | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const passwordInputRef = useRef<TextInput>(null);

  // Redirect when already signed in
  useEffect(() => {
    if (sessionStatus === 'signed_out' || successTarget) return;
    router.replace('/home');
  }, [sessionStatus, successTarget]);

  const completeAuthSuccess = useCallback(() => {
    setSuccessTarget((current) => {
      if (!current) return current;
      router.replace(current);
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
    successTimerRef.current = setTimeout(() => completeAuthSuccess(), 950);
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, [completeAuthSuccess, successTarget]);

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(fadeAnim, { toValue: 1, useNativeDriver: true, tension: 56, friction: 9 }).start();
  }, [fadeAnim]);

  const runLogin = async () => {
    setInlineError('');
    setConfirmationEmail('');
    setSubmitting(true);
    const result = await signIn(email.trim().toLowerCase(), password);
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

  const copyrightYear = new Date().getFullYear();

  return (
    <View style={styles.root}>
      <CinematicBackground variant="form" />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoider}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          enabled={Platform.OS === 'ios'}
        >
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 20) + 16 },
          ]}
        >
          {/* Header logo (compact) */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
                ],
              },
            ]}
          >
            <BrandLogoHeader compact />
          </Animated.View>

          {/* Form card */}
          <Animated.View
            style={[
              styles.formCard,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) },
                ],
              },
            ]}
          >
            {/* Section headline */}
            <View style={styles.formHeadline}>
              <Text style={styles.formTitle}>{t('common.login')}</Text>
              <Text style={styles.formSubtitle}>{t('auth.loginSubtitle')}</Text>
            </View>

            {/* Confirmation notice */}
            {confirmationEmail ? (
              <View style={styles.noticeCard}>
                <Text style={styles.noticeTitle}>{t('authFlow.confirmEmailTitle')}</Text>
                <Text style={styles.noticeBody}>
                  {t('authFlow.confirmEmailBody', { email: confirmationEmail })}
                </Text>
                <Pressable
                  onPress={async () => {
                    const result = await resendConfirmationEmail(confirmationEmail);
                    if (!result.ok) setInlineError(result.message);
                    else showToast(t('authFlow.confirmationResent'), 'success');
                  }}
                  style={styles.noticeCta}
                >
                  <Text style={styles.noticeCtaText}>{t('authFlow.resendConfirmation')}</Text>
                </Pressable>
              </View>
            ) : null}

            {/* Error notice */}
            {inlineError ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>{inlineError}</Text>
              </View>
            ) : null}

            {/* Email field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t('common.email').toUpperCase()}</Text>
              <View
                style={[
                  styles.inputShell,
                  emailFocused && styles.inputShellFocused,
                ]}
              >
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="nombre@ejemplo.com"
                  placeholderTextColor={withOpacity(textMuted, 0.5)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  style={styles.input}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                />
              </View>
            </View>

            {/* Password field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t('common.password').toUpperCase()}</Text>
              <View
                style={[
                  styles.inputShell,
                  passwordFocused && styles.inputShellFocused,
                ]}
              >
                <TextInput
                  ref={passwordInputRef}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={withOpacity(textMuted, 0.5)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="done"
                  blurOnSubmit={false}
                  style={[styles.input, styles.inputFlex]}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  onSubmitEditing={() => {
                    if (!submitting && !successTarget) void runLogin();
                  }}
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={10}
                  accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={passwordFocused ? primary : textMuted}
                  />
                </Pressable>
              </View>
              <Pressable
                onPress={() => router.push('/forgot-password')}
                style={styles.forgotWrap}
              >
                <Text style={styles.forgotText}>{t('authFlow.forgotPassword')}</Text>
              </Pressable>
            </View>

            {/* Submit */}
            <Pressable
              onPress={() => { void runLogin(); }}
              disabled={submitting || Boolean(successTarget)}
              style={({ pressed }) => [
                styles.btnPrimary,
                (submitting || Boolean(successTarget)) && styles.btnDisabled,
                pressed && styles.btnPressed,
              ]}
              accessibilityRole="button"
            >
              <Text style={styles.btnPrimaryText}>
                {submitting ? t('authFlow.signingIn') : t('common.login')}
              </Text>
            </Pressable>

            {/* Separator + social */}
            <SocialSeparator />
            <SocialButtonsRow variant="rect" />

            {/* Sign-up link */}
            <View style={styles.signupRow}>
              <Text style={styles.signupBody}>{t('authFlow.noAccount')}</Text>
              <Pressable onPress={() => router.push('/register')}>
                <Text style={styles.signupLink}>{t('authFlow.createAccount')}</Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerLinks}>
              {([
                t('authFlow.termsLink'),
                t('authFlow.privacyLink'),
                t('authFlow.riskLink'),
              ]).map((label) => (
                <Pressable key={label} onPress={() => showToast(t('authFlow.linkComingSoon', { label }), 'info')}>
                  <Text style={styles.footerLink}>{label}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.footerCopyright}>
              {t('authFlow.copyright', { year: copyrightYear })}
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
    paddingTop: 20,
    gap: 20,
  },
  // Header
  header: {
    alignItems: 'center',
    paddingTop: 8,
  },
  // Form card (glass panel)
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
  // Notices
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
  // Fields
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
  inputShellFocused: {
    borderColor: primary,
    shadowColor: primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
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
  forgotWrap: {
    alignSelf: 'flex-end',
    paddingVertical: 2,
  },
  forgotText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: primary,
    letterSpacing: 0.2,
  },
  // Buttons
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
  // Sign-up link
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
  // Footer
  footer: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
    paddingBottom: 8,
  },
  footerLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    columnGap: 18,
  },
  footerLink: {
    fontFamily: FONT.medium,
    fontSize: 11,
    color: textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    opacity: 0.7,
    paddingVertical: 3,
  },
  footerCopyright: {
    fontFamily: FONT.medium,
    fontSize: 10,
    color: textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.5,
    textAlign: 'center',
  },
});
