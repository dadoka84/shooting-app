import type { StringKey } from '@/lib/i18n/strings';
import { TIP_DISPLAY_ORDER, type TipId, tipBodyKey, tipTitleKey } from '@/lib/i18n/tipsCatalog';

type Translator = (key: StringKey, vars?: Record<string, string | number>) => string;

export function sortTipsForDisplay<T extends { id: string }>(rows: T[]): T[] {
  const order = new Map(TIP_DISPLAY_ORDER.map((id, index) => [id, index]));
  return [...rows].sort((a, b) => (order.get(a.id as TipId) ?? 99) - (order.get(b.id as TipId) ?? 99));
}

export function localizedTip(
  t: Translator,
  tipId: string,
): { title: string; body: string } {
  const titleKey = tipTitleKey(tipId) as StringKey;
  const bodyKey = tipBodyKey(tipId) as StringKey;
  return { title: t(titleKey), body: t(bodyKey) };
}
