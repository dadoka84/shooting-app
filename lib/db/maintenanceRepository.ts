import type { SQLiteDatabase } from 'expo-sqlite';
import { nowMs } from '@/lib/id';
import type { WeaponMaintenanceSchedule } from '@/lib/types';

function mapSchedule(row: WeaponMaintenanceSchedule): WeaponMaintenanceSchedule {
  return {
    ...row,
    enabled: row.enabled ? 1 : 0,
    interval_rounds: Math.max(1, row.interval_rounds ?? 100),
    baseline_rounds: Math.max(0, row.baseline_rounds ?? 0),
    alerted_through_rounds: Math.max(0, row.alerted_through_rounds ?? 0),
  };
}

/** All rounds logged on trips for this arsenal weapon. */
export async function getWeaponLoggedRoundsTotal(
  db: SQLiteDatabase,
  weaponId: string,
): Promise<number> {
  const row = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(rounds_fired), 0) AS total
     FROM trip_weapons
     WHERE weapon_id = ?`,
    weaponId,
  );
  return row?.total ?? 0;
}

/** @deprecated Use getWeaponLoggedRoundsTotal */
export async function getWeaponOwnedRoundsTotal(
  db: SQLiteDatabase,
  weaponId: string,
): Promise<number> {
  return getWeaponLoggedRoundsTotal(db, weaponId);
}

export async function getMaintenanceSchedule(
  db: SQLiteDatabase,
  weaponId: string,
): Promise<WeaponMaintenanceSchedule | null> {
  const row = await db.getFirstAsync<WeaponMaintenanceSchedule>(
    'SELECT * FROM weapon_maintenance_schedules WHERE weapon_id = ?',
    weaponId,
  );
  return row ? mapSchedule(row) : null;
}

export async function upsertMaintenanceSchedule(
  db: SQLiteDatabase,
  input: {
    weapon_id: string;
    enabled: boolean;
    interval_rounds: number;
  },
): Promise<WeaponMaintenanceSchedule> {
  const ts = nowMs();
  const interval = Math.max(1, Math.round(input.interval_rounds));
  const existing = await getMaintenanceSchedule(db, input.weapon_id);

  if (!existing) {
    await db.runAsync(
      `INSERT INTO weapon_maintenance_schedules
       (weapon_id, enabled, interval_rounds, baseline_rounds, alerted_through_rounds, updated_at)
       VALUES (?, ?, ?, 0, 0, ?)`,
      input.weapon_id,
      input.enabled ? 1 : 0,
      interval,
      ts,
    );
  } else {
    await db.runAsync(
      `UPDATE weapon_maintenance_schedules
       SET enabled = ?, interval_rounds = ?, updated_at = ?
       WHERE weapon_id = ?`,
      input.enabled ? 1 : 0,
      interval,
      ts,
      input.weapon_id,
    );
  }

  const next = await getMaintenanceSchedule(db, input.weapon_id);
  if (!next) throw new Error('Failed to save maintenance schedule');
  return next;
}

export async function completeWeaponMaintenance(
  db: SQLiteDatabase,
  weaponId: string,
): Promise<void> {
  const baseline = await getWeaponLoggedRoundsTotal(db, weaponId);
  const ts = nowMs();
  const existing = await getMaintenanceSchedule(db, weaponId);
  if (!existing) return;

  await db.runAsync(
    `UPDATE weapon_maintenance_schedules
     SET baseline_rounds = ?, alerted_through_rounds = ?, updated_at = ?
     WHERE weapon_id = ?`,
    baseline,
    baseline,
    ts,
    weaponId,
  );
}

export async function markMaintenanceAlerted(
  db: SQLiteDatabase,
  weaponId: string,
  alertedThroughRounds: number,
): Promise<void> {
  await db.runAsync(
    `UPDATE weapon_maintenance_schedules
     SET alerted_through_rounds = ?, updated_at = ?
     WHERE weapon_id = ?`,
    Math.max(0, alertedThroughRounds),
    nowMs(),
    weaponId,
  );
}

export type MaintenanceDueRow = {
  weapon_id: string;
  weapon_name: string;
  schedule: WeaponMaintenanceSchedule;
  owned_rounds_total: number;
  rounds_since_service: number;
  rounds_until_due: number;
};

export function maintenanceProgress(
  schedule: WeaponMaintenanceSchedule,
  loggedRoundsTotal: number,
): {
  sinceService: number;
  untilDue: number;
  due: boolean;
  /** Round count at the current interval boundary we last notified for. */
  notifyThreshold: number;
} {
  const since = Math.max(0, loggedRoundsTotal - schedule.baseline_rounds);
  const until = Math.max(0, schedule.interval_rounds - since);
  const due = schedule.enabled === 1 && since >= schedule.interval_rounds;
  const steps = due ? Math.max(1, Math.floor(since / schedule.interval_rounds)) : 0;
  const notifyThreshold = schedule.baseline_rounds + steps * schedule.interval_rounds;
  return { sinceService: since, untilDue: until, due, notifyThreshold };
}

export async function listEnabledMaintenanceSchedules(
  db: SQLiteDatabase,
): Promise<MaintenanceDueRow[]> {
  const rows = await db.getAllAsync<
    WeaponMaintenanceSchedule & { weapon_name: string }
  >(
    `SELECT s.*, w.name AS weapon_name
     FROM weapon_maintenance_schedules s
     INNER JOIN weapons w ON w.id = s.weapon_id
     WHERE s.enabled = 1`,
  );

  const result: MaintenanceDueRow[] = [];
  for (const row of rows) {
    const schedule = mapSchedule(row);
    const logged = await getWeaponLoggedRoundsTotal(db, schedule.weapon_id);
    const progress = maintenanceProgress(schedule, logged);
    result.push({
      weapon_id: schedule.weapon_id,
      weapon_name: row.weapon_name,
      schedule,
      owned_rounds_total: logged,
      rounds_since_service: progress.sinceService,
      rounds_until_due: progress.untilDue,
    });
  }
  return result;
}

export async function listMaintenanceDueWeapons(
  db: SQLiteDatabase,
): Promise<MaintenanceDueRow[]> {
  const rows = await listEnabledMaintenanceSchedules(db);
  return rows.filter((row) =>
    maintenanceProgress(row.schedule, row.owned_rounds_total).due,
  );
}
