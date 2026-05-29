import { ActivityIndicator, Text, View } from 'react-native';

import { COLORS, styles } from './browserStyles';

interface BrowserLoadingStateProps {
  host: string;
  progress: number;
}

export function BrowserLoadingState({ host, progress }: BrowserLoadingStateProps) {
  return (
    <View style={styles.loadingCard}>
      <ActivityIndicator color={COLORS.purpleSoft} size="small" />
      <Text style={styles.loadingText}>Cargando {host}</Text>
      <View style={styles.loadingTrack}>
        <View style={[styles.loadingFill, { width: `${Math.max(progress * 100, 8)}%` }]} />
      </View>
    </View>
  );
}
