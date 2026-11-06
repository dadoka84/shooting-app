import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { AppHeader } from '@/components/theme';
import { LinkButton, PrimaryButton, ScreenScroll } from '@/components/ui';
import { UI_BUILD_STAMP } from '@/constants/buildStamp';
import { AppColors } from '@/constants/theme';
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
      <View style={styles.buildStamp}>
        <Text style={styles.buildStampText}>{UI_BUILD_STAMP}</Text>
      </View>
      <AppHeader subtitle="Phase 1 · offline range log" />
      <Text style={styles.subtitle}>Shooting journal — trips, targets, brass‑ring scoring (mock)</Text>

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
  buildStamp: {
    alignSelf: 'flex-start',
    backgroundColor: AppColors.surfaceRaised,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: AppColors.accentBrass,
    marginBottom: 4,
  },
  buildStampText: {
    color: AppColors.accentBrass,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: { color: AppColors.textMuted, marginBottom: 8, fontSize: 14 },
  section: { fontSize: 18, fontWeight: '700', marginTop: 8, color: AppColors.accentBrass },
  listItem: { paddingVertical: 8, color: AppColors.accentBrass, fontWeight: '600' },
  row: { gap: 8, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
});
