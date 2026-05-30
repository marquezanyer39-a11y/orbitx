import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';

import { FONT } from '../../../constants/theme';
import { GiftAnimationOverlay } from '../../components/social/GiftAnimationOverlay';
import { LiveFeatureErrorBoundary } from '../../components/social/LiveFeatureErrorBoundary';
import { AstraLiveInsight } from '../../components/social/AstraLiveInsight';
import { FloatingReactions } from '../../components/social/FloatingReactions';
import { LiveActionRail } from '../../components/social/LiveActionRail';
import { LiveBottomBar } from '../../components/social/LiveBottomBar';
import { LiveChatOverlay } from '../../components/social/LiveChatOverlay';
import { LiveHeader } from '../../components/social/LiveHeader';
import { useUiStore } from '../../store/uiStore';
import { useAstraSocial, useLiveRoom } from '../../social/hooks';
import { useSocialNavigator } from '../../social/navigation/SocialNavigator';
import { AstraInsightSheet, CommentsBottomSheet, GiftSheet, ShareModal } from '../../social/overlays';
import { copyToClipboard } from '../../utils/copyToClipboard';

type LiveSheetMode = 'comments' | 'share' | 'profile' | 'astra' | 'gifts' | null;

export default function LiveRoomScreen() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const showToast = useUiStore((state) => state.showToast);
  const socialNavigator = useSocialNavigator();
  const translateY = useRef(new Animated.Value(0)).current;
  const [sheetMode, setSheetMode] = useState<LiveSheetMode>(null);
  const [messageDraft, setMessageDraft] = useState('');
  const { insights, insightsOpen, openInsight, closeInsight } = useAstraSocial();

  const {
    stream,
    creator,
    messages,
    viewers,
    reactions,
    giftBurst,
    gifts,
    comments,
    followingCreatorIds,
    toggleFollowCreator,
    likedPostIds,
    toggleLikePost,
    viewerGiftBalanceUsd,
    removeReaction,
    clearGiftBurst,
    sendMessage,
    sendReaction,
    sendGift,
    leaveStream,
    astraInsight,
  } = useLiveRoom();

  const liked = stream ? likedPostIds.includes(stream.id) : false;
  const isFollowing = creator ? followingCreatorIds.includes(creator.id) : false;
  const likeCount = stream?.likes ?? 0;
  const commentCount = messages.length || stream?.comments || 0;

  const closeRoom = useCallback(() => {
    void leaveStream();
    socialNavigator.openHome('live');
  }, [leaveStream, socialNavigator]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dy) > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 120 || gestureState.vy > 1.25) {
            Animated.timing(translateY, {
              toValue: height,
              duration: 180,
              useNativeDriver: true,
            }).start(closeRoom);
            return;
          }

          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
          }).start();
        },
      }),
    [closeRoom, height, translateY],
  );

  if (!stream || !creator) {
    return (
      <View style={styles.emptyState}>
        <StatusBar style="light" />
        <Text style={styles.emptyTitle}>No hay directos activos</Text>
        <Text style={styles.emptyBody}>
          La sala live necesita un stream mock disponible para mostrarse. Puedes volver al feed social.
        </Text>
        <Pressable onPress={closeRoom} style={styles.emptyButton}>
          <Text style={styles.emptyButtonLabel}>Volver al feed</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <LiveFeatureErrorBoundary>
      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View
          style={[styles.screen, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          <StatusBar style="light" backgroundColor="#08090B" />

          <View style={StyleSheet.absoluteFill}>
            <Image source={{ uri: stream.posterUri || stream.mediaUri }} style={styles.streamImage} resizeMode="cover" />
            <View style={styles.greenGlowPrimary} />
            <View style={styles.greenGlowSecondary} />

            <LinearGradient
              colors={['rgba(0,0,0,0.68)', 'transparent', 'rgba(0,0,0,0.84)']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </View>

          <View style={[styles.headerOverlay, { paddingTop: insets.top + 8 }]}>
            <LiveHeader
              creator={creator}
              viewers={viewers}
              isFollowing={isFollowing}
              onFollow={() => toggleFollowCreator(creator.id)}
              onClose={closeRoom}
            />
          </View>

          <View style={[styles.actionRailWrap, { top: insets.top + 106 }]}>
            <LiveActionRail
              creator={creator}
              liked={liked}
              likeCount={likeCount}
              commentCount={commentCount}
              onProfile={() => socialNavigator.openCreator(creator.id)}
              onLike={() => {
                toggleLikePost(stream.id);
                void sendReaction();
              }}
              onComments={() => setSheetMode('comments')}
              onGifts={() => setSheetMode('gifts')}
              onShare={() => setSheetMode('share')}
              onAstra={() => {
                void openInsight('live', stream.tokenSymbol);
              }}
            />
          </View>

          <View style={[styles.leftStack, { bottom: 112 + insets.bottom }]}>
            <View style={styles.streamMeta}>
              <View style={styles.metaRow}>
                <Text style={styles.streamHandle}>{creator.handle}</Text>
                {stream.tokenSymbol ? <Text style={styles.streamToken}>· ${stream.tokenSymbol}</Text> : null}
                <Text style={styles.demoMetaBadge}>LIVE SIMULADO</Text>
              </View>
              <Text style={styles.streamDescription} numberOfLines={3}>
                {stream.description}
              </Text>
              <Text style={styles.demoNotice} numberOfLines={2}>
                Vista de ejemplo: sin streaming real, sin audiencia real y sin pagos reales.
              </Text>
              <Text style={styles.streamTags} numberOfLines={1}>
                {stream.hashtags.join(' ')}
              </Text>
            </View>

            <AstraLiveInsight
              insight={astraInsight}
              onPress={() => {
                void openInsight('live', stream.tokenSymbol);
              }}
            />

            <LiveChatOverlay messages={messages} onOpenComments={() => setSheetMode('comments')} />
          </View>

          <View style={[styles.bottomBarWrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <LiveBottomBar
              value={messageDraft}
              onChangeText={setMessageDraft}
              onGift={() => setSheetMode('gifts')}
              onShareTrade={() => showToast('Compartir trade completo llegará en una siguiente fase.', 'info')}
              onSend={async () => {
                const result = await sendMessage(messageDraft);
                if (result) {
                  setMessageDraft('');
                }
              }}
            />
          </View>

          <FloatingReactions items={reactions} onDone={removeReaction} />

          <GiftAnimationOverlay
            burst={giftBurst}
            visible={Boolean(giftBurst)}
            onComplete={clearGiftBurst}
          />

          <ShareModal
            visible={sheetMode === 'share'}
            title="Compartir"
            body="Comparte este live room demo dentro de QVEX sin exponer balances, wallets ni datos sensibles."
            primaryLabel="Copiar enlace demo"
            onClose={() => setSheetMode(null)}
            onPrimaryAction={async () => {
              await copyToClipboard(`qvex://social/live/${stream.id}`);
              showToast('Enlace demo del live copiado.', 'success');
              setSheetMode(null);
            }}
          />

          <GiftSheet
            visible={sheetMode === 'gifts'}
            gifts={gifts}
            balanceUsd={viewerGiftBalanceUsd}
            onClose={() => setSheetMode(null)}
            onSelectGift={async (gift) => {
              const result = await sendGift(gift);
              if (!result?.success) {
                showToast('Saldo demo de gifts insuficiente para este live simulado.', 'error');
                return;
              }
              setSheetMode(null);
            }}
          />

          <CommentsBottomSheet
            visible={sheetMode === 'comments'}
            comments={comments.comments}
            astraInsight={comments.astraInsight}
            currentUser={comments.currentUser}
            creatorIds={comments.creatorIds}
            creatorLabel="Creator"
            likedCommentIds={comments.likedCommentIds}
            onClose={() => setSheetMode(null)}
            onLikeComment={(commentId) => {
              void comments.likeComment(commentId);
            }}
            onOpenGift={() => setSheetMode('gifts')}
            onSendComment={async (body, replyToCommentId) => {
              await comments.addComment(body, replyToCommentId);
              await sendMessage(body);
            }}
          />

          <AstraInsightSheet
            visible={insightsOpen}
            title="Astra Live Insight"
            body={insights || astraInsight}
            caption={`Señal contextual mock sobre ${stream.tokenSymbol ?? 'mercado crypto'}. No ejecuta trades ni activa órdenes reales.`}
            onClose={closeInsight}
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </LiveFeatureErrorBoundary>
  );
}

const styles = StyleSheet.create({
  keyboardWrap: {
    flex: 1,
    backgroundColor: '#08090B',
  },
  screen: {
    flex: 1,
    backgroundColor: '#08090B',
  },
  streamImage: {
    ...StyleSheet.absoluteFillObject,
  },
  greenGlowPrimary: {
    position: 'absolute',
    left: -80,
    top: 92,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(0,200,83,0.14)',
  },
  greenGlowSecondary: {
    position: 'absolute',
    right: -80,
    bottom: 180,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(63,229,108,0.10)',
  },
  headerOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 0,
    zIndex: 10,
  },
  actionRailWrap: {
    position: 'absolute',
    right: 12,
    zIndex: 9,
  },
  leftStack: {
    position: 'absolute',
    left: 16,
    right: 96,
    zIndex: 8,
    gap: 14,
  },
  streamMeta: {
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  streamHandle: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 16,
  },
  streamToken: {
    color: '#9CFFC0',
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  demoMetaBadge: {
    color: '#081008',
    fontFamily: FONT.bold,
    fontSize: 10,
    letterSpacing: 0.8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#FFD76A',
  },
  streamDescription: {
    color: '#FAFAFA',
    fontFamily: FONT.semibold,
    fontSize: 15,
    lineHeight: 22,
    textShadowColor: 'rgba(0,0,0,0.36)',
    textShadowRadius: 10,
  },
  demoNotice: {
    color: '#FFD76A',
    fontFamily: FONT.semibold,
    fontSize: 12,
    lineHeight: 17,
    textShadowColor: 'rgba(0,0,0,0.36)',
    textShadowRadius: 8,
  },
  streamTags: {
    color: '#B7C1BB',
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  bottomBarWrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 0,
    zIndex: 10,
  },
  emptyState: {
    flex: 1,
    backgroundColor: '#08090B',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 10,
  },
  emptyTitle: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 20,
  },
  emptyBody: {
    color: '#CAD2CC',
    fontFamily: FONT.medium,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 6,
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: 23,
    backgroundColor: '#3FE56C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyButtonLabel: {
    color: '#001B09',
    fontFamily: FONT.bold,
    fontSize: 13,
  },
});
