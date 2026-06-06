import { RouteRedirect } from '../components/common/RouteRedirect';
import BrowserScreen from '../src/screens/BrowserScreen';
import { isSensitiveRoutesBlockedInStableMode } from '../src/config/runtimeMode';

export default function BrowserRoute() {
  if (isSensitiveRoutesBlockedInStableMode()) {
    return <RouteRedirect href="/" />;
  }

  return <BrowserScreen />;
}
