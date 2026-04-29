import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../constants/theme';
import { ORBITX_THEME, SCREEN_PADDING } from './orbitxTheme';

interface HomeHeaderProps {
  avatarLabel: string;
  avatarUri?: string | null;
  isSmallPhone?: boolean;
  onProfilePress: () => void;
  onSearchPress: () => void;
}

export function HomeHeader({
  avatarLabel,
  avatarUri,
  isSmallPhone = false,
  onProfilePress,
  onSearchPress,
}: HomeHeaderProps) {
  return (
    <View style={styles.shell}>
      <View
        style={[
          styles.row,
          {
            paddingHorizontal: isSmallPhone ? 12 : SCREEN_PADDING,
          },
        ]}
      >
        <Pressable
          onPress={onProfilePress}
          style={({ pressed }) => [
            styles.avatarButton,
            pressed ? styles.pressed : null,
          ]}
        >
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <Ionicons
              name="person-outline"
              size={isSmallPhone ? 15 : 16}
              color={ORBITX_THEME.colors.textSecondary}
            />
          )}
        </Pressable>

        <Text style={[styles.brand, isSmallPhone ? styles.brandSmall : null]} numberOfLines={1}>
          ORBITX
        </Text>

        <Pressable
          onPress={onSearchPress}
          style={({ pressed }) => [
            styles.searchButton,
            pressed ? styles.pressed : null,
          ]}
        >
          <Ionicons
            name="search-outline"
            size={isSmallPhone ? 21 : 22}
            color={ORBITX_THEME.colors.textSecondary}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: '100%',
    height: 64,
    backgroundColor: ORBITX_THEME.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: withOpacity(ORBITX_THEME.colors.border, 0.28),
    justifyContent: 'center',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ORBITX_THEME.colors.surface,
    borderWidth: 1,
    borderColor: withOpacity(ORBITX_THEME.colors.border, 0.32),
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  brand: {
    color: ORBITX_THEME.colors.textPrimary,
    fontFamily: FONT.bold,
    fontSize: 18,
    letterSpacing: -1,
  },
  brandSmall: {
    fontSize: 17,
  },
  searchButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
