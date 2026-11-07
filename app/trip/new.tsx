import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text as RNText } from 'react-native';
import { Text, View } from '@/components/Themed';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { RoundsFiredPicker } from '@/components/RoundsFiredPicker';
import { WeaponCategoryIcon } from '@/components/weapons/WeaponCategoryIcon';
import { SelectField, type SelectOption } from '@/components/SelectField';
import { OutlineButton, PrimaryButton, ScreenIntro, ScreenScroll, SectionHeader } from '@/components/ui';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { possessionStringKey } from '@/lib/i18n/possession';
import type { StringKey } from '@/lib/i18n/strings';
import { AppColors } from '@/constants/theme';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { TripAmmoInsufficientError } from '@/lib/db/ammoRepository';
import { listShootingRanges } from '@/lib/db/rangeRepository';
import { createTrip, listWeapons } from '@/lib/db/repository';
import type { ShootingRange } from '@/lib/types';
import type { Possession, TripWeaponInput, Weapon } from '@/lib/types';

const POSSESSIONS: Possession[] = ['owned', 'rental', 'borrowed'];

export default function NewTripScreen() {
  const { db, bumpRefresh } = useDatabase();
  const router = useRouter();
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [ranges, setRanges] = useState<ShootingRange[]>([]);
  const [rangeId, setRangeId] = useState('');
  const [notes, setNotes] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [startedAt] = useState(() => Date.now());
  const { t } = useI18n();
  const [tripWeapons, setTripWeapons] = useState<TripWeaponInput[]>([
    { weapon_id: null, possession: 'owned', rental_note: null, rounds_fired: 50 },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [weaponList, rangeList] = await Promise.all([listWeapons(db), listShootingRanges(db)]);
      setWeapons(weaponList);
      setRanges(rangeList);
    })();
  }, [db]);

  const rangeOptions: SelectOption<string>[] = ranges.map((r) => ({ value: r.id, label: r.name }));

  const save = async () => {
    if (!rangeId) {
      Alert.alert(t('trip.rangeRequired'), t('trip.rangeRequiredHint'));
      return;
    }
    const rangeName = ranges.find((r) => r.id === rangeId)?.name ?? '';
    setSaving(true);
    try {
      const tripId = await createTrip(db, {
        started_at: startedAt,
        range_id: rangeId,
        notes,
        discipline_tag: discipline || null,
        weapons: tripWeapons,
      });
      bumpRefresh();
      router.replace({
        pathname: '/trip/[id]',
        params: { id: tripId, saved: '1', name: rangeName.trim() },
      });
    } catch (e) {
      if (e instanceof TripAmmoInsufficientError) {
        Alert.alert(
          t('trip.ammoInsufficientTitle'),
          t('trip.ammoInsufficientBody', { caliber: e.caliber, requested: e.requested, available: e.available }),
        );
      } else {
        throw e;
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenScroll>
        <ScreenIntro
          title={t('trip.newTitle')}
          description={t('trip.newStarted', { when: new Date(startedAt).toLocaleString() })}
        />
        <Text style={styles.label}>{t('trip.rangeLabel')}</Text>
        <SelectField
          value={rangeId}
          onChange={setRangeId}
          options={rangeOptions}
          placeholder={t('trip.rangeLabel')}
          disabled={rangeOptions.length === 0}
        />
        <OutlineButton
          label={t('trip.addRange')}
          fullWidth
          onPress={() => router.push('/range/new')}
        />
        <LabelField
          label={t('trip.disciplineLabel')}
          value={discipline}
          onChangeText={setDiscipline}
          placeholder={t('trip.disciplinePlaceholder')}
        />
        <LabelField label={t('common.notes')} value={notes} onChangeText={setNotes} multiline />

        <SectionHeader title={t('trip.weaponsSection')} />
        <Text style={styles.hint}>{t('trip.ammoDeductHint')}</Text>
        {tripWeapons.map((tw, index) => (
          <View key={index} style={styles.weaponRow}>
            <Text style={styles.rowTitle}>{t('trip.weaponRow', { n: index + 1 })}</Text>
            <Text style={styles.label}>{t('trip.possession')}</Text>
            <View style={styles.chipRow}>
              {POSSESSIONS.map((p) => (
                <Text
                  key={p}
                  style={[styles.chip, tw.possession === p && styles.chipActive]}
                  onPress={() => updateTripWeapon(setTripWeapons, index, { possession: p })}
                >
                  {t(possessionStringKey(p))}
                </Text>
              ))}
            </View>
            <Text style={styles.label}>{t('trip.fromLibrary')}</Text>
            <Text style={styles.hint} onPress={() => updateTripWeapon(setTripWeapons, index, { weapon_id: null })}>
              {t('trip.adHoc')}
            </Text>
            {weapons.map((w) => (
              <View
                key={w.id}
                style={[styles.weaponPick, tw.weapon_id === w.id && styles.weaponPickActive]}
              >
                <Pressable
                  style={styles.weaponPickInner}
                  onPress={() => updateTripWeapon(setTripWeapons, index, { weapon_id: w.id })}
                >
                  <WeaponCategoryIcon category={w.category} size={20} />
                  <RNText
                    style={[styles.weaponPickLabel, tw.weapon_id === w.id && styles.weaponPickLabelActive]}
                  >
                    {w.name}
                  </RNText>
                </Pressable>
              </View>
            ))}
            <RoundsFiredPicker
              value={tw.rounds_fired}
              onChange={(n) => updateTripWeapon(setTripWeapons, index, { rounds_fired: n })}
              labels={{ roundsFired: t('common.roundsFired'), custom: t('common.custom') }}
            />
            <LabelField
              label={t('trip.rentalNote')}
              value={tw.rental_note ?? ''}
              onChangeText={(v) => updateTripWeapon(setTripWeapons, index, { rental_note: v })}
            />
          </View>
        ))}
        <OutlineButton
          label={t('trip.addWeaponRow')}
          fullWidth
          onPress={() =>
            setTripWeapons((rows) => [
              ...rows,
              { weapon_id: null, possession: 'owned', rental_note: null, rounds_fired: 50 },
            ])
          }
        />
      <PrimaryButton
        label={saving ? t('common.saving') : t('common.saveTrip')}
        fullWidth
        onPress={save}
        disabled={saving}
      />
    </ScreenScroll>
  );
}

export function TripFormBody({
  rangeId,
  setRangeId,
  rangeOptions,
  onAddRange,
  notes,
  setNotes,
  discipline,
  setDiscipline,
  tripWeapons,
  setTripWeapons,
  weapons,
  roundsLabels,
  translate,
}: {
  rangeId: string;
  setRangeId: (v: string) => void;
  rangeOptions: SelectOption<string>[];
  onAddRange: () => void;
  notes: string;
  setNotes: (v: string) => void;
  discipline: string;
  setDiscipline: (v: string) => void;
  tripWeapons: TripWeaponInput[];
  setTripWeapons: React.Dispatch<React.SetStateAction<TripWeaponInput[]>>;
  weapons: Weapon[];
  roundsLabels: { roundsFired: string; custom: string };
  translate: (key: StringKey, vars?: Record<string, string | number>) => string;
}) {
  const t = translate;
  return (
    <>
      <Text style={styles.label}>{t('trip.rangeLabel')}</Text>
      <SelectField
        value={rangeId}
        onChange={setRangeId}
        options={rangeOptions}
        placeholder={t('trip.rangeLabel')}
        disabled={rangeOptions.length === 0}
      />
      <OutlineButton label={t('trip.addRange')} fullWidth onPress={onAddRange} />
      <LabelField label={t('trip.disciplineLabel')} value={discipline} onChangeText={setDiscipline} />
      <LabelField label={t('common.notes')} value={notes} onChangeText={setNotes} multiline />
      <Text style={styles.section}>{t('trip.weaponsSection')}</Text>
      <Text style={styles.hint}>{t('trip.ammoDeductHint')}</Text>
      {tripWeapons.map((tw, index) => (
        <View key={index} style={styles.weaponRow}>
          <Text style={styles.label}>{t('trip.possession')}</Text>
          <View style={styles.chipRow}>
            {POSSESSIONS.map((p) => (
              <Text
                key={p}
                style={[styles.chip, tw.possession === p && styles.chipActive]}
                onPress={() => updateTripWeapon(setTripWeapons, index, { possession: p })}
              >
                {t(possessionStringKey(p))}
              </Text>
            ))}
          </View>
          {weapons.map((w) => (
            <View
              key={w.id}
              style={[styles.weaponPick, tw.weapon_id === w.id && styles.weaponPickActive]}
            >
              <Pressable
                style={styles.weaponPickInner}
                onPress={() => updateTripWeapon(setTripWeapons, index, { weapon_id: w.id })}
              >
                <WeaponCategoryIcon category={w.category} size={20} />
                <RNText
                  style={[styles.weaponPickLabel, tw.weapon_id === w.id && styles.weaponPickLabelActive]}
                >
                  {w.name}
                </RNText>
              </Pressable>
            </View>
          ))}
          <RoundsFiredPicker
            value={tw.rounds_fired}
            onChange={(n) => updateTripWeapon(setTripWeapons, index, { rounds_fired: n })}
            labels={roundsLabels}
          />
          <LabelField
            label={t('trip.rentalNote')}
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
      <ThemedTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        style={multiline ? styles.multiline : undefined}
      />
    </>
  );
}

const styles = StyleSheet.create({
  pad: { flexGrow: 1 },
  meta: { color: AppColors.textMuted },
  section: { fontSize: 18, fontWeight: '700', marginTop: 12, color: AppColors.accentBrass },
  label: { fontWeight: '600', marginTop: 8, color: AppColors.textPrimary },
  multiline: { minHeight: 72, textAlignVertical: 'top' },
  weaponRow: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
    gap: 4,
    backgroundColor: AppColors.surfaceRaised,
  },
  rowTitle: { fontWeight: '700', color: AppColors.textPrimary },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
    color: AppColors.textMuted,
    overflow: 'hidden',
  },
  chipActive: {
    backgroundColor: AppColors.accentOliveBright,
    color: AppColors.textInverse,
    borderColor: AppColors.accentBrass,
    fontWeight: '700',
  },
  weaponPick: {
    marginTop: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: AppColors.surface,
    overflow: 'hidden',
  },
  weaponPickActive: {
    borderColor: AppColors.accentBrass,
    backgroundColor: 'rgba(107, 138, 78, 0.12)',
  },
  weaponPickInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  weaponPickLabel: { fontSize: 15, fontWeight: '600', color: AppColors.textPrimary, flex: 1 },
  weaponPickLabelActive: { color: AppColors.accentBrass },
  hint: { color: AppColors.textMuted, paddingVertical: 4 },
});
