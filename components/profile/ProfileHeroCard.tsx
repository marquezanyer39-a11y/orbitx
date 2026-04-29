import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { PROFILE_THEME, withProfileAlpha } from './profileTheme';

interface ProfileIdentity {
  displayName: string;
  email: string;
  orbitId: string;
  avatarInitial: string;
  avatarUri: string | null;
  isVerified: boolean;
  accountStatus: string;
  verificationLabel: string;
}

interface ProfileHeroCardProps {
  identity: ProfileIdentity;
  handle: string;
  isSmallPhone: boolean;
  onEdit: () => void;
}

export function ProfileHeroCard({
  identity,
  handle,
  isSmallPhone,
  onEdit,
}: ProfileHeroCardProps) {
  return (
    <LinearGradient
      colors={[
        withProfileAlpha(PROFILE_THEME.colors.primary, 0.18),
        withProfileAlpha(PROFILE_THEME.colors.surface, 0.98),
      ]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={styles.card}
    >
      <View style={styles.glow} />
      <View style={styles.avatarShell}>
        <View style={styles.avatarRing}>
          {identity.avatarUri ? (
            <Image source={{ uri: identity.avatarUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>{identity.avatarInitial}</Text>
            </View>
          )}
        </View>
        <Pressable onPress={onEdit} style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}>
          <Ionicons name="pencil" size={12} color={PROFILE_THEME.colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.identityCopy}>
        <View style={styles.nameRow}>
          <Text
            style={[styles.name, isSmallPhone && styles.nameSmall]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {identity.displayName}
          </Text>
          {identity.isVerified ? (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={10} color={PROFILE_THEME.colors.textPrimary} />
            </View>
          ) : null}
        </View>

        <Text style={styles.handle} numberOfLines={1}>
          {handle}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {identity.email} • ID: {identity.orbitId}
        </Text>
      </View>

      <View style={styles.chips}>
        <View style={styles.statusChip}>
          <View style={styles.statusDot} />
          <Text style={styles.statusChipText}>{identity.accountStatus}</Text>
        </View>
        <View style={styles.infoChip}>
          <Text style={styles.infoChipText}>{identity.verificationLabel}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: PROFILE_THEME.radius.hero,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: withProfileAlpha(PROFILE_THEME.colors.outline, 0.62),
    alignItems: 'center',
    gap: 14,
    backgroundColor: PROFILE_THEME.colors.surface,
  },
  glow: {
    position: 'absolute',
    top: -34,
    right: -12,
    width: 172,
    height: 172,
    borderRadius: 86,
    backgroundColor: withProfileAlpha(PROFILE_THEME.colors.primary, 0.16),
  },
  avatarShell: {
    position: 'relative',
  },
  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    padding: 3,
    backgroundColor: withProfileAlpha(PROFILE_THEME.colors.primary, 0.2),
    borderWidth: 1,
    borderColor: withProfileAlpha(PROFILE_THEME.colors.primary, 0.66),
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 43,
  },
  avatarFallback: {
    flex: 1,
    borderRadius: 43,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withProfileAlpha(PROFILE_THEME.colors.surfaceLow, 0.96),
  },
  avatarInitial: {
    color: PROFILE_THEME.colors.textPrimary,
    fontFamily: PROFILE_THEME.typography.title,
    fontSize: 30,
  },
  editButton: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PROFILE_THEME.colors.primary,
    borderWidth: 2,
    borderColor: PROFILE_THEME.colors.surface,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.98 }],
  },
  identityCopy: {
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: 0,
    maxWidth: '100%',
  },
  name: {
    color: PROFILE_THEME.colors.textPrimary,
    fontFamily: PROFILE_THEME.typography.title,
    fontSize: 28,
    lineHeight: 32,
    textAlign: 'center',
    minWidth: 0,
  },
  nameSmall: {
    fontSize: 25,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withProfileAlpha(PROFILE_THEME.colors.primary, 0.84),
  },
  handle: {
    color: PROFILE_THEME.colors.textSecondary,
    fontFamily: PROFILE_THEME.typography.bodyMedium,
    fontSize: 14,
  },
  meta: {
    color: PROFILE_THEME.colors.textMuted,
    fontFamily: PROFILE_THEME.typography.body,
    fontSize: 13,
    textAlign: 'center',
  },
  chips: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: PROFILE_THEME.radius.pill,
    backgroundColor: withProfileAlpha(PROFILE_THEME.colors.surfaceLowest, 0.96),
    borderWidth: 1,
    borderColor: withProfileAlpha(PROFILE_THEME.colors.outline, 0.55),
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PROFILE_THEME.colors.secondary,
  },
  statusChipText: {
    color: PROFILE_THEME.colors.textPrimary,
    fontFamily: PROFILE_THEME.typography.bodyStrong,
    fontSize: 12,
  },
  infoChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: PROFILE_THEME.radius.pill,
    backgroundColor: withProfileAlpha(PROFILE_THEME.colors.surfaceLowest, 0.9),
    borderWidth: 1,
    borderColor: withProfileAlpha(PROFILE_THEME.colors.outline, 0.5),
  },
  infoChipText: {
    color: PROFILE_THEME.colors.textSecondary,
    fontFamily: PROFILE_THEME.typography.bodyStrong,
    fontSize: 12,
  },
});
