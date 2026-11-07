export type AmmoTypeId = (typeof AMMO_TYPES)[number]['id'];

export const AMMO_TYPES = [
  { id: 'fmj', labelKey: 'ammo.typeFmj' as const },
  { id: 'jhp', labelKey: 'ammo.typeJhp' as const },
  { id: 'sp', labelKey: 'ammo.typeSp' as const },
  { id: 'hp', labelKey: 'ammo.typeHp' as const },
  { id: 'match', labelKey: 'ammo.typeMatch' as const },
  { id: 'subsonic', labelKey: 'ammo.typeSubsonic' as const },
  { id: 'shot', labelKey: 'ammo.typeShot' as const },
  { id: 'slug', labelKey: 'ammo.typeSlug' as const },
  { id: 'other', labelKey: 'ammo.typeOther' as const },
] as const;
