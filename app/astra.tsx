import { RouteRedirect } from '../components/common/RouteRedirect';
import AstraScreen from '../src/screens/AstraScreen/index';
import { isSensitiveRoutesBlockedInStableMode } from '../src/config/runtimeMode';

export default function AstraRoute() {
  if (isSensitiveRoutesBlockedInStableMode()) {
    return <RouteRedirect href="/" />;
  }

  return <AstraScreen />;
}
