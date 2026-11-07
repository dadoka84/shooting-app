import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { SelectField } from '@/components/SelectField';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { useI18n } from '@/lib/i18n/I18nProvider';
import {
  CUSTOM_MANUFACTURER_ID,
  KNOWN_AMMO_MANUFACTURERS,
  type ManufacturerPick,
} from '@/lib/ammo/manufacturers';

export function ManufacturerPicker({
  pick,
  onPickChange,
  customText,
  onCustomTextChange,
}: {
  pick: ManufacturerPick;
  onPickChange: (p: ManufacturerPick) => void;
  customText: string;
  onCustomTextChange: (v: string) => void;
}) {
  const { t } = useI18n();

  const options = useMemo(
    () => [
      ...KNOWN_AMMO_MANUFACTURERS.map((m) => ({
        value: m.id as ManufacturerPick,
        label: m.label,
      })),
      { value: CUSTOM_MANUFACTURER_ID as ManufacturerPick, label: t('ammo.manufacturerCustom') },
    ],
    [t],
  );

  return (
    <View style={styles.wrap}>
      <SelectField
        value={pick}
        onChange={onPickChange}
        options={options}
        placeholder={t('ammo.manufacturerSelect')}
      />
      {pick === CUSTOM_MANUFACTURER_ID ? (
        <ThemedTextInput
          value={customText}
          onChangeText={onCustomTextChange}
          placeholder={t('ammo.manufacturerCustomPlaceholder')}
          autoCapitalize="words"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
});
