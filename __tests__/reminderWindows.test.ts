/**
 * Reminder time-window tests — Nairobi (EAT, UTC+3) day/hour math used by
 * the /api/push/reminders cron endpoint.
 */

import { describe, it, expect } from 'vitest';
import {
  nairobiHour,
  nairobiDayKey,
  isSameNairobiDay,
  nairobiDayStartUtc,
} from '../src/lib/push/reminderWindows';

describe('nairobiHour', () => {
  it('shifts UTC by +3', () => {
    expect(nairobiHour(new Date('2026-08-03T16:00:00Z'))).toBe(19);
    expect(nairobiHour(new Date('2026-08-03T03:00:00Z'))).toBe(6);
  });

  it('wraps past midnight', () => {
    expect(nairobiHour(new Date('2026-08-03T22:00:00Z'))).toBe(1);
    expect(nairobiHour(new Date('2026-08-03T21:00:00Z'))).toBe(0);
  });
});

describe('nairobiDayKey / isSameNairobiDay', () => {
  it('rolls the day over at 21:00 UTC', () => {
    expect(nairobiDayKey(new Date('2026-08-03T20:59:00Z'))).toBe('2026-08-03');
    expect(nairobiDayKey(new Date('2026-08-03T21:00:00Z'))).toBe('2026-08-04');
  });

  it('treats late-UTC and early-UTC instants as the same local day', () => {
    const lateEvening = new Date('2026-08-03T21:30:00Z'); // 00:30 EAT Aug 4
    const nextMorning = new Date('2026-08-04T05:00:00Z'); // 08:00 EAT Aug 4
    expect(isSameNairobiDay(lateEvening, nextMorning)).toBe(true);
    expect(isSameNairobiDay(new Date('2026-08-03T12:00:00Z'), lateEvening)).toBe(false);
  });
});

describe('nairobiDayStartUtc', () => {
  it('returns 21:00 UTC of the previous calendar day', () => {
    const start = nairobiDayStartUtc(new Date('2026-08-03T16:00:00Z'));
    expect(start.toISOString()).toBe('2026-08-02T21:00:00.000Z');
  });

  it('is idempotent across the whole local day', () => {
    const a = nairobiDayStartUtc(new Date('2026-08-03T21:05:00Z'));
    const b = nairobiDayStartUtc(new Date('2026-08-04T18:00:00Z'));
    expect(a.toISOString()).toBe(b.toISOString());
  });
});
