import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { AppHeader } from '@/components/theme';
import {
  Card,
  EmptyState,
  LinkButton,
  ListDivider,
  ListRow,
  PrimaryButton,
  ScreenScroll,
  SectionHeader,
  StatusPill,
  targetStatusDisplay,
} from '@/components/ui';
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

      <Card>
        <View style={styles.quickRow}>
          <PrimaryButton label="New trip" onPress={() => router.push('/trip/new')} />
          <LinkButton href="/(tabs)/trips" label="Browse trips" />
        </View>
      </Card>

      <SectionHeader title="Recent trips" action={<LinkButton href="/(tabs)/trips" label="See all" />} />
      <Card>
        {trips.length === 0 ? (
          <EmptyState
            title="No trips yet"
            hint="Start a trip to log range visits and attach targets."
          />
        ) : (
          trips.map((item, i) => (
            <View key={item.id}>
              <ListRow
                title={formatDateShort(item.started_at)}
                subtitle="Trip detail, weapons, and targets"
                onPress={() => router.push(`/trip/${item.id}`)}
                right={
                  <StatusPill
                    label={item.ended_at != null ? 'Completed' : 'In progress'}
                    tone={item.ended_at != null ? 'success' : 'warning'}
                  />
                }
              />
              {i < trips.length - 1 ? <ListDivider /> : null}
            </View>
          ))
        )}
      </Card>

      <SectionHeader title="Latest targets" action={<LinkButton href="/(tabs)/library" label="Library" />} />
      <Card>
        {targets.length === 0 ? (
          <EmptyState
            title="No targets yet"
            hint="Add a photo from a trip, then score it on the B‑27 template."
          />
        ) : (
          targets.map((item, i) => {
            const st = targetStatusDisplay(item.scoring_status, item.total_score);
            return (
              <View key={item.id}>
                <ListRow
                  title={formatDateShort(item.created_at)}
                  subtitle={`Template · ${formatTemplate(item.target_template)}`}
                  onPress={() => router.push(`/target/${item.id}`)}
                  right={<StatusPill label={st.label} tone={st.tone} />}
                />
                {i < targets.length - 1 ? <ListDivider /> : null}
              </View>
            );
          })
        )}
      </Card>
    </ScreenScroll>
  );
}

function formatDateShort(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatTemplate(id: string): string {
  if (id === 'baker_sl_b27e_v1') return 'B‑27 (Baker)';
  return id.replace(/_/g, ' ');
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
  quickRow: { gap: 8, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', padding: 12 },
});
