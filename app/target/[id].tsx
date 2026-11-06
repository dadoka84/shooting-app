import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { PrimaryButton, ScreenScroll } from '@/components/ui';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { deleteTarget, getScore, getTarget, listShots } from '@/lib/db/repository';
import { resolvePhotoUri } from '@/lib/photos';
import type { Score, Shot, TargetImage } from '@/lib/types';

export default function TargetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { db, bumpRefresh, refreshKey } = useDatabase();
  const router = useRouter();
  const [target, setTarget] = useState<TargetImage | null>(null);
  const [score, setScore] = useState<Score | null>(null);
  const [shots, setShots] = useState<Shot[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      (async () => {
        const t = await getTarget(db, id);
        setTarget(t);
        setScore(await getScore(db, id));
        setShots(await listShots(db, id));
      })();
    }, [db, id, refreshKey]),
  );

  const remove = () => {
    if (!id) return;
    Alert.alert('Delete target?', 'Shots and score will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTarget(db, id);
          bumpRefresh();
          router.back();
        },
      },
    ]);
  };

  if (!target) {
    return (
      <ScreenScroll>
        <Text>Loading…</Text>
      </ScreenScroll>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <ScreenScroll>
        <Image source={{ uri: resolvePhotoUri(target.file_path) }} style={styles.image} />
        <Text>Template: {target.target_template}</Text>
        <Text>Status: {target.scoring_status}</Text>
        {score ? (
          <>
            <Text style={styles.score}>
              Score: {score.total_score}
              {score.max_score != null ? ` / ${score.max_score}` : ''}
            </Text>
            <Text>Algorithm: {score.algorithm_version}</Text>
            {score.group_size_mm != null ? <Text>Group spread (mock mm): {score.group_size_mm.toFixed(1)}</Text> : null}
          </>
        ) : (
          <Text>No confirmed score yet.</Text>
        )}
        {shots.length > 0 ? (
          <>
            <Text style={styles.section}>Shots</Text>
            {shots.map((s) => (
              <Text key={s.id}>
                #{s.ordinal + 1} · ring {s.ring_value} · ({s.x_norm.toFixed(2)}, {s.y_norm.toFixed(2)})
              </Text>
            ))}
          </>
        ) : null}
        <PrimaryButton label="Score / correct" onPress={() => router.push(`/target/score/${target.id}`)} />
        <PrimaryButton label="Delete target" onPress={remove} />
      </ScreenScroll>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pad: { flexGrow: 1 },
  image: { width: '100%', height: 360, borderRadius: 8, backgroundColor: '#111' },
  score: { fontSize: 20, fontWeight: '700', marginTop: 8 },
  section: { fontWeight: '600', marginTop: 8 },
});
