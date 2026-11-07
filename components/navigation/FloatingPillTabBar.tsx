import { BottomTabBar } from 'expo-router/build/react-navigation/bottom-tabs/views/BottomTabBar';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs/types';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors, TabBarLayout } from '@/constants/theme';

/** Insets the pill from screen edges; expo ignores left/width on tabBarStyle alone. */
export function FloatingPillTabBar(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const marginBottom = TabBarLayout.marginBottom + insets.bottom;
  const marginH = TabBarLayout.marginHorizontal;

  return (
    <View style={styles.outer} pointerEvents="box-none">
      <View
        style={[
          styles.pill,
          {
            marginBottom,
            marginHorizontal: marginH,
            height: TabBarLayout.height,
            borderRadius: TabBarLayout.radius,
          },
        ]}
      >
        <BottomTabBar
          {...props}
          style={{
            backgroundColor: AppColors.surfaceRaised,
            borderTopWidth: 0,
            height: TabBarLayout.height,
            paddingTop: 0,
            paddingBottom: 0,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
  },
  pill: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: AppColors.surfaceRaised,
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
});
