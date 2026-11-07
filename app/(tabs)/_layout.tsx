import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { FloatingPillTabBar } from '@/components/navigation/FloatingPillTabBar';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

import { TabHeaderBackground } from '@/components/theme';
import { AppColors, TabBarLayout } from '@/constants/theme';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useI18n } from '@/lib/i18n/I18nProvider';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useI18n();
  return (
    <Tabs
      tabBar={(props) => <FloatingPillTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'dark'].tabIconDefault,
        tabBarShowLabel: false,
        tabBarItemStyle: tabBarStyles.item,
        tabBarIconStyle: tabBarStyles.icon,
        tabBarStyle: {
          position: 'absolute',
          height: TabBarLayout.height,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
        headerTransparent: false,
        headerShadowVisible: false,
        headerBackground: () => <TabHeaderBackground />,
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerTintColor: AppColors.accentBrass,
        headerTitleStyle: {
          fontWeight: '800',
          color: AppColors.textPrimary,
          letterSpacing: 0.5,
          textShadowColor: 'rgba(0,0,0,0.45)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        },
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => (
            <TabBarIconSlot>
              <SymbolView name={{ ios: 'house', android: 'home', web: 'home' }} tintColor={color} size={26} />
            </TabBarIconSlot>
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: t('tabs.trips'),
          tabBarIcon: ({ color }) => (
            <TabBarIconSlot>
              <SymbolView name={{ ios: 'map', android: 'map', web: 'map' }} tintColor={color} size={26} />
            </TabBarIconSlot>
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: t('tabs.library'),
          tabBarIcon: ({ color }) => (
            <TabBarIconSlot>
              <SymbolView
                name={{ ios: 'photo.on.rectangle', android: 'photo_library', web: 'photo_library' }}
                tintColor={color}
                size={26}
              />
            </TabBarIconSlot>
          ),
        }}
      />
      <Tabs.Screen
        name="weapons"
        options={{
          title: t('tabs.weapons'),
          tabBarIcon: ({ color }) => (
            <TabBarIconSlot>
              <SymbolView name={{ ios: 'scope', android: 'gps_fixed', web: 'gps_fixed' }} tintColor={color} size={26} />
            </TabBarIconSlot>
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t('tabs.more'),
          tabBarIcon: ({ color }) => (
            <TabBarIconSlot>
              <SymbolView
                name={{ ios: 'ellipsis.circle', android: 'more_horiz', web: 'more_horiz' }}
                tintColor={color}
                size={26}
              />
            </TabBarIconSlot>
          ),
        }}
      />
    </Tabs>
  );
}

function TabBarIconSlot({ children }: { children: ReactNode }) {
  return <View style={tabBarStyles.iconSlot}>{children}</View>;
}

const tabBarStyles = StyleSheet.create({
  item: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    padding: 0,
  },
  icon: {
    marginTop: 0,
    marginBottom: 0,
  },
  iconSlot: {
    height: TabBarLayout.height,
    justifyContent: 'center',
    alignItems: 'center',
    /** Nudge below optical center after hidden label space is removed */
    paddingTop: 7,
  },
});
