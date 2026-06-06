import { RouteRedirect } from '../../components/common/RouteRedirect';
import TradeScreen from '../../src/screens/TradeScreen/index';
import { isSensitiveRoutesBlockedInStableMode } from '../../src/config/runtimeMode';

export default function SpotTabScreen() {
  if (isSensitiveRoutesBlockedInStableMode()) {
    return <RouteRedirect href="/" />;
  }

  return <TradeScreen />;
}
