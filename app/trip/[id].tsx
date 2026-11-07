import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Asset } from 'expo-asset';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { WeaponListRow } from '@/components/weapons/WeaponListRow';
import {
  ButtonRow,
  Card,
  ContextBanner,
  DangerButton,
  EmptyState,
  ListDivider,
  ListRow,
  OutlineButton,
  PrimaryButton,
  ScreenIntro,
  ScreenScroll,
  SecondaryButton,
  SectionHeader,
} from '@/components/ui';
import { AppColors } from '@/constants/theme';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { possessionStringKey } from '@/lib/i18n/possession';
import { listTripAmmoDeductions, type TripAmmoDeduction } from '@/lib/db/ammoRepository';
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
import { isTripCompleted, tripEndedAtMs } from '@/lib/trips/status';
import type { ScoringStatus, TargetImage, Trip, TripWeapon, Weapon } from '@/lib/types';

export default function TripDetailScreen() {
  const { id, saved, name: savedName } = useLocalSearchParams<{
    id: string;
    saved?: string;
    name?: string;
  }>();
  const { db, bumpRefresh, refreshKey } = useDatabase();
  const { t } = useI18n();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [locationName, setLocationName] = useState('');
  const [tripWeapons, setTripWeapons] = useState<TripWeapon[]>([]);
  const [weaponMap, setWeaponMap] = useState<Record<string, Weapon>>({});
  const [targets, setTargets] = useState<TargetImage[]>([]);
  const [ammoFromBox, setAmmoFromBox] = useState<TripAmmoDeduction[]>([]);
  const [showSavedBanner, setShowSavedBanner] = useState(saved === '1');

  useEffect(() => {
    setShowSavedBanner(saved === '1');
  }, [saved]);

  const load = useCallback(async () => {
    if (!id) return;
    const tripRow = await getTrip(db, id);
    setTrip(tripRow);
    const loc = await getTripLocation(db, id);
    setLocationName(loc?.display_name ?? '');
    setTripWeapons(await listTripWeapons(db, id));
    setTargets(await listTargetsForTrip(db, id));
    setAmmoFromBox(await listTripAmmoDeductions(db, id));
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
    const target = await createTargetFromPhoto(db, { trip_id: id, sourceUri: uri });
    bumpRefresh();
    const tripLabel = locationName.trim() || t('common.unknownRange');
    router.push({
      pathname: '/target/[id]',
      params: { id: target.id, added: '1', tripName: tripLabel },
    });
  };

  const pickCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('target.cameraPerm'));
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
      Alert.alert(t('target.galleryPerm'));
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
    Alert.alert(t('trip.deleteTitle'), t('trip.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
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
        <Text>{t('common.loading')}</Text>
      </ScreenScroll>
    );
  }

  const started = new Date(trip.started_at).toLocaleString();
  const ended = isTripCompleted(trip) ? new Date(tripEndedAtMs(trip)).toLocaleString() : null;
  const tripRoundsTotal = tripWeapons.reduce((sum, tw) => sum + (tw.rounds_fired ?? 0), 0);
  const displayName = locationName.trim() || t('common.unknownRange');

  return (
    <ScreenScroll>
      {showSavedBanner ? (
        <ContextBanner
          title={t('flow.tripSavedTitle')}
          body={t('flow.tripSavedBody', { name: savedName?.trim() || displayName })}
        />
      ) : null}

      <ScreenIntro
        title={displayName}
        description={[
          t('trip.viewingTrip'),
          started,
          isTripCompleted(trip) && ended
            ? t('trip.ended', { when: ended })
            : t('home.inProgress'),
          trip.discipline_tag?.trim(),
          tripRoundsTotal > 0 ? t('trip.roundsOnTrip', { count: tripRoundsTotal }) : null,
        ]
          .filter(Boolean)
          .join(' · ')}
      />

      {trip.notes?.trim() ? (
        <Card>
          <View style={styles.cardPad}>
            <Text style={styles.notesLabel}>{t('common.notes')}</Text>
            <Text style={styles.notesBody}>{trip.notes}</Text>
          </View>
        </Card>
      ) : null}

      <SectionHeader title={t('trip.weaponsOnTrip')} />
      <Card>
        {tripWeapons.length === 0 ? (
          <EmptyState title={t('trip.noWeapons')} hint={t('trip.noWeaponsHint')} />
        ) : (
          tripWeapons.map((tw, i) => {
            const linked = tw.weapon_id ? weaponMap[tw.weapon_id] : null;
            const weaponName = linked?.name ?? t('trip.adHocWeapon');
            const category = linked?.category ?? 'other';
            const sub = [
              t(possessionStringKey(tw.possession)),
              tw.rental_note?.trim(),
              tw.rounds_fired > 0 ? t('trip.roundsCount', { count: tw.rounds_fired }) : null,
            ]
              .filter(Boolean)
              .join(' · ');
            return (
              <View key={tw.id}>
                <WeaponListRow
                  name={weaponName}
                  category={category}
                  subtitle={sub}
                  showChevron={false}
                  showCategoryPill={Boolean(linked)}
                />
                {i < tripWeapons.length - 1 ? <ListDivider /> : null}
              </View>
            );
          })
        )}
      </Card>

      {ammoFromBox.length > 0 ? (
        <>
          <SectionHeader title={t('trip.ammoFromBox')} />
          <Card>
            {ammoFromBox.map((row, i) => (
              <View key={row.caliber}>
                <ListRow
                  title={row.caliber}
                  subtitle={t('weapons.ammoRowSub', { count: row.rounds })}
                  showChevron={false}
                />
                {i < ammoFromBox.length - 1 ? <ListDivider /> : null}
              </View>
            ))}
          </Card>
        </>
      ) : null}

      <ButtonRow>
        <OutlineButton label={t('trip.editTrip')} fullWidth onPress={() => router.push(`/trip/edit/${trip.id}`)} />
      </ButtonRow>

      <SectionHeader title={t('trip.addTarget')} />
      <ButtonRow>
        <PrimaryButton label={t('trip.takePhoto')} fullWidth onPress={pickCamera} />
        <SecondaryButton label={t('trip.fromGallery')} fullWidth onPress={pickLibrary} />
        <OutlineButton label={t('trip.useSample')} fullWidth onPress={useReferenceSample} />
      </ButtonRow>

      <SectionHeader title={t('trip.targetsOnTrip')} />
      <Card>
        {targets.length === 0 ? (
          <EmptyState title={t('trip.noTargets')} hint={t('trip.noTargetsHint')} />
        ) : (
          targets.map((item, i) => (
            <View key={item.id}>
              <View style={styles.targetRow}>
                <Image source={{ uri: resolvePhotoUri(item.file_path) }} style={styles.thumb} />
                <View style={styles.targetMeta}>
                  <Text style={styles.targetStatus}>{scoringStatusLabel(item.scoring_status, t)}</Text>
                  <Text style={styles.targetTemplate}>
                    {item.target_template === 'baker_sl_b27e_v1' ? t('template.b27') : item.target_template}
                  </Text>
                  <ButtonRow layout="row">
                    <OutlineButton label={t('common.details')} onPress={() => router.push(`/target/${item.id}`)} />
                    <SecondaryButton label={t('common.score')} onPress={() => router.push(`/target/score/${item.id}`)} />
                  </ButtonRow>
                </View>
              </View>
              {i < targets.length - 1 ? <ListDivider /> : null}
            </View>
          ))
        )}
      </Card>

      <SectionHeader title={t('common.dangerZone')} />
      <DangerButton label={t('common.delete')} fullWidth onPress={removeTrip} />
    </ScreenScroll>
  );
}

function scoringStatusLabel(
  status: ScoringStatus,
  t: ReturnType<typeof useI18n>['t'],
): string {
  if (status === 'pending') return t('target.statusPending');
  if (status === 'confirmed') return t('target.statusConfirmed');
  return t('target.statusScored');
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
