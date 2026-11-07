import type { SymbolViewProps } from 'expo-symbols';

import type { WeaponCategory } from '@/lib/types';

export const WEAPON_CATEGORIES: WeaponCategory[] = ['pistol', 'rifle', 'pcc', 'other'];

export function weaponCategoryLabel(category: WeaponCategory): string {
  const map: Record<WeaponCategory, string> = {
    pistol: 'Pistol',
    rifle: 'Rifle',
    pcc: 'PCC',
    other: 'Other',
  };
  return map[category];
}

/** Cross-platform symbol names for expo-symbols SymbolView */
export function weaponCategorySymbol(category: WeaponCategory): SymbolViewProps['name'] {
  const map: Record<WeaponCategory, SymbolViewProps['name']> = {
    pistol: { ios: 'scope', android: 'gps_fixed', web: 'gps_fixed' },
    rifle: { ios: 'arrow.left.and.right', android: 'straighten', web: 'straighten' },
    pcc: { ios: 'rectangle.split.2x1', android: 'view_column', web: 'view_column' },
    other: { ios: 'wrench.and.screwdriver', android: 'build', web: 'build' },
  };
  return map[category];
}
