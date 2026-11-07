import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Text } from '@/components/Themed';
import { PrimaryButton, ScreenIntro, ScreenScroll } from '@/components/ui';
import { WeaponFormFields } from '@/app/weapon/new';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { getWeapon, updateWeapon } from '@/lib/db/repository';
import type { WeaponCategory } from '@/lib/types';

export default function EditWeaponScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { db, bumpRefresh } = useDatabase();
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<WeaponCategory>('pistol');
  const [caliber, setCaliber] = useState('');
  const [serialNote, setSerialNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const w = await getWeapon(db, id);
      if (w) {
        setName(w.name);
        setCategory(w.category);
        setCaliber(w.caliber ?? '');
        setSerialNote(w.serial_note ?? '');
      }
      setLoading(false);
    })();
  }, [db, id]);

  const save = async () => {
    if (!id || !name.trim()) {
      Alert.alert('Name required');
      return;
    }
    await updateWeapon(db, id, { name, category, caliber, serial_note: serialNote });
    bumpRefresh();
    router.back();
  };

  if (loading) {
    return (
      <ScreenScroll>
        <Text>Loading…</Text>
      </ScreenScroll>
    );
  }

  return (
    <ScreenScroll>
      <ScreenIntro title="Edit weapon" description="Update category, caliber, and notes." />
      <WeaponFormFields
          name={name}
          setName={setName}
          category={category}
          setCategory={setCategory}
          caliber={caliber}
          setCaliber={setCaliber}
          serialNote={serialNote}
          setSerialNote={setSerialNote}
        />
      <PrimaryButton label="Save changes" fullWidth onPress={save} />
    </ScreenScroll>
  );
}
