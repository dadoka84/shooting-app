import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Text } from '@/components/Themed';
import { PrimaryButton, ScreenIntro, ScreenScroll } from '@/components/ui';
import { TripFormBody } from '@/app/trip/new';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { TripAmmoInsufficientError } from '@/lib/db/ammoRepository';
import {
  getTrip,
  getTripLocation,
  listTripWeapons,
  listWeapons,
  updateTrip,
} from '@/lib/db/repository';
import type { TripWeaponInput, Weapon } from '@/lib/types';

export default function EditTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { db, bumpRefresh } = useDatabase();
  const { t } = useI18n();
  const router = useRouter();
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [locationName, setLocationName] = useState('');
  const [notes, setNotes] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [tripWeapons, setTripWeapons] = useState<TripWeaponInput[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [trip, loc, tws, weaponList] = await Promise.all([
        getTrip(db, id),
        getTripLocation(db, id),
        listTripWeapons(db, id),
        listWeapons(db),
      ]);
      if (trip) {
        setStartedAt(trip.started_at);
        setNotes(trip.notes ?? '');
        setDiscipline(trip.discipline_tag ?? '');
      }
      setLocationName(loc?.display_name ?? '');
      setTripWeapons(
        tws.map((tw) => ({
          weapon_id: tw.weapon_id,
          possession: tw.possession,
          rental_note: tw.rental_note,
          rounds_fired: tw.rounds_fired ?? 0,
        })),
      );
      if (tws.length === 0) {
        setTripWeapons([{ weapon_id: null, possession: 'owned', rental_note: null, rounds_fired: 50 }]);
      }
      setWeapons(weaponList);
      setLoading(false);
    })();
  }, [db, id]);

  const save = async () => {
    if (!id || !locationName.trim()) {
      Alert.alert(t('trip.locationRequired'), t('trip.locationRequiredHint'));
      return;
    }
    try {
      await updateTrip(db, id, {
        started_at: startedAt,
        location_name: locationName,
        notes,
        discipline_tag: discipline || null,
        weapons: tripWeapons,
      });
      bumpRefresh();
      router.back();
    } catch (e) {
      if (e instanceof TripAmmoInsufficientError) {
        Alert.alert(
          t('trip.ammoInsufficientTitle'),
          t('trip.ammoInsufficientBody', { caliber: e.caliber, requested: e.requested, available: e.available }),
        );
      } else {
        throw e;
      }
    }
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
      <ScreenIntro
        title={t('trip.editTitle')}
        description={t('trip.newStarted', { when: new Date(startedAt).toLocaleString() })}
      />
      <TripFormBody
        locationName={locationName}
        setLocationName={setLocationName}
        notes={notes}
        setNotes={setNotes}
        discipline={discipline}
        setDiscipline={setDiscipline}
        tripWeapons={tripWeapons}
        setTripWeapons={setTripWeapons}
        weapons={weapons}
        roundsLabels={{ roundsFired: t('common.roundsFired'), custom: t('common.custom') }}
        translate={t}
      />
      <PrimaryButton label={t('common.saveChanges')} fullWidth onPress={save} />
    </ScreenScroll>
  );
}
