import { RouteRedirect } from '../components/common/RouteRedirect';
import { CreateTokenWizard } from '../components/create-token/CreateTokenWizard';
import { useAuthStore } from '../src/store/authStore';

export default function CreateTokenStandaloneScreen() {
  const sessionStatus = useAuthStore((state) => state.session.status);

  if (sessionStatus === 'signed_out') {
    return <RouteRedirect href="/" />;
  }

  return <CreateTokenWizard standalone />;
}
