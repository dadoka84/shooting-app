import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { WeaponMaintenanceSection } from '@/components/WeaponMaintenanceSection';
import { WeaponCategoryIcon } from '@/components/weapons/WeaponCategoryIcon';
import { weaponCategoryLabel } from '@/lib/weapons/categoryDisplay';
import {
  ButtonRow,
  Card,
  DangerButton,
  ListDivider,
  ListRow,
  PrimaryButton,
  ScreenScroll,
  SectionHeader,
} from '@/components/ui';
import { AppColors } from '@/constants/theme';
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
      <Card>
        <View style={styles.hero}>
          <WeaponCategoryIcon category={weapon.category} size={30} />
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>{weapon.name}</Text>
            <Text style={styles.heroSub}>{weaponCategoryLabel(weapon.category)}</Text>
          </View>
        </View>
      </Card>

      <SectionHeader title="Specifications" />
      <Card>
        <ListRow
          title="Category"
          subtitle={weaponCategoryLabel(weapon.category)}
          leading={<WeaponCategoryIcon category={weapon.category} />}
          showChevron={false}
        />
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

      <WeaponMaintenanceSection weaponId={weapon.id} />

      <SectionHeader title="Actions" />
      <ButtonRow>
        <PrimaryButton label="Edit weapon" fullWidth onPress={() => router.push(`/weapon/edit/${weapon.id}`)} />
      </ButtonRow>

      <SectionHeader title="Danger zone" />
      <DangerButton label="Delete weapon" fullWidth onPress={remove} />
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  heroText: { flex: 1, minWidth: 0, gap: 4 },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  heroSub: {
    fontSize: 14,
    color: AppColors.textMuted,
    fontWeight: '600',
  },
});
