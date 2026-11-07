import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { RangeFormBody, type RangeFormValues } from '@/components/ranges/RangeFormBody';
import { DangerButton, PrimaryButton, ScreenIntro, ScreenScroll, SectionHeader } from '@/components/ui';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { deleteShootingRange, getShootingRange, updateShootingRange } from '@/lib/db/rangeRepository';
import { useI18n } from '@/lib/i18n/I18nProvider';

export default function RangeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { db, bumpRefresh } = useDatabase();
  const router = useRouter();
  const { t } = useI18n();
  const [values, setValues] = useState<RangeFormValues | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const row = await getShootingRange(db, id);
      if (!row) return;
      setValues({
        name: row.name,
        address: row.address ?? '',
        phone: row.phone ?? '',
        web: row.web ?? '',
        email: row.email ?? '',
        comment: row.comment ?? '',
        latitude: row.latitude,
        longitude: row.longitude,
      });
    })();
  }, [db, id]);

  const save = async () => {
    if (!id || !values?.name.trim()) {
      Alert.alert(t('range.nameRequired'));
      return;
    }
    setSaving(true);
    try {
      await updateShootingRange(db, id, {
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

  const remove = () => {
    if (!id) return;
    Alert.alert(t('range.deleteTitle'), t('range.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteShootingRange(db, id);
          bumpRefresh();
          router.back();
        },
      },
    ]);
  };

  if (!values) {
    return (
      <ScreenScroll>
        <ScreenIntro title={t('range.editTitle')} description={t('common.loading')} />
      </ScreenScroll>
    );
  }

  return (
    <ScreenScroll>
      <ScreenIntro title={t('range.editTitle')} description={t('ranges.intro')} />
      <RangeFormBody values={values} onChange={(patch) => setValues((v) => (v ? { ...v, ...patch } : v))} t={t} />
      <PrimaryButton
        label={saving ? t('common.saving') : t('common.saveChanges')}
        fullWidth
        onPress={save}
        disabled={saving}
      />
      <SectionHeader title={t('common.dangerZone')} />
      <DangerButton label={t('common.delete')} fullWidth onPress={remove} />
    </ScreenScroll>
  );
}
