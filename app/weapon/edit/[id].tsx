import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Text } from '@/components/Themed';
import { PrimaryButton, ScreenIntro, ScreenScroll } from '@/components/ui';
import { WeaponFormFields } from '@/app/weapon/new';
import type { CaliberPick } from '@/lib/ammo/calibers';
import { inferCaliberPickFromStored, resolveStoredCaliber } from '@/lib/ammo/caliberMatch';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { getWeapon, updateWeapon } from '@/lib/db/repository';
import type { WeaponCategory } from '@/lib/types';

export default function EditWeaponScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { db, bumpRefresh } = useDatabase();
  const router = useRouter();
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<WeaponCategory>('pistol');
  const [caliberPick, setCaliberPick] = useState<CaliberPick>('9mm');
  const [caliberCustom, setCaliberCustom] = useState('');
  const [serialNote, setSerialNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const w = await getWeapon(db, id);
      if (w) {
        setName(w.name);
        setCategory(w.category);
        const cal = inferCaliberPickFromStored(w.caliber ?? '');
        setCaliberPick(cal.pick);
        setCaliberCustom(cal.customText);
        setSerialNote(w.serial_note ?? '');
      }
      setLoading(false);
    })();
  }, [db, id]);

  const save = async () => {
    if (!id || !name.trim()) {
      Alert.alert(t('weapon.nameRequired'));
      return;
    }
    const caliber = resolveStoredCaliber(caliberPick, caliberCustom);
    if (!caliber) {
      Alert.alert(t('ammo.caliberRequired'));
      return;
    }
    await updateWeapon(db, id, { name, category, caliber, serial_note: serialNote });
    bumpRefresh();
    router.back();
  };

  if (loading) {
    return (
      <ScreenScroll>
        <Text>{t('common.loading')}</Text>
      </ScreenScroll>
    );
  }

  return (
    <ScreenScroll>
      <ScreenIntro title={t('weapon.editTitle')} description={t('weapon.editHint')} />
      <WeaponFormFields
        t={t}
        name={name}
        setName={setName}
        category={category}
        setCategory={setCategory}
        caliberPick={caliberPick}
        setCaliberPick={setCaliberPick}
        caliberCustom={caliberCustom}
        setCaliberCustom={setCaliberCustom}
        serialNote={serialNote}
        setSerialNote={setSerialNote}
      />
      <PrimaryButton label={t('common.saveChanges')} fullWidth onPress={save} />
    </ScreenScroll>
  );
}
