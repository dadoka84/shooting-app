export type WeaponCategory = 'pistol' | 'rifle' | 'sniper' | 'other';
export type Possession = 'owned' | 'rental' | 'borrowed';
export type ScoringStatus = 'pending' | 'auto' | 'confirmed';
export type ShotSource = 'auto' | 'manual';
export type LocationSource = 'gps' | 'manual' | 'geocode';
export type WeatherSource = 'api' | 'manual';

export const DEFAULT_TARGET_TEMPLATE = 'baker_sl_b27e_v1';

export interface Weapon {
  id: string;
  name: string;
  category: WeaponCategory;
  caliber: string | null;
  photo_path: string | null;
  serial_note: string | null;
  created_at: number;
  updated_at: number;
}

export interface Trip {
  id: string;
  started_at: number;
  ended_at: number | null;
  discipline_tag: string | null;
  notes: string | null;
  created_at: number;
  updated_at: number;
}

export interface TripWeapon {
  id: string;
  trip_id: string;
  weapon_id: string | null;
  possession: Possession;
  rental_note: string | null;
  sort_order: number;
  rounds_fired: number;
}

export interface Location {
  id: string;
  trip_id: string;
  latitude: number | null;
  longitude: number | null;
  display_name: string;
  source: LocationSource;
}

export interface TargetImage {
  id: string;
  trip_id: string;
  weapon_id: string | null;
  file_path: string;
  thumbnail_path: string | null;
  target_template: string;
  distance_m: number | null;
  shot_count_expected: number | null;
  created_at: number;
  scoring_status: ScoringStatus;
}

export interface Shot {
  id: string;
  target_image_id: string;
  x_norm: number;
  y_norm: number;
  ring_value: number | null;
  ordinal: number;
  source: ShotSource;
}

export interface Score {
  id: string;
  target_image_id: string;
  total_score: number;
  max_score: number | null;
  group_size_mm: number | null;
  mean_radius_mm: number | null;
  cep50_mm: number | null;
  computed_at: number;
  algorithm_version: string;
}

export interface DraftShot {
  id: string;
  x_norm: number;
  y_norm: number;
  source: ShotSource;
}

export interface TripWeaponInput {
  weapon_id: string | null;
  possession: Possession;
  rental_note: string | null;
  rounds_fired: number;
}

/** Round-based cleaning/service reminder for owned weapons only. */
export interface WeaponMaintenanceSchedule {
  weapon_id: string;
  enabled: number;
  interval_rounds: number;
  /** Owned-possession round count at last completed service. */
  baseline_rounds: number;
  /** Highest round total we already notified for this service cycle. */
  alerted_through_rounds: number;
  updated_at: number;
}
