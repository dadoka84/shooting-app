import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { LinkButton, PrimaryButton, ScreenScroll } from '@/components/ui';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { recentTargets, recentTrips, type TargetListRow } from '@/lib/db/repository';
import type { Trip } from '@/lib/types';

export default function HomeScreen() {
  const { db, refreshKey } = useDatabase();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [targets, setTargets] = useState<TargetListRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setTrips(await recentTrips(db, 5));
        setTargets(await recentTargets(db, 5));
      })();
    }, [db, refreshKey]),
  );

  return (
    <ScreenScroll>
      <Text style={styles.title}>Shooting journal</Text>
      <Text style={styles.subtitle}>Phase 1 prototype — offline, local-only data</Text>

      <View style={styles.row}>
        <PrimaryButton label="New trip" onPress={() => router.push('/trip/new')} />
        <LinkButton href="/(tabs)/trips" label="All trips" />
      </View>

      <Text style={styles.section}>Recent trips</Text>
      {trips.length === 0 ? (
        <Text>No trips yet. Log your first range visit.</Text>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Text style={styles.listItem} onPress={() => router.push(`/trip/${item.id}`)}>
              {formatDate(item.started_at)}
            </Text>
          )}
        />
      )}

      <Text style={styles.section}>Latest targets</Text>
      {targets.length === 0 ? (
        <Text>Add a target photo from a trip to score it.</Text>
      ) : (
        <FlatList
          data={targets}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Text style={styles.listItem} onPress={() => router.push(`/target/${item.id}`)}>
              {formatDate(item.created_at)}
              {item.total_score != null ? ` · score ${item.total_score}` : ' · pending'}
            </Text>
          )}
        />
      )}
    </ScreenScroll>
  );
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleString();
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { opacity: 0.7, marginBottom: 8 },
  section: { fontSize: 18, fontWeight: '600', marginTop: 8 },
  listItem: { paddingVertical: 6, color: '#2563eb' },
  row: { gap: 8 },
});
