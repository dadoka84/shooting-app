import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedTextInput } from '@/components/ThemedTextInput';
import { AppColors } from '@/constants/theme';
import { useI18n } from '@/lib/i18n/I18nProvider';
import {
  CUSTOM_MANUFACTURER_ID,
  KNOWN_AMMO_MANUFACTURERS,
  type KnownManufacturerId,
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

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {KNOWN_AMMO_MANUFACTURERS.map((m) => (
          <Chip
            key={m.id}
            label={m.label}
            active={pick === m.id}
            onPress={() => onPickChange(m.id as KnownManufacturerId)}
          />
        ))}
        <Chip
          label={t('ammo.manufacturerCustom')}
          active={pick === CUSTOM_MANUFACTURER_ID}
          onPress={() => onPickChange(CUSTOM_MANUFACTURER_ID)}
        />
      </View>
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

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.chipPressed]}
    >
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: AppColors.surfaceRaised,
  },
  chipActive: {
    backgroundColor: AppColors.accentOliveBright,
    borderColor: AppColors.accentBrass,
  },
  chipPressed: { opacity: 0.9 },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.textMuted,
  },
  chipLabelActive: {
    color: AppColors.textInverse,
  },
});
