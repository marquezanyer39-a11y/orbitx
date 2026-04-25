import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session as SupabaseSession } from '@supabase/supabase-js';
import * as Haptics from 'expo-haptics';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { translate } from '../../constants/i18n';
import { ORBITX_AUTH_STORAGE_KEY } from '../../constants/storage';
import type { ActionResult, SessionState, UserProfile } from '../../types';
import {
  applyOrbitAuthCallbackUrl,
  getOrbitAuthMeta,
  getOrbitAuthSession,
  requestOrbitPasswordReset,
  resendOrbitEmailConfirmation,
  signInWithOrbitEmail,
  signOutOrbitAuth,
  signUpWithOrbitEmail,
  updateOrbitAuthPassword,
} from '../../utils/orbitAuth';
import { ensureOrbitUserId } from '../../utils/orbitUserId';
import { isValidEmail, isValidName, isValidPassword } from '../../utils/validation';
import { useOrbitStore } from '../../store/useOrbitStore';
import { useUiStore } from './uiStore';

interface AuthStoreState {
  hasHydrated: boolean;
  hasBootstrapped: boolean;
  isRestoring: boolean;
  profile: UserProfile;
  session: SessionState;
}

interface AuthStoreActions {
  signIn: (email: string, password: string) => Promise<ActionResult>;
  signUp: (name: string, email: string, password: string) => Promise<ActionResult>;
  updateProfile: (name: string) => ActionResult;
  updateAvatar: (avatarUri: string | null) => ActionResult;
  requestPasswordReset: (email: string) => Promise<ActionResult>;
  resendConfirmationEmail: (email: string) => Promise<ActionResult>;
  completePasswordReset: (password: string) => Promise<ActionResult>;
  restoreAuthSession: () => Promise<void>;
  handleAuthCallbackUrl: (url: string) => Promise<ActionResult>;
  signOut: () => Promise<void>;
  syncSupabaseSession: (session: SupabaseSession | null) => void;
  setHasHydrated: (value: boolean) => void;
}

export type AuthStore = AuthStoreState & AuthStoreActions;

const initialProfile: UserProfile = {
  orbitId: ensureOrbitUserId(undefined, { name: 'OrbitX User' }),
  name: 'OrbitX User',
  email: '',
  handle: '@orbitxuser',
  avatar: 'OX',
  avatarUri: null,
  level: 'Pro Trader',
  walletMode: 'custodial',
};

const initialSession: SessionState = {
  status: 'signed_out',
  provider: 'local',
  recoveryEmail: '',
  passwordResetPending: false,
  emailConfirmed: false,
};

function fireFeedback(tone: 'success' | 'error' | 'info') {
  if (tone === 'error') {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    return;
  }

  if (tone === 'success') {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return;
  }

  void Haptics.selectionAsync();
}

function buildResult(ok: boolean, message: string, code?: string): ActionResult {
  return { ok, message, code };
}

function initialsFromName(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? '')
    .join('');

  return initials || 'OX';
}

function handleFromIdentity(name: string, email: string) {
  const base =
    name.trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase() ||
    email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  return `@${base.slice(0, 14) || 'orbitxuser'}`;
}

function buildProfileFromSupabaseSession(
  currentProfile: UserProfile,
  session: SupabaseSession,
): UserProfile {
  const nextEmail = session.user.email?.trim().toLowerCase() || currentProfile.email;
  const sameAccount = currentProfile.email === nextEmail;
  const metadataName =
    typeof session.user.user_metadata?.full_name === 'string'
      ? session.user.user_metadata.full_name.trim()
      : '';
  const nextName =
    (sameAccount ? currentProfile.name : '') ||
    metadataName ||
    nextEmail.split('@')[0] ||
    'OrbitX User';
  const nextHandle =
    (sameAccount ? currentProfile.handle : '') || handleFromIdentity(nextName, nextEmail);
  const nextOrbitId = ensureOrbitUserId(sameAccount ? currentProfile.orbitId : undefined, {
    userId: session.user.id,
    email: nextEmail,
    name: nextName,
  });

  return {
    ...currentProfile,
    orbitId: nextOrbitId,
    name: nextName,
    email: nextEmail,
    avatar: initialsFromName(nextName),
    avatarUri:
      (sameAccount ? currentProfile.avatarUri : null) ||
      (typeof session.user.user_metadata?.avatar_url === 'string'
        ? session.user.user_metadata.avatar_url
        : null),
    handle: nextHandle,
  };
}

function buildSessionFromSupabaseSession(
  currentSession: SessionState,
  session: SupabaseSession,
  overrides?: Partial<SessionState>,
): SessionState {
  return {
    ...currentSession,
    status: 'authenticated',
    provider: 'supabase',
    recoveryEmail: session.user.email?.trim().toLowerCase() || currentSession.recoveryEmail,
    passwordResetPending: false,
    emailConfirmed: Boolean(session.user.email_confirmed_at),
    lastAuthAt: new Date().toISOString(),
    ...overrides,
  };
}

function syncLegacyProfile(nextProfile: UserProfile) {
  useOrbitStore.setState((state) => ({
    profile: {
      ...state.profile,
      orbitId: nextProfile.orbitId,
      name: nextProfile.name,
      email: nextProfile.email,
      handle: nextProfile.handle,
      avatar: nextProfile.avatar,
    },
  }));
}

function clearWalletSessionView() {
  try {
    const { useWalletStore } = require('./walletStore') as typeof import('./walletStore');
    useWalletStore.getState().clearSessionWalletState();
  } catch {
    // Ignore circular bootstrap timing errors.
  }
}

function hydrateWalletForCurrentSession() {
  try {
    const { useWalletStore } = require('./walletStore') as typeof import('./walletStore');
    const walletStore = useWalletStore.getState();
    walletStore.clearSessionWalletState();
    void walletStore.hydrateWallet();
  } catch {
    // Ignore circular bootstrap timing errors.
  }
}

function getLanguage() {
  return useOrbitStore.getState().settings.language;
}

function showToast(message: string, tone: 'success' | 'error' | 'info' = 'info') {
  useUiStore.getState().showToast(message, tone);
  fireFeedback(tone);
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      hasBootstrapped: false,
      isRestoring: false,
      profile: initialProfile,
      session: initialSession,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      syncSupabaseSession: (session) => {
        if (!session) {
          syncLegacyProfile(initialProfile);
          set((state) => ({
            hasBootstrapped: true,
            isRestoring: false,
            profile: initialProfile,
            session: {
              ...state.session,
              status: 'signed_out',
              provider: 'supabase',
              passwordResetPending: false,
              emailConfirmed: false,
            },
          }));
          clearWalletSessionView();
          return;
        }

        const nextProfile = buildProfileFromSupabaseSession(get().profile, session);
        syncLegacyProfile(nextProfile);
        set((state) => ({
          hasBootstrapped: true,
          isRestoring: false,
          profile: nextProfile,
          session: buildSessionFromSupabaseSession(state.session, session),
        }));
        hydrateWalletForCurrentSession();
      },

      signIn: async (email, password) => {
        const language = getLanguage();
        const authMeta = getOrbitAuthMeta();
        const cleanedEmail = email.trim().toLowerCase();
        const normalizedPassword = password.trim();

        if (!isValidEmail(cleanedEmail)) {
          const message = translate(language, 'toast.invalidEmail');
          showToast(message, 'error');
          return buildResult(false, message, 'invalid_email');
        }

        if (!isValidPassword(normalizedPassword)) {
          const message = translate(language, 'toast.invalidPassword');
          showToast(message, 'error');
          return buildResult(false, message, 'invalid_password');
        }

        if (authMeta.configured) {
          try {
            const result = await signInWithOrbitEmail(cleanedEmail, normalizedPassword);
            if (!result.ok || !result.session) {
              set((state) => ({
                session: {
                  ...state.session,
                  status: 'signed_out',
                  provider: 'supabase',
                  passwordResetPending: false,
                  emailConfirmed: false,
                },
              }));
              showToast(result.message, 'error');
              return buildResult(false, result.message, result.code);
            }

            const nextProfile = buildProfileFromSupabaseSession(get().profile, result.session);
            const nextSession = buildSessionFromSupabaseSession(get().session, result.session);
            syncLegacyProfile(nextProfile);
            set({
              hasBootstrapped: true,
              isRestoring: false,
              profile: nextProfile,
              session: nextSession,
            });
            hydrateWalletForCurrentSession();
            showToast(translate(language, 'toast.loginReadyReal'), 'success');
            return buildResult(true, 'Sign in completed', 'signed_in');
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'No se pudo iniciar sesion ahora.';
            set((state) => ({
              hasBootstrapped: true,
              isRestoring: false,
              session: {
                ...state.session,
                status: 'signed_out',
                provider: 'supabase',
                passwordResetPending: false,
                emailConfirmed: false,
              },
            }));
            showToast(message, 'error');
            return buildResult(false, message, 'sign_in_error');
          }
        }

        const nextProfile = {
          ...get().profile,
          orbitId: ensureOrbitUserId(get().profile.orbitId, {
            email: cleanedEmail,
            name: get().profile.name,
          }),
          email: cleanedEmail,
          handle: handleFromIdentity(get().profile.name, cleanedEmail),
        };
        syncLegacyProfile(nextProfile);
        set((state) => ({
          hasBootstrapped: true,
          isRestoring: false,
          profile: nextProfile,
          session: {
            ...state.session,
            status: 'authenticated',
            provider: 'local',
            passwordResetPending: false,
            emailConfirmed: true,
            lastAuthAt: new Date().toISOString(),
          },
        }));
        hydrateWalletForCurrentSession();
        showToast(translate(language, 'toast.loginReady'), 'success');
        return buildResult(true, 'Sign in simulated', 'signed_in');
      },

      signUp: async (name, email, password) => {
        const language = getLanguage();
        const authMeta = getOrbitAuthMeta();
        const cleanedName = name.trim();
        const cleanedEmail = email.trim().toLowerCase();
        const normalizedPassword = password.trim();

        if (!isValidName(cleanedName)) {
          const message = translate(language, 'toast.invalidName');
          showToast(message, 'error');
          return buildResult(false, message, 'invalid_name');
        }

        if (!isValidEmail(cleanedEmail)) {
          const message = translate(language, 'toast.invalidEmail');
          showToast(message, 'error');
          return buildResult(false, message, 'invalid_email');
        }

        if (!isValidPassword(normalizedPassword)) {
          const message = translate(language, 'toast.invalidPassword');
          showToast(message, 'error');
          return buildResult(false, message, 'invalid_password');
        }

        if (authMeta.configured) {
          try {
            const result = await signUpWithOrbitEmail(cleanedName, cleanedEmail, normalizedPassword);
            if (!result.ok) {
              showToast(result.message, 'error');
              return buildResult(false, result.message, result.code);
            }

            const nextProfile = result.session
              ? buildProfileFromSupabaseSession(get().profile, result.session)
              : {
                  ...get().profile,
                  orbitId: ensureOrbitUserId(undefined, {
                    email: cleanedEmail,
                    name: cleanedName,
                  }),
                  name: cleanedName,
                  email: cleanedEmail,
                  avatar: initialsFromName(cleanedName),
                  handle: handleFromIdentity(cleanedName, cleanedEmail),
                };

          const nextSession: SessionState = result.session
            ? buildSessionFromSupabaseSession(get().session, result.session)
            : {
                ...get().session,
                status: 'signed_out' as const,
                provider: 'supabase' as const,
                recoveryEmail: cleanedEmail,
                passwordResetPending: false,
                emailConfirmed: false,
              };

            syncLegacyProfile(nextProfile);
            set({
              hasBootstrapped: true,
              isRestoring: false,
              profile: nextProfile,
              session: nextSession,
            });
            if (result.session) {
              hydrateWalletForCurrentSession();
            } else {
              clearWalletSessionView();
            }

            showToast(
              result.requiresEmailConfirmation
                ? translate(language, 'toast.registerCheckEmail')
                : translate(language, 'toast.registerReadyReal'),
              'success',
            );

            return buildResult(
              true,
              result.requiresEmailConfirmation ? 'Email confirmation required' : 'Signed in after sign up',
              result.requiresEmailConfirmation ? 'confirmation_required' : 'signed_in',
            );
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'No se pudo crear la cuenta ahora.';
            showToast(message, 'error');
            return buildResult(false, message, 'sign_up_error');
          }
        }

        const nextProfile = {
          ...get().profile,
          orbitId: ensureOrbitUserId(get().profile.orbitId, {
            email: cleanedEmail,
            name: cleanedName,
          }),
          name: cleanedName,
          email: cleanedEmail,
          avatar: initialsFromName(cleanedName),
          handle: handleFromIdentity(cleanedName, cleanedEmail),
        };
        syncLegacyProfile(nextProfile);
        set((state) => ({
          hasBootstrapped: true,
          isRestoring: false,
          profile: nextProfile,
          session: {
            ...state.session,
            status: 'authenticated',
            provider: 'local',
            passwordResetPending: false,
            emailConfirmed: true,
            lastAuthAt: new Date().toISOString(),
          },
        }));
        hydrateWalletForCurrentSession();
        showToast(translate(language, 'toast.registerReady'), 'success');
        return buildResult(true, 'Sign up simulated', 'signed_in');
      },

      updateProfile: (name) => {
        const cleanedName = name.trim();
        const language = getLanguage();

        if (!isValidName(cleanedName)) {
          const message = translate(language, 'toast.invalidName');
          showToast(message, 'error');
          return buildResult(false, message, 'invalid_name');
        }

        const nextProfile: UserProfile = {
          ...get().profile,
          name: cleanedName,
          avatar: initialsFromName(cleanedName),
          handle: handleFromIdentity(cleanedName, get().profile.email),
        };

        syncLegacyProfile(nextProfile);
        set({ profile: nextProfile });
        showToast('Perfil actualizado', 'success');
        return buildResult(true, 'Profile updated', 'profile_updated');
      },

      updateAvatar: (avatarUri) => {
        const nextProfile: UserProfile = {
          ...get().profile,
          avatarUri: avatarUri?.trim() || null,
        };

        syncLegacyProfile(nextProfile);
        set({ profile: nextProfile });
        showToast(avatarUri ? 'Foto de perfil actualizada' : 'Foto de perfil eliminada', 'success');
        return buildResult(true, 'Avatar updated', 'avatar_updated');
      },

      requestPasswordReset: async (email) => {
        const language = getLanguage();
        const authMeta = getOrbitAuthMeta();
        const cleanedEmail = email.trim().toLowerCase();

        if (!isValidEmail(cleanedEmail)) {
          const message = translate(language, 'toast.invalidEmail');
          showToast(message, 'error');
          return buildResult(false, message, 'invalid_email');
        }

        if (authMeta.configured) {
          try {
            const result = await requestOrbitPasswordReset(cleanedEmail);
            if (!result.ok) {
              showToast(result.message, 'error');
              return buildResult(false, result.message, result.code);
            }

            set((state) => ({
              session: {
                ...state.session,
                provider: 'supabase',
                recoveryEmail: cleanedEmail,
              },
            }));
            showToast(translate(language, 'toast.passwordSentReal'), 'success');
            return buildResult(true, 'Recovery email sent', 'recovery_sent');
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'No se pudo enviar la recuperacion.';
            showToast(message, 'error');
            return buildResult(false, message, 'recovery_error');
          }
        }

        set((state) => ({
          session: {
            ...state.session,
            provider: 'local',
            recoveryEmail: cleanedEmail,
            passwordResetPending: false,
          },
        }));
        showToast(translate(language, 'toast.passwordSent'), 'success');
        return buildResult(true, 'Password reset simulated', 'recovery_sent');
      },

      resendConfirmationEmail: async (email) => {
        const language = getLanguage();
        const authMeta = getOrbitAuthMeta();
        const cleanedEmail = email.trim().toLowerCase();

        if (!isValidEmail(cleanedEmail)) {
          const message = translate(language, 'toast.invalidEmail');
          showToast(message, 'error');
          return buildResult(false, message, 'invalid_email');
        }

        if (!authMeta.configured) {
          const message = 'El acceso por correo no esta configurado.';
          showToast(message, 'error');
          return buildResult(false, message, 'auth_not_configured');
        }

        try {
          const result = await resendOrbitEmailConfirmation(cleanedEmail);
          if (!result.ok) {
            showToast(result.message, 'error');
            return buildResult(false, result.message, result.code);
          }

          set((state) => ({
            session: {
              ...state.session,
              provider: 'supabase',
              recoveryEmail: cleanedEmail,
              emailConfirmed: false,
            },
          }));
          showToast('Te enviamos un nuevo correo de confirmacion.', 'success');
          return buildResult(true, 'Confirmation email resent', 'confirmation_resent');
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'No se pudo reenviar el correo de confirmacion.';
          showToast(message, 'error');
          return buildResult(false, message, 'confirmation_resend_error');
        }
      },

      completePasswordReset: async (password) => {
        const language = getLanguage();
        const authMeta = getOrbitAuthMeta();

        if (!isValidPassword(password)) {
          const message = translate(language, 'toast.invalidPassword');
          showToast(message, 'error');
          return buildResult(false, message, 'invalid_password');
        }

        if (authMeta.configured) {
          const result = await updateOrbitAuthPassword(password);
          if (!result.ok) {
            showToast(result.message, 'error');
            return buildResult(false, result.message, result.code);
          }

          const nextProfile = result.session
            ? buildProfileFromSupabaseSession(get().profile, result.session)
            : get().profile;
          const nextSession: SessionState = result.session
            ? buildSessionFromSupabaseSession(get().session, result.session, {
                passwordResetPending: false,
              })
            : {
                ...get().session,
                provider: 'supabase' as const,
                status: 'authenticated' as const,
                passwordResetPending: false,
                emailConfirmed: true,
                lastAuthAt: new Date().toISOString(),
              };

          syncLegacyProfile(nextProfile);
          set({
            profile: nextProfile,
            session: nextSession,
          });
          showToast(translate(language, 'toast.passwordUpdated'), 'success');
          return buildResult(true, 'Password updated', 'password_updated');
        }

        set((state) => ({
          session: {
            ...state.session,
            passwordResetPending: false,
            status: 'authenticated',
            provider: 'local',
            emailConfirmed: true,
            lastAuthAt: new Date().toISOString(),
          },
        }));
        showToast(translate(language, 'toast.passwordUpdated'), 'success');
        return buildResult(true, 'Password updated', 'password_updated');
      },

      restoreAuthSession: async () => {
        const authMeta = getOrbitAuthMeta();
        if (!authMeta.configured) {
          set({ hasBootstrapped: true, isRestoring: false });
          return;
        }

        try {
          set({ isRestoring: true });
          const session = await getOrbitAuthSession();
          get().syncSupabaseSession(session);
        } catch {
          get().syncSupabaseSession(null);
        } finally {
          set({ hasBootstrapped: true, isRestoring: false });
        }
      },

      handleAuthCallbackUrl: async (url) => {
        const language = getLanguage();
        const authMeta = getOrbitAuthMeta();

        if (!authMeta.configured) {
          return buildResult(false, 'Auth is not configured', 'auth_not_configured');
        }

        const result = await applyOrbitAuthCallbackUrl(url);
        if (!result.ok || !result.session) {
          showToast(result.message, 'error');
          return buildResult(false, result.message, result.code);
        }

        const nextProfile = buildProfileFromSupabaseSession(get().profile, result.session);
        syncLegacyProfile(nextProfile);
        set((state) => ({
          hasBootstrapped: true,
          isRestoring: false,
          profile: nextProfile,
          session: buildSessionFromSupabaseSession(state.session, result.session!, {
            passwordResetPending: result.code === 'password_recovery',
          }),
        }));
        hydrateWalletForCurrentSession();

        showToast(
          result.code === 'password_recovery'
            ? translate(language, 'toast.passwordRecoveryReady')
            : translate(language, 'toast.loginReadyReal'),
          'success',
        );

        return buildResult(true, result.message, result.code);
      },

      signOut: async () => {
        const language = getLanguage();
        const session = get().session;

        if (session.provider === 'supabase' && getOrbitAuthMeta().configured) {
          await signOutOrbitAuth();
        }

        syncLegacyProfile(initialProfile);
        set({
          hasBootstrapped: true,
          isRestoring: false,
          profile: initialProfile,
          session: {
            ...initialSession,
            provider: getOrbitAuthMeta().provider,
          },
        });
        clearWalletSessionView();
        showToast(translate(language, 'toast.logoutDone'), 'info');
      },
    }),
    {
      name: ORBITX_AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profile: state.profile,
        session: state.session,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const nextProfile: UserProfile = {
            ...state.profile,
            orbitId: ensureOrbitUserId(state.profile.orbitId, {
              email: state.profile.email,
              name: state.profile.name,
            }),
          };

          state.setHasHydrated(true);
          useAuthStore.setState({ profile: nextProfile });
          syncLegacyProfile(nextProfile);
          return;
        }

        useAuthStore.setState({ hasHydrated: true });
      },
    },
  ),
);
