import type { SQLiteDatabase } from 'expo-sqlite';
import { newId, nowMs } from '@/lib/id';
import type {
  Location,
  Possession,
  Score,
  Shot,
  TargetImage,
  Trip,
  TripWeapon,
  TripWeaponInput,
  Weapon,
  WeaponCategory,
} from '@/lib/types';
import { DEFAULT_TARGET_TEMPLATE } from '@/lib/types';
import {
  MOCK_ALGORITHM_VERSION,
  computeMockScoreFromDraftShots,
} from '@/lib/scoring/mockBakerScore';
import type { DraftShot } from '@/lib/types';
import { persistTargetPhoto } from '@/lib/photos';
import { canonicalCaliberLabel } from '@/lib/ammo/caliberMatch';
import { syncTripAmmoConsumption, clearTripAmmoConsumption } from '@/lib/db/ammoRepository';
import { normalizeWeaponCategory } from '@/lib/weapons/categoryDisplay';

function mapWeaponRow(row: Weapon): Weapon {
  return {
    ...row,
    category: normalizeWeaponCategory(String(row.category)),
  };
}

export async function listWeapons(db: SQLiteDatabase): Promise<Weapon[]> {
  const rows = await db.getAllAsync<Weapon>('SELECT * FROM weapons ORDER BY name COLLATE NOCASE');
  return rows.map(mapWeaponRow);
}

export async function getWeapon(db: SQLiteDatabase, id: string): Promise<Weapon | null> {
  const row = await db.getFirstAsync<Weapon>('SELECT * FROM weapons WHERE id = ?', id);
  return row ? mapWeaponRow(row) : null;
}

export async function createWeapon(
  db: SQLiteDatabase,
  input: {
    name: string;
    category: WeaponCategory;
    caliber?: string | null;
    serial_note?: string | null;
  },
): Promise<Weapon> {
  const ts = nowMs();
  const weapon: Weapon = {
    id: newId(),
    name: input.name.trim(),
    category: input.category,
    caliber: input.caliber?.trim() ? canonicalCaliberLabel(input.caliber) : null,
    photo_path: null,
    serial_note: input.serial_note?.trim() || null,
    created_at: ts,
    updated_at: ts,
  };
  await db.runAsync(
    `INSERT INTO weapons (id, name, category, caliber, photo_path, serial_note, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    weapon.id,
    weapon.name,
    weapon.category,
    weapon.caliber,
    weapon.photo_path,
    weapon.serial_note,
    weapon.created_at,
    weapon.updated_at,
  );
  return weapon;
}

export async function updateWeapon(
  db: SQLiteDatabase,
  id: string,
  input: {
    name: string;
    category: WeaponCategory;
    caliber?: string | null;
    serial_note?: string | null;
  },
): Promise<void> {
  await db.runAsync(
    `UPDATE weapons SET name = ?, category = ?, caliber = ?, serial_note = ?, updated_at = ? WHERE id = ?`,
    input.name.trim(),
    input.category,
    input.caliber?.trim() ? canonicalCaliberLabel(input.caliber) : null,
    input.serial_note?.trim() || null,
    nowMs(),
    id,
  );
}

export async function deleteWeapon(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM weapons WHERE id = ?', id);
}

export async function listTrips(db: SQLiteDatabase): Promise<Trip[]> {
  return db.getAllAsync<Trip>('SELECT * FROM trips ORDER BY started_at DESC');
}

export type TripBrowseRow = Trip & {
  location_name: string | null;
  rounds_total: number;
  weapon_ids: string | null;
};

export async function listTripsForBrowse(db: SQLiteDatabase): Promise<TripBrowseRow[]> {
  const rows = await db.getAllAsync<TripBrowseRow>(
    `SELECT t.*,
            l.display_name AS location_name,
            COALESCE(SUM(tw.rounds_fired), 0) AS rounds_total,
            GROUP_CONCAT(DISTINCT tw.weapon_id) AS weapon_ids
     FROM trips t
     LEFT JOIN locations l ON l.trip_id = t.id
     LEFT JOIN trip_weapons tw ON tw.trip_id = t.id
     GROUP BY t.id
     ORDER BY t.started_at DESC`,
  );
  return rows.map((r) => ({
    ...r,
    rounds_total: Number(r.rounds_total ?? 0),
  }));
}

export async function getTrip(db: SQLiteDatabase, id: string): Promise<Trip | null> {
  return db.getFirstAsync<Trip>('SELECT * FROM trips WHERE id = ?', id);
}

export async function getTripLocation(
  db: SQLiteDatabase,
  tripId: string,
): Promise<Location | null> {
  return db.getFirstAsync<Location>('SELECT * FROM locations WHERE trip_id = ?', tripId);
}

function mapTripWeaponRow(row: TripWeapon): TripWeapon {
  return {
    ...row,
    rounds_fired: row.rounds_fired ?? 0,
  };
}

export async function listTripWeapons(
  db: SQLiteDatabase,
  tripId: string,
): Promise<TripWeapon[]> {
  const rows = await db.getAllAsync<TripWeapon>(
    'SELECT * FROM trip_weapons WHERE trip_id = ? ORDER BY sort_order, id',
    tripId,
  );
  return rows.map(mapTripWeaponRow);
}

export async function getTotalRoundsFiredAllTime(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(rounds_fired), 0) AS total FROM trip_weapons',
  );
  return row?.total ?? 0;
}

export type WeaponWithRoundTotal = Weapon & { rounds_fired_total: number };

export async function listWeaponsWithRoundTotals(db: SQLiteDatabase): Promise<WeaponWithRoundTotal[]> {
  const rows = await db.getAllAsync<WeaponWithRoundTotal>(
    `SELECT w.*, COALESCE(SUM(tw.rounds_fired), 0) AS rounds_fired_total
     FROM weapons w
     LEFT JOIN trip_weapons tw ON tw.weapon_id = w.id
     GROUP BY w.id
     ORDER BY w.name COLLATE NOCASE`,
  );
  return rows.map((w) => ({
    ...mapWeaponRow(w),
    rounds_fired_total: w.rounds_fired_total ?? 0,
  }));
}

export async function getTripRoundsFiredTotal(db: SQLiteDatabase, tripId: string): Promise<number> {
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(rounds_fired), 0) AS total FROM trip_weapons WHERE trip_id = ?',
    tripId,
  );
  return row?.total ?? 0;
}

export async function createTrip(
  db: SQLiteDatabase,
  input: {
    started_at: number;
    notes?: string | null;
    discipline_tag?: string | null;
    location_name: string;
    latitude?: number | null;
    longitude?: number | null;
    weapons: TripWeaponInput[];
  },
): Promise<string> {
  const tripId = newId();
  const ts = nowMs();
  const endedAt = nowMs();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO trips (id, started_at, ended_at, discipline_tag, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      tripId,
      input.started_at,
      endedAt,
      input.discipline_tag?.trim() || null,
      input.notes?.trim() || null,
      ts,
      ts,
    );

    const locId = newId();
    await db.runAsync(
      `INSERT INTO locations (id, trip_id, latitude, longitude, display_name, source)
       VALUES (?, ?, ?, ?, ?, ?)`,
      locId,
      tripId,
      input.latitude ?? null,
      input.longitude ?? null,
      input.location_name.trim() || 'Unknown range',
      input.latitude != null ? 'gps' : 'manual',
    );

    let order = 0;
    for (const w of input.weapons) {
      await db.runAsync(
        `INSERT INTO trip_weapons (id, trip_id, weapon_id, possession, rental_note, sort_order, rounds_fired)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        newId(),
        tripId,
        w.weapon_id,
        w.possession,
        w.rental_note?.trim() || null,
        order++,
        Math.max(0, w.rounds_fired ?? 0),
      );
    }

    const weaponRows = await db.getAllAsync<Weapon>('SELECT * FROM weapons');
    const weaponsById = new Map(weaponRows.map((w) => [w.id, w]));
    await syncTripAmmoConsumption(db, tripId, input.weapons, weaponsById);
  });

  return tripId;
}

export async function updateTrip(
  db: SQLiteDatabase,
  tripId: string,
  input: {
    started_at: number;
    notes?: string | null;
    discipline_tag?: string | null;
    location_name: string;
    latitude?: number | null;
    longitude?: number | null;
    weapons: TripWeaponInput[];
  },
): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE trips SET started_at = ?, discipline_tag = ?, notes = ?, updated_at = ? WHERE id = ?`,
      input.started_at,
      input.discipline_tag?.trim() || null,
      input.notes?.trim() || null,
      nowMs(),
      tripId,
    );

    const existingLoc = await getTripLocation(db, tripId);
    if (existingLoc) {
      await db.runAsync(
        `UPDATE locations SET display_name = ?, latitude = ?, longitude = ?, source = ? WHERE trip_id = ?`,
        input.location_name.trim() || 'Unknown range',
        input.latitude ?? null,
        input.longitude ?? null,
        input.latitude != null ? 'gps' : 'manual',
        tripId,
      );
    } else {
      await db.runAsync(
        `INSERT INTO locations (id, trip_id, latitude, longitude, display_name, source)
         VALUES (?, ?, ?, ?, ?, ?)`,
        newId(),
        tripId,
        input.latitude ?? null,
        input.longitude ?? null,
        input.location_name.trim() || 'Unknown range',
        input.latitude != null ? 'gps' : 'manual',
      );
    }

    await db.runAsync('DELETE FROM trip_weapons WHERE trip_id = ?', tripId);
    let order = 0;
    for (const w of input.weapons) {
      await db.runAsync(
        `INSERT INTO trip_weapons (id, trip_id, weapon_id, possession, rental_note, sort_order, rounds_fired)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        newId(),
        tripId,
        w.weapon_id,
        w.possession,
        w.rental_note?.trim() || null,
        order++,
        Math.max(0, w.rounds_fired ?? 0),
      );
    }

    const weaponRows = await db.getAllAsync<Weapon>('SELECT * FROM weapons');
    const weaponsById = new Map(weaponRows.map((w) => [w.id, w]));
    await syncTripAmmoConsumption(db, tripId, input.weapons, weaponsById);
  });
}

export async function deleteTrip(db: SQLiteDatabase, tripId: string): Promise<void> {
  await db.withTransactionAsync(async () => {
    await clearTripAmmoConsumption(db, tripId);
    await db.runAsync('DELETE FROM trips WHERE id = ?', tripId);
  });
}

export async function listTargetsForTrip(
  db: SQLiteDatabase,
  tripId: string,
): Promise<TargetImage[]> {
  return db.getAllAsync<TargetImage>(
    'SELECT * FROM target_images WHERE trip_id = ? ORDER BY created_at DESC',
    tripId,
  );
}

export type TargetListRow = TargetImage & {
  trip_started_at: number;
  total_score: number | null;
};

export async function listAllTargets(db: SQLiteDatabase): Promise<TargetListRow[]> {
  return db.getAllAsync<TargetListRow>(
    `SELECT ti.*, t.started_at AS trip_started_at, s.total_score
     FROM target_images ti
     JOIN trips t ON t.id = ti.trip_id
     LEFT JOIN scores s ON s.target_image_id = ti.id
     ORDER BY ti.created_at DESC`,
  );
}

export async function getTarget(
  db: SQLiteDatabase,
  id: string,
): Promise<TargetImage | null> {
  return db.getFirstAsync<TargetImage>('SELECT * FROM target_images WHERE id = ?', id);
}

export async function createTargetFromPhoto(
  db: SQLiteDatabase,
  input: {
    trip_id: string;
    weapon_id?: string | null;
    sourceUri: string;
    target_template?: string;
  },
): Promise<TargetImage> {
  const id = newId();
  const relativePath = await persistTargetPhoto(input.sourceUri, id);
  const ts = nowMs();
  const target: TargetImage = {
    id,
    trip_id: input.trip_id,
    weapon_id: input.weapon_id ?? null,
    file_path: relativePath,
    thumbnail_path: null,
    target_template: input.target_template ?? DEFAULT_TARGET_TEMPLATE,
    distance_m: null,
    shot_count_expected: null,
    created_at: ts,
    scoring_status: 'pending',
  };

  await db.runAsync(
    `INSERT INTO target_images
     (id, trip_id, weapon_id, file_path, thumbnail_path, target_template, distance_m, shot_count_expected, created_at, scoring_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    target.id,
    target.trip_id,
    target.weapon_id,
    target.file_path,
    target.thumbnail_path,
    target.target_template,
    target.distance_m,
    target.shot_count_expected,
    target.created_at,
    target.scoring_status,
  );

  return target;
}

export async function listShots(db: SQLiteDatabase, targetId: string): Promise<Shot[]> {
  return db.getAllAsync<Shot>(
    'SELECT * FROM shots WHERE target_image_id = ? ORDER BY ordinal',
    targetId,
  );
}

export async function getScore(db: SQLiteDatabase, targetId: string): Promise<Score | null> {
  return db.getFirstAsync<Score>('SELECT * FROM scores WHERE target_image_id = ?', targetId);
}

export async function confirmTargetScore(
  db: SQLiteDatabase,
  targetId: string,
  draftShots: DraftShot[],
): Promise<Score> {
  const computed = computeMockScoreFromDraftShots(draftShots);
  const scoreId = newId();
  const ts = nowMs();

  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM shots WHERE target_image_id = ?', targetId);
    await db.runAsync('DELETE FROM scores WHERE target_image_id = ?', targetId);

    for (let i = 0; i < computed.shots.length; i++) {
      const s = computed.shots[i];
      await db.runAsync(
        `INSERT INTO shots (id, target_image_id, x_norm, y_norm, ring_value, ordinal, source)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        newId(),
        targetId,
        s.x_norm,
        s.y_norm,
        s.ring_value,
        i,
        draftShots[i]?.source ?? 'manual',
      );
    }

    await db.runAsync(
      `INSERT INTO scores
       (id, target_image_id, total_score, max_score, group_size_mm, mean_radius_mm, cep50_mm, computed_at, algorithm_version)
       VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
      scoreId,
      targetId,
      computed.total_score,
      computed.max_score,
      computed.group_size_mm,
      computed.mean_radius_mm,
      ts,
      MOCK_ALGORITHM_VERSION,
    );

    await db.runAsync(
      `UPDATE target_images SET scoring_status = 'confirmed' WHERE id = ?`,
      targetId,
    );
  });

  const score = await getScore(db, targetId);
  if (!score) {
    throw new Error('Score not persisted');
  }
  return score;
}

export async function deleteTarget(db: SQLiteDatabase, targetId: string): Promise<void> {
  await db.runAsync('DELETE FROM target_images WHERE id = ?', targetId);
}

export async function recentTrips(db: SQLiteDatabase, limit = 5): Promise<Trip[]> {
  return db.getAllAsync<Trip>('SELECT * FROM trips ORDER BY started_at DESC LIMIT ?', limit);
}

export type RecentTripRow = Trip & { location_name: string | null };

export async function recentTripsWithLocations(
  db: SQLiteDatabase,
  limit = 5,
): Promise<RecentTripRow[]> {
  return db.getAllAsync<RecentTripRow>(
    `SELECT t.*, l.display_name AS location_name
     FROM trips t
     LEFT JOIN locations l ON l.trip_id = t.id
     ORDER BY t.started_at DESC
     LIMIT ?`,
    limit,
  );
}

export async function recentTargets(db: SQLiteDatabase, limit = 5): Promise<TargetListRow[]> {
  return db.getAllAsync<TargetListRow>(
    `SELECT ti.*, t.started_at AS trip_started_at, s.total_score
     FROM target_images ti
     JOIN trips t ON t.id = ti.trip_id
     LEFT JOIN scores s ON s.target_image_id = ti.id
     ORDER BY ti.created_at DESC
     LIMIT ?`,
    limit,
  );
}

export async function listStaticTips(
  db: SQLiteDatabase,
): Promise<Array<{ id: string; title: string; body: string }>> {
  return db.getAllAsync('SELECT id, title, body FROM tips_static ORDER BY title');
}
