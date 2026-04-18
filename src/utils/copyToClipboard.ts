import * as Clipboard from 'expo-clipboard';

export async function copyToClipboard(value: string) {
  await Clipboard.setStringAsync(value);
  return true;
}
