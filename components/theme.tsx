import { ImageBackground, StyleSheet, Text, View, type ViewProps } from 'react-native';

import { AppColors } from '@/constants/theme';

const CAMO_HEADER_IMAGE = require('@/assets/camo-header.png');

/** Mottled “splotch” layers — reads more like woodland camo than flat stripes. */
const CAMO_BLOBS: Array<{ w: number; h: number; left: `${number}%`; top: `${number}%`; bg: string; opacity: number }> = [
  { w: 120, h: 90, left: '5%', top: '8%', bg: AppColors.camoA, opacity: 0.95 },
  { w: 100, h: 100, left: '42%', top: '0%', bg: AppColors.camoC, opacity: 0.85 },
  { w: 140, h: 70, left: '55%', top: '45%', bg: AppColors.camoB, opacity: 0.9 },
  { w: 90, h: 110, left: '0%', top: '40%', bg: AppColors.camoB, opacity: 0.75 },
  { w: 80, h: 80, left: '70%', top: '10%', bg: AppColors.camoA, opacity: 0.7 },
  { w: 110, h: 95, left: '25%', top: '55%', bg: AppColors.camoC, opacity: 0.8 },
];

const STRIPE_UNDERLAY = [AppColors.camoA, AppColors.camoB, AppColors.camoC, AppColors.camoA, AppColors.camoB] as const;

/**
 * Full-width camo fill: stripe base + soft blob overlays.
 */
export function CamoBackground({ style, ...rest }: ViewProps) {
  return (
    <View style={[camoStyles.fill, style]} {...rest}>
      {STRIPE_UNDERLAY.map((bg, i) => (
        <View key={`s-${i}`} style={[camoStyles.stripeRow, { backgroundColor: bg }]} />
      ))}
      {CAMO_BLOBS.map((b, i) => (
        <View
          key={`b-${i}`}
          style={[
            camoStyles.blob,
            {
              width: b.w,
              height: b.h,
              left: b.left,
              top: b.top,
              backgroundColor: b.bg,
              opacity: b.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

const camoStyles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  stripeRow: {
    flex: 1,
    minHeight: 4,
  },
  blob: {
    position: 'absolute',
    borderRadius: 40,
    transform: [{ rotate: '12deg' }],
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

/** Native stack / tab header background (camo into status bar; title below inset). */
export function TabHeaderBackground() {
  return (
    <View style={tabHeaderStyles.shell}>
      <ImageBackground
        source={CAMO_HEADER_IMAGE}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <View style={tabHeaderStyles.fade} />
      </ImageBackground>
    </View>
  );
}

const tabHeaderStyles = StyleSheet.create({
  shell: {
    flex: 1,
    overflow: 'hidden',
  },
  fade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(13, 16, 13, 0.32)',
  },
});

type AppHeaderProps = {
  subtitle?: string;
};

/** In-screen hero: camo + target mark; nav bar shows the app name (avoid duplicating title beside icon). */
export function AppHeader({ subtitle }: AppHeaderProps) {
  return (
    <ImageBackground
      source={CAMO_HEADER_IMAGE}
      style={headerStyles.shell}
      imageStyle={headerStyles.shellImage}
      resizeMode="cover"
    >
      <View style={headerStyles.scrim} />
      <View style={headerStyles.column}>
        <View style={headerStyles.markWrap} accessibilityLabel="WhatShotz app mark">
          <PistolTargetMark size={48} />
        </View>
        {subtitle ? <Text style={headerStyles.sub}>{subtitle}</Text> : null}
      </View>
    </ImageBackground>
  );
}

const headerStyles = StyleSheet.create({
  shell: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AppColors.border,
    marginBottom: 16,
    minHeight: 120,
  },
  shellImage: {
    borderRadius: 12,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(13, 16, 13, 0.42)',
  },
  column: {
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 10,
  },
  markWrap: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: AppColors.accentBrassDim,
    backgroundColor: 'rgba(13, 16, 13, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sub: {
    fontSize: 13,
    color: AppColors.accentBrass,
    fontWeight: '600',
    letterSpacing: 0.35,
    lineHeight: 18,
    textAlign: 'center',
  },
});
