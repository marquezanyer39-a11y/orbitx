import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONT } from '../../../constants/theme';
import { EmptyState } from '../../components/common/EmptyState';
import { CommentsBottomSheet } from '../../components/social/comments/CommentsBottomSheet';
import { SocialDisclaimerModal } from '../../components/social/SocialDisclaimerModal';
import { SocialBottomNav } from '../../components/social/SocialBottomNav';
import { SocialFeedItem } from '../../components/social/SocialFeedItem';
import { useUiStore } from '../../store/uiStore';
import { useComments, useSocialFeed } from '../../social/hooks';
import { AstraInsightSheet, ShareModal } from '../../social/overlays';
import { useSocialNavigator } from '../../social/navigation/SocialNavigator';
import type { SocialFeedTab } from '../../social/types';
import { copyToClipboard } from '../../utils/copyToClipboard';

export default function SocialFeedScreen() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const params = useLocalSearchParams<{ tab?: string }>();
  const initialTab = normalizeInitialTab(params.tab);
  const socialNavigator = useSocialNavigator();
  const showToast = useUiStore((state) => state.showToast);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [astraVisible, setAstraVisible] = useState(false);
  const listRef = useRef<FlatList>(null);

  const {
    disclaimerAccepted,
    acceptDisclaimer,
    creators,
    commentsByPost,
    likedPostIds,
    followingCreatorIds,
    tabs,
    feedItems,
    selectedTab,
    changeTab,
    toggleFollowCreator,
    getAstraInsight,
    likePost,
  } = useSocialFeed(initialTab);

  const creatorsById = useMemo(
    () => Object.fromEntries(creators.map((creator) => [creator.id, creator])),
    [creators],
  );

  const activePost = feedItems[activeIndex] ?? feedItems[0] ?? null;
  const selectedPost = selectedPostId
    ? feedItems.find((post) => post.id === selectedPostId) ?? activePost
    : activePost;

  const comments = useComments(selectedPost?.id ?? null);

  const itemHeight = height;
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 72 }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      const firstVisible = viewableItems[0];
      if (typeof firstVisible?.index === 'number') {
        setActiveIndex(firstVisible.index);
      }
    },
  ).current;

  useEffect(() => {
    setActiveIndex(0);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [selectedTab]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" backgroundColor="#08090B" />

      <FlatList
        ref={listRef}
        data={feedItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const creator = creatorsById[item.authorId];
          if (!creator) {
            return <View style={[styles.fallbackItem, { height: itemHeight }]} />;
          }

          return (
            <SocialFeedItem
              post={item}
              creator={creator}
              liked={likedPostIds.includes(item.id)}
              commentCount={commentsByPost[item.id]?.length ?? item.comments}
              height={itemHeight}
              astraInsight={getAstraInsight(item)}
              onToggleLike={() => {
                void likePost(item.id);
              }}
              onOpenComments={() => {
                setSelectedPostId(item.id);
                setCommentsVisible(true);
              }}
              onShare={() => {
                setSelectedPostId(item.id);
                setShareVisible(true);
              }}
              onOpenCreator={() => socialNavigator.openCreator(creator.id)}
              onFollowCreator={() => {
                toggleFollowCreator(creator.id);
                showToast(
                  followingCreatorIds.includes(creator.id)
                    ? `Dejaste de seguir a ${creator.displayName}.`
                    : `Ahora sigues a ${creator.displayName}.`,
                  'success',
                );
              }}
              onOpenAstra={() => {
                setSelectedPostId(item.id);
                setAstraVisible(true);
              }}
            />
          );
        }}
        pagingEnabled
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        contentContainerStyle={feedItems.length ? undefined : { flex: 1 }}
        ListEmptyComponent={
          <View style={[styles.emptyWrap, { minHeight: height * 0.5 }]}>
            <EmptyState
              icon="people-outline"
              title="Esta pestaña no tiene contenido aun"
              body="Cuando los creadores publiquen, sus posts apareceran aqui."
            />
          </View>
        }
      />

      <TopTabs
        topInset={insets.top}
        tabs={tabs}
        activeTab={selectedTab}
        onChange={changeTab}
      />

      <SocialBottomNav
        bottomInset={insets.bottom}
        onHome={() => changeTab('for_you')}
        onSearch={() => socialNavigator.openDiscovery()}
        onCreate={() => socialNavigator.openCreatePost()}
        onNotifications={() => socialNavigator.openNotifications()}
        onInbox={() => router.push('/social/messages')}
        onProfile={() => socialNavigator.openProfile()}
      />

      <ShareModal
        visible={shareVisible}
        title="Compartir"
        body="Comparte este contenido demo dentro de QVEX sin exponer direcciones, balances ni datos sensibles."
        primaryLabel={`Copiar enlace demo ${selectedPost?.tokenSymbol ?? 'social'}`}
        onClose={() => setShareVisible(false)}
        onPrimaryAction={async () => {
          if (!selectedPost) return;
          await copyToClipboard(`qvex://social/${selectedPost.id}`);
          showToast('Enlace social demo copiado.', 'success');
          setShareVisible(false);
        }}
      />

      <AstraInsightSheet
        visible={astraVisible}
        title="Astra AI"
        body={selectedPost ? getAstraInsight(selectedPost) : ''}
        caption="Señal informativa basada en contexto mock local. No es asesoría financiera ni ejecuta órdenes."
        onClose={() => setAstraVisible(false)}
      />

      <CommentsBottomSheet
        visible={commentsVisible}
        comments={comments.comments}
        astraInsight={comments.astraInsight}
        currentUser={comments.currentUser}
        creatorIds={comments.creatorIds}
        creatorLabel="Creator"
        likedCommentIds={comments.likedCommentIds}
        onClose={() => setCommentsVisible(false)}
        onLikeComment={(commentId) => {
          void comments.likeComment(commentId);
        }}
        onSendComment={async (body, replyToCommentId) => {
          await comments.addComment(body, replyToCommentId);
        }}
      />

      <SocialDisclaimerModal visible={!disclaimerAccepted} onAccept={acceptDisclaimer} />
    </View>
  );
}

function TopTabs({
  topInset,
  tabs,
  activeTab,
  onChange,
}: {
  topInset: number;
  tabs: Array<{ key: SocialFeedTab; label: string }>;
  activeTab: SocialFeedTab;
  onChange: (tab: SocialFeedTab) => void;
}) {
  return (
    <View pointerEvents="box-none" style={[styles.tabsOverlay, { paddingTop: Math.max(topInset + 16, 38) }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onChange(tab.key)}
              style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}
            >
              <Text style={[styles.tabText, active ? styles.tabTextActive : styles.tabTextInactive]}>
                {tab.label}
              </Text>
              <View style={[styles.tabUnderline, active && styles.tabUnderlineActive]} />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}


function normalizeInitialTab(tab?: string): SocialFeedTab {
  if (
    tab === 'for_you' ||
    tab === 'following' ||
    tab === 'live' ||
    tab === 'ai' ||
    tab === 'memecoins' ||
    tab === 'trading'
  ) {
    return tab;
  }

  return 'for_you';
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#08090B',
  },
  fallbackItem: {
    backgroundColor: '#08090B',
  },
  tabsOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 18,
    paddingBottom: 18,
  },
  tabsContent: {
    paddingHorizontal: 14,
    gap: 28,
    alignItems: 'center',
  },
  tabButton: {
    minHeight: 42,
    justifyContent: 'flex-start',
    gap: 9,
  },
  tabText: {
    fontFamily: FONT.bold,
    fontSize: 18,
    lineHeight: 23,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabTextInactive: {
    color: 'rgba(255,255,255,0.54)',
  },
  tabUnderline: {
    width: '100%',
    height: 3,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  tabUnderlineActive: {
    backgroundColor: '#3FE56C',
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
    backgroundColor: '#08090B',
  },
});
