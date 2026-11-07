import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';
import {
  WEAPON_CATEGORIES,
  weaponCategoryLabel,
} from '@/lib/weapons/categoryDisplay';
import type { WeaponCategory } from '@/lib/types';

import { WeaponCategoryIcon } from './WeaponCategoryIcon';

export function WeaponCategoryPicker({
  value,
  onChange,
}: {
  value: WeaponCategory;
  onChange: (c: WeaponCategory) => void;
}) {
  return (
    <View style={styles.row}>
      {WEAPON_CATEGORIES.map((c) => {
        const active = value === c;
        return (
          <Pressable
            key={c}
            onPress={() => onChange(c)}
            style={({ pressed }) => [
              styles.chip,
              active && styles.chipActive,
              pressed && styles.chipPressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <WeaponCategoryIcon category={c} size={22} bare />
            <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{weaponCategoryLabel(c)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: AppColors.surfaceRaised,
  },
  chipActive: {
    backgroundColor: AppColors.accentOliveBright,
    borderColor: AppColors.accentBrass,
  },
  chipPressed: {
    opacity: 0.9,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textMuted,
  },
  chipLabelActive: {
    color: AppColors.textInverse,
  },
});
