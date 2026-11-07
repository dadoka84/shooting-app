import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { AmmoTypePicker } from '@/components/ammo/AmmoTypePicker';
import { CaliberPicker } from '@/components/ammo/CaliberPicker';
import { ManufacturerPicker } from '@/components/ammo/ManufacturerPicker';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { PrimaryButton, ScreenIntro, ScreenScroll } from '@/components/ui';
import { AppColors } from '@/constants/theme';
import type { AmmoTypeId } from '@/lib/ammo/ammoTypes';
import type { CaliberPick } from '@/lib/ammo/calibers';
import { resolveStoredCaliber } from '@/lib/ammo/caliberMatch';
import { resolveManufacturerLabel, type ManufacturerPick } from '@/lib/ammo/manufacturers';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { createAmmoLot, parsePurchaseDateInput } from '@/lib/db/ammoRepository';
import { useI18n } from '@/lib/i18n/I18nProvider';

export default function AddAmmoScreen() {
  const { db, bumpRefresh } = useDatabase();
  const router = useRouter();
  const { t } = useI18n();

  const [quantity, setQuantity] = useState('50');
  const [caliberPick, setCaliberPick] = useState<CaliberPick>('9mm');
  const [caliberCustom, setCaliberCustom] = useState('');
  const [ammoType, setAmmoType] = useState<AmmoTypeId>('fmj');
  const [manufacturerPick, setManufacturerPick] = useState<ManufacturerPick>('snb');
  const [manufacturerCustom, setManufacturerCustom] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
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
    const qty = Number.parseInt(quantity, 10);
    if (!Number.isFinite(qty) || qty <= 0) {
      Alert.alert(t('ammo.quantityInvalid'));
      return;
    }
    const purchased = parsePurchaseDateInput(purchaseDate);
    if (purchaseDate.trim() && purchased === null) {
      Alert.alert(t('ammo.dateInvalid'));
      return;
    }

    setSaving(true);
    try {
      await createAmmoLot(db, {
        caliber,
        ammo_type: ammoType,
        manufacturer,
        quantity: qty,
        purchased_at: purchased,
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

      <Field label={t('ammo.quantity')} value={quantity} onChangeText={setQuantity} keyboardType="number-pad" />

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

      <Field
        label={t('ammo.purchaseDate')}
        value={purchaseDate}
        onChangeText={setPurchaseDate}
        placeholder={t('ammo.purchaseDatePlaceholder')}
      />

      <PrimaryButton
        label={saving ? t('common.saving') : t('ammo.saveStock')}
        fullWidth
        onPress={save}
        disabled={saving}
      />
    </ScreenScroll>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad';
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <ThemedTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
      />
    </>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: '600', marginTop: 12, color: AppColors.textPrimary },
});
