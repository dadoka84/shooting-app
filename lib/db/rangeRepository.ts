import type { SQLiteDatabase } from 'expo-sqlite';

import { newId, nowMs } from '@/lib/id';
import type { ShootingRange } from '@/lib/types';

function mapRow(row: ShootingRange): ShootingRange {
  return {
    ...row,
    address: row.address ?? null,
    phone: row.phone ?? null,
    web: row.web ?? null,
    email: row.email ?? null,
    comment: row.comment ?? null,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
  };
}

export async function listShootingRanges(db: SQLiteDatabase): Promise<ShootingRange[]> {
  const rows = await db.getAllAsync<ShootingRange>(
    'SELECT * FROM shooting_ranges ORDER BY name COLLATE NOCASE',
  );
  return rows.map(mapRow);
}

export async function getShootingRange(db: SQLiteDatabase, id: string): Promise<ShootingRange | null> {
  const row = await db.getFirstAsync<ShootingRange>('SELECT * FROM shooting_ranges WHERE id = ?', id);
  return row ? mapRow(row) : null;
}

export type ShootingRangeInput = {
  name: string;
  address?: string | null;
  phone?: string | null;
  web?: string | null;
  email?: string | null;
  comment?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export async function createShootingRange(db: SQLiteDatabase, input: ShootingRangeInput): Promise<string> {
  const id = newId();
  const ts = nowMs();
  await db.runAsync(
    `INSERT INTO shooting_ranges
      (id, name, address, phone, web, email, comment, latitude, longitude, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    input.name.trim(),
    input.address?.trim() || null,
    input.phone?.trim() || null,
    input.web?.trim() || null,
    input.email?.trim() || null,
    input.comment?.trim() || null,
    input.latitude ?? null,
    input.longitude ?? null,
    ts,
    ts,
  );
  return id;
}

export async function updateShootingRange(
  db: SQLiteDatabase,
  id: string,
  input: ShootingRangeInput,
): Promise<void> {
  await db.runAsync(
    `UPDATE shooting_ranges SET
      name = ?, address = ?, phone = ?, web = ?, email = ?, comment = ?,
      latitude = ?, longitude = ?, updated_at = ?
     WHERE id = ?`,
    input.name.trim(),
    input.address?.trim() || null,
    input.phone?.trim() || null,
    input.web?.trim() || null,
    input.email?.trim() || null,
    input.comment?.trim() || null,
    input.latitude ?? null,
    input.longitude ?? null,
    nowMs(),
    id,
  );

  await db.runAsync(
    `UPDATE locations SET display_name = ?, latitude = ?, longitude = ?
     WHERE range_id = ?`,
    input.name.trim(),
    input.latitude ?? null,
    input.longitude ?? null,
    id,
  );
}

export async function deleteShootingRange(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('UPDATE locations SET range_id = NULL WHERE range_id = ?', id);
  await db.runAsync('DELETE FROM shooting_ranges WHERE id = ?', id);
}
