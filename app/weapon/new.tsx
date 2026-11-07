import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { CaliberPicker } from '@/components/ammo/CaliberPicker';
import { WeaponCategoryPicker } from '@/components/weapons/WeaponCategoryPicker';
import { PrimaryButton, ScreenIntro, ScreenScroll } from '@/components/ui';
import { AppColors } from '@/constants/theme';
import type { CaliberPick } from '@/lib/ammo/calibers';
import { resolveStoredCaliber } from '@/lib/ammo/caliberMatch';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { createWeapon } from '@/lib/db/repository';
import type { StringKey } from '@/lib/i18n/strings';
import type { WeaponCategory } from '@/lib/types';

export default function NewWeaponScreen() {
  const { db, bumpRefresh } = useDatabase();
  const router = useRouter();
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<WeaponCategory>('pistol');
  const [caliberPick, setCaliberPick] = useState<CaliberPick>('9mm');
  const [caliberCustom, setCaliberCustom] = useState('');
  const [serialNote, setSerialNote] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) {
      Alert.alert(t('weapon.nameRequired'));
      return;
    }
    const caliber = resolveStoredCaliber(caliberPick, caliberCustom);
    if (!caliber) {
      Alert.alert(t('ammo.caliberRequired'));
      return;
    }
    setSaving(true);
    try {
      const weapon = await createWeapon(db, {
        name,
        category,
        caliber,
        serial_note: serialNote,
      });
      bumpRefresh();
      router.replace(`/weapon/${weapon.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenScroll>
      <ScreenIntro title={t('weapon.newTitle')} description={t('weapon.newHint')} />
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
      <PrimaryButton label={saving ? t('common.saving') : t('weapon.saveWeapon')} fullWidth onPress={save} disabled={saving} />
    </ScreenScroll>
  );
}

export function WeaponFormFields({
  t,
  name,
  setName,
  category,
  setCategory,
  caliberPick,
  setCaliberPick,
  caliberCustom,
  setCaliberCustom,
  serialNote,
  setSerialNote,
}: {
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
  name: string;
  setName: (v: string) => void;
  category: WeaponCategory;
  setCategory: (v: WeaponCategory) => void;
  caliberPick: CaliberPick;
  setCaliberPick: (p: CaliberPick) => void;
  caliberCustom: string;
  setCaliberCustom: (v: string) => void;
  serialNote: string;
  setSerialNote: (v: string) => void;
}) {
  return (
    <>
      <Field label={t('weapon.name')} value={name} onChangeText={setName} placeholder={t('weapon.namePlaceholder')} />
      <Text style={styles.label}>{t('weapon.category')}</Text>
      <WeaponCategoryPicker value={category} onChange={setCategory} />
      <Text style={styles.label}>{t('weapon.caliber')}</Text>
      <CaliberPicker
        pick={caliberPick}
        onPickChange={setCaliberPick}
        customText={caliberCustom}
        onCustomTextChange={setCaliberCustom}
      />
      <Field
        label={t('weapon.serialNote')}
        value={serialNote}
        onChangeText={setSerialNote}
        placeholder={t('weapon.serialPlaceholder')}
      />
    </>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <ThemedTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        autoCapitalize="sentences"
      />
    </>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: '600', marginTop: 8, color: AppColors.textPrimary },
});
