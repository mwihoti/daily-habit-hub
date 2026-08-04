/**
 * Time helpers for the reminder cron. FitTribe's market is Kenya, so
 * "the user's day" is computed in Africa/Nairobi (EAT, UTC+3, no DST) —
 * profiles.accountability_reminder_hour is stored in that local time.
 */

const EAT_OFFSET_MS = 3 * 60 * 60 * 1000

/** Hour of day (0-23) in Nairobi local time. */
export function nairobiHour(date: Date): number {
  return new Date(date.getTime() + EAT_OFFSET_MS).getUTCHours()
}

/** YYYY-MM-DD key for the Nairobi-local calendar day. */
export function nairobiDayKey(date: Date): string {
  return new Date(date.getTime() + EAT_OFFSET_MS).toISOString().slice(0, 10)
}

export function isSameNairobiDay(a: Date, b: Date): boolean {
  return nairobiDayKey(a) === nairobiDayKey(b)
}

/** UTC instant when the current Nairobi day began (00:00 EAT). */
export function nairobiDayStartUtc(date: Date): Date {
  const shifted = new Date(date.getTime() + EAT_OFFSET_MS)
  shifted.setUTCHours(0, 0, 0, 0)
  return new Date(shifted.getTime() - EAT_OFFSET_MS)
}
