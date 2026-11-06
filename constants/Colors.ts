import { AppColors } from '@/constants/theme';

const tint = AppColors.accentBrass;
const tabInactive = AppColors.textMuted;

/**
 * Light branch kept for hooks compatibility; app forces dark via useColorScheme.
 */
export default {
  light: {
    text: '#1a1f18',
    background: '#eef0e8',
    tint,
    tabIconDefault: '#6b725f',
    tabIconSelected: AppColors.accentOliveBright,
  },
  dark: {
    text: AppColors.textPrimary,
    background: AppColors.background,
    tint,
    tabIconDefault: tabInactive,
    tabIconSelected: tint,
  },
};
