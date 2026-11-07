import type { SQLiteDatabase } from 'expo-sqlite';

import { canonicalCaliberLabel } from '@/lib/ammo/caliberMatch';

export const DB_NAME = 'shooting.db';
export const SCHEMA_VERSION = 10;

const MIGRATION_V1 = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY NOT NULL,
  applied_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS weapons (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  caliber TEXT,
  photo_path TEXT,
  serial_note TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY NOT NULL,
  started_at INTEGER NOT NULL,
  ended_at INTEGER,
  discipline_tag TEXT,
  notes TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS trip_weapons (
  id TEXT PRIMARY KEY NOT NULL,
  trip_id TEXT NOT NULL,
  weapon_id TEXT,
  possession TEXT NOT NULL,
  rental_note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (weapon_id) REFERENCES weapons(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY NOT NULL,
  trip_id TEXT NOT NULL UNIQUE,
  latitude REAL,
  longitude REAL,
  display_name TEXT NOT NULL,
  source TEXT NOT NULL,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS weather_snapshots (
  id TEXT PRIMARY KEY NOT NULL,
  trip_id TEXT NOT NULL UNIQUE,
  captured_at INTEGER,
  temp_c REAL,
  wind_speed_mps REAL,
  wind_direction_deg REAL,
  conditions_text TEXT,
  humidity_pct REAL,
  source TEXT NOT NULL,
  raw_json TEXT,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS target_images (
  id TEXT PRIMARY KEY NOT NULL,
  trip_id TEXT NOT NULL,
  weapon_id TEXT,
  file_path TEXT NOT NULL,
  thumbnail_path TEXT,
  target_template TEXT NOT NULL,
  distance_m REAL,
  shot_count_expected INTEGER,
  created_at INTEGER NOT NULL,
  scoring_status TEXT NOT NULL,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (weapon_id) REFERENCES weapons(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS shots (
  id TEXT PRIMARY KEY NOT NULL,
  target_image_id TEXT NOT NULL,
  x_norm REAL NOT NULL,
  y_norm REAL NOT NULL,
  ring_value REAL,
  ordinal INTEGER NOT NULL,
  source TEXT NOT NULL,
  FOREIGN KEY (target_image_id) REFERENCES target_images(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scores (
  id TEXT PRIMARY KEY NOT NULL,
  target_image_id TEXT NOT NULL UNIQUE,
  total_score REAL NOT NULL,
  max_score REAL,
  group_size_mm REAL,
  mean_radius_mm REAL,
  cep50_mm REAL,
  computed_at INTEGER NOT NULL,
  algorithm_version TEXT NOT NULL,
  FOREIGN KEY (target_image_id) REFERENCES target_images(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tip_events (
  id TEXT PRIMARY KEY NOT NULL,
  target_image_id TEXT,
  trip_id TEXT,
  rule_id TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (target_image_id) REFERENCES target_images(id) ON DELETE CASCADE,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tips_static (
  id TEXT PRIMARY KEY NOT NULL,
  discipline_tag TEXT,
  title TEXT NOT NULL,
  body TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_target_images_trip ON target_images(trip_id);
CREATE INDEX IF NOT EXISTS idx_target_images_weapon ON target_images(weapon_id);
CREATE INDEX IF NOT EXISTS idx_trips_started ON trips(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_shots_target ON shots(target_image_id);
`;

const SEED_TIPS = `
INSERT OR IGNORE INTO tips_static (id, discipline_tag, title, body) VALUES
  ('tip-grip', 'all', 'Consistent grip', 'Same hand placement each shot. Avoid changing grip pressure mid-string.'),
  ('tip-trigger', 'all', 'Smooth trigger press', 'Press straight back without jerking. Follow through after the break.'),
  ('tip-sight', 'precision', 'Sight picture', 'Focus on the front sight; let the target blur slightly behind it.');
`;

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;

  if (current < SCHEMA_VERSION) {
  await db.withTransactionAsync(async () => {
    if (current < 1) {
      await db.execAsync(MIGRATION_V1);
      await db.runAsync(
        'INSERT OR REPLACE INTO schema_migrations (version, applied_at) VALUES (?, ?)',
        1,
        Date.now(),
      );
      await db.execAsync(SEED_TIPS);
    }
    if (current < 2) {
      await db.runAsync("UPDATE weapons SET category = 'sniper' WHERE category = 'pcc'");
      await db.runAsync(
        'INSERT OR REPLACE INTO schema_migrations (version, applied_at) VALUES (?, ?)',
        2,
        Date.now(),
      );
    }
    if (current < 3) {
      try {
        await db.execAsync(
          'ALTER TABLE trip_weapons ADD COLUMN rounds_fired INTEGER NOT NULL DEFAULT 0',
        );
      } catch {
        // column may already exist during dev reload
      }
      await db.runAsync(
        'INSERT OR REPLACE INTO schema_migrations (version, applied_at) VALUES (?, ?)',
        3,
        Date.now(),
      );
    }
    if (current < 4) {
      await db.runAsync(
        `UPDATE trips SET ended_at = COALESCE(ended_at, started_at) WHERE ended_at IS NULL`,
      );
      await db.runAsync(
        'INSERT OR REPLACE INTO schema_migrations (version, applied_at) VALUES (?, ?)',
        4,
        Date.now(),
      );
    }
    if (current < 5) {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS weapon_maintenance_schedules (
          weapon_id TEXT PRIMARY KEY NOT NULL REFERENCES weapons(id) ON DELETE CASCADE,
          enabled INTEGER NOT NULL DEFAULT 0,
          interval_rounds INTEGER NOT NULL DEFAULT 100,
          baseline_rounds INTEGER NOT NULL DEFAULT 0,
          alerted_through_rounds INTEGER NOT NULL DEFAULT 0,
          updated_at INTEGER NOT NULL
        );
      `);
      await db.runAsync(
        'INSERT OR REPLACE INTO schema_migrations (version, applied_at) VALUES (?, ?)',
        5,
        Date.now(),
      );
    }
    if (current < 6) {
      await db.execAsync(`
        INSERT OR IGNORE INTO tips_static (id, discipline_tag, title, body) VALUES
          ('tip-stance', 'all', 'Stable stance', 'Feet shoulder-width, weight slightly forward. Minimize movement between shots.'),
          ('tip-breathing', 'all', 'Breath control', 'Exhale halfway, hold briefly on the shot, then resume breathing.');
      `);
      await db.runAsync(
        'INSERT OR REPLACE INTO schema_migrations (version, applied_at) VALUES (?, ?)',
        6,
        Date.now(),
      );
    }
    if (current < 7) {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ammo_lots (
          id TEXT PRIMARY KEY NOT NULL,
          caliber TEXT NOT NULL,
          ammo_type TEXT NOT NULL,
          manufacturer TEXT NOT NULL,
          quantity_initial INTEGER NOT NULL,
          quantity_remaining INTEGER NOT NULL,
          purchased_at INTEGER,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_ammo_lots_caliber ON ammo_lots(caliber);
      `);
      await db.runAsync(
        'INSERT OR REPLACE INTO schema_migrations (version, applied_at) VALUES (?, ?)',
        7,
        Date.now(),
      );
    }
    if (current < 8) {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS trip_ammo_deductions (
          trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
          caliber TEXT NOT NULL,
          rounds INTEGER NOT NULL,
          PRIMARY KEY (trip_id, caliber)
        );
      `);
      await db.runAsync(
        'INSERT OR REPLACE INTO schema_migrations (version, applied_at) VALUES (?, ?)',
        8,
        Date.now(),
      );
    }
    if (current < 9) {
      const weapons = await db.getAllAsync<{ id: string; caliber: string }>(
        `SELECT id, caliber FROM weapons WHERE caliber IS NOT NULL AND TRIM(caliber) != ''`,
      );
      for (const row of weapons) {
        const next = canonicalCaliberLabel(row.caliber);
        if (next !== row.caliber) {
          await db.runAsync('UPDATE weapons SET caliber = ? WHERE id = ?', next, row.id);
        }
      }
      const lots = await db.getAllAsync<{ id: string; caliber: string }>(`SELECT id, caliber FROM ammo_lots`);
      for (const row of lots) {
        const next = canonicalCaliberLabel(row.caliber);
        if (next !== row.caliber) {
          await db.runAsync('UPDATE ammo_lots SET caliber = ? WHERE id = ?', next, row.id);
        }
      }
      const deductions = await db.getAllAsync<{
        trip_id: string;
        caliber: string;
        rounds: number;
      }>(`SELECT trip_id, caliber, rounds FROM trip_ammo_deductions`);
      for (const row of deductions) {
        const next = canonicalCaliberLabel(row.caliber);
        if (next !== row.caliber) {
          await db.runAsync(
            'UPDATE trip_ammo_deductions SET caliber = ? WHERE trip_id = ? AND caliber = ?',
            next,
            row.trip_id,
            row.caliber,
          );
        }
      }
      await db.runAsync(
        'INSERT OR REPLACE INTO schema_migrations (version, applied_at) VALUES (?, ?)',
        9,
        Date.now(),
      );
    }
    if (current < 10) {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS shooting_ranges (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          address TEXT,
          phone TEXT,
          web TEXT,
          email TEXT,
          comment TEXT,
          latitude REAL,
          longitude REAL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_shooting_ranges_name ON shooting_ranges(name COLLATE NOCASE);
      `);
      try {
        await db.execAsync('ALTER TABLE locations ADD COLUMN range_id TEXT REFERENCES shooting_ranges(id) ON DELETE SET NULL');
      } catch {
        // column may exist during dev reload
      }
      await db.runAsync(
        'INSERT OR REPLACE INTO schema_migrations (version, applied_at) VALUES (?, ?)',
        10,
        Date.now(),
      );
    }
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  });
  }

  await db.runAsync(
    `UPDATE trips SET ended_at = COALESCE(ended_at, started_at) WHERE ended_at IS NULL`,
  );
}
