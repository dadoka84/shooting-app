import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { ShotMarkerEditor } from '@/components/targets/ShotMarkerEditor';
import { PrimaryButton, ScreenScroll } from '@/components/ui';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { confirmTargetScore, getTarget, listShots } from '@/lib/db/repository';
import { resolvePhotoUri } from '@/lib/photos';
import { computeMockScoreFromDraftShots } from '@/lib/scoring/mockBakerScore';
import type { DraftShot } from '@/lib/types';
import { newId } from '@/lib/id';

export default function TargetScoreScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { db, bumpRefresh, refreshKey } = useDatabase();
  const router = useRouter();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [draftShots, setDraftShots] = useState<DraftShot[]>([]);
  const [confirming, setConfirming] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      (async () => {
        const target = await getTarget(db, id);
        if (!target) return;
        setPhotoUri(resolvePhotoUri(target.file_path));
        const existing = await listShots(db, id);
        if (existing.length > 0) {
          setDraftShots(
            existing.map((s) => ({
              id: s.id,
              x_norm: s.x_norm,
              y_norm: s.y_norm,
              source: s.source,
            })),
          );
        } else {
          setDraftShots([]);
        }
      })();
    }, [db, id, refreshKey]),
  );

  const preview = computeMockScoreFromDraftShots(draftShots);

  const confirm = async () => {
    if (!id) return;
    setConfirming(true);
    try {
      await confirmTargetScore(db, id, draftShots);
      bumpRefresh();
      router.replace(`/target/${id}`);
    } catch (e) {
      Alert.alert('Could not save score', String(e));
    } finally {
      setConfirming(false);
    }
  };

  const clearAll = () => setDraftShots([]);

  const loadDemoMarkers = () => {
    setDraftShots([
      { id: newId(), x_norm: 0.48, y_norm: 0.52, source: 'manual' },
      { id: newId(), x_norm: 0.51, y_norm: 0.5, source: 'manual' },
      { id: newId(), x_norm: 0.49, y_norm: 0.54, source: 'manual' },
    ]);
  };

  if (!photoUri) {
    return (
      <ScreenScroll>
        <Text>Loading…</Text>
      </ScreenScroll>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <ScreenScroll>
        <Text style={styles.title}>Manual correction (M5 mock score)</Text>
        <Text>Template baker_sl_b27e_v1 — tap/drag markers, then confirm.</Text>
        <ShotMarkerEditor imageUri={photoUri} shots={draftShots} onChange={setDraftShots} />
        <Text style={styles.preview}>
          Preview: {preview.total_score} / {preview.max_score} ({draftShots.length} shots)
        </Text>
        <PrimaryButton label="Load demo cluster" onPress={loadDemoMarkers} />
        <PrimaryButton label="Clear markers" onPress={clearAll} />
        <PrimaryButton
          label={confirming ? 'Saving…' : 'Confirm score'}
          onPress={confirm}
          disabled={confirming || draftShots.length === 0}
        />
      </ScreenScroll>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pad: { flexGrow: 1 },
  title: { fontSize: 18, fontWeight: '700' },
  preview: { fontWeight: '600', marginTop: 8 },
});
