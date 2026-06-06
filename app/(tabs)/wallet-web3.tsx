import { RouteRedirect } from '../../components/common/RouteRedirect';
import Web3WalletScreen from '../../src/screens/WalletScreen/Web3WalletScreen';
import { isSensitiveRoutesBlockedInStableMode } from '../../src/config/runtimeMode';

export default function WalletWeb3TabScreen() {
  if (isSensitiveRoutesBlockedInStableMode()) {
    return <RouteRedirect href="/" />;
  }

  return <Web3WalletScreen />;
}
