import type { Trip } from '@/lib/types';

/**
 * Phase 1 trips are offline visit logs, not live sessions.
 * Legacy rows may have NULL ended_at; treat those as completed.
 */
export function isTripCompleted(trip: Trip): boolean {
  const ended = trip.ended_at;
  if (ended == null) return true;
  return ended > 0;
}

export function tripEndedAtMs(trip: Trip): number {
  if (trip.ended_at != null && trip.ended_at > 0) return trip.ended_at;
  return trip.started_at;
}
