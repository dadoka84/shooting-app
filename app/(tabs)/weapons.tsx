import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from '@/components/Themed';
import {
  Card,
  EmptyState,
  ListDivider,
  ListRow,
  PrimaryButton,
  ScreenScroll,
  SectionHeader,
  StatusPill,
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
      <PrimaryButton label="Add weapon" onPress={() => router.push('/weapon/new')} />

      <SectionHeader title="Arsenal" />
      <Card>
        {weapons.length === 0 ? (
          <EmptyState title="No weapons yet" hint="Add pistols or rifles you own, rent, or borrow." />
        ) : (
          weapons.map((item, i) => (
            <View key={item.id}>
              <ListRow
                title={item.name}
                subtitle={formatWeaponSubtitle(item)}
                onPress={() => router.push(`/weapon/${item.id}`)}
                right={<StatusPill label={formatCategory(item.category)} tone="neutral" />}
              />
              {i < weapons.length - 1 ? <ListDivider /> : null}
            </View>
          ))
        )}
      </Card>
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

function formatWeaponSubtitle(w: Weapon): string {
  const parts = [w.caliber?.trim() || null].filter(Boolean) as string[];
  const note = w.serial_note?.trim();
  if (note) parts.push(note);
  return parts.length ? parts.join(' · ') : 'Tap for details';
}
