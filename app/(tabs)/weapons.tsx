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
import { listWeapons } from '@/lib/db/repository';
import type { Weapon } from '@/lib/types';

export default function WeaponsScreen() {
  const { db, refreshKey } = useDatabase();
  const router = useRouter();
  const [weapons, setWeapons] = useState<Weapon[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setWeapons(await listWeapons(db));
      })();
    }, [db, refreshKey]),
  );

  return (
    <ScreenScroll>
      <ScreenIntro description="Track pistols and rifles you own, rent, or borrow on trips." />

      <SectionHeader title="Add" />
      <Card>
        <View style={styles.ctaPad}>
          <ButtonRow>
            <PrimaryButton label="Add weapon" fullWidth onPress={() => router.push('/weapon/new')} />
          </ButtonRow>
        </View>
      </Card>

      <SectionHeader title="Arsenal" />
      <Card>
        {weapons.length === 0 ? (
          <EmptyState title="No weapons yet" hint="Add pistols or rifles you own, rent, or borrow." />
        ) : (
          weapons.map((item, i) => (
            <View key={item.id}>
              <WeaponListRow
                name={item.name}
                category={item.category}
                subtitle={formatWeaponSubtitle(item)}
                onPress={() => router.push(`/weapon/${item.id}`)}
              />
              {i < weapons.length - 1 ? <ListDivider /> : null}
            </View>
          ))
        )}
      </Card>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  ctaPad: { padding: 12 },
});

function formatWeaponSubtitle(w: Weapon): string {
  const parts = [w.caliber?.trim() || null].filter(Boolean) as string[];
  const note = w.serial_note?.trim();
  if (note) parts.push(note);
  return parts.length ? parts.join(' · ') : 'Tap for details';
}
