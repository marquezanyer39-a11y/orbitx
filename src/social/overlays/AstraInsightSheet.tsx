import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../constants/theme';

interface AstraInsightSheetProps {
  visible: boolean;
  title?: string;
  body: string;
  caption?: string;
  onClose: () => void;
}

export function AstraInsightSheet({
  visible,
  title = 'Astra AI',
  body,
  caption = 'Insight contextual mock. No ejecuta órdenes, no activa pagos y no sustituye criterio financiero.',
  onClose,
}: AstraInsightSheetProps) {
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
        <View style={styles.content}>
          <Ionicons name="sparkles" size={22} color="#3FE56C" />
          <Text style={styles.body}>{body}</Text>
          <Text style={styles.caption}>{caption}</Text>
        </View>
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
  content: {
    borderRadius: 20,
    padding: 14,
    backgroundColor: withOpacity('#00C853', 0.08),
    borderWidth: 1,
    borderColor: withOpacity('#3FE56C', 0.18),
    gap: 10,
  },
  body: {
    color: '#FAFAFA',
    fontFamily: FONT.semibold,
    fontSize: 16,
    lineHeight: 22,
  },
  caption: {
    color: '#CAD2CC',
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 18,
  },
});
