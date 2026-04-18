import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ViewToken,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONT, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { SocialDisclaimerModal } from '../../components/social/SocialDisclaimerModal';
import { SocialFeedItem } from '../../components/social/SocialFeedItem';
import { GiftAnimationOverlay } from '../../components/social/GiftAnimationOverlay';
import { SocialGiftsModal } from '../../components/social/SocialGiftsModal';
import { LiveFeatureErrorBoundary } from '../../components/social/LiveFeatureErrorBoundary';
import { useSocialFeed } from '../../hooks/useSocialFeed';
import { createGiftBurst, submitLiveGiftToBackend } from '../../services/social/liveGiftService';
import type { SocialFeedTab, SocialGiftBurst, SocialGiftOption } from '../../types/social';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { devWarn } from '../../utils/devLog';
import { useUiStore } from '../../store/uiStore';

const FEED_TABS: Array<{ key: SocialFeedTab; label: string }> = [
  { key: 'for_you', label: 'Para ti' },
  { key: 'following', label: 'Siguiendo' },
  { key: 'live', label: 'En vivo' },
];

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export default function SocialFeedScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const params = useLocalSearchParams<{ tab?: string }>();
  const initialTab = params.tab === 'following' || params.tab === 'live' ? params.tab : 'for_you';
  const [feedTab, setFeedTab] = useState<SocialFeedTab>(initialTab);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showGiftsModal, setShowGiftsModal] = useState(false);
  const [giftTargetPostId, setGiftTargetPostId] = useState<string | null>(null);
  const [activeGiftAnimation, setActiveGiftAnimation] = useState<SocialGiftBurst | null>(null);
  const [isSendingGift, setIsSendingGift] = useState(false);
  const isMountedRef = useRef(true);
  const showToast = useUiStore((state) => state.showToast);

  const {
    disclaimerAccepted,
    acceptDisclaimer,
    currentCreator,
    creators,
    posts,
    commentsByPost,
    likedPostIds,
    toggleLikePost,
    ensureThreadWithCreator,
    recordGiftTransaction,
    debitViewerGiftBalance,
    gifts,
    activeLivePostId,
    viewerGiftBalanceUsd,
  } = useSocialFeed(feedTab);

  const creatorsById = useMemo(
    () => Object.fromEntries(creators.map((creator) => [creator.id, creator])),
    [creators],
  );

  const cardHeight =
    feedTab === 'live'
      ? Math.max(height - insets.top - insets.bottom - 132, 700)
      : Math.max(height - insets.top - insets.bottom - 152, 620);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 72 }).current;

  useEffect(() => {
    if (params.tab === 'following' || params.tab === 'live' || params.tab === 'for_you') {
      setFeedTab(params.tab);
      setActiveIndex(0);
    }
  }, [params.tab]);

  useEffect(() => {
    if (feedTab !== 'live') {
      setGiftTargetPostId(null);
    }
  }, [feedTab]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      const firstVisible = viewableItems[0];
      if (typeof firstVisible?.index === 'number') {
        setActiveIndex(firstVisible.index);
      }
    },
  ).current;

  const activeCountLabel =
    feedTab === 'live'
      ? 'Directos, regalos y comunidad en tiempo real dentro de OrbitX.'
      : feedTab === 'following' && posts.length === 0
      ? 'Sigue cuentas para ver contenido aqui.'
      : 'Descubre ideas, memes y contexto sin salir de OrbitX.';

  const fallbackGift = gifts[0];
  const defaultGiftTargetId =
    posts[activeIndex]?.id ?? activeLivePostId ?? posts.find((item) => item.isLive)?.id ?? null;

  const openGiftModal = (postId?: string) => {
    const target = postId ?? defaultGiftTargetId;
    if (!target || !fallbackGift) {
      showToast('Aun no hay un directo listo para recibir regalos.', 'info');
      return;
    }

    setGiftTargetPostId(target);
    setShowGiftsModal(true);
  };

  const handleSendGiftInLive = async (gift: SocialGiftOption) => {
    if (isSendingGift) {
      return;
    }

    if (!giftTargetPostId) {
      setShowGiftsModal(false);
      showToast('Selecciona un directo primero.', 'info');
      return;
    }

    if (viewerGiftBalanceUsd < gift.priceUsd) {
      showToast('No tienes saldo suficiente para enviar este regalo.', 'error');
      return;
    }

    const targetPostId = giftTargetPostId;
    const burst = createGiftBurst(targetPostId, gift, currentCreator.displayName);

    try {
      setIsSendingGift(true);

      // 1. Mostrar overlay del regalo encima del live
      setActiveGiftAnimation(burst);
      await wait(60);
      if (!isMountedRef.current) {
        return;
      }

      // 2. Cerrar panel de regalos con delay controlado
      setShowGiftsModal(false);
      setGiftTargetPostId(null);
      await wait(120);
      if (!isMountedRef.current) {
        return;
      }

      // 3. Enviar al backend
      const transaction = await submitLiveGiftToBackend({
        postId: targetPostId,
        gift,
        senderName: currentCreator.displayName,
      });
      if (!isMountedRef.current) {
        return;
      }

      recordGiftTransaction(transaction);

      // 4. Actualizar saldo local del usuario
      debitViewerGiftBalance(transaction.priceUsd);
      showToast(`${gift.label} enviado por $${gift.priceUsd}.`, 'success');
    } catch (error) {
      devWarn('[OrbitX][Live] handleSendGiftInLive failed', error);
      if (!isMountedRef.current) {
        return;
      }
      showToast('No pudimos enviar el regalo. Vuelve a intentarlo.', 'error');
    } finally {
      if (isMountedRef.current) {
        setIsSendingGift(false);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <LinearGradient
        colors={['#0B0B0F', withOpacity(colors.primary, 0.14), '#050505']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.circleButton,
            { backgroundColor: withOpacity(colors.surfaceElevated, 0.82), borderColor: colors.border },
          ]}
        >
          <Ionicons name="chevron-back" size={18} color={colors.text} />
        </Pressable>

        <BlurView
          intensity={24}
          tint="dark"
          style={[styles.tabsShell, { borderColor: withOpacity(colors.primary, 0.22) }]}
        >
          {FEED_TABS.map((tab) => {
            const active = feedTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => {
                  setFeedTab(tab.key);
                  setActiveIndex(0);
                }}
                style={[
                  styles.tabChip,
                  {
                    backgroundColor: active ? withOpacity(colors.primary, 0.18) : 'transparent',
                    borderColor: active ? withOpacity(colors.primary, 0.26) : 'transparent',
                  },
                ]}
              >
                <Text style={[styles.tabLabel, { color: active ? colors.text : colors.textMuted }]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </BlurView>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.push('/social/messages')}
            style={[
              styles.circleButton,
              { backgroundColor: withOpacity(colors.surfaceElevated, 0.82), borderColor: colors.border },
            ]}
          >
            <Ionicons name="mail-outline" size={18} color={colors.text} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/social/creator/current-user')}
            style={[
              styles.profileButton,
              { backgroundColor: withOpacity(colors.surfaceElevated, 0.82), borderColor: colors.border },
            ]}
          >
            {currentCreator.avatarUri ? (
              <Image source={{ uri: currentCreator.avatarUri }} style={styles.profileAvatarImage} resizeMode="cover" />
            ) : (
              <Text style={[styles.profileAvatarText, { color: colors.text }]}>
                {currentCreator.avatar ?? currentCreator.displayName.slice(0, 1)}
              </Text>
            )}
          </Pressable>
        </View>
      </View>

      <View style={styles.headerCopy}>
        <Text style={[styles.feedTitle, { color: colors.text }]}>Explorar</Text>
        <Text style={[styles.feedSubtitle, { color: colors.textMuted }]}>{activeCountLabel}</Text>
      </View>

      {feedTab === 'live' ? (
        <View style={styles.liveControlsRow}>
          <Pressable
            onPress={() => router.push('/social/live')}
            style={[
              styles.livePrimaryAction,
              {
                backgroundColor: withOpacity(colors.primary, 0.16),
                borderColor: withOpacity(colors.primary, 0.28),
              },
            ]}
          >
            <Ionicons name="radio" size={16} color={colors.primary} />
            <Text style={[styles.livePrimaryActionLabel, { color: colors.text }]}>Iniciar en vivo</Text>
          </Pressable>

          <Pressable
            onPress={() => openGiftModal()}
            style={[
              styles.liveSecondaryAction,
              {
                backgroundColor: withOpacity(colors.surfaceElevated, 0.82),
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="gift-outline" size={16} color={colors.text} />
            <Text style={[styles.liveSecondaryActionLabel, { color: colors.text }]}>Regalos</Text>
          </Pressable>
        </View>
      ) : null}

      <LiveFeatureErrorBoundary>
        {posts.length ? (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => {
              const creator = creatorsById[item.authorId];
              if (!creator) {
                return null;
              }

              return (
                <SocialFeedItem
                  post={item}
                  creator={creator}
                  isActive={index === activeIndex}
                  liked={likedPostIds.includes(item.id)}
                  commentCount={commentsByPost[item.id]?.length ?? item.comments}
                  onToggleLike={() => toggleLikePost(item.id)}
                  onOpenComments={() => router.push(`/social/comments/${item.id}`)}
                  onOpenCreator={() => router.push(`/social/creator/${creator.id}`)}
                  onSendMessage={() => {
                    const threadId = ensureThreadWithCreator(creator);
                    router.push({ pathname: '/social/messages', params: { threadId } });
                  }}
                  onOpenGifts={() => openGiftModal(item.id)}
                  onShare={async () => {
                    await copyToClipboard(`orbitx://social/${item.id}`);
                    showToast('Enlace del post copiado.', 'success');
                  }}
                  showGiftAction={feedTab === 'live' && item.isLive}
                  height={cardHeight}
                />
              );
            }}
            pagingEnabled
            snapToAlignment="start"
            decelerationRate="fast"
            initialNumToRender={2}
            maxToRenderPerBatch={2}
            windowSize={3}
            removeClippedSubviews
            viewabilityConfig={viewabilityConfig}
            onViewableItemsChanged={onViewableItemsChanged}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.feedList,
              {
                paddingHorizontal: feedTab === 'live' ? 4 : 12,
                paddingBottom: Math.max(insets.bottom + 92, 106),
              },
            ]}
          />
        ) : (
          <View
            style={[
              styles.emptyState,
              { backgroundColor: withOpacity(colors.surfaceElevated, 0.84), borderColor: colors.border },
            ]}
          >
            <Ionicons name="sparkles-outline" size={26} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {feedTab === 'live' ? 'No hay directos activos ahora' : 'Todavia no sigues a nadie'}
            </Text>
            <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
              {feedTab === 'live'
                ? 'Cuando haya stream activo lo veras aqui con acceso rapido a regalos.'
                : 'Sigue perfiles para construir tu feed y descubrir ideas alineadas a tu mercado.'}
            </Text>
          </View>
        )}
      </LiveFeatureErrorBoundary>

      <Pressable
        onPress={() => router.push(feedTab === 'live' ? '/social/live' : '/social/create')}
        style={[
          styles.composeButton,
          {
            bottom: Math.max(insets.bottom, 14),
            backgroundColor: colors.primary,
            borderColor: withOpacity(colors.primary, 0.68),
          },
        ]}
      >
        <Ionicons name="add" size={20} color="#0B0B0F" />
      </Pressable>

      <SocialDisclaimerModal visible={!disclaimerAccepted} onAccept={acceptDisclaimer} />
      <SocialGiftsModal
        visible={showGiftsModal}
        onClose={() => setShowGiftsModal(false)}
        onSelectGift={(gift) => {
          requestAnimationFrame(() => {
            void handleSendGiftInLive(gift);
          });
        }}
      />
      <LiveFeatureErrorBoundary title="No pudimos reproducir la animacion del regalo">
        <GiftAnimationOverlay
          burst={activeGiftAnimation}
          visible={Boolean(activeGiftAnimation)}
          onComplete={() => {
            if (isMountedRef.current) {
              setActiveGiftAnimation(null);
            }
          }}
        />
      </LiveFeatureErrorBoundary>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  profileAvatarText: {
    fontFamily: FONT.bold,
    fontSize: 16,
  },
  tabsShell: {
    flex: 1,
    minHeight: 46,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    overflow: 'hidden',
  },
  tabChip: {
    flex: 1,
    minHeight: 34,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  headerCopy: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 4,
  },
  feedTitle: {
    fontFamily: FONT.bold,
    fontSize: 26,
    lineHeight: 30,
  },
  feedSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  feedList: {
    paddingTop: 2,
  },
  liveControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  livePrimaryAction: {
    flex: 1,
    minHeight: 44,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  livePrimaryActionLabel: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  liveSecondaryAction: {
    minWidth: 118,
    minHeight: 44,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  liveSecondaryActionLabel: {
    fontFamily: FONT.medium,
    fontSize: 13,
  },
  composeButton: {
    position: 'absolute',
    alignSelf: 'center',
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7B3FE4',
    shadowOpacity: 0.24,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  emptyState: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 8,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: FONT.bold,
    fontSize: 17,
  },
  emptyBody: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
