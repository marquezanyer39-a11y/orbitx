import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RouteRedirect } from '../../components/common/RouteRedirect';
import { FONT, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useI18n } from '../../hooks/useI18n';
import { TAB_NAV_ITEMS } from '../../src/navigation/TabNavigator';
import { isSensitiveRoutesBlockedInStableMode } from '../../src/config/runtimeMode';
import { useAuthStore } from '../../src/store/authStore';

const TAB_ORDER = TAB_NAV_ITEMS.map((item) => item.key) as Array<
  (typeof TAB_NAV_ITEMS)[number]['key']
>;

function StandardTabIcon({
  focused,
  icon,
}: {
  focused: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.standardTabIconShell,
        {
          backgroundColor: focused ? withOpacity(colors.profit, 0.12) : 'transparent',
          borderColor: 'transparent',
        },
      ]}
    >
      <Ionicons
        name={icon ?? 'ellipse-outline'}
        color={focused ? colors.profit : withOpacity(colors.text, 0.6)}
        size={focused ? 18 : 17}
      />
    </View>
  );
}

function TradeTabIcon({ focused }: { focused: boolean }) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.tradeTabOuter,
        {
          backgroundColor: focused ? withOpacity(colors.profit, 0.12) : 'transparent',
          borderColor: 'transparent',
        },
      ]}
    >
      <View
        style={[
          styles.tradeTabButton,
          {
            backgroundColor: 'transparent',
            borderColor: 'transparent',
          },
        ]}
      >
        <Ionicons
          name="swap-horizontal"
          color={focused ? colors.profit : colors.text}
          size={20}
        />
      </View>
    </View>
  );
}

function getTabLabel(routeName: (typeof TAB_ORDER)[number], t: (path: string) => string) {
  if (routeName === 'home') return t('tabs.home');
  if (routeName === 'market') return t('tabs.market');
  if (routeName === 'spot') return t('tabs.trade');
  if (routeName === 'wallet') return t('tabs.wallet');
  if (routeName === 'profile') return t('tabs.profile');
  return TAB_NAV_ITEMS.find((item) => item.key === routeName)?.label ?? routeName;
}

function OrbitTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const visibleTabOrder = isSensitiveRoutesBlockedInStableMode()
    ? TAB_ORDER.filter((routeName) => routeName !== 'spot' && routeName !== 'wallet')
    : TAB_ORDER;

  return (
    <View
      style={[
        styles.tabBarShell,
        {
          backgroundColor: withOpacity(colors.card, 0.82),
          borderTopColor: withOpacity(colors.text, 0.045),
          paddingBottom: Math.max(insets.bottom, 4),
        },
      ]}
    >
      <View style={styles.tabBarRow}>
        {visibleTabOrder.map((routeName) => {
          const route = state.routes.find((item) => item.name === routeName);
          if (!route) {
            return <View key={routeName} style={styles.tabBarItem} />;
          }

          const activeRouteName = state.routes[state.index]?.name;
          const focused =
            state.routes[state.index]?.key === route.key ||
            (route.name === 'spot' &&
              (activeRouteName === 'create-token' ||
                activeRouteName === 'create-token-liquidity' ||
                activeRouteName === 'create-token-airdrop' ||
                activeRouteName === 'create-token-publication' ||
                activeRouteName === 'create-token-review' ||
                activeRouteName === 'create-token-created')) ||
            (route.name === 'wallet' &&
              (activeRouteName === 'wallet-spot' ||
                activeRouteName === 'wallet-local' ||
                activeRouteName === 'wallet-web3')) ||
            (route.name === 'profile' && activeRouteName === 'profile-vip');
          const isTrade = route.name === 'spot';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              style={[styles.tabBarItem, isTrade ? styles.tabBarItemTrade : null]}
            >
              {isTrade ? (
                <TradeTabIcon focused={focused} />
              ) : route.name === 'home' ? (
                <StandardTabIcon focused={focused} icon="home-outline" />
              ) : route.name === 'market' ? (
                <StandardTabIcon focused={focused} icon="stats-chart-outline" />
              ) : route.name === 'wallet' ? (
                <StandardTabIcon focused={focused} icon="wallet-outline" />
              ) : (
                <StandardTabIcon focused={focused} icon="person-outline" />
              )}

              <Text
                style={[
                  isTrade ? styles.tradeTabLabel : styles.standardTabLabel,
                  {
                    color: focused
                      ? isTrade
                        ? colors.text
                        : colors.profit
                      : withOpacity(colors.text, 0.5),
                  },
                ]}
              >
                {getTabLabel(route.name as (typeof TAB_ORDER)[number], t)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const sessionStatus = useAuthStore((state) => state.session.status);
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const sensitiveRoutesBlocked = isSensitiveRoutesBlockedInStableMode();

  if (sessionStatus === 'signed_out') {
    return <RouteRedirect href="/" />;
  }

  return (
    <Tabs
      tabBar={(props) => <OrbitTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        lazy: true,
        freezeOnBlur: true,
        sceneStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: t('tabs.home') }} />
      <Tabs.Screen name="market" options={{ title: t('tabs.market') }} />
      <Tabs.Screen
        name="spot"
        options={{ title: t('tabs.trade'), href: sensitiveRoutesBlocked ? null : undefined }}
      />
      <Tabs.Screen
        name="wallet"
        options={{ title: t('tabs.wallet'), href: sensitiveRoutesBlocked ? null : undefined }}
      />
      <Tabs.Screen name="wallet-spot" options={{ href: null, title: 'Billetera Spot' }} />
      <Tabs.Screen name="wallet-local" options={{ href: null, title: 'Cuenta Local' }} />
      <Tabs.Screen name="wallet-web3" options={{ href: null, title: 'Billetera Web3' }} />
      <Tabs.Screen name="create-token" options={{ href: null, title: 'Crear token' }} />
      <Tabs.Screen name="create-token-liquidity" options={{ href: null, title: 'Configurar liquidez' }} />
      <Tabs.Screen name="create-token-airdrop" options={{ href: null, title: 'Configurar airdrop' }} />
      <Tabs.Screen name="create-token-publication" options={{ href: null, title: 'Publicación QVEX' }} />
      <Tabs.Screen name="create-token-review" options={{ href: null, title: 'Revisión final' }} />
      <Tabs.Screen name="create-token-created" options={{ href: null, title: 'Token creado' }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile') }} />
      <Tabs.Screen name="profile-vip" options={{ href: null, title: 'Rango QVEX' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  standardTabIconShell: {
    width: 26,
    height: 24,
    borderRadius: 8,
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarShell: {
    borderTopWidth: 1,
    paddingTop: 4,
    paddingHorizontal: 6,
  },
  tabBarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  tabBarItem: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    paddingTop: 1,
  },
  tabBarItemTrade: {
    gap: 2,
  },
  tradeTabOuter: {
    width: 36,
    height: 28,
    borderRadius: 10,
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tradeTabButton: {
    width: 32,
    height: 26,
    borderRadius: 9,
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  standardTabLabel: {
    fontFamily: FONT.semibold,
    fontSize: 9.5,
    lineHeight: 12,
    marginTop: 1,
  },
  tradeTabLabel: {
    fontFamily: FONT.semibold,
    fontSize: 10,
    lineHeight: 12,
    marginTop: 1,
  },
});
