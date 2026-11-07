import { useEffect } from 'react';

import { useDatabase } from '@/lib/db/DatabaseProvider';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { syncWeaponMaintenanceNotifications } from '@/lib/maintenance/notifications';

/** Re-check round thresholds and fire local notifications when maintenance is due. */
export function MaintenanceSync() {
  const { db, ready, refreshKey } = useDatabase();
  const { t } = useI18n();

  useEffect(() => {
    if (!ready) return;
    syncWeaponMaintenanceNotifications(db, t).catch((err) => {
      console.warn('Maintenance notification sync failed', err);
    });
  }, [db, ready, refreshKey, t]);

  return null;
}
