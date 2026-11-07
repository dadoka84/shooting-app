import { SymbolView } from 'expo-symbols';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { AppColors } from '@/constants/theme';
import { weaponCategorySymbol } from '@/lib/weapons/categoryDisplay';
import type { WeaponCategory } from '@/lib/types';

type WeaponCategoryIconProps = {
  category: WeaponCategory;
  size?: number;
  style?: ViewStyle;
  /** When true, icon only (no camo-style tile). Use inside category chips. */
  bare?: boolean;
};

/** Brass-ring tile + symbol — shared visual for weapon rows and cards */
export function WeaponCategoryIcon({ category, size = 26, style, bare }: WeaponCategoryIconProps) {
  const inner = (
    <SymbolView name={weaponCategorySymbol(category)} tintColor={AppColors.accentBrass} size={size} />
  );

  if (bare) {
    return <View style={[styles.bare, style]}>{inner}</View>;
  }

  return (
    <View style={[styles.tile, style]} accessibilityLabel={`${category} weapon type`}>
      {inner}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: AppColors.accentBrassDim,
    backgroundColor: 'rgba(13, 16, 13, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bare: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
