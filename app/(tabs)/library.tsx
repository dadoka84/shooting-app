import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import {
  Card,
  EmptyState,
  ListDivider,
  ListRow,
  ScreenScroll,
  SectionHeader,
  StatusPill,
  targetStatusDisplay,
} from '@/components/ui';
import { AppColors } from '@/constants/theme';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { listAllTargets, type TargetListRow } from '@/lib/db/repository';

export default function LibraryScreen() {
  const { db, refreshKey } = useDatabase();
  const router = useRouter();
  const [targets, setTargets] = useState<TargetListRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setTargets(await listAllTargets(db));
      })();
    }, [db, refreshKey]),
  );

  return (
    <ScreenScroll>
      <Text style={styles.title}>Target library</Text>
      <Text style={styles.lead}>All photos you’ve saved from trips.</Text>

      <SectionHeader title="All targets" />
      <Card>
        {targets.length === 0 ? (
          <EmptyState title="No target photos yet" hint="Capture a target from a trip, then open it to score." />
        ) : (
          targets.map((item, i) => {
            const st = targetStatusDisplay(item.scoring_status, item.total_score);
            return (
              <View key={item.id}>
                <ListRow
                  title={formatDateShort(item.created_at)}
                  subtitle={`Trip · ${formatDateShort(item.trip_started_at)} · ${formatTemplate(item.target_template)}`}
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
  title: { fontSize: 22, fontWeight: '800', color: AppColors.accentBrass },
  lead: { color: AppColors.textMuted, fontSize: 14, marginBottom: 4 },
});
