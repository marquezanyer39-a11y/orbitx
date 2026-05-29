import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { COLORS, styles } from './browserStyles';
import { RECENT_SITES } from './useBrowserViewModel';

interface BrowserHistorySectionProps {
  onOpenDestination: (input?: string | null, selected?: string) => void;
}

export function BrowserHistorySection({ onOpenDestination }: BrowserHistorySectionProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentContent}>
      {RECENT_SITES.map((site) => (
        <Pressable
          key={site.id}
          onPress={() => onOpenDestination(site.url)}
          style={({ pressed }) => [styles.recentCard, pressed && styles.pressed]}
        >
          <View style={styles.recentIcon}>
            <Ionicons name={site.icon} size={20} color={COLORS.purpleSoft} />
          </View>
          <Text style={styles.recentTitle} numberOfLines={1}>{site.title}</Text>
          <Text style={styles.recentHost} numberOfLines={1}>{site.host}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
