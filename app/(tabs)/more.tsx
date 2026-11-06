import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { ScreenScroll } from '@/components/ui';
import { AppColors } from '@/constants/theme';
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
      <Text style={styles.title}>Settings & fundamentals</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Privacy</Text>
        <Text>All trips, photos, and scores stay on this device. No account or cloud sync in Phase 1.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Units</Text>
        <Text>Metric defaults (°C, m/s) — settings UI in a later milestone.</Text>
      </View>
      <Text style={styles.section}>Fundamentals (static)</Text>
      <FlatList
        data={tips}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.tip}>
            <Text style={styles.tipTitle}>{item.title}</Text>
            <Text>{item.body}</Text>
          </View>
        )}
      />
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', color: AppColors.accentBrass },
  section: { fontSize: 18, fontWeight: '700', marginTop: 12, color: AppColors.accentBrass },
  card: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: AppColors.surfaceRaised,
    borderWidth: 1,
    borderColor: AppColors.border,
    gap: 4,
  },
  cardTitle: { fontWeight: '700', color: AppColors.textPrimary },
  tip: { paddingVertical: 8, gap: 4 },
  tipTitle: { fontWeight: '700', color: AppColors.accentBrass },
});
