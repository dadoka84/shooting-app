import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Text } from '@/components/Themed';
import { PrimaryButton, ScreenIntro, ScreenScroll } from '@/components/ui';
import { TripFormBody } from '@/app/trip/new';
import { useDatabase } from '@/lib/db/DatabaseProvider';
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
  const router = useRouter();
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [locationName, setLocationName] = useState('');
  const [notes, setNotes] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [startedAt, setStartedAt] = useState(Date.now());
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
        })),
      );
      if (tws.length === 0) {
        setTripWeapons([{ weapon_id: null, possession: 'owned', rental_note: null }]);
      }
      setWeapons(weaponList);
      setLoading(false);
    })();
  }, [db, id]);

  const save = async () => {
    if (!id || !locationName.trim()) {
      Alert.alert('Location required');
      return;
    }
    await updateTrip(db, id, {
      started_at: startedAt,
      location_name: locationName,
      notes,
      discipline_tag: discipline || null,
      weapons: tripWeapons,
    });
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
      <ScreenIntro title="Edit trip" description={`Started ${new Date(startedAt).toLocaleString()}`} />
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
        />
      <PrimaryButton label="Save changes" fullWidth onPress={save} />
    </ScreenScroll>
  );
}
