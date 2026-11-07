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
export const UNKNOWN_PLACE_KEY = '__unknown__';
export const TRIP_UNLINKED_KEY = '__unlinked__';

export function placeGroupKey(locationName: string | null | undefined): string {
  const trimmed = locationName?.trim();
  if (!trimmed) return UNKNOWN_PLACE_KEY;
  return trimmed.toLocaleLowerCase().replace(/\s+/g, ' ');
}

export function tripSectionKey(row: TripBrowseRow): string {
  if (row.range_id) return row.range_id;
  const name = row.location_name?.trim();
  if (!name) return UNKNOWN_PLACE_KEY;
  return `legacy:${placeGroupKey(name)}`;
}

export type TripPlaceSection = {
  placeKey: string;
  title: string;
  trips: TripBrowseRow[];
};

export function groupFilteredTripsByPlace(
  rows: TripBrowseRow[],
  unknownLabel: string,
  sortMode: TripSortMode,
  locale?: string,
): TripPlaceSection[] {
  const buckets = new Map<string, TripBrowseRow[]>();
  for (const r of rows) {
    const key = tripSectionKey(r);
    const list = buckets.get(key) ?? [];
    list.push(r);
    buckets.set(key, list);
  }
  const sections: TripPlaceSection[] = [];
  for (const [placeKey, trips] of buckets) {
    const title =
      placeKey === UNKNOWN_PLACE_KEY
        ? unknownLabel
        : placeKey.startsWith('legacy:')
          ? trips[0]?.location_name?.trim() || unknownLabel
          : trips[0]?.location_name?.trim() || unknownLabel;
    sections.push({ placeKey, title, trips });
  }
  sections.sort((a, b) => {
    if (sortMode === 'ammo_desc') {
      const maxA = Math.max(...a.trips.map((t) => Number(t.rounds_total ?? 0)));
      const maxB = Math.max(...b.trips.map((t) => Number(t.rounds_total ?? 0)));
      if (maxB !== maxA) return maxB - maxA;
    } else {
      const latestA = Math.max(...a.trips.map((t) => t.started_at));
      const latestB = Math.max(...b.trips.map((t) => t.started_at));
      if (latestB !== latestA) return latestB - latestA;
    }
    if (a.placeKey === UNKNOWN_PLACE_KEY) return 1;
    if (b.placeKey === UNKNOWN_PLACE_KEY) return -1;
    return a.title.localeCompare(b.title, locale, { sensitivity: 'base' });
  });
  return sections;
}

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
    if (filters.place === TRIP_UNLINKED_KEY) {
      out = out.filter((r) => !r.range_id);
    } else if (filters.place === UNKNOWN_PLACE_KEY) {
      out = out.filter((r) => tripSectionKey(r) === UNKNOWN_PLACE_KEY);
    } else {
      out = out.filter((r) => r.range_id === filters.place);
    }
  }
  if (filters.weaponId !== TRIP_FILTER_ALL) {
    out = out.filter((r) => parseTripWeaponIds(r.weapon_ids).includes(filters.weaponId));
  }

  const sorted = [...out];
  if (filters.sort === 'ammo_desc') {
    sorted.sort((a, b) => {
      const diff = Number(b.rounds_total ?? 0) - Number(a.rounds_total ?? 0);
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
