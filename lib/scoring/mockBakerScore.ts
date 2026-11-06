import templateJson from '@/assets/targets/baker_sl_b27e_v1.json';
import type { DraftShot, Shot } from '@/lib/types';

type BakerTemplate = {
  id: string;
  scoringCenterNorm: { x: number; y: number };
  ringRadiiNorm: {
    x: number;
    ten: number;
    nine: number;
    eight: number;
    seven: number;
  };
  silhouetteBoundsNorm: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  maxScorePerShot: number;
};

const template = templateJson as BakerTemplate;

export const MOCK_ALGORITHM_VERSION = 'mock_baker_v1';

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Mock ring assignment from normalized image coordinates (M5 — not CV). */
export function ringValueForPoint(xNorm: number, yNorm: number): number {
  const { silhouetteBoundsNorm: b, scoringCenterNorm: c, ringRadiiNorm: r } = template;

  if (
    xNorm < b.minX ||
    xNorm > b.maxX ||
    yNorm < b.minY ||
    yNorm > b.maxY
  ) {
    return 0;
  }

  const d = distance({ x: xNorm, y: yNorm }, c);

  if (d <= r.x) {
    return 10;
  }
  if (d <= r.ten) {
    return 10;
  }
  if (d <= r.nine) {
    return 9;
  }
  if (d <= r.eight) {
    return 8;
  }
  if (d <= r.seven) {
    return 7;
  }

  return 0;
}

export function computeMockScoreFromDraftShots(shots: DraftShot[]): {
  total_score: number;
  max_score: number;
  group_size_mm: number | null;
  mean_radius_mm: number | null;
  shots: Array<{ x_norm: number; y_norm: number; ring_value: number; source: DraftShot['source'] }>;
} {
  const enriched = shots.map((s) => ({
    x_norm: s.x_norm,
    y_norm: s.y_norm,
    ring_value: ringValueForPoint(s.x_norm, s.y_norm),
    source: s.source,
  }));

  const total_score = enriched.reduce((sum, s) => sum + s.ring_value, 0);
  const max_score = shots.length * template.maxScorePerShot;

  const center = template.scoringCenterNorm;
  const radii = enriched.map((s) => distance({ x: s.x_norm, y: s.y_norm }, center));
  const group_size_mm =
    radii.length >= 2
      ? (Math.max(...radii) - Math.min(...radii)) * 350
      : radii.length === 1
        ? 0
        : null;
  const mean_radius_mm =
    radii.length > 0 ? (radii.reduce((a, b) => a + b, 0) / radii.length) * 350 : null;

  return {
    total_score,
    max_score,
    group_size_mm,
    mean_radius_mm,
    shots: enriched,
  };
}

export function computeMockScoreFromShots(shots: Shot[]): number {
  return shots.reduce((sum, s) => sum + (s.ring_value ?? ringValueForPoint(s.x_norm, s.y_norm)), 0);
}

export function getTemplateId(): string {
  return template.id;
}
