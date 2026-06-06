import { RouteRedirect } from '../../components/common/RouteRedirect';
import WalletScreen from '../../src/screens/WalletScreen/index';
import { isSensitiveRoutesBlockedInStableMode } from '../../src/config/runtimeMode';

export default function WalletTabScreen() {
  if (isSensitiveRoutesBlockedInStableMode()) {
    return <RouteRedirect href="/" />;
  }

  return <WalletScreen />;
}
