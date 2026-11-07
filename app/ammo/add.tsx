import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { AmmoQuantityField } from '@/components/ammo/AmmoQuantityField';
import { AmmoTypePicker } from '@/components/ammo/AmmoTypePicker';
import { CaliberPicker } from '@/components/ammo/CaliberPicker';
import { ManufacturerPicker } from '@/components/ammo/ManufacturerPicker';
import { PurchaseDatePicker } from '@/components/ammo/PurchaseDatePicker';
import { PrimaryButton, ScreenIntro, ScreenScroll } from '@/components/ui';
import { AppColors } from '@/constants/theme';
import type { AmmoTypeId } from '@/lib/ammo/ammoTypes';
import type { CaliberPick } from '@/lib/ammo/calibers';
import { resolveStoredCaliber } from '@/lib/ammo/caliberMatch';
import { resolveManufacturerLabel, type ManufacturerPick } from '@/lib/ammo/manufacturers';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { createAmmoLot } from '@/lib/db/ammoRepository';
import { useI18n } from '@/lib/i18n/I18nProvider';

export default function AddAmmoScreen() {
  const { db, bumpRefresh } = useDatabase();
  const router = useRouter();
  const { t } = useI18n();

  const [quantity, setQuantity] = useState(50);
  const [quantityText, setQuantityText] = useState('50');
  const [caliberPick, setCaliberPick] = useState<CaliberPick>('9mm');
  const [caliberCustom, setCaliberCustom] = useState('');
  const [ammoType, setAmmoType] = useState<AmmoTypeId>('fmj');
  const [manufacturerPick, setManufacturerPick] = useState<ManufacturerPick>('snb');
  const [manufacturerCustom, setManufacturerCustom] = useState('');
  const [purchaseDateMs, setPurchaseDateMs] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const caliber = resolveStoredCaliber(caliberPick, caliberCustom);
    if (!caliber) {
      Alert.alert(t('ammo.caliberRequired'));
      return;
    }
    const manufacturer = resolveManufacturerLabel(manufacturerPick, manufacturerCustom);
    if (!manufacturer) {
      Alert.alert(t('ammo.manufacturerRequired'));
      return;
    }
    const qty = quantity;
    if (!Number.isFinite(qty) || qty <= 0) {
      Alert.alert(t('ammo.quantityInvalid'));
      return;
    }

    setSaving(true);
    try {
      await createAmmoLot(db, {
        caliber,
        ammo_type: ammoType,
        manufacturer,
        quantity: qty,
        purchased_at: purchaseDateMs,
      });
      bumpRefresh();
      router.back();
    } catch {
      Alert.alert(t('ammo.saveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenScroll>
      <ScreenIntro title={t('ammo.addTitle')} description={t('ammo.addHint')} />

      <Text style={styles.label}>{t('ammo.quantity')}</Text>
      <AmmoQuantityField
        quantityText={quantityText}
        onQuantityTextChange={setQuantityText}
        onQuantityNumber={setQuantity}
      />

      <Text style={styles.label}>{t('ammo.caliber')}</Text>
      <CaliberPicker
        pick={caliberPick}
        onPickChange={setCaliberPick}
        customText={caliberCustom}
        onCustomTextChange={setCaliberCustom}
      />

      <Text style={styles.label}>{t('ammo.type')}</Text>
      <AmmoTypePicker value={ammoType} onChange={setAmmoType} />

      <Text style={styles.label}>{t('ammo.manufacturer')}</Text>
      <ManufacturerPicker
        pick={manufacturerPick}
        onPickChange={setManufacturerPick}
        customText={manufacturerCustom}
        onCustomTextChange={setManufacturerCustom}
      />

      <Text style={styles.label}>{t('ammo.purchaseDate')}</Text>
      <PurchaseDatePicker valueMs={purchaseDateMs} onChange={setPurchaseDateMs} />

      <PrimaryButton
        label={saving ? t('common.saving') : t('ammo.saveStock')}
        fullWidth
        onPress={save}
        disabled={saving}
      />
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: '600', marginTop: 12, color: AppColors.textPrimary },
});
