import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { Text } from '@/components/Themed';
import {
  ButtonRow,
  Card,
  DangerButton,
  ListDivider,
  ListRow,
  PrimaryButton,
  ScreenIntro,
  ScreenScroll,
  SectionHeader,
} from '@/components/ui';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { deleteWeapon, getWeapon } from '@/lib/db/repository';
import type { Weapon } from '@/lib/types';

export default function WeaponDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { db, bumpRefresh, refreshKey } = useDatabase();
  const router = useRouter();
  const [weapon, setWeapon] = useState<Weapon | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      (async () => {
        setWeapon(await getWeapon(db, id));
      })();
    }, [db, id, refreshKey]),
  );

  if (!weapon) {
    return (
      <ScreenScroll>
        <Text>Loading…</Text>
      </ScreenScroll>
    );
  }

  const remove = () => {
    Alert.alert('Delete weapon?', weapon.name, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteWeapon(db, weapon.id);
          bumpRefresh();
          router.back();
        },
      },
    ]);
  };

  return (
    <ScreenScroll>
      <ScreenIntro title={weapon.name} description={formatCategory(weapon.category)} />

      <SectionHeader title="Specifications" />
      <Card>
        <ListRow title="Category" subtitle={formatCategory(weapon.category)} showChevron={false} />
        {weapon.caliber?.trim() ? (
          <>
            <ListDivider />
            <ListRow title="Caliber" subtitle={weapon.caliber} showChevron={false} />
          </>
        ) : null}
        {weapon.serial_note?.trim() ? (
          <>
            <ListDivider />
            <ListRow title="Serial / note" subtitle={weapon.serial_note} showChevron={false} />
          </>
        ) : null}
      </Card>

      <SectionHeader title="Actions" />
      <ButtonRow>
        <PrimaryButton label="Edit weapon" fullWidth onPress={() => router.push(`/weapon/edit/${weapon.id}`)} />
      </ButtonRow>

      <SectionHeader title="Danger zone" />
      <DangerButton label="Delete weapon" fullWidth onPress={remove} />
    </ScreenScroll>
  );
}

function formatCategory(cat: Weapon['category']): string {
  const map: Record<Weapon['category'], string> = {
    pistol: 'Pistol',
    rifle: 'Rifle',
    pcc: 'PCC',
    other: 'Other',
  };
  return map[cat];
}
