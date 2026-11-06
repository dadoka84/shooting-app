import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { ScreenScroll } from '@/components/ui';
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
      <FlatList
        data={targets}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={<Text>No target photos yet.</Text>}
        renderItem={({ item }) => (
          <Text style={styles.item} onPress={() => router.push(`/target/${item.id}`)}>
            {formatDate(item.created_at)} · {item.scoring_status}
            {item.total_score != null ? ` · ${item.total_score} pts` : ''}
          </Text>
        )}
      />
    </ScreenScroll>
  );
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString();
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  item: { paddingVertical: 10, color: '#2563eb' },
});
