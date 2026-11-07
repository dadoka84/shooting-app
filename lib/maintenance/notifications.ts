import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { SQLiteDatabase } from 'expo-sqlite';

import {
  listEnabledMaintenanceSchedules,
  maintenanceProgress,
  markMaintenanceAlerted,
} from '@/lib/db/maintenanceRepository';
import type { StringKey } from '@/lib/i18n/strings';

export const MAINTENANCE_CHANNEL_ID = 'weapon-maintenance';

let handlerConfigured = false;

export function configureMaintenanceNotifications(): void {
  if (handlerConfigured) return;
  handlerConfigured = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(MAINTENANCE_CHANNEL_ID, {
    name: 'Weapon maintenance',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
  });
}

export type TranslateFn = (key: StringKey, vars?: Record<string, string | number>) => string;

export async function syncWeaponMaintenanceNotifications(
  db: SQLiteDatabase,
  t: TranslateFn,
): Promise<void> {
  configureMaintenanceNotifications();
  const allowed = await ensureNotificationPermissions();
  if (!allowed) return;

  await ensureAndroidChannel();

  const schedules = await listEnabledMaintenanceSchedules(db);
  for (const row of schedules) {
    const { schedule, owned_rounds_total, weapon_name } = row;
    const { due, notifyAt } = maintenanceProgress(schedule, owned_rounds_total);
    if (!due) continue;
    if (schedule.alerted_through_rounds >= notifyAt) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: t('maintenance.notifTitle'),
        body: t('maintenance.notifBody', {
          name: weapon_name,
          rounds: row.rounds_since_service,
        }),
        data: { weaponId: schedule.weapon_id, type: 'maintenance' },
        sound: true,
      },
      trigger:
        Platform.OS === 'android'
          ? { channelId: MAINTENANCE_CHANNEL_ID }
          : null,
    });

    await markMaintenanceAlerted(db, schedule.weapon_id, notifyAt);
  }
}
