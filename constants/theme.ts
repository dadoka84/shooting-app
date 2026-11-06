/**
 * WhatShotz — Phase 1 visual identity: dark tactical UI, olive + camo stripe, brass accents.
 */
export const AppColors = {
  /** Near-black panel */
  background: '#0d100d',
  /** Slightly lifted surfaces */
  surface: '#161a16',
  surfaceRaised: '#1e241e',
  /** Typography */
  textPrimary: '#e8ecde',
  textMuted: '#98a38a',
  textInverse: '#0d100d',
  /** Accents */
  accentOlive: '#4a5d3a',
  accentOliveBright: '#6b8a4e',
  accentBrass: '#b8a572',
  accentBrassDim: '#8a7d54',
  accentDanger: '#c45c4a',
  /** Borders / dividers */
  border: '#2d3528',
  borderSubtle: '#252b21',
  /** Camo stripe (used as horizontal bands, not full-screen heavy pattern) */
  camoA: '#3d4a32',
  camoB: '#2f3828',
  camoC: '#4f5c42',
  /** Overlays */
  overlayDark: 'rgba(0,0,0,0.5)',
  /** Semantic UI (status pills, badges) */
  successMuted: '#2d4a32',
  successBorder: '#3d6644',
  successText: '#a3d9ae',
  warningMuted: '#4a3d28',
  warningBorder: '#6b5a38',
  warningText: '#e8d4a8',
  neutralMuted: '#252b21',
  neutralBorder: '#2d3528',
  neutralText: '#b8c4aa',
} as const;

export type AppColorName = keyof typeof AppColors;
