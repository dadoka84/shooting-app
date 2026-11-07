import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { SelectField } from '@/components/SelectField';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { useI18n } from '@/lib/i18n/I18nProvider';
import {
  COMMON_CALIBERS,
  CUSTOM_CALIBER_ID,
  type CaliberPick,
} from '@/lib/ammo/calibers';

export function CaliberPicker({
  pick,
  onPickChange,
  customText,
  onCustomTextChange,
}: {
  pick: CaliberPick;
  onPickChange: (p: CaliberPick) => void;
  customText: string;
  onCustomTextChange: (v: string) => void;
}) {
  const { t } = useI18n();

  const options = useMemo(
    () => [
      ...COMMON_CALIBERS.map((c) => ({ value: c.id as CaliberPick, label: c.label })),
      { value: CUSTOM_CALIBER_ID as CaliberPick, label: t('ammo.caliberCustom') },
    ],
    [t],
  );

  return (
    <View style={styles.wrap}>
      <SelectField
        value={pick}
        onChange={onPickChange}
        options={options}
        placeholder={t('ammo.caliberSelect')}
      />
      {pick === CUSTOM_CALIBER_ID ? (
        <ThemedTextInput
          value={customText}
          onChangeText={onCustomTextChange}
          placeholder={t('ammo.caliberCustomPlaceholder')}
          autoCapitalize="characters"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
});
