import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../constants/theme';
import type { SocialGiftOption } from '../../types/social';

interface GiftSheetProps {
  visible: boolean;
  gifts: SocialGiftOption[];
  balanceUsd: number;
  onClose: () => void;
  onSelectGift: (gift: SocialGiftOption) => void;
}

export function GiftSheet({ visible, gifts, balanceUsd, onClose, onSelectGift }: GiftSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <BlurView intensity={24} tint="dark" style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Enviar gift demo</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={20} color="#FAFAFA" />
          </Pressable>
        </View>
        <Text style={styles.balance}>Saldo demo de gifts: ${balanceUsd.toFixed(2)} - sin pagos reales</Text>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {gifts.map((gift) => (
            <Pressable key={gift.id} onPress={() => onSelectGift(gift)} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
              <View style={styles.iconWrap}>
                <Ionicons name="gift" size={18} color="#FFD76A" />
              </View>
              <View style={styles.copy}>
                <Text style={styles.name}>{gift.label}</Text>
                <Text style={styles.subtitle}>{gift.subtitle}</Text>
              </View>
              <Text style={styles.price}>${gift.priceUsd.toFixed(2)} demo</Text>
            </Pressable>
          ))}
        </ScrollView>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,9,11,0.52)',
  },
  sheet: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 18,
    maxHeight: '66%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(20,21,24,0.76)',
    borderWidth: 1,
    borderColor: withOpacity('#FAFAFA', 0.08),
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: withOpacity('#FAFAFA', 0.18),
  },
  header: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 20,
  },
  balance: {
    marginTop: 12,
    color: '#7FFF93',
    fontFamily: FONT.bold,
    fontSize: 13,
  },
  list: {
    gap: 12,
    paddingTop: 12,
  },
  row: {
    minHeight: 62,
    borderRadius: 18,
    paddingHorizontal: 14,
    backgroundColor: withOpacity('#FAFAFA', 0.04),
    borderWidth: 1,
    borderColor: withOpacity('#FAFAFA', 0.06),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#FFD76A', 0.12),
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 13,
  },
  subtitle: {
    color: '#BFC7C1',
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  price: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.985 }],
  },
});
