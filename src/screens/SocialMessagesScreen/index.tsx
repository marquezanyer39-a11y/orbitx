import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useSocialFeed } from '../../hooks/useSocialFeed';
import { useUiStore } from '../../store/uiStore';

function formatMessageTime(value: string) {
  const date = new Date(value);
  return date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ThreadAvatar({
  avatarUri,
  fallback,
  colors,
}: {
  avatarUri?: string | null;
  fallback: string;
  colors: ReturnType<typeof useAppTheme>['colors'];
}) {
  return (
    <View
      style={[
        styles.avatar,
        {
          backgroundColor: withOpacity(colors.primary, 0.16),
          borderColor: withOpacity(colors.primary, 0.26),
        },
      ]}
    >
      {avatarUri ? (
        <Image source={{ uri: avatarUri }} style={styles.avatarImage} resizeMode="cover" />
      ) : (
        <Text style={[styles.avatarText, { color: colors.text }]}>{fallback}</Text>
      )}
    </View>
  );
}

export default function SocialMessagesScreen() {
  const { colors } = useAppTheme();
  const showToast = useUiStore((state) => state.showToast);
  const { threadId } = useLocalSearchParams<{ threadId?: string }>();
  const [draft, setDraft] = useState('');

  const { threads, currentCreator, sendThreadMessage, markThreadRead } = useSocialFeed();
  const [selectedThreadId, setSelectedThreadId] = useState<string>('');

  useEffect(() => {
    if (threadId && threads.some((thread) => thread.id === threadId)) {
      setSelectedThreadId(threadId);
      return;
    }

    if (!selectedThreadId && threads.length) {
      setSelectedThreadId(threads[0].id);
    }
  }, [selectedThreadId, threadId, threads]);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) ?? null,
    [selectedThreadId, threads],
  );

  useEffect(() => {
    if (selectedThreadId) {
      markThreadRead(selectedThreadId);
    }
  }, [markThreadRead, selectedThreadId]);

  const handleSend = () => {
    if (!selectedThread) {
      return;
    }

    const body = draft.trim();
    if (!body) {
      showToast('Escribe un mensaje para continuar.', 'info');
      return;
    }

    sendThreadMessage(selectedThread.id, body);
    setDraft('');
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <LinearGradient
        colors={['#0B0B0F', withOpacity(colors.primary, 0.12), '#07070B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.circleButton,
              {
                backgroundColor: withOpacity(colors.surfaceElevated, 0.82),
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="chevron-back" size={18} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>Mensajes</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Hilos directos dentro de la comunidad OrbitX.
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/social/creator/current-user')}
            style={[
              styles.circleButton,
              {
                backgroundColor: withOpacity(colors.surfaceElevated, 0.82),
                borderColor: colors.border,
                overflow: 'hidden',
              },
            ]}
          >
            {currentCreator.avatarUri ? (
              <Image
                source={{ uri: currentCreator.avatarUri }}
                style={styles.headerAvatarImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={[styles.headerAvatarText, { color: colors.text }]}>
                {currentCreator.avatar ?? currentCreator.displayName.slice(0, 1)}
              </Text>
            )}
          </Pressable>
        </View>

        {threads.length ? (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.threadRail}
            >
              {threads.map((thread) => {
                const active = thread.id === selectedThreadId;
                const lastMessage = thread.messages[thread.messages.length - 1]?.body;

                return (
                  <Pressable
                    key={thread.id}
                    onPress={() => setSelectedThreadId(thread.id)}
                    style={[
                      styles.threadCard,
                      {
                        backgroundColor: active
                          ? withOpacity(colors.primary, 0.16)
                          : withOpacity(colors.surfaceElevated, 0.9),
                        borderColor: active
                          ? withOpacity(colors.primary, 0.3)
                          : colors.border,
                      },
                    ]}
                  >
                    <ThreadAvatar
                      avatarUri={thread.peerAvatarUri}
                      fallback={thread.peerAvatar ?? thread.peerName.slice(0, 1)}
                      colors={colors}
                    />
                    <View style={styles.threadCopy}>
                      <View style={styles.threadTopRow}>
                        <Text style={[styles.threadName, { color: colors.text }]} numberOfLines={1}>
                          {thread.peerName}
                        </Text>
                        {thread.unreadCount ? (
                          <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.unreadLabel}>{thread.unreadCount}</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text
                        style={[styles.threadPreview, { color: colors.textMuted }]}
                        numberOfLines={1}
                      >
                        {lastMessage ?? 'Abre el hilo para empezar.'}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            {selectedThread ? (
              <>
                <View
                  style={[
                    styles.threadHeader,
                    {
                      backgroundColor: withOpacity(colors.surfaceElevated, 0.9),
                      borderColor: withOpacity(colors.primary, 0.18),
                    },
                  ]}
                >
                  <ThreadAvatar
                    avatarUri={selectedThread.peerAvatarUri}
                    fallback={selectedThread.peerAvatar ?? selectedThread.peerName.slice(0, 1)}
                    colors={colors}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.peerName, { color: colors.text }]}>
                      {selectedThread.peerName}
                    </Text>
                    <Text style={[styles.peerHandle, { color: colors.textMuted }]}>
                      {selectedThread.peerHandle}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() =>
                      router.push(`/social/creator/${selectedThread.peerId === 'current-user' ? 'current-user' : selectedThread.peerId}`)
                    }
                    style={[
                      styles.viewProfileButton,
                      {
                        backgroundColor: withOpacity(colors.fieldBackground, 0.84),
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.viewProfileLabel, { color: colors.text }]}>Ver perfil</Text>
                  </Pressable>
                </View>

                <ScrollView
                  contentContainerStyle={styles.messageList}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {selectedThread.messages.map((message) => {
                    const isMine =
                      message.senderId === currentCreator.id || message.senderId === 'current-user';
                    return (
                      <View
                        key={message.id}
                        style={[
                          styles.messageWrap,
                          isMine ? styles.messageWrapMine : styles.messageWrapPeer,
                        ]}
                      >
                        <View
                          style={[
                            styles.messageBubble,
                            isMine ? styles.messageMine : styles.messagePeer,
                            {
                              backgroundColor: isMine
                                ? withOpacity(colors.primary, 0.18)
                                : withOpacity(colors.surfaceElevated, 0.88),
                              borderColor: isMine
                                ? withOpacity(colors.primary, 0.28)
                                : colors.border,
                            },
                          ]}
                        >
                          <Text style={[styles.messageBody, { color: colors.text }]}>
                            {message.body}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.messageTime,
                            {
                              color: colors.textMuted,
                              textAlign: isMine ? 'right' : 'left',
                            },
                          ]}
                        >
                          {formatMessageTime(message.createdAt)}
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>
              </>
            ) : null}
          </>
        ) : (
          <View style={styles.centered}>
            <Ionicons name="mail-open-outline" size={24} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Tu inbox esta vacio</Text>
            <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
              Inicia una conversacion desde el feed para construir tu red.
            </Text>
          </View>
        )}

        {selectedThread ? (
          <View
            style={[
              styles.composerShell,
              {
                backgroundColor: withOpacity(colors.surfaceElevated, 0.96),
                borderTopColor: withOpacity(colors.border, 0.88),
              },
            ]}
          >
            <View style={styles.composerRow}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Escribe un mensaje..."
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    backgroundColor: withOpacity(colors.fieldBackground, 0.84),
                    borderColor: colors.border,
                  },
                ]}
              />
              <Pressable
                onPress={handleSend}
                style={[
                  styles.sendButton,
                  {
                    backgroundColor: colors.primary,
                    borderColor: withOpacity(colors.primary, 0.68),
                  },
                ]}
              >
                <Ionicons name="send" size={16} color="#0B0B0F" />
              </Pressable>
            </View>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 10,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarImage: { width: '100%', height: '100%', borderRadius: 20 },
  headerAvatarText: { fontFamily: FONT.bold, fontSize: 16 },
  title: {
    fontFamily: FONT.bold,
    fontSize: 24,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  threadRail: {
    paddingHorizontal: 18,
    paddingBottom: 12,
    gap: 10,
  },
  threadCard: {
    width: 190,
    minHeight: 70,
    borderRadius: 20,
    borderWidth: 1,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  threadCopy: { flex: 1, gap: 4 },
  threadTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  threadName: { flex: 1, fontFamily: FONT.semibold, fontSize: 13 },
  threadPreview: { fontFamily: FONT.regular, fontSize: 11, lineHeight: 15 },
  unreadBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadLabel: {
    color: '#0B0B0F',
    fontFamily: FONT.bold,
    fontSize: 10,
  },
  threadHeader: {
    marginHorizontal: 18,
    borderRadius: RADII.lg,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 20 },
  avatarText: {
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  peerName: {
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  peerHandle: {
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  viewProfileButton: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewProfileLabel: { fontFamily: FONT.semibold, fontSize: 11 },
  messageList: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 136,
    gap: 8,
  },
  messageWrap: {
    maxWidth: '78%',
    gap: 4,
  },
  messageWrapMine: {
    alignSelf: 'flex-end',
  },
  messageWrapPeer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  messageMine: {
    borderBottomRightRadius: 8,
  },
  messagePeer: {
    borderBottomLeftRadius: 8,
  },
  messageBody: {
    fontFamily: FONT.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  messageTime: {
    fontFamily: FONT.regular,
    fontSize: 10,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontFamily: FONT.bold,
    fontSize: 17,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  composerShell: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 46,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontFamily: FONT.medium,
    fontSize: 14,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
