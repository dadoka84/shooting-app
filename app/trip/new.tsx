import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput } from 'react-native';
import { Text, View } from '@/components/Themed';
import { PrimaryButton, ScreenScroll } from '@/components/ui';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { createTrip, listWeapons } from '@/lib/db/repository';
import type { Possession, TripWeaponInput, Weapon } from '@/lib/types';

const POSSESSIONS: Possession[] = ['owned', 'rental', 'borrowed'];

export default function NewTripScreen() {
  const { db, bumpRefresh } = useDatabase();
  const router = useRouter();
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [locationName, setLocationName] = useState('');
  const [notes, setNotes] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [startedAt] = useState(Date.now());
  const [tripWeapons, setTripWeapons] = useState<TripWeaponInput[]>([
    { weapon_id: null, possession: 'owned', rental_note: null },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setWeapons(await listWeapons(db));
    })();
  }, [db]);

  const save = async () => {
    if (!locationName.trim()) {
      Alert.alert('Location required', 'Enter a range name or location.');
      return;
    }
    setSaving(true);
    try {
      const tripId = await createTrip(db, {
        started_at: startedAt,
        location_name: locationName,
        notes,
        discipline_tag: discipline || null,
        weapons: tripWeapons,
      });
      bumpRefresh();
      router.replace(`/trip/${tripId}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <ScreenScroll>
        <Text style={styles.meta}>Started: {new Date(startedAt).toLocaleString()}</Text>
        <LabelField label="Range / location" value={locationName} onChangeText={setLocationName} />
        <LabelField
          label="Discipline tag (optional)"
          value={discipline}
          onChangeText={setDiscipline}
          placeholder="precision"
        />
        <LabelField label="Notes" value={notes} onChangeText={setNotes} multiline />

        <Text style={styles.section}>Weapons on trip</Text>
        {tripWeapons.map((tw, index) => (
          <View key={index} style={styles.weaponRow}>
            <Text style={styles.rowTitle}>Weapon #{index + 1}</Text>
            <Text style={styles.label}>Possession</Text>
            <View style={styles.chipRow}>
              {POSSESSIONS.map((p) => (
                <Text
                  key={p}
                  style={[styles.chip, tw.possession === p && styles.chipActive]}
                  onPress={() => updateTripWeapon(setTripWeapons, index, { possession: p })}
                >
                  {p}
                </Text>
              ))}
            </View>
            <Text style={styles.label}>From library</Text>
            <Text style={styles.hint} onPress={() => updateTripWeapon(setTripWeapons, index, { weapon_id: null })}>
              None / ad-hoc
            </Text>
            {weapons.map((w) => (
              <Text
                key={w.id}
                style={[styles.weaponPick, tw.weapon_id === w.id && styles.weaponPickActive]}
                onPress={() => updateTripWeapon(setTripWeapons, index, { weapon_id: w.id })}
              >
                {w.name}
              </Text>
            ))}
            <LabelField
              label="Rental / borrowed note"
              value={tw.rental_note ?? ''}
              onChangeText={(v) => updateTripWeapon(setTripWeapons, index, { rental_note: v })}
            />
          </View>
        ))}
        <PrimaryButton
          label="Add another weapon row"
          onPress={() =>
            setTripWeapons((rows) => [
              ...rows,
              { weapon_id: null, possession: 'owned', rental_note: null },
            ])
          }
        />
        <PrimaryButton label={saving ? 'Saving…' : 'Save trip'} onPress={save} disabled={saving} />
      </ScreenScroll>
    </ScrollView>
  );
}

export function TripFormBody({
  locationName,
  setLocationName,
  notes,
  setNotes,
  discipline,
  setDiscipline,
  tripWeapons,
  setTripWeapons,
  weapons,
}: {
  locationName: string;
  setLocationName: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  discipline: string;
  setDiscipline: (v: string) => void;
  tripWeapons: TripWeaponInput[];
  setTripWeapons: React.Dispatch<React.SetStateAction<TripWeaponInput[]>>;
  weapons: Weapon[];
}) {
  return (
    <>
      <LabelField label="Range / location" value={locationName} onChangeText={setLocationName} />
      <LabelField label="Discipline tag" value={discipline} onChangeText={setDiscipline} />
      <LabelField label="Notes" value={notes} onChangeText={setNotes} multiline />
      <Text style={styles.section}>Weapons on trip</Text>
      {tripWeapons.map((tw, index) => (
        <View key={index} style={styles.weaponRow}>
          <Text style={styles.label}>Possession</Text>
          <View style={styles.chipRow}>
            {POSSESSIONS.map((p) => (
              <Text
                key={p}
                style={[styles.chip, tw.possession === p && styles.chipActive]}
                onPress={() => updateTripWeapon(setTripWeapons, index, { possession: p })}
              >
                {p}
              </Text>
            ))}
          </View>
          {weapons.map((w) => (
            <Text
              key={w.id}
              style={[styles.weaponPick, tw.weapon_id === w.id && styles.weaponPickActive]}
              onPress={() => updateTripWeapon(setTripWeapons, index, { weapon_id: w.id })}
            >
              {w.name}
            </Text>
          ))}
          <LabelField
            label="Note"
            value={tw.rental_note ?? ''}
            onChangeText={(v) => updateTripWeapon(setTripWeapons, index, { rental_note: v })}
          />
        </View>
      ))}
    </>
  );
}

function updateTripWeapon(
  setRows: React.Dispatch<React.SetStateAction<TripWeaponInput[]>>,
  index: number,
  patch: Partial<TripWeaponInput>,
) {
  setRows((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
}

function LabelField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
      />
    </>
  );
}

const styles = StyleSheet.create({
  pad: { flexGrow: 1 },
  meta: { opacity: 0.7 },
  section: { fontSize: 18, fontWeight: '600', marginTop: 12 },
  label: { fontWeight: '600', marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  multiline: { minHeight: 72, textAlignVertical: 'top' },
  weaponRow: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 4,
  },
  rowTitle: { fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#94a3b8',
  },
  chipActive: { backgroundColor: '#2563eb', color: '#fff', borderColor: '#2563eb' },
  weaponPick: { paddingVertical: 4, color: '#334155' },
  weaponPickActive: { color: '#2563eb', fontWeight: '700' },
  hint: { color: '#64748b', paddingVertical: 4 },
});
