import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import {
  ButtonRow,
  Card,
  EmptyState,
  LinkButton,
  ListDivider,
  ListRow,
  PrimaryButton,
  ScreenIntro,
  ScreenScroll,
  SectionHeader,
  StatusPill,
} from '@/components/ui';
import { AppColors } from '@/constants/theme';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { getTripLocation, listTrips } from '@/lib/db/repository';
import type { Trip } from '@/lib/types';

type TripRow = Trip & { location_name?: string };

export default function TripsScreen() {
  const { db, refreshKey } = useDatabase();
  const router = useRouter();
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
      <ScreenIntro description="Log range visits, weapons, and target photos per trip." />

      <SectionHeader title="Start" />
      <Card>
        <View style={styles.ctaPad}>
          <ButtonRow>
            <PrimaryButton label="New trip" fullWidth onPress={() => router.push('/trip/new')} />
          </ButtonRow>
        </View>
      </Card>

      <SectionHeader title="Your trips" />
      <Card>
        {rows.length === 0 ? (
          <EmptyState title="No trips logged yet" hint="Create a trip to get started." />
        ) : (
          rows.map((item, i) => (
            <View key={item.id}>
              <ListRow
                title={item.location_name ?? 'Unknown range'}
                subtitle={formatSubtitle(item)}
                onPress={() => router.push(`/trip/${item.id}`)}
                right={
                  <StatusPill
                    label={item.ended_at != null ? 'Done' : 'Open'}
                    tone={item.ended_at != null ? 'success' : 'warning'}
                  />
                }
              />
              {i < rows.length - 1 ? <ListDivider /> : null}
            </View>
          ))
        )}
      </Card>

      <LinkButton href="/(tabs)/index" label="Back to home" />
    </ScreenScroll>
  );
}

function formatSubtitle(t: Trip): string {
  const when = new Date(t.started_at).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  const extra = t.discipline_tag?.trim();
  return extra ? `${when} · ${extra}` : when;
}

const styles = StyleSheet.create({
  ctaPad: { padding: 12 },
});
