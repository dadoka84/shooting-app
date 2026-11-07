import { caliberMatchKey, canonicalCaliberLabel } from '@/lib/ammo/caliberMatch';
import type { TripWeaponInput, Weapon } from '@/lib/types';

export type TripAmmoDeductionLine = { caliber: string; rounds: number };

/** Owned library weapons with a caliber — rounds on trip deduct from the ammo box. */
export function computeTripAmmoDeductions(
  tripWeapons: TripWeaponInput[],
  weaponsById: Map<string, Weapon>,
): TripAmmoDeductionLine[] {
  const totals = new Map<string, { label: string; rounds: number }>();
  for (const tw of tripWeapons) {
    if (tw.possession !== 'owned' || !tw.weapon_id) continue;
    const weapon = weaponsById.get(tw.weapon_id);
    const raw = weapon?.caliber?.trim();
    if (!raw) continue;
    const rounds = Math.max(0, Math.floor(tw.rounds_fired ?? 0));
    if (rounds <= 0) continue;
    const key = caliberMatchKey(raw);
    const label = canonicalCaliberLabel(raw);
    const prev = totals.get(key);
    if (prev) {
      prev.rounds += rounds;
    } else {
      totals.set(key, { label, rounds });
    }
  }
  return [...totals.values()]
    .map(({ label, rounds }) => ({ caliber: label, rounds }))
    .sort((a, b) => a.caliber.localeCompare(b.caliber));
}
