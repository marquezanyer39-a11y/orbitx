import { SocialModulePlaceholderScreen } from '../shared/SocialModulePlaceholderScreen';

export default function SocialWalletScreen() {
  return (
    <SocialModulePlaceholderScreen
      title="Social Wallet"
      subtitle="Vista demo para gifts, earnings y creator economy. Sin pagos reales ni balances reales."
      bullets={[
        'No sustituye la wallet principal QVEX',
        'Solo economía social y creator',
        'Conexión futura con ledger/backend social',
      ]}
    />
  );
}
