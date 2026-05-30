import { router } from 'expo-router';

import { buildCommentsRoute, buildCreatorRoute, SOCIAL_ROUTES } from './socialRoutes';

export function useSocialNavigator() {
  return {
    openHome: (tab?: string) =>
      router.push({
        pathname: SOCIAL_ROUTES.home_feed,
        params: tab ? { tab } : undefined,
      }),
    openLiveRoom: () => router.push(SOCIAL_ROUTES.live_room),
    openProfile: () => router.push(buildCreatorRoute('current-user')),
    openCreator: (creatorId: string) => router.push(buildCreatorRoute(creatorId)),
    openComments: (postId: string) => router.push(buildCommentsRoute(postId)),
    openCreatePost: () => router.push(SOCIAL_ROUTES.create_post),
    openDiscovery: () => router.push(SOCIAL_ROUTES.stream_discovery),
    openNotifications: () => router.push(SOCIAL_ROUTES.notifications),
    openGiftStore: () => router.push(SOCIAL_ROUTES.gift_store),
    openSocialWallet: () => router.push(SOCIAL_ROUTES.social_wallet),
    openXSettings: () => router.push(SOCIAL_ROUTES.x_connection_settings),
    back: () => router.back(),
  };
}
