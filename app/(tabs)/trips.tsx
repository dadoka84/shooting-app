import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppColors } from '@/constants/theme';
import type { SelectOption } from '@/components/SelectField';
import {
  buildWeaponFilterOptions,
  TripBrowseControls,
  type TripsViewMode,
} from '@/components/trips/TripBrowseControls';
import { TripListCard } from '@/components/trips/TripListCard';
import { TripMonthCalendar } from '@/components/trips/TripMonthCalendar';
import {
  ButtonRow,
  Card,
  EmptyState,
  ListDivider,
  ListRow,
  PrimaryButton,
  ScreenIntro,
  ScreenScroll,
  SectionHeader,
} from '@/components/ui';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { listShootingRanges } from '@/lib/db/rangeRepository';
import { listTripsForBrowse, listWeapons, type TripBrowseRow } from '@/lib/db/repository';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { StringKey } from '@/lib/i18n/strings';
import type { ShootingRange } from '@/lib/types';
import { isTripCompleted } from '@/lib/trips/status';
import {
  TRIP_FILTER_ALL,
  TRIP_UNLINKED_KEY,
  applyTripBrowseFilters,
  defaultTripBrowseFilters,
  groupFilteredTripsByPlace,
  tripsByDateKey,
  type TripBrowseFilters,
  type TripSortMode,
} from '@/lib/trips/tripBrowse';

export default function TripsScreen() {
  const { db, refreshKey } = useDatabase();
  const router = useRouter();
  const { t, locale } = useI18n();
  const [rows, setRows] = useState<TripBrowseRow[]>([]);
  const [ranges, setRanges] = useState<ShootingRange[]>([]);
  const [weaponNames, setWeaponNames] = useState<Map<string, string>>(new Map());
  const [viewMode, setViewMode] = useState<TripsViewMode>('list');
  const [filters, setFilters] = useState<TripBrowseFilters>(defaultTripBrowseFilters());

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [trips, weapons, rangeList] = await Promise.all([
          listTripsForBrowse(db),
          listWeapons(db),
          listShootingRanges(db),
        ]);
        const nameMap = new Map(weapons.map((w) => [w.id, w.name]));
        setWeaponNames(nameMap);
        setRows(trips);
        setRanges(rangeList);
      })();
    }, [db, refreshKey]),
  );

  const weaponOptions = useMemo(
    () => buildWeaponFilterOptions(rows, weaponNames),
    [rows, weaponNames],
  );

  const rangeFilterOptions = useMemo((): SelectOption<string>[] => {
    const opts: SelectOption<string>[] = [
      { value: TRIP_FILTER_ALL, label: t('trips.filterAllPlaces') },
    ];
    for (const r of ranges) {
      opts.push({ value: r.id, label: r.name });
    }
    if (rows.some((row) => !row.range_id)) {
      opts.push({ value: TRIP_UNLINKED_KEY, label: t('trips.filterUnlinkedPlaces') });
    }
    return opts;
  }, [ranges, rows, t]);

  const eventCounts = useMemo(() => tripsByDateKey(rows), [rows]);

  const displayRows = useMemo(() => applyTripBrowseFilters(rows, filters), [rows, filters]);

  const placeSections = useMemo(
    () => groupFilteredTripsByPlace(displayRows, t('common.unknownRange'), filters.sort, locale),
    [displayRows, filters.sort, locale, t],
  );

  const calendarSelectedKey =
    filters.dateKey !== TRIP_FILTER_ALL ? filters.dateKey : null;

  const setDateKey = (dateKey: string) => {
    setFilters((f) => ({ ...f, dateKey }));
  };

  const onCalendarSelect = (key: string | null) => {
    setFilters((f) => ({
      ...f,
      dateKey: key ? key : TRIP_FILTER_ALL,
    }));
  };

  return (
    <ScreenScroll>
      <ScreenIntro description={t('trips.intro')} />

      <SectionHeader title={t('trips.start')} />
      <Card>
        <View style={styles.ctaPad}>
          <ButtonRow>
            <PrimaryButton
              label={t('trips.newTrip')}
              icon="newTrip"
              fullWidth
              onPress={() => router.push('/trip/new')}
            />
          </ButtonRow>
        </View>
      </Card>

      <SectionHeader title={t('trips.yourTrips')} />
      <Card>
        <View style={styles.browsePad}>
          <TripBrowseControls
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            rows={rows}
            rangeFilterOptions={rangeFilterOptions}
            weaponOptions={weaponOptions}
            dateKey={filters.dateKey}
            place={filters.place}
            weaponId={filters.weaponId}
            sort={filters.sort}
            onDateKeyChange={setDateKey}
            onPlaceChange={(place) => setFilters((f) => ({ ...f, place }))}
            onWeaponIdChange={(weaponId) => setFilters((f) => ({ ...f, weaponId }))}
            onSortChange={(sort: TripSortMode) => setFilters((f) => ({ ...f, sort }))}
          />

          {viewMode === 'calendar' ? (
            <View style={styles.calendarBlock}>
              <TripMonthCalendar
                eventCountsByDay={eventCounts}
                selectedDateKey={calendarSelectedKey}
                onSelectDateKey={onCalendarSelect}
              />
            </View>
          ) : null}
        </View>

        {displayRows.length === 0 ? (
          <EmptyState
            title={rows.length === 0 ? t('trips.empty') : t('trips.emptyFiltered')}
            hint={rows.length === 0 ? t('trips.emptyHint') : undefined}
          />
        ) : (
          placeSections.map((section, sectionIndex) => (
            <View key={section.placeKey}>
              {sectionIndex > 0 ? <ListDivider /> : null}
              <View style={styles.placeGroupHeader}>
                <Text style={styles.placeGroupTitle} numberOfLines={1}>
                  {section.title}
                </Text>
                <Text style={styles.placeGroupMeta}>{section.trips.length}</Text>
              </View>
              {section.trips.map((item) => (
                <TripListCard
                  key={item.id}
                  title={formatTripTitle(item)}
                  subtitle={formatTripSubtitle(item, t)}
                  statusLabel={isTripCompleted(item) ? t('trips.done') : t('trips.open')}
                  statusTone={isTripCompleted(item) ? 'success' : 'warning'}
                  onPress={() => router.push(`/trip/${item.id}`)}
                />
              ))}
            </View>
          ))
        )}
      </Card>

      <SectionHeader title={t('ranges.section')} />
      <Card>
        <View style={styles.ctaPad}>
          <ButtonRow>
            <PrimaryButton
              label={t('ranges.add')}
              fullWidth
              onPress={() => router.push('/range/new')}
            />
          </ButtonRow>
        </View>
        {ranges.length === 0 ? (
          <EmptyState title={t('ranges.empty')} hint={t('ranges.emptyHint')} />
        ) : (
          ranges.map((range, i) => (
            <View key={range.id}>
              <ListRow
                title={range.name}
                subtitle={formatRangeSubtitle(range, t)}
                onPress={() => router.push({ pathname: '/range/[id]', params: { id: range.id } })}
              />
              {i < ranges.length - 1 ? <ListDivider /> : null}
            </View>
          ))
        )}
      </Card>
    </ScreenScroll>
  );
}

function formatTripTitle(trip: TripBrowseRow): string {
  return new Date(trip.started_at).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatTripSubtitle(
  trip: TripBrowseRow,
  t: (key: StringKey, vars?: Record<string, string | number>) => string,
): string {
  const rounds = Number(trip.rounds_total ?? 0);
  const base = t('trips.rowMetaSub', { rounds });
  const extra = trip.discipline_tag?.trim();
  return extra ? `${base} · ${extra}` : base;
}

function formatRangeSubtitle(
  range: ShootingRange,
  t: (key: StringKey, vars?: Record<string, string | number>) => string,
): string {
  const parts = [range.address, range.phone, range.web].map((x) => x?.trim()).filter(Boolean);
  return t('ranges.rowSub', { details: parts.join(' · ') || '—' });
}

const styles = StyleSheet.create({
  ctaPad: { padding: 12 },
  browsePad: { padding: 12, paddingBottom: 4, gap: 12 },
  calendarBlock: { marginTop: 4 },
  placeGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 2,
    gap: 8,
  },
  placeGroupTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: AppColors.accentBrass,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  placeGroupMeta: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.textMuted,
  },
});
