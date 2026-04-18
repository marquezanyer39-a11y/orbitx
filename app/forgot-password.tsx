import { router } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { AuthModeCard } from '../components/common/AuthModeCard';
import { GlassCard } from '../components/common/GlassCard';
import { PageHeader } from '../components/common/PageHeader';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { Screen } from '../components/common/Screen';
import { OrbitInput } from '../components/forms/OrbitInput';
import { useI18n } from '../hooks/useI18n';
import { useAuthStore } from '../src/store/authStore';
import { getOrbitAuthMeta } from '../utils/orbitAuth';

export default function ForgotPasswordScreen() {
  const requestPasswordReset = useAuthStore((state) => state.requestPasswordReset);
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState('');
  const authMeta = getOrbitAuthMeta();

  return (
    <Screen>
      <PageHeader
        title={t('auth.forgotTitle')}
        subtitle={t('auth.forgotSubtitle')}
        rightSlot={
          <PrimaryButton label={t('common.close')} variant="secondary" onPress={() => router.back()} />
        }
      />

      <AuthModeCard
        title={authMeta.configured ? t('auth.providerLive') : t('auth.providerLocal')}
        body={authMeta.configured ? t('auth.providerLiveBody') : t('auth.providerLocalBody')}
        live={authMeta.configured}
      />

      <GlassCard highlighted>
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
      </GlassCard>

      {inlineError ? (
        <GlassCard>
          <Text style={styles.errorText}>{inlineError}</Text>
        </GlassCard>
      ) : null}

      <PrimaryButton
        label={t('auth.forgotCta')}
        disabled={submitting}
        onPress={async () => {
          setInlineError('');
          setSubmitting(true);
          const result = await requestPasswordReset(email);
          setSubmitting(false);
          if (result.ok) {
            router.replace('/login');
            return;
          }

          setInlineError(result.message);
        }}
      />
      <PrimaryButton label={t('common.login')} variant="secondary" onPress={() => router.replace('/login')} />
    </Screen>
  );
}

const styles = {
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500' as const,
  },
};
