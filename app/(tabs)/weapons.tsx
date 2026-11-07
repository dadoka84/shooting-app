import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WeaponListRow } from '@/components/weapons/WeaponListRow';
import {
  ButtonRow,
  Card,
  EmptyState,
  ListDivider,
  PrimaryButton,
  ScreenIntro,
  ScreenScroll,
  SectionHeader,
} from '@/components/ui';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { listWeaponsWithRoundTotals, type WeaponWithRoundTotal } from '@/lib/db/repository';

export default function WeaponsScreen() {
  const { db, refreshKey } = useDatabase();
  const router = useRouter();
  const { t } = useI18n();
  const [weapons, setWeapons] = useState<WeaponWithRoundTotal[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setWeapons(await listWeaponsWithRoundTotals(db));
      })();
    }, [db, refreshKey]),
  );

  return (
    <ScreenScroll>
      <ScreenIntro description={t('weapons.intro')} />

      <SectionHeader title={t('weapons.add')} />
      <Card>
        <View style={styles.ctaPad}>
          <ButtonRow>
            <PrimaryButton label={t('weapons.addWeapon')} fullWidth onPress={() => router.push('/weapon/new')} />
          </ButtonRow>
        </View>
      </Card>

      <SectionHeader title={t('weapons.arsenal')} />
      <Card>
        {weapons.length === 0 ? (
          <EmptyState title={t('weapons.empty')} hint={t('weapons.emptyHint')} />
        ) : (
          weapons.map((item, i) => (
            <View key={item.id}>
              <WeaponListRow
                name={item.name}
                category={item.category}
                subtitle={weaponSubtitle(item, t)}
                onPress={() => router.push(`/weapon/${item.id}`)}
                showCategoryPill
              />
              {i < weapons.length - 1 ? <ListDivider /> : null}
            </View>
          ))
        )}
      </Card>
    </ScreenScroll>
  );
}

function weaponSubtitle(w: WeaponWithRoundTotal, t: ReturnType<typeof useI18n>['t']): string {
  const parts: string[] = [];
  const meta = [w.caliber?.trim(), w.serial_note?.trim()].filter(Boolean) as string[];
  if (meta.length) parts.push(meta.join(' · '));
  parts.push(t('weapons.roundsTotal', { count: w.rounds_fired_total }));
  return parts.join(' · ');
}

const styles = StyleSheet.create({
  ctaPad: { padding: 12 },
});
