import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Asset } from 'expo-asset';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Image, ScrollView, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { PrimaryButton, ScreenScroll } from '@/components/ui';
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

  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <ScreenScroll>
        <Text style={styles.title}>{locationName || 'Trip'}</Text>
        <Text>{new Date(trip.started_at).toLocaleString()}</Text>
        {trip.notes ? <Text>{trip.notes}</Text> : null}

        <Text style={styles.section}>Weapons</Text>
        {tripWeapons.length === 0 ? (
          <Text>No weapons linked.</Text>
        ) : (
          tripWeapons.map((tw) => (
            <Text key={tw.id}>
              {tw.possession}
              {tw.weapon_id && weaponMap[tw.weapon_id]
                ? ` · ${weaponMap[tw.weapon_id].name}`
                : ''}
              {tw.rental_note ? ` · ${tw.rental_note}` : ''}
            </Text>
          ))
        )}

        <PrimaryButton label="Edit trip" onPress={() => router.push(`/trip/edit/${trip.id}`)} />

        <Text style={styles.section}>Targets</Text>
        <PrimaryButton label="Camera" onPress={pickCamera} />
        <PrimaryButton label="Import from gallery" onPress={pickLibrary} />
        <PrimaryButton label="Use B-27 reference sample" onPress={useReferenceSample} />

        <FlatList
          data={targets}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ListEmptyComponent={<Text>No targets yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.targetRow}>
              <Image source={{ uri: resolvePhotoUri(item.file_path) }} style={styles.thumb} />
              <View style={styles.targetMeta}>
                <Text onPress={() => router.push(`/target/${item.id}`)}>
                  {item.scoring_status} · tap for detail
                </Text>
                <Text onPress={() => router.push(`/target/score/${item.id}`)} style={styles.link}>
                  Score / correct
                </Text>
              </View>
            </View>
          )}
        />

        <PrimaryButton label="Delete trip" onPress={removeTrip} />
      </ScreenScroll>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pad: { flexGrow: 1 },
  title: { fontSize: 22, fontWeight: '700' },
  section: { fontSize: 18, fontWeight: '600', marginTop: 12 },
  targetRow: { flexDirection: 'row', gap: 10, marginTop: 10, alignItems: 'center' },
  thumb: { width: 72, height: 96, borderRadius: 6, backgroundColor: AppColors.surfaceRaised },
  targetMeta: { flex: 1, gap: 6 },
  link: { color: AppColors.accentBrass, fontWeight: '700' },
});
