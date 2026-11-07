import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppColors } from '@/constants/theme';
import { useI18n } from '@/lib/i18n/I18nProvider';

export type SelectOption<T extends string> = { value: T; label: string };

export function SelectField<T extends string>({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  compact,
  style,
}: {
  value: T;
  onChange: (v: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => options.find((o) => o.value === value), [options, value]);
  const display = selected?.label ?? placeholder ?? t('ammo.selectPlaceholder');

  return (
    <>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          compact && styles.triggerCompact,
          disabled && styles.triggerDisabled,
          pressed && !disabled && styles.triggerPressed,
          style,
        ]}
        accessibilityRole="button"
      >
        <Text
          style={[
            styles.triggerText,
            compact && styles.triggerTextCompact,
            !selected && styles.placeholder,
          ]}
          numberOfLines={1}
        >
          {display}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
          <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{placeholder ?? t('ammo.selectPlaceholder')}</Text>
            <Pressable onPress={() => setOpen(false)} hitSlop={8}>
              <Text style={styles.done}>{t('ammo.selectDone')}</Text>
            </Pressable>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            style={styles.list}
            renderItem={({ item }: ListRenderItemInfo<SelectOption<T>>) => {
              const active = item.value === value;
              return (
                <Pressable
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.row,
                    active && styles.rowActive,
                    pressed && styles.rowPressed,
                  ]}
                >
                  <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>{item.label}</Text>
                  {active ? <Text style={styles.check}>✓</Text> : null}
                </Pressable>
              );
            }}
          />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
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
    marginTop: 4,
    gap: 8,
  },
  triggerCompact: {
    marginTop: 0,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  triggerTextCompact: {
    fontSize: 13,
    fontWeight: '600',
  },
  triggerDisabled: { opacity: 0.45 },
  triggerPressed: { opacity: 0.9 },
  triggerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  placeholder: { color: AppColors.textMuted, fontWeight: '500' },
  chevron: { fontSize: 14, color: AppColors.accentBrass },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: AppColors.overlayDark,
  },
  sheet: {
    maxHeight: '55%',
    backgroundColor: AppColors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderSubtle,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  done: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.accentBrass,
  },
  list: { flexGrow: 0 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppColors.borderSubtle,
  },
  rowActive: { backgroundColor: AppColors.surfaceRaised },
  rowPressed: { opacity: 0.85 },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.textPrimary,
    flex: 1,
  },
  rowLabelActive: { color: AppColors.accentBrass },
  check: { fontSize: 16, color: AppColors.accentBrass, fontWeight: '800' },
});
