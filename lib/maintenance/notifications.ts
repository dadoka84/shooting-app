import Constants, { ExecutionEnvironment } from 'expo-constants';
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
let androidChannelReady = false;

function runningInExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

export function configureMaintenanceNotifications(): void {
  if (Platform.OS === 'web') return;
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

async function ensureAndroidChannel(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  if (androidChannelReady) return true;
  if (runningInExpoGo()) {
    // Expo Go: custom channel creation often NPEs; use the default channel id.
    return false;
  }
  try {
    await Notifications.setNotificationChannelAsync(MAINTENANCE_CHANNEL_ID, {
      name: 'Weapon maintenance',
      importance: Notifications.AndroidImportance.HIGH,
    });
    androidChannelReady = true;
    return true;
  } catch (err) {
    console.warn('Maintenance notification channel setup failed', err);
    return false;
  }
}

export type TranslateFn = (key: StringKey, vars?: Record<string, string | number>) => string;

export async function syncWeaponMaintenanceNotifications(
  db: SQLiteDatabase,
  t: TranslateFn,
): Promise<void> {
  if (Platform.OS === 'web') return;
  configureMaintenanceNotifications();
  const allowed = await ensureNotificationPermissions();
  if (!allowed) return;

  const hasChannel = await ensureAndroidChannel();
  const androidChannelId = hasChannel ? MAINTENANCE_CHANNEL_ID : 'default';

  const schedules = await listEnabledMaintenanceSchedules(db);
  for (const row of schedules) {
    const { schedule, owned_rounds_total, weapon_name } = row;
    const { due, notifyThreshold } = maintenanceProgress(schedule, owned_rounds_total);
    if (!due) continue;
    if (schedule.alerted_through_rounds >= notifyThreshold) continue;

    const content = {
      title: t('maintenance.notifTitle'),
      body: t('maintenance.notifBody', {
        name: weapon_name,
        rounds: row.rounds_since_service,
      }),
      data: { weaponId: schedule.weapon_id, type: 'maintenance' },
      sound: true,
      ...(Platform.OS === 'android' ? { channelId: androidChannelId } : {}),
    };

    try {
      await Notifications.scheduleNotificationAsync({
        content,
        trigger:
          Platform.OS === 'android'
            ? {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: 1,
              }
            : null,
      });
    } catch (err) {
      console.warn('Maintenance notification schedule failed', err);
      continue;
    }

    await markMaintenanceAlerted(db, schedule.weapon_id, notifyThreshold);
  }
}
