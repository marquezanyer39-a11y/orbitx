import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../constants/theme';

interface ShareModalProps {
  visible: boolean;
  title?: string;
  body?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onClose: () => void;
  onPrimaryAction?: () => void | Promise<void>;
  onSecondaryAction?: () => void;
}

export function ShareModal({
  visible,
  title = 'Compartir',
  body = 'Comparte este contenido dentro de QVEX sin exponer wallets, balances ni datos sensibles.',
  primaryLabel = 'Copiar enlace',
  secondaryLabel = 'Compartir en social',
  onClose,
  onPrimaryAction,
  onSecondaryAction,
}: ShareModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <BlurView intensity={24} tint="dark" style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={20} color="#FAFAFA" />
          </Pressable>
        </View>
        <Text style={styles.body}>{body}</Text>
        <Pressable
          onPress={() => {
            void onPrimaryAction?.();
          }}
          style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
        >
          <Ionicons name="copy-outline" size={18} color="#031108" />
          <Text style={styles.primaryLabel}>{primaryLabel}</Text>
        </Pressable>
        <Pressable onPress={onSecondaryAction ?? onClose} style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}>
          <Ionicons name="share-social-outline" size={18} color="#7FFF93" />
          <Text style={styles.secondaryLabel}>{secondaryLabel}</Text>
        </Pressable>
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
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(20,21,24,0.76)',
    borderWidth: 1,
    borderColor: withOpacity('#FAFAFA', 0.08),
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
    gap: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: withOpacity('#FAFAFA', 0.18),
  },
  header: {
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
  body: {
    color: '#DCE5D7',
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  primaryAction: {
    minHeight: 50,
    borderRadius: 18,
    backgroundColor: '#3FE56C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryLabel: {
    color: '#031108',
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  secondaryAction: {
    minHeight: 48,
    borderRadius: 18,
    backgroundColor: withOpacity('#FAFAFA', 0.04),
    borderWidth: 1,
    borderColor: withOpacity('#FAFAFA', 0.08),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  secondaryLabel: {
    color: '#FAFAFA',
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.985 }],
  },
});
