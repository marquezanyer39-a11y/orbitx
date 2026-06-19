import { RouteRedirect } from '../components/common/RouteRedirect';
import { LoginScreen } from '../components/auth/LoginScreen';
import { useAuthStore } from '../src/store/authStore';

export default function LoginRoute() {
  const sessionStatus = useAuthStore((state) => state.session.status);

  if (sessionStatus !== 'signed_out') {
    return <RouteRedirect href="/home" />;
  }

  return <LoginScreen />;
}
