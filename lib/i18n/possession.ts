import type { Possession } from '@/lib/types';
import type { StringKey } from '@/lib/i18n/strings';

export function possessionStringKey(p: Possession): StringKey {
  return `possession.${p}` as StringKey;
}
