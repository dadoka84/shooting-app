import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';

import { AppColors } from '@/constants/theme';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'dark'].tabIconDefault,
        tabBarStyle: {
          backgroundColor: AppColors.surface,
          borderTopColor: AppColors.border,
        },
        tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
        headerStyle: {
          backgroundColor: AppColors.surface,
          borderBottomColor: AppColors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: AppColors.accentBrass,
        headerTitleStyle: { fontWeight: '800', color: AppColors.textPrimary, letterSpacing: 0.5 },
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'WhatShotz',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'house', android: 'home', web: 'home' }} tintColor={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trips',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'map', android: 'map', web: 'map' }} tintColor={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
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
          title: 'Weapons',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'scope', android: 'gps_fixed', web: 'gps_fixed' }} tintColor={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
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
