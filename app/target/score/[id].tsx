import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { ShotMarkerEditor } from '@/components/targets/ShotMarkerEditor';
import {
  ButtonRow,
  OutlineButton,
  PrimaryButton,
  ScreenIntro,
  ScreenScroll,
  SecondaryButton,
  SectionHeader,
} from '@/components/ui';
import { AppColors } from '@/constants/theme';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { confirmTargetScore, getTarget, listShots } from '@/lib/db/repository';
import { resolvePhotoUri } from '@/lib/photos';
import { computeMockScoreFromDraftShots } from '@/lib/scoring/mockBakerScore';
import type { DraftShot } from '@/lib/types';
import { newId } from '@/lib/id';

export default function TargetScoreScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { db, bumpRefresh, refreshKey } = useDatabase();
  const router = useRouter();
  const { t } = useI18n();
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
      Alert.alert(t('target.scoreSaveError'), String(e));
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
        <Text>{t('common.loading')}</Text>
      </ScreenScroll>
    );
  }

  return (
    <ScreenScroll>
      <ScreenIntro title={t('target.scoreScreenTitle')} description={t('target.scoreScreenDesc')} />
      <ShotMarkerEditor imageUri={photoUri} shots={draftShots} onChange={setDraftShots} />

      <SectionHeader title={t('target.preview')} />
      <Text style={styles.preview}>
        {preview.total_score} / {preview.max_score} · {draftShots.length} shot{draftShots.length === 1 ? '' : 's'}
      </Text>

      <SectionHeader title={t('target.markers')} />
      <ButtonRow layout="row">
        <SecondaryButton label={t('target.demoCluster')} onPress={loadDemoMarkers} />
        <OutlineButton label={t('target.clearAll')} onPress={clearAll} />
      </ButtonRow>

      <PrimaryButton
        label={confirming ? t('common.saving') : t('target.confirmScore')}
        fullWidth
        onPress={confirm}
        disabled={confirming || draftShots.length === 0}
      />
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  preview: {
    fontWeight: '700',
    fontSize: 17,
    color: AppColors.accentBrass,
    marginTop: -4,
  },
});
