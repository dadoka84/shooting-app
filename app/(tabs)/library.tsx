import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from '@/components/Themed';
import { TargetRowIcon } from '@/components/TargetRowIcon';
import {
  Card,
  EmptyState,
  ListDivider,
  ListRow,
  ScreenIntro,
  ScreenScroll,
  SectionHeader,
  StatusPill,
  targetStatusDisplay,
} from '@/components/ui';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { listAllTargets, type TargetListRow } from '@/lib/db/repository';

export default function LibraryScreen() {
  const { db, refreshKey } = useDatabase();
  const router = useRouter();
  const { t } = useI18n();
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
      <ScreenIntro description={t('library.intro')} />

      <SectionHeader title={t('library.allTargets')} />
      <Card>
        {targets.length === 0 ? (
          <EmptyState title={t('library.empty')} hint={t('library.emptyHint')} />
        ) : (
          targets.map((item, i) => {
            const st = targetStatusDisplay(item.scoring_status, item.total_score);
            return (
              <View key={item.id}>
                <ListRow
                  leading={<TargetRowIcon />}
                  title={formatDateShort(item.created_at)}
                  subtitle={t('library.rowSubTemplate', {
                    template: formatTemplate(item.target_template, t),
                  })}
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

function formatTemplate(id: string, t: ReturnType<typeof useI18n>['t']): string {
  if (id === 'baker_sl_b27e_v1') return t('template.b27');
  return id.replace(/_/g, ' ');
}
