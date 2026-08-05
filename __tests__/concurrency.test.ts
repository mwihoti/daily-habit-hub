/**
 * mapWithConcurrency — bounded-parallelism helper used by the push cron.
 */

import { describe, it, expect } from 'vitest';
import { mapWithConcurrency } from '../src/lib/push/concurrency';

describe('mapWithConcurrency', () => {
  it('preserves input order in results', async () => {
    const out = await mapWithConcurrency([3, 1, 2], 2, async (n) => {
      await new Promise((r) => setTimeout(r, n * 10));
      return n * 10;
    });
    expect(out).toEqual([30, 10, 20]);
  });

  it('never exceeds the concurrency limit', async () => {
    let inFlight = 0;
    let peak = 0;
    await mapWithConcurrency(Array.from({ length: 20 }, (_, i) => i), 4, async () => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await new Promise((r) => setTimeout(r, 5));
      inFlight--;
    });
    expect(peak).toBeLessThanOrEqual(4);
    expect(peak).toBeGreaterThan(1);
  });

  it('converts rejections to null without sinking the batch', async () => {
    const out = await mapWithConcurrency([1, 2, 3], 2, async (n) => {
      if (n === 2) throw new Error('boom');
      return n;
    });
    expect(out).toEqual([1, null, 3]);
  });

  it('handles empty input and limit larger than items', async () => {
    expect(await mapWithConcurrency([], 5, async (x) => x)).toEqual([]);
    expect(await mapWithConcurrency([1], 100, async (x) => x)).toEqual([1]);
  });
});
