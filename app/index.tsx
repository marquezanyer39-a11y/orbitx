import { RouteRedirect } from '../components/common/RouteRedirect';
import { AuthLoginExperience } from '../components/auth/AuthLoginExperience';
import { useAuthStore } from '../src/store/authStore';
import { QVEX_RUNTIME_MODE } from '../src/config/runtimeMode';

export default function OnboardingScreen() {
  const sessionStatus = useAuthStore((state) => state.session.status);

  if (QVEX_RUNTIME_MODE.forceLanding) {
    return <AuthLoginExperience />;
  }

  if (sessionStatus !== 'signed_out') {
    return <RouteRedirect href="/home" />;
  }

  return <AuthLoginExperience />;
}
