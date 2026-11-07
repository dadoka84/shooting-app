import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedTextInput } from '@/components/ThemedTextInput';
import { AppColors } from '@/constants/theme';

const PRESETS = [50, 100, 150, 200] as const;

type RoundsFiredPickerProps = {
  value: number;
  onChange: (n: number) => void;
  labels: {
    roundsFired: string;
    custom: string;
  };
};

export function RoundsFiredPicker({ value, onChange, labels }: RoundsFiredPickerProps) {
  const presetSet = new Set<number>(PRESETS);
  const [customMode, setCustomMode] = useState(!presetSet.has(value));
  const [customText, setCustomText] = useState(customMode ? String(value) : '');

  const pickPreset = (n: number) => {
    setCustomMode(false);
    onChange(n);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{labels.roundsFired}</Text>
      <View style={styles.row}>
        {PRESETS.map((n) => {
          const active = !customMode && value === n;
          return (
            <Pressable
              key={n}
              onPress={() => pickPreset(n)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{n}</Text>
            </Pressable>
          );
        })}
        <Pressable
          onPress={() => setCustomMode(true)}
          style={[styles.chip, customMode && styles.chipActive]}
        >
          <Text style={[styles.chipText, customMode && styles.chipTextActive]}>{labels.custom}</Text>
        </Pressable>
      </View>
      {customMode ? (
        <ThemedTextInput
          value={customText}
          onChangeText={(v) => {
            setCustomText(v);
            const parsed = parseInt(v, 10);
            if (!Number.isNaN(parsed) && parsed >= 0) onChange(parsed);
          }}
          keyboardType="number-pad"
          placeholder="0"
          style={styles.customInput}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginTop: 8 },
  label: { fontWeight: '600', color: AppColors.textPrimary, fontSize: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: AppColors.surfaceRaised,
  },
  chipActive: {
    backgroundColor: AppColors.accentOliveBright,
    borderColor: AppColors.accentBrass,
  },
  chipText: { fontWeight: '700', color: AppColors.textMuted, fontSize: 14 },
  chipTextActive: { color: AppColors.textInverse },
  customInput: { marginTop: 4 },
});
