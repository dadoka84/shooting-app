import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Image, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import {
  ButtonRow,
  Card,
  ContextBanner,
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
import { useI18n } from '@/lib/i18n/I18nProvider';
import { deleteTarget, getScore, getTarget, listShots } from '@/lib/db/repository';
import { resolvePhotoUri } from '@/lib/photos';
import type { Score, Shot, TargetImage } from '@/lib/types';

export default function TargetDetailScreen() {
  const { id, added, tripName } = useLocalSearchParams<{
    id: string;
    added?: string;
    tripName?: string;
  }>();
  const { db, bumpRefresh, refreshKey } = useDatabase();
  const { t } = useI18n();
  const router = useRouter();
  const [target, setTarget] = useState<TargetImage | null>(null);
  const [score, setScore] = useState<Score | null>(null);
  const [shots, setShots] = useState<Shot[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      (async () => {
        const row = await getTarget(db, id);
        setTarget(row);
        setScore(await getScore(db, id));
        setShots(await listShots(db, id));
      })();
    }, [db, id, refreshKey]),
  );

  const remove = () => {
    if (!id) return;
    Alert.alert(t('target.deleteTitle'), t('target.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
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
        <Text>{t('common.loading')}</Text>
      </ScreenScroll>
    );
  }

  const st = targetStatusDisplay(target.scoring_status, score?.total_score ?? null, t);
  const tripLabel = tripName?.trim() || t('common.unknownRange');

  return (
    <ScreenScroll>
      {added === '1' ? (
        <ContextBanner
          tone="info"
          title={t('flow.targetAddedTitle')}
          body={`${t('flow.targetAddedBody', { name: tripLabel })} ${t('flow.nextStepScore')}`}
        />
      ) : null}

      <Card>
        <Image source={{ uri: resolvePhotoUri(target.file_path) }} style={styles.image} />
      </Card>

      <SectionHeader title={t('target.scoring')} />
      <Card>
        <ListRow
          title={t('target.status')}
          subtitle={
            target.target_template === 'baker_sl_b27e_v1' ? t('template.b27') : target.target_template
          }
          showChevron={false}
          right={<StatusPill label={st.label} tone={st.tone} />}
        />
        {score ? (
          <>
            <ListDivider />
            <ListRow
              title={`${score.total_score}${score.max_score != null ? ` / ${score.max_score}` : ''}`}
              subtitle={score.algorithm_version}
              showChevron={false}
            />
            {score.group_size_mm != null ? (
              <>
                <ListDivider />
                <ListRow
                  title={t('target.groupSpread')}
                  subtitle={`${score.group_size_mm.toFixed(1)} mm`}
                  showChevron={false}
                />
              </>
            ) : null}
          </>
        ) : null}
      </Card>

      {shots.length > 0 ? (
        <>
          <SectionHeader title={t('target.shots')} />
          <Card>
            {shots.map((s, i) => (
              <View key={s.id}>
                <ListRow
                  title={`${s.ordinal + 1}`}
                  subtitle={`${s.ring_value} · (${s.x_norm.toFixed(2)}, ${s.y_norm.toFixed(2)})`}
                  showChevron={false}
                />
                {i < shots.length - 1 ? <ListDivider /> : null}
              </View>
            ))}
          </Card>
        </>
      ) : null}

      <SectionHeader title={t('weapon.actions')} />
      <ButtonRow>
        <PrimaryButton
          label={t('target.scoreCorrect')}
          fullWidth
          onPress={() => router.push(`/target/score/${target.id}`)}
        />
      </ButtonRow>

      <SectionHeader title={t('common.dangerZone')} />
      <DangerButton label={t('target.deleteTarget')} fullWidth onPress={remove} />
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 360, borderRadius: 8, backgroundColor: AppColors.surface },
});
