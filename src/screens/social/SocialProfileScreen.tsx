import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONT, withOpacity } from '../../../constants/theme';
import { ProfileHeader } from '../../components/social/profile/ProfileHeader';
import { CreatorStats } from '../../components/social/profile/CreatorStats';
import { AstraProfileInsight } from '../../components/social/profile/AstraProfileInsight';
import { ProfileTabs } from '../../components/social/profile/ProfileTabs';
import { ProfileContentGrid } from '../../components/social/profile/ProfileContentGrid';
import { TopSupporters } from '../../components/social/profile/TopSupporters';
import { SocialProfileBottomNav } from '../../components/social/profile/SocialProfileBottomNav';
import { useUiStore } from '../../store/uiStore';
import { useSocialNavigator } from '../../social/navigation/SocialNavigator';
import { AstraInsightSheet, ShareModal } from '../../social/overlays';
import { useSocialProfile } from '../../social/hooks';
import { copyToClipboard } from '../../utils/copyToClipboard';

type ProfileTabKey = 'posts' | 'streams' | 'clips' | 'trades' | 'ai' | 'likes';

export default function SocialProfileScreen() {
  const insets = useSafeAreaInsets();
  const { creatorId } = useLocalSearchParams<{ creatorId?: string }>();
  const socialNavigator = useSocialNavigator();
  const showToast = useUiStore((state) => state.showToast);
  const [activeTab, setActiveTab] = useState<ProfileTabKey>('posts');
  const [shareVisible, setShareVisible] = useState(false);
  const [astraVisible, setAstraVisible] = useState(false);

  const {
    profile,
    content,
    stats,
    supporters,
    earningsStrip,
    tabs,
    isFollowing,
    astraInsight,
    follow,
    ensureThreadWithCreator,
  } = useSocialProfile(creatorId);

  const activeItems = content[activeTab] ?? [];
  const mappedSupporters = supporters.map((supporter) => ({
    ...supporter,
    avatarUri:
      supporter.avatarUri ??
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
    badge: supporter.badge ?? 'Supporter',
  }));

  return (
    <View style={styles.screen}>
      <StatusBar style="light" backgroundColor="#08090B" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 132 + Math.max(insets.bottom, 16) }]}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          creator={{
            name: profile.displayName,
            handle: `@${profile.username}`,
            bio: profile.bio ?? '',
            avatarUri:
              profile.avatarUri ??
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=480&q=80',
            bannerUri:
              profile.bannerUri ??
              'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=90',
            verified: profile.verified ?? false,
            vipLabel: profile.vipLevel?.toUpperCase() ?? 'CREATOR',
            followersLabel: `${formatMetric(profile.followers)} demo`,
            followingLabel: `${formatMetric(profile.following)} demo`,
            likesLabel: `${formatMetric(profile.totalLikes)} demo`,
          }}
          isFollowing={isFollowing}
          onBack={socialNavigator.back}
          onMore={() => showToast('Más opciones del creator llegarán pronto.', 'info')}
          onToggleFollow={() => {
            void follow();
          }}
          onMessage={() => {
            const threadId = ensureThreadWithCreator({
              id: profile.id,
              displayName: profile.displayName,
              handle: `@${profile.username}`,
              avatar: profile.displayName.slice(0, 1).toUpperCase(),
              avatarUri: profile.avatarUri ?? null,
            });
            router.push({ pathname: '/social/messages', params: { threadId } });
          }}
          onShare={() => setShareVisible(true)}
        />

        <View style={styles.section}>
          <CreatorStats items={stats} />
        </View>

        <View style={styles.section}>
          <AstraProfileInsight text={astraInsight} onPress={() => setAstraVisible(true)} />
        </View>

        <View style={styles.section}>
          <Pressable
            onPress={socialNavigator.openXSettings}
            style={({ pressed }) => [styles.xConnectCard, pressed && styles.pressed]}
          >
            <View style={styles.xConnectTextWrap}>
              <Text style={styles.xConnectLabel}>SOCIAL BRIDGE</Text>
              <Text style={styles.xConnectTitle}>Conectar X</Text>
              <Text style={styles.xConnectBody}>
                Vincula tu cuenta en modo mock para importar comunidad de ejemplo cuando OAuth este listo.
              </Text>
            </View>
            <Text style={styles.xConnectAction}>Abrir</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <ProfileTabs tabs={tabs} activeTab={activeTab} onChange={(key) => setActiveTab(key as ProfileTabKey)} />
        </View>

        <View style={styles.section}>
          <ProfileContentGrid
            items={activeItems}
            onOpen={() => showToast('La apertura de contenido real se conectará en la siguiente fase.', 'info')}
          />
        </View>

        <View style={styles.section}>
          <TopSupporters supporters={mappedSupporters} onOpenSupporters={() => showToast('Leaderboard completo pendiente de backend social.', 'info')} />
        </View>

        <View style={styles.section}>
          <BlurView intensity={18} tint="dark" style={styles.earningsCard}>
            <Text style={styles.earningsTitle}>SOCIAL WALLET DEMO</Text>
            <Text style={styles.earningsDisclaimer}>Valores simulados. Sin pagos reales ni balances reales.</Text>
            <View style={styles.earningsRow}>
              {earningsStrip.map((item) => (
                <View key={item.label} style={styles.earningsItem}>
                  <Text style={styles.earningsValue}>{item.value}</Text>
                  <Text style={styles.earningsLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </BlurView>
        </View>
      </ScrollView>

      <SocialProfileBottomNav
        bottomInset={insets.bottom}
        onHome={() => socialNavigator.openHome()}
        onSearch={() => socialNavigator.openDiscovery()}
        onCreate={() => socialNavigator.openCreatePost()}
        onNotifications={() => socialNavigator.openNotifications()}
        onInbox={() => showToast('Inbox social preparado para la siguiente fase.', 'info')}
      />

      <ShareModal
        visible={shareVisible}
        title="Compartir perfil"
        body="Comparte este perfil creator dentro de QVEX sin exponer wallet ni datos sensibles."
        primaryLabel="Copiar enlace del perfil"
        onClose={() => setShareVisible(false)}
        onPrimaryAction={async () => {
          await copyToClipboard(`qvex://social/profile/${profile.username}`);
          showToast('Enlace del creator copiado.', 'success');
          setShareVisible(false);
        }}
      />

      <AstraInsightSheet
        visible={astraVisible}
        title="Astra Profile Insight"
        body={astraInsight}
        onClose={() => setAstraVisible(false)}
      />
    </View>
  );
}

function formatMetric(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}k`;
  }

  return `${value}`;
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
    paddingBottom: 140,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 18,
  },
  earningsCard: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(20,21,24,0.52)',
    borderWidth: 1,
    borderColor: withOpacity('#3C4A3C', 0.22),
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  earningsTitle: {
    color: '#7FFF93',
    fontFamily: FONT.bold,
    fontSize: 12,
    letterSpacing: 1.1,
  },
  earningsDisclaimer: {
    marginTop: -6,
    color: '#FFD76A',
    fontFamily: FONT.semibold,
    fontSize: 11,
    lineHeight: 16,
  },
  earningsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  earningsItem: {
    width: '47%',
    gap: 4,
  },
  earningsValue: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  earningsLabel: {
    color: '#A1A1AA',
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  xConnectCard: {
    minHeight: 92,
    borderRadius: 18,
    backgroundColor: withOpacity('#192219', 0.68),
    borderWidth: 1,
    borderColor: withOpacity('#3FE56C', 0.24),
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  xConnectTextWrap: {
    flex: 1,
    gap: 4,
  },
  xConnectLabel: {
    color: '#7FFF93',
    fontFamily: FONT.bold,
    fontSize: 10,
    letterSpacing: 1,
  },
  xConnectTitle: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  xConnectBody: {
    color: '#A1A1AA',
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 17,
  },
  xConnectAction: {
    color: '#003912',
    fontFamily: FONT.bold,
    fontSize: 12,
    overflow: 'hidden',
    backgroundColor: '#3FE56C',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.985 }],
  },
});
