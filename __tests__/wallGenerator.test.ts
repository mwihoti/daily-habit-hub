/**
 * Graffiti wall generator tests
 *
 * Covers:
 *  - Level ladder thresholds (tag → throw-up → piece → burner → king → all-city)
 *  - Deterministic output: same inputs → identical SVG; different users differ
 *  - User-provided names are XML-escaped (no markup injection)
 *  - Palette selection from dominant workout type
 *  - Level-dependent art escalation markers
 */

import { describe, it, expect } from 'vitest';
import {
  generateWallSVG,
  getWallLevel,
  getWallPalette,
  hashSeed,
  mulberry32,
  WALL_LEVELS,
} from '../src/lib/skins/wallGenerator';

describe('getWallLevel', () => {
  it('maps check-in counts to the graffiti ladder', () => {
    expect(getWallLevel(0).level).toBe(0);
    expect(getWallLevel(1).name).toBe('First Tag');
    expect(getWallLevel(6).name).toBe('First Tag');
    expect(getWallLevel(7).name).toBe('Throw-Up');
    expect(getWallLevel(21).name).toBe('The Piece');
    expect(getWallLevel(30).name).toBe('Burner');
    expect(getWallLevel(49).name).toBe('King of the Wall');
    expect(getWallLevel(99).name).toBe('King of the Wall');
    expect(getWallLevel(100).name).toBe('All-City');
    expect(getWallLevel(5000).name).toBe('All-City');
  });

  it('reports progress to the next level', () => {
    expect(getWallLevel(3).next).toMatchObject({ name: 'Throw-Up', remaining: 4 });
    expect(getWallLevel(100).next).toBeNull();
  });

  it('has strictly ascending thresholds', () => {
    const mins = WALL_LEVELS.map((l) => l.min);
    expect([...mins].sort((a, b) => a - b)).toEqual(mins);
    expect(new Set(mins).size).toBe(mins.length);
  });
});

describe('determinism', () => {
  const opts = {
    userId: 'user-abc-123',
    name: 'Wanjiku',
    totalCheckins: 35,
    workoutTypes: ['Running', 'Running', 'Yoga'],
    stickers: 5,
    streak: 12,
  };

  it('same inputs always paint the same wall', () => {
    expect(generateWallSVG(opts)).toBe(generateWallSVG({ ...opts }));
  });

  it('different users paint different walls', () => {
    const other = generateWallSVG({ ...opts, userId: 'user-xyz-789' });
    expect(generateWallSVG(opts)).not.toBe(other);
  });

  it('prng is stable for a given seed', () => {
    const a = mulberry32(hashSeed('seed'));
    const b = mulberry32(hashSeed('seed'));
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});

describe('output safety and structure', () => {
  it('escapes markup in user names', () => {
    const svg = generateWallSVG({
      userId: 'u1',
      name: '<script>"x"</script>',
      totalCheckins: 10,
    });
    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&lt;SCRIPT&gt;');
  });

  it('is a self-contained svg document', () => {
    const svg = generateWallSVG({ userId: 'u1', name: 'Test', totalCheckins: 1 });
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(svg.trim().endsWith('</svg>')).toBe(true);
  });

  it('escalates the art with level', () => {
    const base = { userId: 'u1', name: 'Test', workoutTypes: [], stickers: 0, streak: 0 };
    const blank = generateWallSVG({ ...base, totalCheckins: 0 });
    const king = generateWallSVG({ ...base, totalCheckins: 49 });
    const allCity = generateWallSVG({ ...base, totalCheckins: 100 });

    expect(blank).toContain('check in to paint it');
    expect(king).toContain('#FACC15'); // crown gold
    expect(allCity).toContain('<animate'); // chrome shimmer
    expect(blank).not.toContain('<animate');
  });

  it('shows the streak chip only for active streaks', () => {
    const base = { userId: 'u1', name: 'Test', totalCheckins: 10 };
    expect(generateWallSVG({ ...base, streak: 9 })).toContain('🔥 9');
    expect(generateWallSVG({ ...base, streak: 0 })).not.toContain('🔥');
  });
});

describe('getWallPalette', () => {
  it('picks the dominant activity palette', () => {
    expect(getWallPalette(['Morning Run', 'Run', 'Gym'])[0]).toBe('#38BDF8'); // cardio
    expect(getWallPalette(['Leg Day Lifting', 'Weights'])[0]).toBe('#F97316'); // strength
    expect(getWallPalette(['Yoga Flow'])[0]).toBe('#C084FC'); // mobility
  });

  it('falls back to the brand palette', () => {
    expect(getWallPalette([])).toEqual(['#F97316', '#38BDF8', '#FACC15']);
    expect(getWallPalette(['Underwater Basket Weaving'])).toEqual(['#F97316', '#38BDF8', '#FACC15']);
  });
});
