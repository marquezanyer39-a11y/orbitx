import { sendOrbitWalletAsset } from '../../../utils/walletSend';

export async function sendWalletAsset(
  tokenId: string,
  destination: string,
  amount: number,
) {
  return sendOrbitWalletAsset(tokenId, destination, amount);
}
