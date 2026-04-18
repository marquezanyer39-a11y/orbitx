import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FONT, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { SOCIAL_GIFTS } from '../../constants/social';
import type { SocialGiftOption } from '../../types/social';

interface SocialGiftsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectGift: (gift: SocialGiftOption) => void;
}

export function SocialGiftsModal({
  visible,
  onClose,
  onSelectGift,
}: SocialGiftsModalProps) {
  const { colors } = useAppTheme();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <Pressable style={styles.backdrop} onPress={onClose}>
          <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
        </Pressable>

        <View style={styles.sheetWrap}>
          <LinearGradient
            colors={[withOpacity(colors.primary, 0.2), withOpacity(colors.surfaceElevated, 0.96), '#08080C']}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={[styles.sheet, { borderColor: withOpacity(colors.primary, 0.22) }]}
          >
            <View style={styles.header}>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Regalos en vivo</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  Apoya al creador sin salir del directo.
                </Text>
              </View>

              <Pressable
                onPress={onClose}
                style={[
                  styles.closeButton,
                  {
                    backgroundColor: withOpacity(colors.overlay, 0.64),
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="close" size={18} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.giftList}>
              {SOCIAL_GIFTS.map((gift) => (
                <GiftPreviewCard
                  key={gift.id}
                  gift={gift}
                  onPress={() => onSelectGift(gift)}
                />
              ))}
            </View>
          </LinearGradient>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function GiftPreviewCard({
  gift,
  onPress,
}: {
  gift: SocialGiftOption;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  const isInfernoLion = gift.id === 'gift-inferno-lion';
  const accentColor = isInfernoLion ? '#FF9B2F' : colors.primary;
  const previewIcon = isInfernoLion ? 'flame' : 'sparkles';
  const previewGradient: [string, string, string] = isInfernoLion
    ? [withOpacity('#FFB347', 0.82), withOpacity('#FF5A1F', 0.46), withOpacity('#08080C', 0.98)]
    : [withOpacity(colors.primary, 0.72), withOpacity('#19D9FF', 0.24), withOpacity('#08080C', 0.98)];

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.giftCard,
        {
          backgroundColor: withOpacity(colors.surfaceElevated, 0.84),
          borderColor: withOpacity(accentColor, isInfernoLion ? 0.34 : 0.18),
        },
      ]}
    >
        <View
          style={[
            styles.previewShell,
            {
              backgroundColor: withOpacity(accentColor, 0.08),
            borderColor: withOpacity(accentColor, isInfernoLion ? 0.34 : 0.24),
          },
          ]}
        >
        <LinearGradient
          colors={previewGradient}
          start={{ x: 0.12, y: 0 }}
          end={{ x: 0.92, y: 1 }}
          style={styles.previewGradient}
        >
          <View
            style={[
              styles.previewOrb,
              {
                backgroundColor: withOpacity(accentColor, 0.22),
              },
            ]}
          />
          <Ionicons name={previewIcon} size={22} color="#FFFFFF" />
        </LinearGradient>
      </View>

      <View style={{ flex: 1 }}>
        <View style={styles.giftTitleRow}>
          <View style={styles.giftTitleMeta}>
            <Text style={[styles.giftLabel, { color: colors.text }]}>{gift.label}</Text>
            {isInfernoLion ? (
              <View
                style={[
                  styles.featureBadge,
                  {
                    backgroundColor: withOpacity(accentColor, 0.16),
                    borderColor: withOpacity(accentColor, 0.34),
                  },
                ]}
              >
                <Text style={[styles.featureBadgeText, { color: accentColor }]}>EPIC</Text>
              </View>
            ) : null}
          </View>
          <View
            style={[
              styles.priceBadge,
              {
                backgroundColor: withOpacity(isInfernoLion ? accentColor : colors.profit, 0.16),
                borderColor: withOpacity(isInfernoLion ? accentColor : colors.profit, 0.28),
              },
            ]}
          >
            <Text style={[styles.priceBadgeText, { color: isInfernoLion ? accentColor : colors.profit }]}>
              $ {gift.priceUsd}
            </Text>
          </View>
        </View>
        <Text style={[styles.giftSubtitle, { color: colors.textMuted }]}>{gift.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sheet: {
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 20,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftList: {
    gap: 12,
  },
  giftCard: {
    minHeight: 92,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewShell: {
    width: 74,
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  previewGradient: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewOrb: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  giftTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  giftTitleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  giftLabel: {
    fontFamily: FONT.semibold,
    fontSize: 15,
  },
  featureBadge: {
    minHeight: 22,
    paddingHorizontal: 8,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  giftSubtitle: {
    marginTop: 4,
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  priceBadge: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 11,
  },
});
