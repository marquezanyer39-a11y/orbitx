import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONT, withOpacity } from '../../../../constants/theme';
import * as xIntegrationMockService from '../../services/xIntegrationMockService';

type XStatus = 'connected' | 'not_connected';

export default function XConnectionSettingsScreen() {
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<XStatus>('not_connected');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('La integracion real con X OAuth se conectara mas adelante.');

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const nextStatus = await xIntegrationMockService.getConnectionStatus();
      setStatus(nextStatus as XStatus);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const connectX = useCallback(async () => {
    setLoading(true);
    try {
      const result = await xIntegrationMockService.connectXMock();
      setStatus(result.connected ? 'connected' : 'not_connected');
      setMessage('Cuenta X conectada en modo mock. OAuth real sigue pendiente de backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  const importPosts = useCallback(async () => {
    setLoading(true);
    try {
      const posts = await xIntegrationMockService.importPostsMock();
      setMessage(`Importacion mock lista: ${posts.length} publicaciones preparadas para revision.`);
    } finally {
      setLoading(false);
    }
  }, []);

  const shareProfile = useCallback(async () => {
    setLoading(true);
    try {
      const result = await xIntegrationMockService.shareToXMock();
      setMessage(
        result.success
          ? 'Perfil preparado para compartir en X en modo mock.'
          : 'Conecta X en modo mock antes de preparar el perfil para compartir.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const connected = status === 'connected';

  return (
    <View style={styles.screen}>
      <StatusBar style="light" backgroundColor="#08090B" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top + 18, 34) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={router.back} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
            <Ionicons name="arrow-back" size={18} color="#7FFF93" />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.kicker}>SOCIAL BRIDGE</Text>
            <Text style={styles.title}>Conectar X</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.xMark}>
            <Text style={styles.xMarkText}>X</Text>
          </View>
          <Text style={styles.heroTitle}>{connected ? 'Cuenta X conectada' : 'Cuenta X no conectada'}</Text>
          <Text style={styles.heroBody}>
            Usa este puente para importar comunidad y compartir contenido cuando la integracion real con X OAuth
            este disponible.
          </Text>
          <View style={[styles.statusPill, connected && styles.statusPillConnected]}>
            <View style={[styles.statusDot, connected && styles.statusDotConnected]} />
            <Text style={styles.statusText}>{connected ? 'Conectado mock' : 'No conectado'}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <ActionButton
            icon="link-outline"
            title={connected ? 'X conectado' : 'Conectar X'}
            subtitle="OAuth real pendiente de backend."
            disabled={loading || connected}
            onPress={connectX}
          />
          <ActionButton
            icon="download-outline"
            title="Importar publicaciones"
            subtitle="Trae posts mock para revision social."
            disabled={loading}
            onPress={importPosts}
          />
          <ActionButton
            icon="share-social-outline"
            title="Compartir perfil en X"
            subtitle="Prepara una accion mock sin publicar nada real."
            disabled={loading}
            onPress={shareProfile}
          />
        </View>

        <View style={styles.notice}>
          {loading ? <ActivityIndicator color="#3FE56C" /> : <Ionicons name="sparkles-outline" size={18} color="#7FFF93" />}
          <Text style={styles.noticeText}>{message}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function ActionButton({
  icon,
  title,
  subtitle,
  disabled,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.actionButton, disabled && styles.disabled, pressed && styles.pressed]}
    >
      <View style={styles.actionIcon}>
        <Ionicons name={icon} size={20} color="#7FFF93" />
      </View>
      <View style={styles.actionCopy}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.42)" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#08090B',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 22,
    paddingBottom: 40,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#192219', 0.72),
    borderWidth: 1,
    borderColor: withOpacity('#3C4A3C', 0.32),
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  kicker: {
    color: '#7FFF93',
    fontFamily: FONT.bold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  title: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 28,
  },
  hero: {
    borderRadius: 24,
    backgroundColor: withOpacity('#192219', 0.7),
    borderWidth: 1,
    borderColor: withOpacity('#3FE56C', 0.22),
    padding: 20,
    gap: 12,
  },
  xMark: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  xMarkText: {
    color: '#08090B',
    fontFamily: FONT.bold,
    fontSize: 24,
  },
  heroTitle: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 22,
  },
  heroBody: {
    color: '#A1A1AA',
    fontFamily: FONT.medium,
    fontSize: 14,
    lineHeight: 21,
  },
  statusPill: {
    alignSelf: 'flex-start',
    minHeight: 32,
    borderRadius: 999,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: withOpacity('#FF5252', 0.13),
    borderWidth: 1,
    borderColor: withOpacity('#FF5252', 0.24),
  },
  statusPillConnected: {
    backgroundColor: withOpacity('#00C853', 0.14),
    borderColor: withOpacity('#00C853', 0.28),
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5252',
  },
  statusDotConnected: {
    backgroundColor: '#3FE56C',
  },
  statusText: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 12,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    minHeight: 78,
    borderRadius: 20,
    backgroundColor: withOpacity('#141518', 0.82),
    borderWidth: 1,
    borderColor: withOpacity('#3C4A3C', 0.22),
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#00C853', 0.13),
  },
  actionCopy: {
    flex: 1,
    gap: 3,
  },
  actionTitle: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 15,
  },
  actionSubtitle: {
    color: '#A1A1AA',
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 17,
  },
  notice: {
    borderRadius: 18,
    backgroundColor: withOpacity('#00C853', 0.1),
    borderWidth: 1,
    borderColor: withOpacity('#00C853', 0.18),
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  noticeText: {
    flex: 1,
    color: '#DCE5D7',
    fontFamily: FONT.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  disabled: {
    opacity: 0.58,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
});
