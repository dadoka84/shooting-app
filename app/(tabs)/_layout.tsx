import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';

import { TabHeaderBackground } from '@/components/theme';
import { AppColors, TabBarLayout } from '@/constants/theme';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useI18n } from '@/lib/i18n/I18nProvider';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const tabBottom = TabBarLayout.marginBottom + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'dark'].tabIconDefault,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          left: TabBarLayout.marginHorizontal,
          right: TabBarLayout.marginHorizontal,
          bottom: tabBottom,
          height: TabBarLayout.height,
          borderRadius: TabBarLayout.radius,
          backgroundColor: AppColors.surfaceRaised,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: AppColors.border,
          paddingTop: 0,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 10,
            },
            android: { elevation: 12 },
            default: {},
          }),
        },
        tabBarBackground: () => (
          <View style={[tabBarStyles.pillBg, { borderRadius: TabBarLayout.radius }]} />
        ),
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
            <SymbolView name={{ ios: 'house', android: 'home', web: 'home' }} tintColor={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: t('tabs.trips'),
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'map', android: 'map', web: 'map' }} tintColor={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: t('tabs.library'),
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'photo.on.rectangle', android: 'photo_library', web: 'photo_library' }}
              tintColor={color}
              size={26}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="weapons"
        options={{
          title: t('tabs.weapons'),
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'scope', android: 'gps_fixed', web: 'gps_fixed' }} tintColor={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t('tabs.more'),
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'ellipsis.circle', android: 'more_horiz', web: 'more_horiz' }}
              tintColor={color}
              size={26}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const tabBarStyles = StyleSheet.create({
  pillBg: {
    flex: 1,
    backgroundColor: AppColors.surfaceRaised,
    overflow: 'hidden',
  },
});
