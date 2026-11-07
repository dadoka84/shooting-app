import { StyleSheet, Text, View } from 'react-native';

import { RangeMapPicker } from '@/components/ranges/RangeMapPicker';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { AppColors } from '@/constants/theme';
import type { StringKey } from '@/lib/i18n/strings';

export type RangeFormValues = {
  name: string;
  address: string;
  phone: string;
  web: string;
  email: string;
  comment: string;
  latitude: number | null;
  longitude: number | null;
};

type Props = {
  values: RangeFormValues;
  onChange: (patch: Partial<RangeFormValues>) => void;
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
};

export function RangeFormBody({ values, onChange, t }: Props) {
  return (
    <View style={styles.root}>
      <Field label={t('range.name')} value={values.name} onChangeText={(name) => onChange({ name })} />
      <Field
        label={t('range.address')}
        value={values.address}
        onChangeText={(address) => onChange({ address })}
        multiline
      />
      <Field label={t('range.phone')} value={values.phone} onChangeText={(phone) => onChange({ phone })} />
      <Field label={t('range.web')} value={values.web} onChangeText={(web) => onChange({ web })} />
      <Field
        label={t('range.email')}
        value={values.email}
        onChangeText={(email) => onChange({ email })}
        keyboardType="email-address"
      />
      <Field
        label={t('range.comment')}
        value={values.comment}
        onChangeText={(comment) => onChange({ comment })}
        multiline
      />
      <RangeMapPicker
        latitude={values.latitude}
        longitude={values.longitude}
        onChange={(latitude, longitude) => onChange({ latitude, longitude })}
      />
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <ThemedTextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
        style={multiline ? styles.multiline : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 4 },
  field: { marginTop: 8 },
  label: { fontWeight: '600', marginBottom: 4, color: AppColors.textPrimary },
  multiline: { minHeight: 72, textAlignVertical: 'top' },
});
