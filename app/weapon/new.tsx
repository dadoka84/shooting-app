import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput } from 'react-native';
import { Text } from '@/components/Themed';
import { PrimaryButton, ScreenScroll } from '@/components/ui';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { createWeapon } from '@/lib/db/repository';
import type { WeaponCategory } from '@/lib/types';

const CATEGORIES: WeaponCategory[] = ['pistol', 'rifle', 'pcc', 'other'];

export default function NewWeaponScreen() {
  const { db, bumpRefresh } = useDatabase();
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<WeaponCategory>('pistol');
  const [caliber, setCaliber] = useState('9mm');
  const [serialNote, setSerialNote] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Enter a weapon name.');
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
    <ScrollView contentContainerStyle={styles.pad}>
      <ScreenScroll>
        <Field label="Name" value={name} onChangeText={setName} placeholder="Glock 19" />
        <Text style={styles.label}>Category</Text>
        {CATEGORIES.map((c) => (
          <Text
            key={c}
            style={[styles.chip, category === c && styles.chipActive]}
            onPress={() => setCategory(c)}
          >
            {c}
          </Text>
        ))}
        <Field label="Caliber" value={caliber} onChangeText={setCaliber} placeholder="9mm" />
        <Field
          label="Serial note (optional)"
          value={serialNote}
          onChangeText={setSerialNote}
          placeholder="Last 4 digits only"
        />
        <PrimaryButton label={saving ? 'Saving…' : 'Save weapon'} onPress={save} disabled={saving} />
      </ScreenScroll>
    </ScrollView>
  );
}

export function WeaponFormFields({
  name,
  setName,
  category,
  setCategory,
  caliber,
  setCaliber,
  serialNote,
  setSerialNote,
}: {
  name: string;
  setName: (v: string) => void;
  category: WeaponCategory;
  setCategory: (v: WeaponCategory) => void;
  caliber: string;
  setCaliber: (v: string) => void;
  serialNote: string;
  setSerialNote: (v: string) => void;
}) {
  return (
    <>
      <Field label="Name" value={name} onChangeText={setName} />
      <Text style={styles.label}>Category</Text>
      {CATEGORIES.map((c) => (
        <Text
          key={c}
          style={[styles.chip, category === c && styles.chipActive]}
          onPress={() => setCategory(c)}
        >
          {c}
        </Text>
      ))}
      <Field label="Caliber" value={caliber} onChangeText={setCaliber} />
      <Field label="Serial note" value={serialNote} onChangeText={setSerialNote} />
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
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        autoCapitalize="sentences"
      />
    </>
  );
}

const styles = StyleSheet.create({
  pad: { flexGrow: 1 },
  label: { fontWeight: '600', marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 6,
    marginRight: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#94a3b8',
    alignSelf: 'flex-start',
  },
  chipActive: {
    backgroundColor: '#2563eb',
    color: '#fff',
    borderColor: '#2563eb',
  },
});
