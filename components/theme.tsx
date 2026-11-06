import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { AppColors } from '@/constants/theme';

const CAMO_SEQUENCE = [
  AppColors.camoA,
  AppColors.camoB,
  AppColors.camoC,
  AppColors.camoA,
  AppColors.camoB,
  AppColors.camoC,
  AppColors.camoA,
  AppColors.camoB,
] as const;

/**
 * Full-width camo stripe stack (fills container height).
 */
export function CamoBackground({ style, ...rest }: ViewProps) {
  return (
    <View style={[camoStyles.fill, style]} {...rest}>
      {CAMO_SEQUENCE.map((bg, i) => (
        <View key={i} style={[camoStyles.stripeRow, { backgroundColor: bg }]} />
      ))}
    </View>
  );
}

const camoStyles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'column',
  },
  stripeRow: {
    flex: 1,
    minHeight: 3,
  },
});

/**
 * Subtle horizontal camo band — legacy accent strip (optional).
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

/** Concentric rings = pistol paper target at a glance */
export function PistolTargetMark({ size = 48 }: { size?: number }) {
  const outer = size;
  const mid = size * 0.65;
  const inner = size * 0.36;
  const dot = size * 0.14;
  return (
    <View style={[markStyles.wrap, { width: outer, height: outer }]}>
      <View
        style={[
          markStyles.ring,
          {
            width: outer - 4,
            height: outer - 4,
            borderRadius: (outer - 4) / 2,
          },
        ]}
      />
      <View
        style={[
          markStyles.ring,
          {
            width: mid,
            height: mid,
            borderRadius: mid / 2,
          },
        ]}
      />
      <View
        style={[
          markStyles.ring,
          {
            width: inner,
            height: inner,
            borderRadius: inner / 2,
          },
        ]}
      />
      <View
        style={[
          markStyles.bull,
          {
            width: dot,
            height: dot,
            borderRadius: dot / 2,
          },
        ]}
      />
    </View>
  );
}

const markStyles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: AppColors.accentBrass,
  },
  bull: {
    position: 'absolute',
    backgroundColor: AppColors.accentOliveBright,
    borderWidth: 1,
    borderColor: AppColors.accentBrass,
  },
});

/** Native stack / tab header background (camo fill) */
export function TabHeaderBackground() {
  return (
    <View style={tabHeaderStyles.shell}>
      <CamoBackground />
      <View style={tabHeaderStyles.fade} />
    </View>
  );
}

const tabHeaderStyles = StyleSheet.create({
  shell: {
    flex: 1,
    overflow: 'hidden',
  },
  fade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 16, 13, 0.35)',
  },
});

type AppHeaderProps = {
  subtitle?: string;
};

export function AppHeader({ subtitle }: AppHeaderProps) {
  return (
    <View style={headerStyles.shell}>
      <CamoBackground style={headerStyles.camoLayer} />
      <View style={headerStyles.scrim} />
      <View style={headerStyles.row}>
        <View style={headerStyles.markWrap} accessibilityLabel="WhatShotz app mark">
          <PistolTargetMark size={44} />
        </View>
        <View style={headerStyles.wordmark}>
          <Text style={headerStyles.title}>WhatShotz</Text>
          {subtitle ? <Text style={headerStyles.sub}>{subtitle}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  shell: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AppColors.border,
    marginBottom: 16,
    minHeight: 92,
  },
  camoLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 16, 13, 0.42)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 16,
    zIndex: 1,
  },
  markWrap: {
    width: 56,
    height: 56,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: AppColors.accentBrassDim,
    backgroundColor: 'rgba(13, 16, 13, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: { flex: 1 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: AppColors.textPrimary,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  sub: {
    marginTop: 2,
    fontSize: 12,
    color: AppColors.accentBrass,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});
