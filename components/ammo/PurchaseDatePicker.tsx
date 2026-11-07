import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { formatPurchaseDateDdMmYyyy } from '@/lib/dates/purchaseDate';

export function PurchaseDatePicker({
  valueMs,
  onChange,
}: {
  valueMs: number | null;
  onChange: (ms: number | null) => void;
}) {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  const display = valueMs != null ? formatPurchaseDateDdMmYyyy(valueMs) : t('ammo.purchaseDateEmpty');

  const onPickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    if (event.type === 'dismissed') {
      return;
    }
    if (date) {
      const noon = new Date(date);
      noon.setHours(12, 0, 0, 0);
      onChange(noon.getTime());
    }
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => setShow(true)}
        style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}
      >
        <Text style={[styles.triggerText, valueMs == null && styles.placeholder]}>{display}</Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>
      {valueMs != null ? (
        <Pressable onPress={() => onChange(null)} hitSlop={8}>
          <Text style={styles.clear}>{t('ammo.purchaseDateClear')}</Text>
        </Pressable>
      ) : null}
      {show ? (
        <View style={styles.pickerWrap}>
          <DateTimePicker
            value={valueMs != null ? new Date(valueMs) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onPickerChange}
            maximumDate={new Date()}
          />
          {Platform.OS === 'ios' ? (
            <Pressable onPress={() => setShow(false)} style={styles.iosDone}>
              <Text style={styles.iosDoneText}>{t('ammo.selectDone')}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, marginTop: 4 },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: AppColors.surfaceRaised,
    gap: 8,
  },
  triggerPressed: { opacity: 0.9 },
  triggerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  placeholder: { color: AppColors.textMuted, fontWeight: '500' },
  chevron: { fontSize: 14, color: AppColors.accentBrass },
  clear: {
    alignSelf: 'flex-start',
    color: AppColors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  pickerWrap: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.border,
    overflow: 'hidden',
    backgroundColor: AppColors.surfaceRaised,
  },
  iosDone: {
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderSubtle,
  },
  iosDoneText: {
    fontWeight: '700',
    color: AppColors.accentBrass,
    fontSize: 15,
  },
});
