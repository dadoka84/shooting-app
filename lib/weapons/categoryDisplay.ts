import type { WeaponCategory } from '@/lib/types';

export const WEAPON_CATEGORIES: WeaponCategory[] = ['pistol', 'rifle', 'sniper', 'other'];

export function weaponCategoryLabel(category: WeaponCategory): string {
  const map: Record<WeaponCategory, string> = {
    pistol: 'Pistol',
    rifle: 'Rifle',
    sniper: 'Sniper',
    other: 'Other',
  };
  return map[category];
}

/** Map legacy DB values from before sniper category replaced PCC */
export function normalizeWeaponCategory(value: string): WeaponCategory {
  if (value === 'pcc') return 'sniper';
  if (value === 'pistol' || value === 'rifle' || value === 'sniper' || value === 'other') {
    return value;
  }
  return 'other';
}
