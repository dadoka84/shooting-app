import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SelectField, type SelectOption } from '@/components/SelectField';
import { AppColors } from '@/constants/theme';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { TripBrowseRow } from '@/lib/db/repository';
import type { TripSortMode } from '@/lib/trips/tripBrowse';
import {
  TRIP_FILTER_ALL,
  UNKNOWN_PLACE_KEY,
  formatTripDateLabel,
  parseTripWeaponIds,
  placeGroupsFromRows,
  tripDateKey,
} from '@/lib/trips/tripBrowse';

export type TripsViewMode = 'list' | 'calendar';

type Props = {
  viewMode: TripsViewMode;
  onViewModeChange: (mode: TripsViewMode) => void;
  rows: TripBrowseRow[];
  weaponOptions: SelectOption<string>[];
  dateKey: string;
  place: string;
  weaponId: string;
  sort: TripSortMode;
  onDateKeyChange: (v: string) => void;
  onPlaceChange: (v: string) => void;
  onWeaponIdChange: (v: string) => void;
  onSortChange: (v: TripSortMode) => void;
};

export function TripBrowseControls({
  viewMode,
  onViewModeChange,
  rows,
  weaponOptions,
  dateKey,
  place,
  weaponId,
  sort,
  onDateKeyChange,
  onPlaceChange,
  onWeaponIdChange,
  onSortChange,
}: Props) {
  const { t, locale } = useI18n();

  const dateOptions = useMemo(() => {
    const keys = [...new Set(rows.map((r) => tripDateKey(r.started_at)))].sort((a, b) =>
      b.localeCompare(a),
    );
    const opts: SelectOption<string>[] = [
      { value: TRIP_FILTER_ALL, label: t('trips.filterAllDates') },
    ];
    for (const key of keys) {
      const sample = rows.find((r) => tripDateKey(r.started_at) === key);
      const label = sample
        ? formatTripDateLabel(sample.started_at, locale)
        : key;
      opts.push({ value: key, label });
    }
    return opts;
  }, [locale, rows, t]);

  const placeLabelByKey = useMemo(() => placeGroupsFromRows(rows), [rows]);

  const fixedPlaceOptions = useMemo(() => {
    const opts: SelectOption<string>[] = [
      { value: TRIP_FILTER_ALL, label: t('trips.filterAllPlaces') },
    ];
    const keys = [...placeLabelByKey.keys()].filter((k) => k !== UNKNOWN_PLACE_KEY);
    keys.sort((a, b) =>
      (placeLabelByKey.get(a) ?? '').localeCompare(placeLabelByKey.get(b) ?? '', locale, {
        sensitivity: 'base',
      }),
    );
    for (const key of keys) {
      opts.push({ value: key, label: placeLabelByKey.get(key) ?? key });
    }
    if (placeLabelByKey.has(UNKNOWN_PLACE_KEY)) {
      opts.push({ value: UNKNOWN_PLACE_KEY, label: t('common.unknownRange') });
    }
    return opts;
  }, [locale, placeLabelByKey, t]);

  const weaponFilterOptions = useMemo(() => {
    return [{ value: TRIP_FILTER_ALL, label: t('trips.filterAllWeapons') }, ...weaponOptions];
  }, [t, weaponOptions]);

  const sortOptions: SelectOption<TripSortMode>[] = useMemo(
    () => [
      { value: 'started_desc', label: t('trips.sortByDate') },
      { value: 'ammo_desc', label: t('trips.sortByAmmo') },
    ],
    [t],
  );

  return (
    <View style={styles.root}>
      <View style={styles.viewToggle}>
        <Pressable
          onPress={() => onViewModeChange('list')}
          style={[styles.viewBtn, viewMode === 'list' && styles.viewBtnActive]}
        >
          <Text style={[styles.viewBtnText, viewMode === 'list' && styles.viewBtnTextActive]}>
            {t('trips.viewList')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onViewModeChange('calendar')}
          style={[styles.viewBtn, viewMode === 'calendar' && styles.viewBtnActive]}
        >
          <Text style={[styles.viewBtnText, viewMode === 'calendar' && styles.viewBtnTextActive]}>
            {t('trips.viewCalendar')}
          </Text>
        </Pressable>
      </View>

      <View style={styles.filters}>
        <View style={styles.filterRow}>
          {viewMode === 'list' ? (
            <View style={styles.filterHalf}>
              <SelectField
                compact
                value={dateKey}
                onChange={onDateKeyChange}
                options={dateOptions}
                placeholder={t('trips.filterDate')}
              />
            </View>
          ) : null}
          <View style={styles.filterHalf}>
            <SelectField
              compact
              value={place}
              onChange={onPlaceChange}
              options={fixedPlaceOptions}
              placeholder={t('trips.filterPlace')}
            />
          </View>
          {viewMode === 'calendar' ? (
            <View style={styles.filterHalf}>
              <SelectField
                compact
                value={weaponId}
                onChange={onWeaponIdChange}
                options={weaponFilterOptions}
                placeholder={t('trips.filterWeapon')}
              />
            </View>
          ) : null}
        </View>
        <View style={styles.filterRow}>
          {viewMode === 'list' ? (
            <>
              <View style={styles.filterHalf}>
                <SelectField
                  compact
                  value={weaponId}
                  onChange={onWeaponIdChange}
                  options={weaponFilterOptions}
                  placeholder={t('trips.filterWeapon')}
                />
              </View>
              <View style={styles.filterHalf}>
                <SelectField
                  compact
                  value={sort}
                  onChange={onSortChange}
                  options={sortOptions}
                  placeholder={t('trips.sortBy')}
                />
              </View>
            </>
          ) : (
            <View style={styles.filterHalf}>
              <SelectField
                compact
                value={sort}
                onChange={onSortChange}
                options={sortOptions}
                placeholder={t('trips.sortBy')}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export function buildWeaponFilterOptions(
  rows: TripBrowseRow[],
  weaponNames: Map<string, string>,
): SelectOption<string>[] {
  const ids = new Set<string>();
  for (const r of rows) {
    for (const id of parseTripWeaponIds(r.weapon_ids)) {
      ids.add(id);
    }
  }
  const opts: SelectOption<string>[] = [];
  for (const id of ids) {
    const label = weaponNames.get(id) ?? id;
    opts.push({ value: id, label });
  }
  opts.sort((a, b) => a.label.localeCompare(b.label));
  return opts;
}

const styles = StyleSheet.create({
  root: { gap: 12 },
  viewToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  viewBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.borderSubtle,
    backgroundColor: AppColors.surfaceRaised,
    alignItems: 'center',
  },
  viewBtnActive: {
    borderColor: AppColors.accentBrassDim,
    backgroundColor: AppColors.accentOlive,
  },
  viewBtnText: {
    color: AppColors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  viewBtnTextActive: {
    color: AppColors.accentBrass,
  },
  filters: {
    gap: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'stretch',
  },
  filterHalf: {
    flex: 1,
    minWidth: 0,
  },
});
