import type { TripBrowseRow } from '@/lib/db/repository';

export function tripDateKey(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseTripWeaponIds(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw.split(',').filter((id) => id.trim().length > 0);
}

export const TRIP_FILTER_ALL = '__all__' as const;

export type TripSortMode = 'started_desc' | 'ammo_desc';

export type TripBrowseFilters = {
  dateKey: string;
  place: string;
  weaponId: string;
  sort: TripSortMode;
};

export function defaultTripBrowseFilters(): TripBrowseFilters {
  return {
    dateKey: TRIP_FILTER_ALL,
    place: TRIP_FILTER_ALL,
    weaponId: TRIP_FILTER_ALL,
    sort: 'started_desc',
  };
}

export function applyTripBrowseFilters(
  rows: TripBrowseRow[],
  filters: TripBrowseFilters,
): TripBrowseRow[] {
  let out = rows;

  if (filters.dateKey !== TRIP_FILTER_ALL) {
    out = out.filter((r) => tripDateKey(r.started_at) === filters.dateKey);
  }
  if (filters.place !== TRIP_FILTER_ALL) {
    if (filters.place === '__unknown__') {
      out = out.filter((r) => !r.location_name?.trim());
    } else {
      out = out.filter((r) => (r.location_name?.trim() ?? '') === filters.place);
    }
  }
  if (filters.weaponId !== TRIP_FILTER_ALL) {
    out = out.filter((r) => parseTripWeaponIds(r.weapon_ids).includes(filters.weaponId));
  }

  const sorted = [...out];
  if (filters.sort === 'ammo_desc') {
    sorted.sort((a, b) => {
      const diff = (b.rounds_total ?? 0) - (a.rounds_total ?? 0);
      if (diff !== 0) return diff;
      return b.started_at - a.started_at;
    });
  } else {
    sorted.sort((a, b) => b.started_at - a.started_at);
  }
  return sorted;
}

export function tripsByDateKey(rows: TripBrowseRow[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const r of rows) {
    const key = tripDateKey(r.started_at);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

export function formatTripDateLabel(ms: number, locale?: string): string {
  return new Date(ms).toLocaleDateString(locale, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
