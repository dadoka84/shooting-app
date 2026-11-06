import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { LinkButton, PrimaryButton, ScreenScroll } from '@/components/ui';
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
      <PrimaryButton label="New trip" onPress={() => router.push('/trip/new')} />
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={<Text>No trips logged yet.</Text>}
        renderItem={({ item }) => (
          <Text style={styles.item} onPress={() => router.push(`/trip/${item.id}`)}>
            {formatDate(item.started_at)} — {item.location_name ?? 'Unknown range'}
          </Text>
        )}
      />
      <LinkButton href="/(tabs)/index" label="Back to home" />
    </ScreenScroll>
  );
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleString();
}

const styles = StyleSheet.create({
  item: { paddingVertical: 10, fontSize: 16, color: AppColors.accentBrass, fontWeight: '600' },
});
