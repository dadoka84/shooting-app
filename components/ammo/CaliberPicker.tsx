import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedTextInput } from '@/components/ThemedTextInput';
import { AppColors } from '@/constants/theme';
import { useI18n } from '@/lib/i18n/I18nProvider';
import {
  COMMON_CALIBERS,
  CUSTOM_CALIBER_ID,
  type CaliberPick,
  type CommonCaliberId,
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

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {COMMON_CALIBERS.map((c) => (
          <Chip
            key={c.id}
            label={c.label}
            active={pick === c.id}
            onPress={() => onPickChange(c.id as CommonCaliberId)}
          />
        ))}
        <Chip
          label={t('ammo.caliberCustom')}
          active={pick === CUSTOM_CALIBER_ID}
          onPress={() => onPickChange(CUSTOM_CALIBER_ID)}
        />
      </View>
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
