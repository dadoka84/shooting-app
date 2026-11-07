import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Asset } from 'expo-asset';
import { useCallback, useState } from 'react';
import { Alert, Image, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { WeaponListRow } from '@/components/weapons/WeaponListRow';
import {
  ButtonRow,
  Card,
  DangerButton,
  EmptyState,
  ListDivider,
  OutlineButton,
  PrimaryButton,
  ScreenIntro,
  ScreenScroll,
  SecondaryButton,
  SectionHeader,
} from '@/components/ui';
import { AppColors } from '@/constants/theme';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import {
  createTargetFromPhoto,
  deleteTrip,
  getTrip,
  getTripLocation,
  listTargetsForTrip,
  listTripWeapons,
  listWeapons,
} from '@/lib/db/repository';
import { resolvePhotoUri } from '@/lib/photos';
import type { TargetImage, Trip, TripWeapon, Weapon } from '@/lib/types';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { db, bumpRefresh, refreshKey } = useDatabase();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [locationName, setLocationName] = useState('');
  const [tripWeapons, setTripWeapons] = useState<TripWeapon[]>([]);
  const [weaponMap, setWeaponMap] = useState<Record<string, Weapon>>({});
  const [targets, setTargets] = useState<TargetImage[]>([]);

  const load = useCallback(async () => {
    if (!id) return;
    const t = await getTrip(db, id);
    setTrip(t);
    const loc = await getTripLocation(db, id);
    setLocationName(loc?.display_name ?? '');
    setTripWeapons(await listTripWeapons(db, id));
    setTargets(await listTargetsForTrip(db, id));
    const weapons = await listWeapons(db);
    setWeaponMap(Object.fromEntries(weapons.map((w) => [w.id, w])));
  }, [db, id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load, refreshKey]),
  );

  const addTarget = async (uri: string) => {
    if (!id) return;
    await createTargetFromPhoto(db, { trip_id: id, sourceUri: uri });
    bumpRefresh();
    await load();
  };

  const pickCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera permission required');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.9 });
    if (!result.canceled && result.assets[0]?.uri) {
      await addTarget(result.assets[0].uri);
    }
  };

  const pickLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photo library permission required');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.9 });
    if (!result.canceled && result.assets[0]?.uri) {
      await addTarget(result.assets[0].uri);
    }
  };

  const useReferenceSample = async () => {
    const asset = Asset.fromModule(require('@/assets/targets/baker-sl-b27e-reference.jpg'));
    await asset.downloadAsync();
    if (asset.localUri) {
      await addTarget(asset.localUri);
    }
  };

  const removeTrip = () => {
    if (!trip) return;
    Alert.alert('Delete trip?', 'Targets and scores will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTrip(db, trip.id);
          bumpRefresh();
          router.replace('/(tabs)/trips');
        },
      },
    ]);
  };

  if (!trip) {
    return (
      <ScreenScroll>
        <Text>Loading…</Text>
      </ScreenScroll>
    );
  }

  const started = new Date(trip.started_at).toLocaleString();
  const ended = trip.ended_at != null ? new Date(trip.ended_at).toLocaleString() : null;
  const tripRoundsTotal = tripWeapons.reduce((sum, tw) => sum + (tw.rounds_fired ?? 0), 0);

  return (
    <ScreenScroll>
      <ScreenIntro
        title={locationName || 'Trip'}
        description={[
          started,
          ended ? `Ended ${ended}` : 'In progress',
          trip.discipline_tag?.trim(),
          tripRoundsTotal > 0 ? `${tripRoundsTotal} rounds fired` : null,
        ]
          .filter(Boolean)
          .join(' · ')}
      />

      {trip.notes?.trim() ? (
        <Card>
          <View style={styles.cardPad}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesBody}>{trip.notes}</Text>
          </View>
        </Card>
      ) : null}

      <SectionHeader title="Weapons on trip" />
      <Card>
        {tripWeapons.length === 0 ? (
          <EmptyState title="No weapons linked" hint="Edit the trip to add library guns or rental notes." />
        ) : (
          tripWeapons.map((tw, i) => {
            const linked = tw.weapon_id ? weaponMap[tw.weapon_id] : null;
            const name = linked?.name ?? 'Ad-hoc / unlisted';
            const category = linked?.category ?? 'other';
            const sub = [
              tw.possession,
              tw.rental_note?.trim(),
              tw.rounds_fired > 0 ? `${tw.rounds_fired} rounds` : null,
            ]
              .filter(Boolean)
              .join(' · ');
            return (
              <View key={tw.id}>
                <WeaponListRow
                  name={name}
                  category={category}
                  subtitle={sub || tw.possession}
                  showChevron={false}
                  showCategoryPill={Boolean(linked)}
                />
                {i < tripWeapons.length - 1 ? <ListDivider /> : null}
              </View>
            );
          })
        )}
      </Card>

      <ButtonRow>
        <OutlineButton label="Edit trip" fullWidth onPress={() => router.push(`/trip/edit/${trip.id}`)} />
      </ButtonRow>

      <SectionHeader title="Add target" />
      <ButtonRow>
        <PrimaryButton label="Take photo" fullWidth onPress={pickCamera} />
        <SecondaryButton label="From gallery" fullWidth onPress={pickLibrary} />
        <OutlineButton label="Use B-27 sample" fullWidth onPress={useReferenceSample} />
      </ButtonRow>

      <SectionHeader title="Targets on this trip" />
      <Card>
        {targets.length === 0 ? (
          <EmptyState title="No targets yet" hint="Capture or import a target photo above." />
        ) : (
          targets.map((item, i) => (
            <View key={item.id}>
              <View style={styles.targetRow}>
                <Image source={{ uri: resolvePhotoUri(item.file_path) }} style={styles.thumb} />
                <View style={styles.targetMeta}>
                  <Text style={styles.targetStatus}>{item.scoring_status}</Text>
                  <Text style={styles.targetTemplate}>{item.target_template}</Text>
                  <ButtonRow layout="row">
                    <OutlineButton label="Details" onPress={() => router.push(`/target/${item.id}`)} />
                    <SecondaryButton label="Score" onPress={() => router.push(`/target/score/${item.id}`)} />
                  </ButtonRow>
                </View>
              </View>
              {i < targets.length - 1 ? <ListDivider /> : null}
            </View>
          ))
        )}
      </Card>

      <SectionHeader title="Danger zone" />
      <DangerButton label="Delete trip" fullWidth onPress={removeTrip} />
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  cardPad: { padding: 14, gap: 6 },
  notesLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', color: AppColors.textMuted },
  notesBody: { fontSize: 15, lineHeight: 22, color: AppColors.textPrimary },
  targetRow: { flexDirection: 'row', gap: 10, padding: 10, alignItems: 'flex-start' },
  thumb: { width: 72, height: 96, borderRadius: 6, backgroundColor: AppColors.surfaceRaised },
  targetMeta: { flex: 1, gap: 8, minWidth: 0 },
  targetStatus: { fontSize: 16, fontWeight: '700', color: AppColors.textPrimary },
  targetTemplate: { fontSize: 13, color: AppColors.textMuted },
});
