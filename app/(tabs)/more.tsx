import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from '@/components/Themed';
import { Card, ListDivider, ListRow, ScreenScroll, SectionHeader } from '@/components/ui';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { listStaticTips } from '@/lib/db/repository';

export default function MoreScreen() {
  const { db } = useDatabase();
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
      <SectionHeader title="About this build" />
      <Card>
        <ListRow
          title="Privacy"
          subtitle="Trips, photos, and scores stay on this device. No cloud sync in Phase 1."
          showChevron={false}
        />
        <ListDivider />
        <ListRow
          title="Units"
          subtitle="Metric defaults (°C, m/s) — full settings UI comes later."
          showChevron={false}
        />
      </Card>

      <SectionHeader title="Fundamentals" />
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
