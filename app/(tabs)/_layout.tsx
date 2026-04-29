import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RouteRedirect } from '../../components/common/RouteRedirect';
import { FONT, RADII, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useI18n } from '../../hooks/useI18n';
import { TAB_NAV_ITEMS } from '../../src/navigation/TabNavigator';
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
          borderColor: focused
            ? withOpacity(colors.profit, 0.18)
            : withOpacity(colors.borderStrong, 0.08),
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
          backgroundColor: focused
            ? withOpacity(colors.profit, 0.16)
            : withOpacity(colors.profit, 0.06),
          borderColor: focused
            ? withOpacity(colors.profit, 0.22)
            : withOpacity(colors.borderStrong, 0.45),
        },
      ]}
    >
      <View
        style={[
          styles.tradeTabButton,
          {
            backgroundColor: focused ? withOpacity(colors.profit, 0.9) : colors.card,
            borderColor: focused
              ? withOpacity(colors.profit, 0.58)
              : withOpacity(colors.profit, 0.12),
          },
        ]}
      >
        <Ionicons
          name="swap-horizontal"
          color={focused ? colors.background : colors.text}
          size={19}
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

  return (
    <View
      style={[
        styles.tabBarShell,
        {
          backgroundColor: withOpacity(colors.card, 0.9),
          borderTopColor: withOpacity(colors.text, 0.06),
          paddingBottom: Math.max(insets.bottom, 6),
        },
      ]}
    >
      <View style={styles.tabBarRow}>
        {TAB_ORDER.map((routeName) => {
          const route = state.routes.find((item) => item.name === routeName);
          if (!route) {
            return <View key={routeName} style={styles.tabBarItem} />;
          }

          const focused = state.routes[state.index]?.key === route.key;
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
      <Tabs.Screen name="spot" options={{ title: t('tabs.trade') }} />
      <Tabs.Screen name="wallet" options={{ title: t('tabs.wallet') }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  standardTabIconShell: {
    width: 29,
    height: 29,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarShell: {
    borderTopWidth: 1,
    paddingTop: 5,
    paddingHorizontal: 8,
  },
  tabBarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  tabBarItem: {
    flex: 1,
    minHeight: 51,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    paddingTop: 1,
  },
  tabBarItemTrade: {
    gap: 2,
  },
  tradeTabOuter: {
    width: 46,
    height: 46,
    borderRadius: RADII.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tradeTabButton: {
    width: 38,
    height: 38,
    borderRadius: RADII.pill,
    borderWidth: 1,
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
