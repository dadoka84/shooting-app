import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedTextInput } from '@/components/ThemedTextInput';
import { AppColors } from '@/constants/theme';
import { useI18n } from '@/lib/i18n/I18nProvider';

export const AMMO_BOX_SIZE = 50;
const BOX_CYCLE = [50, 100, 150, 200] as const;

export function cycleBoxQuantity(current: number): number {
  const idx = BOX_CYCLE.indexOf(current as (typeof BOX_CYCLE)[number]);
  if (idx >= 0) {
    return BOX_CYCLE[(idx + 1) % BOX_CYCLE.length];
  }
  return AMMO_BOX_SIZE;
}

export function AmmoQuantityField({
  quantityText,
  onQuantityTextChange,
  onQuantityNumber,
}: {
  quantityText: string;
  onQuantityTextChange: (v: string) => void;
  onQuantityNumber: (n: number) => void;
}) {
  const { t } = useI18n();

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <ThemedTextInput
          style={styles.input}
          value={quantityText}
          onChangeText={(v) => {
            onQuantityTextChange(v);
            const parsed = Number.parseInt(v, 10);
            if (Number.isFinite(parsed) && parsed >= 0) {
              onQuantityNumber(parsed);
            }
          }}
          keyboardType="number-pad"
          placeholder="0"
        />
        <Pressable
          onPress={() => {
            const parsed = Number.parseInt(quantityText, 10);
            const base = Number.isFinite(parsed) ? parsed : AMMO_BOX_SIZE;
            const next = cycleBoxQuantity(base);
            onQuantityTextChange(String(next));
            onQuantityNumber(next);
          }}
          style={({ pressed }) => [styles.boxBtn, pressed && styles.boxBtnPressed]}
        >
          <Text style={styles.boxBtnTitle}>{t('ammo.boxButton')}</Text>
          <Text style={styles.boxBtnSub}>{t('ammo.boxButtonSub', { size: AMMO_BOX_SIZE })}</Text>
        </Pressable>
      </View>
      <Text style={styles.hint}>{t('ammo.boxCycleHint')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'stretch', gap: 10 },
  input: { flex: 1, marginTop: 0 },
  boxBtn: {
    minWidth: 108,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.accentBrass,
    backgroundColor: AppColors.accentOliveBright,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxBtnPressed: { opacity: 0.9 },
  boxBtnTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: AppColors.textInverse,
  },
  boxBtnSub: {
    fontSize: 11,
    fontWeight: '600',
    color: AppColors.textInverse,
    opacity: 0.9,
    marginTop: 2,
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: AppColors.textMuted,
    lineHeight: 16,
  },
});
