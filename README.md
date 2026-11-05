# Shooting app — Phase 1 validation prototype

Offline-first React Native app (Expo SDK 58, TypeScript) for logging range trips, weapons, target photos, and **manual shot marking with mock B-27 scoring** (milestones M1–M5).

## Setup

```bash
cd code/shooting-app
npm install
npx expo start
```

Open in Expo Go (iOS/Android) or a simulator. No EAS build required for this prototype.

## Scope completed (M1–M5)

| Milestone | Deliverable |
|-----------|-------------|
| **M1** | Expo shell, bottom tabs (Home, Trips, Library, Weapons, More), SQLite `shooting.db` with versioned schema |
| **M2** | Weapons CRUD (list, detail, add, edit, delete) |
| **M3** | Trips CRUD with `locations` + `trip_weapons` possession (`owned` / `rental` / `borrowed`) |
| **M4** | Target camera/gallery import; JPEG stored under app document directory; `target_images` rows (`baker_sl_b27e_v1`) |
| **M5** | Target score screen: tap/drag/remove markers, confirm → `shots` + `scores` with mock ring math |

Reference target for dev: `assets/targets/baker-sl-b27e-reference.jpg` (also loadable from trip detail via **Use B-27 reference sample**).

## Navigation map

- **Home** — recent trips/targets, shortcut to new trip
- **Trips** — list → trip detail → add target / edit / delete
- **Library** — all targets with score status
- **Weapons** — weapon library CRUD
- **More** — privacy copy + seeded static fundamentals tips

Target flow: trip detail → target detail → **Score / correct** → confirm mock score.

## Scripts

```bash
npm run typecheck   # tsc --noEmit
npm start           # expo start
```

## Next steps (M6+ — not in this pass)

- **M6:** Classical CV pipeline for `baker_sl_b27e_v1` (template alignment, blob hole detection, ring assignment from traced geometry in `assets/targets/baker_sl_b27e_v1.json`)
- **M7–M10:** Acceptance photo suite, tips engine, weather API, library filters/polish

### M6 blockers / prerequisites

1. Accurate ring geometry traced from the reference scan (current JSON uses placeholder radii).
2. Native CV choice in Expo (custom module, OpenCV bridge, or hybrid TFLite) — not yet integrated.
3. Auto-align / perspective normalization before mapping hits to normalized template space.
4. Device performance testing on 12 MP photos (&lt; 5 s target from spec).

## Data model

See Project spec §5 (`weapons`, `trips`, `trip_weapons`, `locations`, `weather_snapshots`, `target_images`, `shots`, `scores`, `tips_static`). Weather and auto-detection tables exist but are unused until later milestones.

## Privacy

All data stays on device. No accounts or backend in Phase 1.
