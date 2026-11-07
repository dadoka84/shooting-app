import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';
import { StatusPill } from '@/components/ui';

type Props = {
  title: string;
  subtitle: string;
  statusLabel: string;
  statusTone: 'success' | 'warning';
  onPress: () => void;
};

export function TripListCard({ title, subtitle, statusLabel, statusTone, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
    >
      <View style={styles.textCol}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>
        <StatusPill label={statusLabel} tone={statusTone} />
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 12,
    marginVertical: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.borderSubtle,
    backgroundColor: AppColors.surfaceRaised,
  },
  cardPressed: { opacity: 0.88 },
  textCol: { flex: 1, minWidth: 0, gap: 4 },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: AppColors.textMuted,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chevron: {
    fontSize: 20,
    color: AppColors.accentBrass,
    fontWeight: '600',
  },
});
