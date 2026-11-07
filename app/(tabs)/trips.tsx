import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppColors } from '@/constants/theme';
import {
  buildWeaponFilterOptions,
  TripBrowseControls,
  type TripsViewMode,
} from '@/components/trips/TripBrowseControls';
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
  StatusPill,
} from '@/components/ui';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { listTripsForBrowse, listWeapons, type TripBrowseRow } from '@/lib/db/repository';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { StringKey } from '@/lib/i18n/strings';
import { isTripCompleted } from '@/lib/trips/status';
import {
  TRIP_FILTER_ALL,
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
  const [weaponNames, setWeaponNames] = useState<Map<string, string>>(new Map());
  const [viewMode, setViewMode] = useState<TripsViewMode>('list');
  const [filters, setFilters] = useState<TripBrowseFilters>(defaultTripBrowseFilters());

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [trips, weapons] = await Promise.all([listTripsForBrowse(db), listWeapons(db)]);
        const nameMap = new Map(weapons.map((w) => [w.id, w.name]));
        setWeaponNames(nameMap);
        setRows(trips);
      })();
    }, [db, refreshKey]),
  );

  const weaponOptions = useMemo(
    () => buildWeaponFilterOptions(rows, weaponNames),
    [rows, weaponNames],
  );

  const eventCounts = useMemo(() => tripsByDateKey(rows), [rows]);

  const displayRows = useMemo(() => applyTripBrowseFilters(rows, filters), [rows, filters]);

  const placeSections = useMemo(
    () => groupFilteredTripsByPlace(displayRows, t('common.unknownRange'), locale),
    [displayRows, locale, t],
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
              {section.trips.map((item, i) => (
                <View key={item.id}>
                  <ListRow
                    title={formatTripListTitle(item, section)}
                    subtitle={formatTripRowSubtitle(item, t)}
                    onPress={() => router.push(`/trip/${item.id}`)}
                    right={
                      <StatusPill
                        label={isTripCompleted(item) ? t('trips.done') : t('trips.open')}
                        tone={isTripCompleted(item) ? 'success' : 'warning'}
                      />
                    }
                  />
                  {i < section.trips.length - 1 ? <ListDivider /> : null}
                </View>
              ))}
            </View>
          ))
        )}
      </Card>
    </ScreenScroll>
  );
}

function formatTripListTitle(
  trip: TripBrowseRow,
  section: { title: string; trips: TripBrowseRow[] },
): string {
  const when = new Date(trip.started_at).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  if (section.trips.length > 1) {
    return when;
  }
  const extra = trip.discipline_tag?.trim();
  return extra ? `${section.title} · ${extra}` : section.title;
}

function formatTripRowSubtitle(
  trip: TripBrowseRow,
  t: (key: StringKey, vars?: Record<string, string | number>) => string,
): string {
  const when = new Date(trip.started_at).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  const rounds = trip.rounds_total ?? 0;
  const base = t('trips.rowRoundsSub', { rounds, when });
  const extra = trip.discipline_tag?.trim();
  return extra ? `${base} · ${extra}` : base;
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
    paddingBottom: 4,
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
