import * as Location from 'expo-location';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, type MapPressEvent, type Region } from 'react-native-maps';

import { AppColors } from '@/constants/theme';
import { useI18n } from '@/lib/i18n/I18nProvider';

const DEFAULT_REGION: Region = {
  latitude: 43.8564,
  longitude: 18.4131,
  latitudeDelta: 0.45,
  longitudeDelta: 0.45,
};

type Props = {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number | null, lng: number | null) => void;
};

export function RangeMapPicker({ latitude, longitude, onChange }: Props) {
  const { t } = useI18n();
  const [locating, setLocating] = useState(false);

  const region = useMemo<Region>(() => {
    if (latitude != null && longitude != null) {
      return {
        latitude,
        longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      };
    }
    return DEFAULT_REGION;
  }, [latitude, longitude]);

  const onMapPress = useCallback(
    (e: MapPressEvent) => {
      const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
      onChange(lat, lng);
    },
    [onChange],
  );

  const useMyLocation = useCallback(async () => {
    setLocating(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(t('range.locationDeniedTitle'), t('range.locationDeniedBody'));
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      onChange(pos.coords.latitude, pos.coords.longitude);
    } catch {
      Alert.alert(t('range.locationErrorTitle'), t('range.locationErrorBody'));
    } finally {
      setLocating(false);
    }
  }, [onChange, t]);

  return (
    <View style={styles.root}>
      <Text style={styles.hint}>{t('range.mapHint')}</Text>
      <View style={styles.mapShell}>
        <MapView style={styles.map} initialRegion={region} region={region} onPress={onMapPress}>
          {latitude != null && longitude != null ? (
            <Marker
              coordinate={{ latitude, longitude }}
              draggable
              onDragEnd={(e) => {
                const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
                onChange(lat, lng);
              }}
            />
          ) : null}
        </MapView>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={useMyLocation} disabled={locating} style={styles.actionBtn}>
          <Text style={styles.actionText}>
            {locating ? t('range.locating') : t('range.useMyLocation')}
          </Text>
        </Pressable>
        {latitude != null && longitude != null ? (
          <Pressable onPress={() => onChange(null, null)} style={styles.clearBtn}>
            <Text style={styles.clearText}>{t('range.clearPin')}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 8 },
  hint: { color: AppColors.textMuted, fontSize: 13, lineHeight: 18 },
  mapShell: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  map: { flex: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center' },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: AppColors.accentOlive,
    borderWidth: 1,
    borderColor: AppColors.accentBrassDim,
  },
  actionText: { color: AppColors.accentBrass, fontWeight: '700', fontSize: 13 },
  clearBtn: { paddingVertical: 6 },
  clearText: { color: AppColors.textMuted, fontWeight: '600', fontSize: 13 },
});
