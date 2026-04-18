import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthModeCard } from '../../components/common/AuthModeCard';
import { GlassCard } from '../../components/common/GlassCard';
import { OrbitLogo } from '../../components/common/OrbitLogo';
import { PageHeader } from '../../components/common/PageHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { Screen } from '../../components/common/Screen';
import { OrbitInput } from '../../components/forms/OrbitInput';
import { FONT, SPACING } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useI18n } from '../../hooks/useI18n';
import { useAuthStore } from '../../src/store/authStore';
import { useUiStore } from '../../src/store/uiStore';
import { getOrbitAuthMeta } from '../../utils/orbitAuth';

export default function ResetPasswordScreen() {
  const completePasswordReset = useAuthStore((state) => state.completePasswordReset);
  const showToast = useUiStore((state) => state.showToast);
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const authMeta = getOrbitAuthMeta();

  return (
    <Screen>
      <PageHeader
        title={t('auth.resetTitle')}
        subtitle={t('auth.resetSubtitle')}
        rightSlot={
          <PrimaryButton label={t('common.close')} variant="secondary" onPress={() => router.replace('/login')} />
        }
      />

      <GlassCard highlighted>
        <View style={styles.hero}>
          <OrbitLogo size={68} showWordmark={false} />
          <View style={styles.heroCopy}>
            <Text style={[styles.heroTitle, { color: colors.text }]}>{t('auth.resetReady')}</Text>
            <Text style={[styles.heroBody, { color: colors.textSoft }]}>{t('auth.passwordHint')}</Text>
          </View>
        </View>
      </GlassCard>

      <AuthModeCard
        title={authMeta.configured ? t('auth.providerLive') : t('auth.providerLocal')}
        body={authMeta.configured ? t('auth.providerLiveBody') : t('auth.providerLocalBody')}
        live={authMeta.configured}
      />

      <OrbitInput
        label={t('common.password')}
        value={password}
        onChangeText={setPassword}
        placeholder="******"
        autoCapitalize="none"
        secureTextEntry
      />
      <OrbitInput
        label={t('common.confirmPassword')}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="******"
        autoCapitalize="none"
        secureTextEntry
      />

      <PrimaryButton
        label={t('auth.resetCta')}
        disabled={submitting}
        onPress={async () => {
          if (password !== confirmPassword) {
            showToast(t('toast.invalidPasswordMatch'), 'error');
            return;
          }

          setSubmitting(true);
          const result = await completePasswordReset(password);
          setSubmitting(false);

          if (result.ok) {
            router.replace('/home');
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  heroCopy: {
    flex: 1,
    gap: 4,
  },
  heroTitle: {
    fontFamily: FONT.semibold,
    fontSize: 16,
  },
  heroBody: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 20,
  },
});
