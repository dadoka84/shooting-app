import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WeaponListRow } from '@/components/weapons/WeaponListRow';
import {
  ButtonRow,
  Card,
  EmptyState,
  ListDivider,
  ListRow,
  PrimaryButton,
  ScreenIntro,
  ScreenScroll,
  SectionHeader,
  SecondaryButton,
  StatusPill,
} from '@/components/ui';
import { AppColors } from '@/constants/theme';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { getAmmoTotalQuantity, listAmmoByCaliber } from '@/lib/db/ammoRepository';
import { listMaintenanceDueWeapons } from '@/lib/db/maintenanceRepository';
import { listStaticTips, listWeaponsWithRoundTotals, type WeaponWithRoundTotal } from '@/lib/db/repository';
import type { AmmoCaliberSummary } from '@/lib/types';
import { localizedTip, sortTipsForDisplay } from '@/lib/i18n/tipDisplay';

export default function WeaponsScreen() {
  const { db, refreshKey } = useDatabase();
  const router = useRouter();
  const { t } = useI18n();
  const [weapons, setWeapons] = useState<WeaponWithRoundTotal[]>([]);
  const [dueWeaponIds, setDueWeaponIds] = useState<Set<string>>(new Set());
  const [tips, setTips] = useState<{ id: string; title: string; body: string }[]>([]);
  const [ammoTotal, setAmmoTotal] = useState(0);
  const [ammoByCaliber, setAmmoByCaliber] = useState<AmmoCaliberSummary[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setWeapons(await listWeaponsWithRoundTotals(db));
        const dueRows = await listMaintenanceDueWeapons(db);
        setDueWeaponIds(new Set(dueRows.map((s) => s.weapon_id)));
        setTips(sortTipsForDisplay(await listStaticTips(db)));
        setAmmoTotal(await getAmmoTotalQuantity(db));
        setAmmoByCaliber(await listAmmoByCaliber(db));
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
                showCategoryPill={!dueWeaponIds.has(item.id)}
                right={
                  dueWeaponIds.has(item.id) ? (
                    <StatusPill label={t('maintenance.badge')} tone="warning" />
                  ) : undefined
                }
              />
              {i < weapons.length - 1 ? <ListDivider /> : null}
            </View>
          ))
        )}
      </Card>

      <SectionHeader title={t('weapons.ammoSection')} />
      <Card>
        <View style={styles.ctaPad}>
          <Text style={styles.ammoTotal}>{t('weapons.ammoTotal', { count: ammoTotal })}</Text>
          <Text style={styles.ammoIntro}>{t('weapons.ammoIntro')}</Text>
          <ButtonRow>
            <View style={styles.halfBtn}>
              <PrimaryButton label={t('weapons.ammoAdd')} fullWidth onPress={() => router.push('/ammo/add')} />
            </View>
            <View style={styles.halfBtn}>
              <SecondaryButton label={t('weapons.ammoReduce')} fullWidth onPress={() => router.push('/ammo/reduce')} />
            </View>
          </ButtonRow>
        </View>
        {ammoByCaliber.length === 0 ? (
          <EmptyState title={t('weapons.ammoEmpty')} hint={t('weapons.ammoEmptyHint')} />
        ) : (
          ammoByCaliber.map((row, i) => (
            <View key={row.caliber}>
              <ListRow
                title={row.caliber}
                subtitle={t('weapons.ammoRowSub', { count: row.quantity })}
                showChevron={false}
              />
              {i < ammoByCaliber.length - 1 ? <ListDivider /> : null}
            </View>
          ))
        )}
      </Card>

      <SectionHeader title={t('weapons.tips')} />
      <Card>
        {tips.map((item, i) => {
          const copy = localizedTip(t, item.id);
          return (
            <View key={item.id}>
              <ListRow title={copy.title} subtitle={copy.body} showChevron={false} />
              {i < tips.length - 1 ? <ListDivider /> : null}
            </View>
          );
        })}
      </Card>
    </ScreenScroll>
  );
}

function weaponSubtitle(
  w: WeaponWithRoundTotal,
  t: ReturnType<typeof useI18n>['t'],
): string {
  const parts: string[] = [];
  const meta = [w.caliber?.trim(), w.serial_note?.trim()].filter(Boolean) as string[];
  if (meta.length) parts.push(meta.join(' · '));
  parts.push(t('weapons.roundsTotal', { count: w.rounds_fired_total }));
  return parts.join(' · ');
}

const styles = StyleSheet.create({
  ctaPad: { padding: 12, gap: 10 },
  ammoTotal: { color: AppColors.accentBrass, fontSize: 16, fontWeight: '800' },
  ammoIntro: { color: AppColors.textMuted, fontSize: 13, lineHeight: 18 },
  halfBtn: { flex: 1, minWidth: 0 },
});
