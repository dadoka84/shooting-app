import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { AppColors } from '@/constants/theme';

/**
 * Subtle horizontal camo band — reads “tactical” without heavy image assets.
 */
export function CamoBand({ style, ...rest }: ViewProps) {
  return (
    <View style={[bandStyles.wrap, style]} {...rest}>
      <View style={[bandStyles.stripe, { backgroundColor: AppColors.camoA }]} />
      <View style={[bandStyles.stripe, { backgroundColor: AppColors.camoB }]} />
      <View style={[bandStyles.stripe, { backgroundColor: AppColors.camoC }]} />
      <View style={[bandStyles.stripe, { backgroundColor: AppColors.camoA }]} />
      <View style={[bandStyles.stripe, { backgroundColor: AppColors.camoB }]} />
    </View>
  );
}

const bandStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 2,
    overflow: 'hidden',
    opacity: 0.95,
  },
  stripe: { flex: 1 },
});

type AppHeaderProps = {
  subtitle?: string;
};

/** Crosshair + wordmark placeholder until a real logo asset ships. */
export function AppHeader({ subtitle }: AppHeaderProps) {
  return (
    <View style={headerStyles.block}>
      <CamoBand style={headerStyles.band} />
      <View style={headerStyles.row}>
        <View style={headerStyles.markWrap} accessibilityLabel="WhatShotz logo placeholder">
          <View style={headerStyles.crosshair}>
            <View style={headerStyles.chH} />
            <View style={headerStyles.chV} />
            <View style={headerStyles.chDot} />
          </View>
        </View>
        <View style={headerStyles.wordmark}>
          <Text style={headerStyles.title}>WhatShotz</Text>
          {subtitle ? <Text style={headerStyles.sub}>{subtitle}</Text> : null}
        </View>
      </View>
      <CamoBand style={headerStyles.bandBottom} />
    </View>
  );
}

const headerStyles = StyleSheet.create({
  block: { marginBottom: 16, gap: 10 },
  band: { alignSelf: 'stretch' },
  bandBottom: { alignSelf: 'stretch', opacity: 0.7 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  markWrap: {
    width: 52,
    height: 52,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: AppColors.accentBrass,
    backgroundColor: AppColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshair: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chH: {
    position: 'absolute',
    width: 22,
    height: 2,
    backgroundColor: AppColors.accentBrass,
    borderRadius: 1,
  },
  chV: {
    position: 'absolute',
    width: 2,
    height: 22,
    backgroundColor: AppColors.accentBrass,
    borderRadius: 1,
  },
  chDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AppColors.accentOliveBright,
    borderWidth: 1,
    borderColor: AppColors.accentBrass,
  },
  wordmark: { flex: 1 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: AppColors.textPrimary,
    textTransform: 'uppercase',
  },
  sub: {
    marginTop: 2,
    fontSize: 12,
    color: AppColors.accentBrass,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});
