import { CreateTokenWizard } from '../../components/create-token/CreateTokenWizard';
import { RouteRedirect } from '../../components/common/RouteRedirect';
import { isSensitiveRoutesBlockedInStableMode } from '../../src/config/runtimeMode';

export default function CreateTokenTabScreen() {
  if (isSensitiveRoutesBlockedInStableMode()) {
    return <RouteRedirect href="/" />;
  }

  return <CreateTokenWizard />;
}
