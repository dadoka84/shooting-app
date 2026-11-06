import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { PrimaryButton, ScreenScroll } from '@/components/ui';
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
    <ScrollView contentContainerStyle={styles.pad}>
      <ScreenScroll>
        <Text style={styles.title}>{weapon.name}</Text>
        <Text>Category: {weapon.category}</Text>
        {weapon.caliber ? <Text>Caliber: {weapon.caliber}</Text> : null}
        {weapon.serial_note ? <Text>Serial note: {weapon.serial_note}</Text> : null}
        <PrimaryButton label="Edit" onPress={() => router.push(`/weapon/edit/${weapon.id}`)} />
        <PrimaryButton label="Delete" onPress={remove} />
      </ScreenScroll>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pad: { flexGrow: 1 },
  title: { fontSize: 22, fontWeight: '700' },
});
