import 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { AppColors } from '@/constants/theme';
import { DatabaseProvider } from '@/lib/db/DatabaseProvider';
import { I18nProvider, useI18n } from '@/lib/i18n/I18nProvider';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: AppColors.background }}>
      <SafeAreaProvider>
        <I18nProvider>
          <DatabaseProvider>
            <RootLayoutNav />
          </DatabaseProvider>
        </I18nProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const { t } = useI18n();
  const navTheme = useMemo(
    () => ({
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        primary: AppColors.accentBrass,
        background: AppColors.background,
        card: AppColors.surface,
        text: AppColors.textPrimary,
        border: AppColors.border,
        notification: AppColors.accentOliveBright,
      },
    }),
    [],
  );

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: AppColors.surface },
          headerTintColor: AppColors.accentBrass,
          headerTitleStyle: { fontWeight: '700', color: AppColors.textPrimary },
          contentStyle: { backgroundColor: AppColors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="trip/new" options={{ title: t('stack.newTrip') }} />
        <Stack.Screen name="trip/[id]" options={{ title: t('stack.trip') }} />
        <Stack.Screen name="trip/edit/[id]" options={{ title: t('stack.editTrip') }} />
        <Stack.Screen name="weapon/new" options={{ title: t('stack.addWeapon') }} />
        <Stack.Screen name="weapon/[id]" options={{ title: t('stack.weapon') }} />
        <Stack.Screen name="weapon/edit/[id]" options={{ title: t('stack.editWeapon') }} />
        <Stack.Screen name="target/[id]" options={{ title: t('stack.target') }} />
        <Stack.Screen name="target/score/[id]" options={{ title: t('stack.scoreTarget') }} />
      </Stack>
    </ThemeProvider>
  );
}
