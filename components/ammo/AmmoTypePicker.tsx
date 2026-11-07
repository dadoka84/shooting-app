import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';
import { AMMO_TYPES, type AmmoTypeId } from '@/lib/ammo/ammoTypes';
import { useI18n } from '@/lib/i18n/I18nProvider';

export function AmmoTypePicker({
  value,
  onChange,
}: {
  value: AmmoTypeId;
  onChange: (id: AmmoTypeId) => void;
}) {
  const { t } = useI18n();

  return (
    <View style={styles.row}>
      {AMMO_TYPES.map((type) => {
        const active = value === type.id;
        return (
          <Pressable
            key={type.id}
            onPress={() => onChange(type.id)}
            style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.chipPressed]}
          >
            <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{t(type.labelKey)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
