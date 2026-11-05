import type { SQLiteDatabase } from 'expo-sqlite';

export const DB_NAME = 'shooting.db';
export const SCHEMA_VERSION = 1;

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

  if (current >= SCHEMA_VERSION) {
    return;
  }

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
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  });
}
