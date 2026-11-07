import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { AppColors } from '@/constants/theme';
import type { WeaponCategory } from '@/lib/types';

type WeaponCategoryGlyphProps = {
  category: WeaponCategory;
  size?: number;
  color?: string;
};

/** Side-view silhouettes: pistol, rifle, sniper (plus generic other) */
export function WeaponCategoryGlyph({
  category,
  size = 26,
  color = AppColors.accentBrass,
}: WeaponCategoryGlyphProps) {
  const w = size;
  const h = size;

  if (category === 'pistol') {
    return (
      <Svg width={w} height={h} viewBox="0 0 24 24" accessibilityRole="image">
        <Rect x={12} y={10} width={9} height={2.6} rx={0.4} fill={color} />
        <Rect x={8} y={10.4} width={5} height={2.2} rx={0.4} fill={color} />
        <Path fill={color} d="M7.5 12.6h2.8v5.2H8.8v-3.6H7.5v-1.6z" />
        <Rect x={6.2} y={12.8} width={1.8} height={4.8} rx={0.35} fill={color} />
        <Rect x={19.5} y={10.8} width={2} height={1.4} rx={0.3} fill={color} />
      </Svg>
    );
  }

  if (category === 'rifle') {
    return (
      <Svg width={w} height={h} viewBox="0 0 24 24" accessibilityRole="image">
        <Path fill={color} d="M3 10.5h2.2l1.2 2.2H3V10.5zm2.6 2.2h14.2v2H5.6v-2z" />
        <Rect x={6} y={11.2} width={14} height={2} rx={0.35} fill={color} />
        <Path fill={color} d="M3 12.5l-1.2 3.2h2.2l.8-2H3v-1.2z" opacity={0.95} />
        <Rect x={19.5} y={11.5} width={2.2} height={1.2} rx={0.25} fill={color} />
      </Svg>
    );
  }

  if (category === 'sniper') {
    return (
      <Svg width={w} height={h} viewBox="0 0 24 24" accessibilityRole="image">
        <Rect x={5} y={11.2} width={14.5} height={2} rx={0.35} fill={color} />
        <Path fill={color} d="M3 10.8h2.5l1.3 2.5H3v-2.5zm2.2 2.6l-1.1 2.8h2l.9-1.8H5.2z" />
        <Rect x={12.5} y={7.8} width={5.5} height={1.8} rx={0.35} fill={color} />
        <Circle cx={15.2} cy={8.7} r={2.1} fill="none" stroke={color} strokeWidth={1.5} />
        <Rect x={19.3} y={11.4} width={2.4} height={1.2} rx={0.25} fill={color} />
      </Svg>
    );
  }

  return (
    <Svg width={w} height={h} viewBox="0 0 24 24" accessibilityRole="image">
      <Path
        fill={color}
        d="M8 4h8v2H8V4zm0 14h8v2H8v-2zm-1-2h10a1 1 0 001-1V9a1 1 0 00-1-1H7a1 1 0 00-1 1v6a1 1 0 001 1z"
      />
    </Svg>
  );
}
