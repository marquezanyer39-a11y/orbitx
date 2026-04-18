import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import {
  AuthError,
  type AuthChangeEvent,
  type Session,
  createClient,
} from '@supabase/supabase-js';

import type { AuthProvider } from '../types';

type OrbitAuthStatus = 'local' | 'live';

interface OrbitAuthResult {
  ok: boolean;
  message: string;
  code?: string;
  requiresEmailConfirmation?: boolean;
  session?: Session | null;
}

interface OrbitAuthCallbackResult extends OrbitAuthResult {
  flowType?: string;
}

interface NormalizedOrbitAuthError {
  message: string;
  code?: string;
}

function isConfiguredEnvValue(value: string) {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return ![
    'tu_clave_aqui',
    'your-publishable-key',
    'your-anon-key',
    'your-project-url',
  ].includes(normalized);
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
  '';
const authConfigured =
  isConfiguredEnvValue(supabaseUrl) && isConfiguredEnvValue(supabasePublishableKey);

const supabase = authConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export function getOrbitAuthMeta() {
  return {
    configured: authConfigured,
    provider: (authConfigured ? 'supabase' : 'local') as AuthProvider,
    status: (authConfigured ? 'live' : 'local') as OrbitAuthStatus,
    redirectUrl: Linking.createURL('/auth/reset'),
  };
}

export function looksLikeOrbitAuthCallbackUrl(url: string) {
  return (
    url.includes('access_token=') ||
    url.includes('refresh_token=') ||
    url.includes('error_description=') ||
    url.includes('type=recovery')
  );
}

function normalizeAuthError(
  error: AuthError | Error | null,
  fallback: string,
): NormalizedOrbitAuthError {
  if (!error) {
    return { message: fallback };
  }

  const message = error.message || fallback;
  const normalized = message.trim().toLowerCase();

  if (
    normalized.includes('user already registered') ||
    normalized.includes('already registered')
  ) {
    return {
      message: 'Ese correo ya esta registrado.',
      code: 'user_already_registered',
    };
  }

  if (normalized.includes('email not confirmed')) {
    return {
      message: 'Debes confirmar tu correo antes de ingresar. Revisa tu bandeja y spam.',
      code: 'email_not_confirmed',
    };
  }

  if (normalized.includes('invalid login credentials')) {
    return {
      message: 'Correo o contrasena incorrectos.',
      code: 'invalid_login_credentials',
    };
  }

  if (
    normalized.includes('password should be at least') ||
    normalized.includes('password must be at least')
  ) {
    return {
      message: 'La contrasena debe tener al menos 6 caracteres.',
      code: 'weak_password',
    };
  }

  if (
    normalized.includes('network request failed') ||
    normalized.includes('fetch failed') ||
    normalized.includes('failed to fetch')
  ) {
    return {
      message: 'No se pudo conectar con el servicio de acceso. Intenta otra vez.',
      code: 'network_error',
    };
  }

  if (
    normalized.includes('signup is disabled') ||
    normalized.includes('signups not allowed')
  ) {
    return {
      message: 'El registro por correo no esta habilitado en este momento.',
      code: 'signup_disabled',
    };
  }

  return {
    message,
    code: error instanceof AuthError ? error.code : undefined,
  };
}

function parseAuthParams(url: string) {
  const [base, hashFragment = ''] = url.split('#');
  const queryString = base.includes('?') ? base.split('?')[1] ?? '' : '';
  const queryParams = new URLSearchParams(queryString);
  const hashParams = new URLSearchParams(hashFragment);

  const read = (key: string) => hashParams.get(key) ?? queryParams.get(key) ?? '';

  return {
    accessToken: read('access_token'),
    refreshToken: read('refresh_token'),
    type: read('type'),
    errorCode: read('error_code'),
    errorDescription: read('error_description'),
  };
}

export async function signInWithOrbitEmail(email: string, password: string): Promise<OrbitAuthResult> {
  if (!supabase) {
    return {
      ok: false,
      message: 'El acceso por correo no esta configurado.',
      code: 'auth_not_configured',
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const normalized = normalizeAuthError(error, 'Unable to sign in.');
    return {
      ok: false,
      message: normalized.message,
      code: normalized.code ?? error.code ?? 'auth_error',
    };
  }

  return {
    ok: true,
    message: 'Signed in with Supabase.',
    code: 'signed_in',
    session: data.session,
  };
}

export async function signUpWithOrbitEmail(
  name: string,
  email: string,
  password: string,
): Promise<OrbitAuthResult> {
  if (!supabase) {
    return {
      ok: false,
      message: 'El acceso por correo no esta configurado.',
      code: 'auth_not_configured',
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getOrbitAuthMeta().redirectUrl,
      data: {
        full_name: name,
      },
    },
  });

  if (error) {
    const normalized = normalizeAuthError(error, 'Unable to create the account.');
    return {
      ok: false,
      message: normalized.message,
      code: normalized.code ?? error.code ?? 'auth_error',
    };
  }

  return {
    ok: true,
    message: data.session ? 'Account created and signed in.' : 'Email confirmation required.',
    code: data.session ? 'signed_in' : 'confirmation_required',
    requiresEmailConfirmation: !data.session,
    session: data.session,
  };
}

export async function requestOrbitPasswordReset(email: string): Promise<OrbitAuthResult> {
  if (!supabase) {
    return {
      ok: false,
      message: 'El acceso por correo no esta configurado.',
      code: 'auth_not_configured',
    };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getOrbitAuthMeta().redirectUrl,
  });

  if (error) {
    const normalized = normalizeAuthError(error, 'Unable to send the recovery email.');
    return {
      ok: false,
      message: normalized.message,
      code: normalized.code ?? error.code ?? 'auth_error',
    };
  }

  return {
    ok: true,
    message: 'Recovery email sent.',
    code: 'recovery_sent',
  };
}

export async function resendOrbitEmailConfirmation(email: string): Promise<OrbitAuthResult> {
  if (!supabase) {
    return {
      ok: false,
      message: 'El acceso por correo no esta configurado.',
      code: 'auth_not_configured',
    };
  }

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: getOrbitAuthMeta().redirectUrl,
    },
  });

  if (error) {
    const normalized = normalizeAuthError(error, 'Unable to resend the confirmation email.');
    return {
      ok: false,
      message: normalized.message,
      code: normalized.code ?? error.code ?? 'auth_error',
    };
  }

  return {
    ok: true,
    message: 'Confirmation email sent.',
    code: 'confirmation_resent',
  };
}

export async function updateOrbitAuthPassword(password: string): Promise<OrbitAuthResult> {
  if (!supabase) {
    return {
      ok: false,
      message: 'El acceso por correo no esta configurado.',
      code: 'auth_not_configured',
    };
  }

  const { data, error } = await supabase.auth.updateUser({ password });

  if (error) {
    const normalized = normalizeAuthError(error, 'Unable to update the password.');
    return {
      ok: false,
      message: normalized.message,
      code: normalized.code ?? error.code ?? 'auth_error',
    };
  }

  return {
    ok: true,
    message: 'Password updated.',
    code: 'password_updated',
    session: data.user ? await getOrbitAuthSession() : null,
  };
}

export async function getOrbitAuthSession() {
  if (!supabase) {
    return null;
  }

  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function subscribeToOrbitAuth(
  onChange: (event: AuthChangeEvent, session: Session | null) => void,
) {
  if (!supabase) {
    return () => undefined;
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(onChange);

  return () => {
    subscription.unsubscribe();
  };
}

export async function signOutOrbitAuth() {
  if (!supabase) {
    return;
  }

  await supabase.auth.signOut();
}

export async function applyOrbitAuthCallbackUrl(url: string): Promise<OrbitAuthCallbackResult> {
  if (!supabase) {
    return {
      ok: false,
      message: 'El acceso por correo no esta configurado.',
      code: 'auth_not_configured',
    };
  }

  const params = parseAuthParams(url);

  if (params.errorCode || params.errorDescription) {
    return {
      ok: false,
      message: params.errorDescription || 'Authentication callback failed.',
      code: params.errorCode || 'auth_callback_error',
    };
  }

  if (!params.accessToken || !params.refreshToken) {
    return {
      ok: false,
      message: 'No auth tokens were found in the callback.',
      code: 'auth_callback_missing_tokens',
    };
  }

  const { error } = await supabase.auth.setSession({
    access_token: params.accessToken,
    refresh_token: params.refreshToken,
  });

  if (error) {
    const normalized = normalizeAuthError(error, 'Unable to restore the auth session.');
    return {
      ok: false,
      message: normalized.message,
      code: normalized.code ?? error.code ?? 'auth_callback_error',
    };
  }

  return {
    ok: true,
    message: 'Authentication callback processed.',
    code: params.type === 'recovery' ? 'password_recovery' : 'signed_in',
    flowType: params.type,
    session: await getOrbitAuthSession(),
  };
}
