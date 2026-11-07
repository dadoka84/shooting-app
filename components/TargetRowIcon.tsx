import { StyleSheet, View } from 'react-native';

import { PistolTargetMark } from '@/components/theme';
import { AppColors } from '@/constants/theme';

/** Small target tile for list rows (library / home) */
export function TargetRowIcon({ size = 22 }: { size?: number }) {
  const outer = Math.round(size * 1.85);
  return (
    <View style={[styles.tile, { width: outer, height: outer }]}>
      <PistolTargetMark size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: AppColors.accentBrassDim,
    backgroundColor: 'rgba(13, 16, 13, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
