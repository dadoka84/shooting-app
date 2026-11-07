import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Image, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import {
  ButtonRow,
  Card,
  DangerButton,
  ListDivider,
  ListRow,
  PrimaryButton,
  ScreenScroll,
  SectionHeader,
  StatusPill,
  targetStatusDisplay,
} from '@/components/ui';
import { AppColors } from '@/constants/theme';
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

  const st = targetStatusDisplay(target.scoring_status, score?.total_score ?? null);

  return (
    <ScreenScroll>
      <Card>
        <Image source={{ uri: resolvePhotoUri(target.file_path) }} style={styles.image} />
      </Card>

      <SectionHeader title="Scoring" />
      <Card>
        <ListRow
          title="Status"
          subtitle={target.target_template}
          showChevron={false}
          right={<StatusPill label={st.label} tone={st.tone} />}
        />
        {score ? (
          <>
            <ListDivider />
            <ListRow
              title={`${score.total_score}${score.max_score != null ? ` / ${score.max_score}` : ''} points`}
              subtitle={`Algorithm ${score.algorithm_version}`}
              showChevron={false}
            />
            {score.group_size_mm != null ? (
              <>
                <ListDivider />
                <ListRow
                  title="Group spread"
                  subtitle={`${score.group_size_mm.toFixed(1)} mm (mock)`}
                  showChevron={false}
                />
              </>
            ) : null}
          </>
        ) : (
          <>
            <ListDivider />
            <View style={styles.cardPad}>
              <Text style={styles.muted}>No confirmed score yet. Use Score / correct to mark shots.</Text>
            </View>
          </>
        )}
      </Card>

      {shots.length > 0 ? (
        <>
          <SectionHeader title="Shots" />
          <Card>
            {shots.map((s, i) => (
              <View key={s.id}>
                <ListRow
                  title={`Shot ${s.ordinal + 1}`}
                  subtitle={`Ring ${s.ring_value} · (${s.x_norm.toFixed(2)}, ${s.y_norm.toFixed(2)})`}
                  showChevron={false}
                />
                {i < shots.length - 1 ? <ListDivider /> : null}
              </View>
            ))}
          </Card>
        </>
      ) : null}

      <SectionHeader title="Actions" />
      <ButtonRow>
        <PrimaryButton label="Score / correct" fullWidth onPress={() => router.push(`/target/score/${target.id}`)} />
      </ButtonRow>

      <SectionHeader title="Danger zone" />
      <DangerButton label="Delete target" fullWidth onPress={remove} />
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 360, borderRadius: 8, backgroundColor: AppColors.surface },
  cardPad: { padding: 14 },
  muted: { color: AppColors.textMuted, fontSize: 14, lineHeight: 20 },
});
