import { RouteRedirect } from '../components/common/RouteRedirect';
import { AuthLoginExperience } from '../components/auth/AuthLoginExperience';
import { useAuthStore } from '../src/store/authStore';

export default function OnboardingScreen() {
  const sessionStatus = useAuthStore((state) => state.session.status);

  if (sessionStatus !== 'signed_out') {
    return <RouteRedirect href="/home" />;
  }

  return <AuthLoginExperience />;
}
