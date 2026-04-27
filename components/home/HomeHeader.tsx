import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../constants/theme';

interface HomeHeaderProps {
  avatarLabel: string;
  avatarUri?: string | null;
  onProfilePress: () => void;
  onSearchPress: () => void;
  onNotificationsPress: () => void;
  onAstraPress: () => void;
  onProPress: () => void;
}

export function HomeHeader({
  avatarLabel,
  avatarUri,
  onProfilePress,
  onSearchPress,
  onNotificationsPress,
  onAstraPress,
  onProPress,
}: HomeHeaderProps) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onProfilePress} style={styles.avatarButton}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarLabel}>{avatarLabel}</Text>
        )}
      </Pressable>

      <Pressable onPress={onSearchPress} style={styles.searchShell}>
        <Ionicons name="search-outline" size={16} color="#9AA4B2" />
        <Text style={styles.searchText}>Buscar activos, mercados...</Text>
      </Pressable>

      <Pressable onPress={onNotificationsPress} style={styles.iconButton}>
        <Ionicons name="notifications-outline" size={18} color="#F5F7FA" />
      </Pressable>

      <Pressable onPress={onAstraPress} style={styles.iconButton}>
        <Ionicons name="sparkles-outline" size={18} color="#1EDC8B" />
      </Pressable>

      <Pressable onPress={onProPress} style={styles.proPill}>
        <Text style={styles.proText}>Pro</Text>
        <View style={styles.proDot} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: RADII.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#151924',
    borderWidth: 1,
    borderColor: withOpacity('#F5F7FA', 0.08),
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarLabel: {
    color: '#F5F7FA',
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  searchShell: {
    flex: 1,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: RADII.pill,
    backgroundColor: '#11131A',
    borderWidth: 1,
    borderColor: '#232634',
  },
  searchText: {
    flex: 1,
    color: '#9AA4B2',
    fontFamily: FONT.medium,
    fontSize: 13,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: RADII.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#11131A',
    borderWidth: 1,
    borderColor: '#232634',
  },
  proPill: {
    minWidth: 54,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: RADII.pill,
    backgroundColor: '#11131A',
    borderWidth: 1,
    borderColor: '#232634',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  proText: {
    color: '#F5F7FA',
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  proDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: '#1EDC8B',
  },
});
