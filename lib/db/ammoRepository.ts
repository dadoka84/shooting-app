import type { SQLiteDatabase } from 'expo-sqlite';

import { caliberMatchKey, calibersMatch, canonicalCaliberLabel } from '@/lib/ammo/caliberMatch';
import { computeTripAmmoDeductions } from '@/lib/ammo/tripConsumption';
import { newId, nowMs } from '@/lib/id';
import type { AmmoCaliberSummary, AmmoLot, TripWeaponInput, Weapon } from '@/lib/types';

const TRIP_RESTORE_MANUFACTURER = '—';

function normalizeCaliber(caliber: string): string {
  return canonicalCaliberLabel(caliber);
}

export async function createAmmoLot(
  db: SQLiteDatabase,
  input: {
    caliber: string;
    ammo_type: string;
    manufacturer: string;
    quantity: number;
    purchased_at?: number | null;
  },
): Promise<AmmoLot> {
  const qty = Math.max(0, Math.floor(input.quantity));
  if (qty <= 0) {
    throw new Error('AMMO_QTY_INVALID');
  }
  const caliber = normalizeCaliber(input.caliber);
  if (!caliber) {
    throw new Error('AMMO_CALIBER_REQUIRED');
  }
  const manufacturer = input.manufacturer.trim();
  if (!manufacturer) {
    throw new Error('AMMO_MANUFACTURER_REQUIRED');
  }
  const ts = nowMs();
  const lot: AmmoLot = {
    id: newId(),
    caliber,
    ammo_type: input.ammo_type.trim() || 'other',
    manufacturer,
    quantity_initial: qty,
    quantity_remaining: qty,
    purchased_at: input.purchased_at ?? null,
    created_at: ts,
    updated_at: ts,
  };
  await db.runAsync(
    `INSERT INTO ammo_lots
      (id, caliber, ammo_type, manufacturer, quantity_initial, quantity_remaining, purchased_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    lot.id,
    lot.caliber,
    lot.ammo_type,
    lot.manufacturer,
    lot.quantity_initial,
    lot.quantity_remaining,
    lot.purchased_at,
    lot.created_at,
    lot.updated_at,
  );
  return lot;
}

export async function getAmmoTotalQuantity(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(quantity_remaining), 0) AS total FROM ammo_lots',
  );
  return row?.total ?? 0;
}

export async function listAmmoByCaliber(db: SQLiteDatabase): Promise<AmmoCaliberSummary[]> {
  const lots = await db.getAllAsync<AmmoLot>(
    'SELECT * FROM ammo_lots WHERE quantity_remaining > 0',
  );
  const byKey = new Map<string, AmmoCaliberSummary>();
  for (const lot of lots) {
    const key = caliberMatchKey(lot.caliber);
    const label = canonicalCaliberLabel(lot.caliber);
    const prev = byKey.get(key);
    if (prev) {
      prev.quantity += lot.quantity_remaining;
    } else {
      byKey.set(key, { caliber: label, quantity: lot.quantity_remaining });
    }
  }
  return [...byKey.values()].sort((a, b) => a.caliber.localeCompare(b.caliber));
}

export class InsufficientAmmoError extends Error {
  constructor(
    readonly caliber: string,
    readonly requested: number,
    readonly available: number,
  ) {
    super('INSUFFICIENT_AMMO');
  }
}

/** Deduct quantity FIFO (oldest purchase first) for matching caliber. */
export async function reduceAmmoByCaliber(
  db: SQLiteDatabase,
  caliber: string,
  amount: number,
): Promise<void> {
  const norm = normalizeCaliber(caliber);
  const deduct = Math.max(0, Math.floor(amount));
  if (deduct <= 0) {
    throw new Error('AMMO_QTY_INVALID');
  }

  const allLots = await db.getAllAsync<AmmoLot>(
    `SELECT * FROM ammo_lots
     WHERE quantity_remaining > 0
     ORDER BY COALESCE(purchased_at, created_at) ASC, created_at ASC`,
  );
  const lots = allLots.filter((lot) => calibersMatch(lot.caliber, norm));

  const available = lots.reduce((s, l) => s + l.quantity_remaining, 0);
  if (available < deduct) {
    throw new InsufficientAmmoError(norm, deduct, available);
  }

  let left = deduct;
  const ts = nowMs();
  for (const lot of lots) {
    if (left <= 0) break;
    const take = Math.min(left, lot.quantity_remaining);
    const next = lot.quantity_remaining - take;
    await db.runAsync(
      'UPDATE ammo_lots SET quantity_remaining = ?, updated_at = ? WHERE id = ?',
      next,
      ts,
      lot.id,
    );
    left -= take;
  }
}

export type TripAmmoDeduction = { caliber: string; rounds: number };

export async function listTripAmmoDeductions(
  db: SQLiteDatabase,
  tripId: string,
): Promise<TripAmmoDeduction[]> {
  return db.getAllAsync<TripAmmoDeduction>(
    `SELECT caliber, rounds FROM trip_ammo_deductions WHERE trip_id = ? ORDER BY caliber COLLATE NOCASE`,
    tripId,
  );
}

async function restoreAmmoByCaliber(db: SQLiteDatabase, caliber: string, amount: number): Promise<void> {
  const add = Math.max(0, Math.floor(amount));
  if (add <= 0) return;
  const norm = normalizeCaliber(caliber);
  const ts = nowMs();
  const allLots = await db.getAllAsync<AmmoLot>(
    `SELECT * FROM ammo_lots ORDER BY updated_at DESC, created_at DESC`,
  );
  const lot = allLots.find((row) => calibersMatch(row.caliber, norm));
  if (lot) {
    await db.runAsync(
      'UPDATE ammo_lots SET quantity_remaining = quantity_remaining + ?, updated_at = ? WHERE id = ?',
      add,
      ts,
      lot.id,
    );
    return;
  }
  const id = newId();
  await db.runAsync(
    `INSERT INTO ammo_lots
      (id, caliber, ammo_type, manufacturer, quantity_initial, quantity_remaining, purchased_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    norm,
    'other',
    TRIP_RESTORE_MANUFACTURER,
    add,
    add,
    null,
    ts,
    ts,
  );
}

async function reverseTripAmmoDeductions(db: SQLiteDatabase, tripId: string): Promise<void> {
  const rows = await listTripAmmoDeductions(db, tripId);
  for (const row of rows) {
    await restoreAmmoByCaliber(db, row.caliber, row.rounds);
  }
  await db.runAsync('DELETE FROM trip_ammo_deductions WHERE trip_id = ?', tripId);
}

export async function clearTripAmmoConsumption(db: SQLiteDatabase, tripId: string): Promise<void> {
  await reverseTripAmmoDeductions(db, tripId);
}

/** Reconcile ammo box with owned rounds on a trip (call inside trip save transaction). */
export async function syncTripAmmoConsumption(
  db: SQLiteDatabase,
  tripId: string,
  tripWeapons: TripWeaponInput[],
  weaponsById: Map<string, Weapon>,
): Promise<void> {
  await reverseTripAmmoDeductions(db, tripId);

  const next = computeTripAmmoDeductions(tripWeapons, weaponsById);
  for (const line of next) {
    try {
      await reduceAmmoByCaliber(db, line.caliber, line.rounds);
    } catch (e) {
      if (e instanceof InsufficientAmmoError) {
        throw new TripAmmoInsufficientError(e.caliber, e.requested, e.available);
      }
      throw e;
    }
    await db.runAsync(
      'INSERT INTO trip_ammo_deductions (trip_id, caliber, rounds) VALUES (?, ?, ?)',
      tripId,
      line.caliber,
      line.rounds,
    );
  }
}

export class TripAmmoInsufficientError extends Error {
  constructor(
    readonly caliber: string,
    readonly requested: number,
    readonly available: number,
  ) {
    super('TRIP_AMMO_INSUFFICIENT');
  }
}

export function parsePurchaseDateInput(text: string): number | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(y, mo, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) {
    return null;
  }
  return dt.getTime();
}
