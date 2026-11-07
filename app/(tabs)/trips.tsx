import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
import { useI18n } from '@/lib/i18n/I18nProvider';
import { getTripLocation, listTrips } from '@/lib/db/repository';
import type { Trip } from '@/lib/types';

type TripRow = Trip & { location_name?: string };

export default function TripsScreen() {
  const { db, refreshKey } = useDatabase();
  const router = useRouter();
  const { t } = useI18n();
  const [rows, setRows] = useState<TripRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const trips = await listTrips(db);
        const enriched: TripRow[] = [];
        for (const t of trips) {
          const loc = await getTripLocation(db, t.id);
          enriched.push({ ...t, location_name: loc?.display_name });
        }
        setRows(enriched);
      })();
    }, [db, refreshKey]),
  );

  return (
    <ScreenScroll>
      <ScreenIntro description={t('trips.intro')} />

      <SectionHeader title={t('trips.start')} />
      <Card>
        <View style={styles.ctaPad}>
          <ButtonRow>
            <PrimaryButton label={t('trips.newTrip')} fullWidth onPress={() => router.push('/trip/new')} />
          </ButtonRow>
        </View>
      </Card>

      <SectionHeader title={t('trips.yourTrips')} />
      <Card>
        {rows.length === 0 ? (
          <EmptyState title={t('trips.empty')} hint={t('trips.emptyHint')} />
        ) : (
          rows.map((item, i) => (
            <View key={item.id}>
              <ListRow
                title={item.location_name ?? 'Unknown range'}
                subtitle={formatSubtitle(item)}
                onPress={() => router.push(`/trip/${item.id}`)}
                right={
                  <StatusPill
                    label={item.ended_at != null ? t('trips.done') : t('trips.open')}
                    tone={item.ended_at != null ? 'success' : 'warning'}
                  />
                }
              />
              {i < rows.length - 1 ? <ListDivider /> : null}
            </View>
          ))
        )}
      </Card>
    </ScreenScroll>
  );
}

function formatSubtitle(trip: Trip): string {
  const when = new Date(trip.started_at).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  const extra = trip.discipline_tag?.trim();
  return extra ? `${when} · ${extra}` : when;
}

const styles = StyleSheet.create({
  ctaPad: { padding: 12 },
});
