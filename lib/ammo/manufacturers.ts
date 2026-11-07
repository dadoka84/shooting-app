export const CUSTOM_MANUFACTURER_ID = 'custom' as const;

export const KNOWN_AMMO_MANUFACTURERS = [
  { id: 'federal', label: 'Federal' },
  { id: 'cci', label: 'CCI' },
  { id: 'winchester', label: 'Winchester' },
  { id: 'remington', label: 'Remington' },
  { id: 'hornady', label: 'Hornady' },
  { id: 'snb', label: 'Sellier & Bellot' },
  { id: 'magtech', label: 'Magtech' },
  { id: 'pmc', label: 'PMC' },
  { id: 'fiocchi', label: 'Fiocchi' },
  { id: 'norma', label: 'Norma' },
  { id: 'lapua', label: 'Lapua' },
  { id: 'blazer', label: 'Blazer' },
  { id: 'aguila', label: 'Aguila' },
  { id: 'ppu', label: 'Prvi Partizan' },
  { id: 'geco', label: 'Geco' },
  { id: 'rws', label: 'RWS' },
  { id: 'igman', label: 'Igman' },
  { id: 'winchesternato', label: 'Winchester NATO' },
  { id: 'barnaul', label: 'Barnaul' },
  { id: 'wolf', label: 'Wolf / Tula' },
] as const;

export type KnownManufacturerId = (typeof KNOWN_AMMO_MANUFACTURERS)[number]['id'];
export type ManufacturerPick = KnownManufacturerId | typeof CUSTOM_MANUFACTURER_ID;

export function resolveManufacturerLabel(pick: ManufacturerPick, customText: string): string {
  if (pick === CUSTOM_MANUFACTURER_ID) {
    return customText.trim();
  }
  const row = KNOWN_AMMO_MANUFACTURERS.find((m) => m.id === pick);
  return row?.label ?? customText.trim();
}
