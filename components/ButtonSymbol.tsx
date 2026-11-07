import { SymbolView } from 'expo-symbols';
import type { StyleProp, ViewStyle } from 'react-native';

export type UiSymbolId = keyof typeof UI_SYMBOLS;

/** Cross-platform SF / Material symbol names for action buttons */
export const UI_SYMBOLS = {
  newTrip: { ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' },
  browseTrips: { ios: 'list.bullet', android: 'view_list', web: 'view_list' },
  camera: { ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' },
  addWeapon: { ios: 'plus', android: 'add', web: 'add' },
  addAmmo: { ios: 'shippingbox.fill', android: 'inventory_2', web: 'inventory_2' },
} as const;

export function ButtonSymbol({
  symbolId,
  color,
  size = 20,
  style,
}: {
  symbolId: UiSymbolId;
  color: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const symbol = UI_SYMBOLS[symbolId];
  return (
    <SymbolView
      name={{ ios: symbol.ios, android: symbol.android, web: symbol.web }}
      tintColor={color}
      size={size}
      style={style}
    />
  );
}
