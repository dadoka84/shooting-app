import type { ReactNode } from 'react';

import { ListRow, StatusPill } from '@/components/ui';
import { weaponCategoryLabel } from '@/lib/weapons/categoryDisplay';
import type { WeaponCategory } from '@/lib/types';

import { WeaponCategoryIcon } from './WeaponCategoryIcon';

type WeaponListRowProps = {
  name: string;
  category: WeaponCategory;
  subtitle?: string;
  onPress?: () => void;
  right?: ReactNode;
  showCategoryPill?: boolean;
  showChevron?: boolean;
};

/** List row inside cards: icon tile + title, matching Home trip/target cards */
export function WeaponListRow({
  name,
  category,
  subtitle,
  onPress,
  right,
  showCategoryPill = true,
  showChevron = true,
}: WeaponListRowProps) {
  return (
    <ListRow
      leading={<WeaponCategoryIcon category={category} />}
      title={name}
      subtitle={subtitle}
      onPress={onPress}
      showChevron={showChevron}
      right={
        right ??
        (showCategoryPill ? <StatusPill label={weaponCategoryLabel(category)} tone="neutral" /> : null)
      }
    />
  );
}
