import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { PrimaryButton, ScreenScroll } from '@/components/ui';
import { AppColors } from '@/constants/theme';
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
      <FlatList
        data={weapons}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={<Text>No weapons in library.</Text>}
        renderItem={({ item }) => (
          <Text style={styles.item} onPress={() => router.push(`/weapon/${item.id}`)}>
            {item.name} · {item.category}
            {item.caliber ? ` · ${item.caliber}` : ''}
          </Text>
        )}
      />
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  item: { paddingVertical: 10, fontSize: 16, color: AppColors.accentBrass, fontWeight: '600' },
});
