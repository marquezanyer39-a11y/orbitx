import { RouteRedirect } from '../components/common/RouteRedirect';
import { WelcomeScreen } from '../components/auth/WelcomeScreen';
import { useAuthStore } from '../src/store/authStore';

export default function OnboardingScreen() {
  const sessionStatus = useAuthStore((state) => state.session.status);

  if (sessionStatus !== 'signed_out') {
    return <RouteRedirect href="/home" />;
  }

  return <WelcomeScreen />;
}
