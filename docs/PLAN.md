# WhatShotz product plan (Phase 1 → Phase 2)

Benchmarked against **Range App**, **ZeroPoint**, **TargetLog**, and **PewPew Life** — offline-first; no cloud until explicitly scoped.

## Shipped (M1–M5)

| Area | What we have |
|------|----------------|
| Sessions | Trip CRUD, locations, trip weapons (`owned` / `rental` / `borrowed`) |
| Arsenal | Weapon library CRUD |
| Targets | Camera / gallery import, B-27 template id, library list |
| Scoring | Manual markers + mock Baker B-27 ring math |
| UX | Tab shell, tactical theme, scrollable screens, button hierarchy |

## Competitive patterns → roadmap

| Pattern (seen elsewhere) | WhatShotz mapping | Milestone |
|--------------------------|-------------------|-----------|
| One-tap session / trip start | Home **New trip**, optional future “live session” timer | **M5a** (polish) / **M8** (live session) |
| Round count per gun & ammo deduct | `trip_weapons` exists; no round counter UI yet | **M8** inventory rounds |
| Target photos + score history | Library + trip targets + scores | ✅ M4–M5 |
| B-27 / silhouette scoring | Mock manual + future CV | **M6** auto B-27 |
| ISSF / photo CV scoring | Out of scope Phase 1; align with M6 pipeline | **M6+** |
| Calendar of range days | `trips.started_at` data; no calendar UI | **M9** calendar tab |
| Stats & trends | DB ready; no charts | **M10** stats |
| Saved ranges directory | `locations` per trip; no favorites directory | **M9** range favorites |
| Shooting buddies | Not in schema | **M11** buddies (optional) |
| Drill library | Static tips in **More** only | **M7** tips engine + drills |
| Weather / conditions | `weather_snapshots` table unused | **M10** weather snap |
| Cloud sync | Explicitly out of Phase 1 | Phase 3+ |
| AI target analysis | PewPew-style; needs backend or on-device CV | **M6** then **M12** AI assist |

## Near-term build order (recommended)

1. **M5a — UX & structure** (this pass): `ScrollView` screens, section cards, primary / secondary / outline / danger actions, tab intros.
2. **M6 — B-27 CV**: template JSON geometry, alignment, hole detect, ring assignment (&lt; 5 s on 12 MP target).
3. **M7 — Tips**: replace static seed with local tips engine; fundamentals categories.
4. **M8 — Session polish**: in-progress trip banner, end trip, optional round counts per weapon row.
5. **M8b — Maintenance schedules** (shipped): per owned weapon, round interval (50/100/150/200/custom), local notifications via `expo-notifications`, “mark service complete” baseline reset.
6. **M9 — Library filters + calendar**: filter by score status, template, date; month view of trips.
7. **M10 — Stats + weather**: simple line chart of scores; optional manual weather on trip save.

### M8b maintenance (detail)

| Piece | Behavior |
|-------|----------|
| Data | `weapon_maintenance_schedules` keyed by `weapon_id` |
| Rounds counted | `trip_weapons` where `possession = 'owned'` only |
| UI | Weapon detail → toggle, interval picker, status, mark complete |
| Notify | On app refresh / after trips, when `owned_total ≥ baseline + interval` |
| Permissions | Local notifications; dev build recommended for Android push channel polish |

## Principles

- **Local-first**: no account required for validation prototype.
- **Reuse schema**: prefer UI on existing tables over migrations until M8+.
- **One scoring story**: perfect manual B-27 path before auto CV ships.
