/** Common calibers sorted ascending by typical projectile / bore size (mm). */
export type CommonCaliberId =
  | '22lr'
  | '22wmr'
  | '17hmr'
  | '25acp'
  | '32acp'
  | '57x28'
  | '380acp'
  | '9mm'
  | '357sig'
  | '38sp'
  | '40sw'
  | '10mm'
  | '45acp'
  | '357mag'
  | '44mag'
  | '223'
  | '300blk'
  | '762x39'
  | '308'
  | '3006'
  | '65cm'
  | '338lm'
  | '50bmg'
  | '20ga'
  | '12ga';

export const CUSTOM_CALIBER_ID = 'custom' as const;

export type CaliberPick = CommonCaliberId | typeof CUSTOM_CALIBER_ID;

export type CommonCaliber = {
  id: CommonCaliberId;
  label: string;
  /** Sort key: nominal bore / bullet diameter in mm */
  sizeMm: number;
};

const CALIBER_SEED: CommonCaliber[] = [
  { id: '17hmr', label: '.17 HMR', sizeMm: 4.5 },
  { id: '22lr', label: '.22 LR', sizeMm: 5.7 },
  { id: '22wmr', label: '.22 WMR', sizeMm: 5.7 },
  { id: '57x28', label: '5.7×28', sizeMm: 5.7 },
  { id: '223', label: '.223 / 5.56', sizeMm: 5.56 },
  { id: '25acp', label: '.25 ACP', sizeMm: 6.4 },
  { id: '65cm', label: '6.5 Creedmoor', sizeMm: 6.5 },
  { id: '300blk', label: '.300 BLK', sizeMm: 7.62 },
  { id: '762x39', label: '7.62×39', sizeMm: 7.62 },
  { id: '308', label: '.308 Win', sizeMm: 7.62 },
  { id: '3006', label: '.30-06', sizeMm: 7.62 },
  { id: '32acp', label: '.32 ACP', sizeMm: 7.65 },
  { id: '338lm', label: '.338 Lapua', sizeMm: 8.6 },
  { id: '380acp', label: '.380 ACP', sizeMm: 9 },
  { id: '9mm', label: '9×19', sizeMm: 9 },
  { id: '357sig', label: '.357 SIG', sizeMm: 9 },
  { id: '38sp', label: '.38 Special', sizeMm: 9 },
  { id: '357mag', label: '.357 Magnum', sizeMm: 9 },
  { id: '40sw', label: '.40 S&W', sizeMm: 10.2 },
  { id: '10mm', label: '10mm Auto', sizeMm: 10.2 },
  { id: '45acp', label: '.45 ACP', sizeMm: 11.4 },
  { id: '44mag', label: '.44 Magnum', sizeMm: 11.4 },
  { id: '50bmg', label: '.50 BMG', sizeMm: 12.7 },
  { id: '20ga', label: '20 gauge', sizeMm: 15.6 },
  { id: '12ga', label: '12 gauge', sizeMm: 18.5 },
];

export const COMMON_CALIBERS: CommonCaliber[] = [...CALIBER_SEED].sort(
  (a, b) => a.sizeMm - b.sizeMm || a.label.localeCompare(b.label),
);

export function resolveCaliberLabel(pick: CaliberPick, customText: string): string {
  if (pick === CUSTOM_CALIBER_ID) {
    return customText.trim();
  }
  const row = COMMON_CALIBERS.find((c) => c.id === pick);
  return row?.label ?? customText.trim();
}
