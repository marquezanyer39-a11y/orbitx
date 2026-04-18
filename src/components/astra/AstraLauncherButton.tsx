import { AstraEntryPoint } from './AstraEntryPoint';

interface Props {
  onPress: () => void;
  size?: number;
}

export function AstraLauncherButton({ onPress, size = 50 }: Props) {
  return <AstraEntryPoint onPress={onPress} size={size} accessibilityLabel="Abrir Astra" />;
}
