import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedTextInput } from '@/components/ThemedTextInput';
import { PrimaryButton, ScreenIntro, ScreenScroll } from '@/components/ui';
import { AppColors } from '@/constants/theme';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { InsufficientAmmoError, listAmmoByCaliber, reduceAmmoByCaliber } from '@/lib/db/ammoRepository';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { AmmoCaliberSummary } from '@/lib/types';

export default function ReduceAmmoScreen() {
  const { db, bumpRefresh, refreshKey } = useDatabase();
  const router = useRouter();
  const { t } = useI18n();

  const [rows, setRows] = useState<AmmoCaliberSummary[]>([]);
  const [selectedCaliber, setSelectedCaliber] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('25');
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        const list = await listAmmoByCaliber(db);
        setRows(list);
        setSelectedCaliber((prev) => {
          if (prev && list.some((r) => r.caliber === prev)) return prev;
          return list[0]?.caliber ?? null;
        });
      })();
    }, [db, refreshKey]),
  );

  const selectedRow = rows.find((r) => r.caliber === selectedCaliber);

  const save = async () => {
    if (!selectedCaliber) {
      Alert.alert(t('ammo.caliberRequired'));
      return;
    }
    const qty = Number.parseInt(quantity, 10);
    if (!Number.isFinite(qty) || qty <= 0) {
      Alert.alert(t('ammo.quantityInvalid'));
      return;
    }
    setSaving(true);
    try {
      await reduceAmmoByCaliber(db, selectedCaliber, qty);
      bumpRefresh();
      router.back();
    } catch (e) {
      if (e instanceof InsufficientAmmoError) {
        Alert.alert(t('ammo.insufficientTitle'), t('ammo.insufficientBody', { available: e.available }));
      } else {
        Alert.alert(t('ammo.saveError'));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenScroll>
      <ScreenIntro title={t('ammo.reduceTitle')} description={t('ammo.reduceHint')} />

      <Text style={styles.label}>{t('ammo.caliber')}</Text>
      {rows.length === 0 ? (
        <Text style={styles.muted}>{t('ammo.reduceNoStock')}</Text>
      ) : (
        <View style={styles.row}>
          {rows.map((r) => {
            const active = r.caliber === selectedCaliber;
            return (
              <Pressable
                key={r.caliber}
                onPress={() => setSelectedCaliber(r.caliber)}
                style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.chipPressed]}
              >
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{r.caliber}</Text>
                <Text style={[styles.chipSub, active && styles.chipLabelActive]}>
                  {t('weapons.ammoRowSub', { count: r.quantity })}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {selectedRow ? (
        <Text style={styles.avail}>{t('ammo.available', { count: selectedRow.quantity })}</Text>
      ) : null}

      <Text style={styles.label}>{t('ammo.quantityReduce')}</Text>
      <ThemedTextInput value={quantity} onChangeText={setQuantity} keyboardType="number-pad" />

      <PrimaryButton
        label={saving ? t('common.saving') : t('ammo.confirmReduce')}
        fullWidth
        onPress={save}
        disabled={saving || rows.length === 0}
      />
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: '600', marginTop: 12, color: AppColors.textPrimary },
  muted: { color: AppColors.textMuted, marginTop: 6 },
  avail: { marginTop: 8, color: AppColors.textMuted, fontSize: 13 },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: AppColors.surfaceRaised,
    gap: 2,
  },
  chipActive: {
    backgroundColor: AppColors.accentOliveBright,
    borderColor: AppColors.accentBrass,
  },
  chipPressed: { opacity: 0.9 },
  chipLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  chipSub: {
    fontSize: 12,
    color: AppColors.textMuted,
  },
  chipLabelActive: {
    color: AppColors.textInverse,
  },
});
