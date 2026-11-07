import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { RangeFormBody, type RangeFormValues } from '@/components/ranges/RangeFormBody';
import { PrimaryButton, ScreenIntro, ScreenScroll } from '@/components/ui';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { createShootingRange } from '@/lib/db/rangeRepository';
import { useI18n } from '@/lib/i18n/I18nProvider';

const EMPTY: RangeFormValues = {
  name: '',
  address: '',
  phone: '',
  web: '',
  email: '',
  comment: '',
  latitude: null,
  longitude: null,
};

export default function NewRangeScreen() {
  const { db, bumpRefresh } = useDatabase();
  const router = useRouter();
  const { t } = useI18n();
  const [values, setValues] = useState<RangeFormValues>(EMPTY);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!values.name.trim()) {
      Alert.alert(t('range.nameRequired'));
      return;
    }
    setSaving(true);
    try {
      await createShootingRange(db, {
        name: values.name,
        address: values.address,
        phone: values.phone,
        web: values.web,
        email: values.email,
        comment: values.comment,
        latitude: values.latitude,
        longitude: values.longitude,
      });
      bumpRefresh();
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenScroll>
      <ScreenIntro title={t('range.newTitle')} description={t('ranges.intro')} />
      <RangeFormBody values={values} onChange={(patch) => setValues((v) => ({ ...v, ...patch }))} t={t} />
      <PrimaryButton
        label={saving ? t('common.saving') : t('range.saveRange')}
        fullWidth
        onPress={save}
        disabled={saving}
      />
    </ScreenScroll>
  );
}
