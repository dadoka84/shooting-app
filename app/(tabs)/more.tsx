import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, ListDivider, ListRow, ScreenIntro, ScreenScroll, SectionHeader } from '@/components/ui';
import { AppColors } from '@/constants/theme';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { listStaticTips } from '@/lib/db/repository';
import type { Locale } from '@/lib/i18n/strings';

const LANG_OPTIONS: { id: Locale; labelKey: 'more.langEn' | 'more.langBs' | 'more.langDe' }[] = [
  { id: 'en', labelKey: 'more.langEn' },
  { id: 'bs', labelKey: 'more.langBs' },
  { id: 'de', labelKey: 'more.langDe' },
];

export default function MoreScreen() {
  const { db } = useDatabase();
  const { t, locale, setLocale } = useI18n();
  const [tips, setTips] = useState<Array<{ id: string; title: string; body: string }>>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setTips(await listStaticTips(db));
      })();
    }, [db]),
  );

  return (
    <ScreenScroll>
      <ScreenIntro description={t('more.intro')} />

      <SectionHeader title={t('more.language')} />
      <Card>
        {LANG_OPTIONS.map((opt, i) => (
          <View key={opt.id}>
            <Pressable onPress={() => setLocale(opt.id)} style={styles.langRow}>
              <Text style={styles.langLabel}>{t(opt.labelKey)}</Text>
              <Text style={[styles.langCheck, locale === opt.id && styles.langCheckActive]}>
                {locale === opt.id ? '●' : '○'}
              </Text>
            </Pressable>
            {i < LANG_OPTIONS.length - 1 ? <ListDivider /> : null}
          </View>
        ))}
      </Card>

      <SectionHeader title={t('more.about')} />
      <Card>
        <ListRow title={t('more.privacyTitle')} subtitle={t('more.privacySub')} showChevron={false} />
        <ListDivider />
        <ListRow title={t('more.unitsTitle')} subtitle={t('more.unitsSub')} showChevron={false} />
      </Card>

      <SectionHeader title={t('more.fundamentals')} />
      <Card>
        {tips.map((item, i) => (
          <View key={item.id}>
            <ListRow title={item.title} subtitle={item.body} showChevron={false} />
            {i < tips.length - 1 ? <ListDivider /> : null}
          </View>
        ))}
      </Card>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  langLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  langCheck: {
    fontSize: 18,
    color: AppColors.textMuted,
  },
  langCheckActive: {
    color: AppColors.accentBrass,
  },
});
