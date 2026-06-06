import { RouteRedirect } from '../components/common/RouteRedirect';
import DappsScreen from '../src/screens/DappsScreen';
import { isSensitiveRoutesBlockedInStableMode } from '../src/config/runtimeMode';

export default function DappsRoute() {
  if (isSensitiveRoutesBlockedInStableMode()) {
    return <RouteRedirect href="/" />;
  }

  return <DappsScreen />;
}
