/**
 * SEO implementation tests
 *
 * Covers:
 *  - Root layout metadata (title, description, OG, Twitter, robots)
 *  - Nairobi local keyword presence across all route layouts
 *  - JSON-LD schema structure and required fields
 *  - robots.txt content and sitemap directive
 *  - Per-page canonical URLs
 *  - Private pages marked noindex
 */

import { describe, it, expect } from 'vitest';
import { metadata as rootMetadata } from '../app/layout';
import { metadata as trainersMetadata } from '../app/trainers/layout';
import { metadata as communityMetadata } from '../app/community/layout';
import { metadata as goalsMetadata } from '../app/goals/layout';
import { metadata as registerMetadata } from '../app/register/layout';
import { metadata as leaderboardMetadata } from '../app/leaderboard/layout';
import { metadata as fitnessHabitTrackerMetadata } from '../app/fitness-habit-tracker/page';
import { metadata as cryptoFitnessAppMetadata } from '../app/crypto-fitness-app/page';
import { metadata as blockchainRewardsMetadata } from '../app/blockchain-fitness-rewards/page';
import { metadata as nftFitnessBadgesMetadata } from '../app/nft-fitness-badges/page';
import { metadata as aboutFittribeMetadata } from '../app/about-fittribe/page';
import { metadata as dashboardMetadata } from '../app/dashboard/layout';
import { metadata as loginMetadata } from '../app/login/layout';
import { metadata as checkInMetadata } from '../app/check-in/layout';
import { metadata as achievementsMetadata } from '../app/achievements/layout';
import { metadata as messagesMetadata } from '../app/messages/layout';
import { metadata as onboardingMetadata } from '../app/onboarding/layout';
import { metadata as profileMetadata } from '../app/profile/layout';
import { metadata as progressMetadata } from '../app/progress/layout';
import { metadata as tasksMetadata } from '../app/tasks/layout';
import { metadata as authTestMetadata } from '../app/auth-test/layout';
import { metadata as thirtyDayChallengeMetadata } from '../app/30-day-workout-challenge/page';
import { metadata as seventyFiveHardMetadata } from '../app/75-hard-alternative/page';
import { metadata as studyStreakMetadata } from '../app/study-streak-tracker/page';
import { metadata as accountabilityAppMetadata } from '../app/accountability-app/page';
import robots from '../app/robots';
import sitemap from '../app/sitemap';
import {
  organizationSchema,
  websiteSchema,
  localBusinessSchema,
  webApplicationSchema,
} from '../src/components/JsonLd';

const NAIROBI_AREAS = [
  'Kilimani', 'Karen', 'Ngong Road', 'CBD', 'Thika Road', 'Roysambu', 'Allsops',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function titleString(metadata: { title?: unknown }): string {
  const t = metadata.title;
  if (typeof t === 'string') return t;
  if (t && typeof t === 'object' && 'default' in t) return (t as { default: string }).default;
  return '';
}

function descriptionString(metadata: { description?: unknown }): string {
  return typeof metadata.description === 'string' ? metadata.description : '';
}

function keywordsArray(metadata: { keywords?: unknown }): string[] {
  const k = metadata.keywords;
  if (Array.isArray(k)) return k;
  if (typeof k === 'string') return [k];
  return [];
}

function hasAnyNairobiArea(text: string): boolean {
  return NAIROBI_AREAS.some((area) => text.includes(area)) || text.includes('Nairobi');
}

// ── Root metadata ─────────────────────────────────────────────────────────────

describe('Root layout metadata', () => {
  it('has a title containing FitTribe', () => {
    expect(titleString(rootMetadata)).toContain('FitTribe');
  });

  it('description leads with the goal-neutral positioning', () => {
    expect(descriptionString(rootMetadata)).toContain('any goal');
  });

  it('description is between 120–160 characters', () => {
    const desc = descriptionString(rootMetadata);
    expect(desc.length).toBeGreaterThanOrEqual(120);
    expect(desc.length).toBeLessThanOrEqual(160);
  });

  it('keywords cover the global habit/streak positioning', () => {
    const kw = keywordsArray(rootMetadata).join(' ');
    for (const term of ['habit tracker', 'streak', 'accountability', 'goal tracker']) {
      expect(kw, `Missing keyword: ${term}`).toContain(term);
    }
  });

  it('keywords and description do not lead with crypto terms', () => {
    const text = (keywordsArray(rootMetadata).join(' ') + ' ' + descriptionString(rootMetadata)).toLowerCase();
    for (const term of ['crypto', 'web3', 'on-chain', 'nft']) {
      expect(text, `Unexpected term: ${term}`).not.toContain(term);
    }
  });

  it('has openGraph title and description', () => {
    const og = rootMetadata.openGraph as Record<string, unknown>;
    expect(og).toBeTruthy();
    expect(og.title).toBeTruthy();
    expect(og.description).toBeTruthy();
  });

  it('openGraph has an image defined', () => {
    const og = rootMetadata.openGraph as Record<string, unknown>;
    const images = og.images as unknown[];
    expect(Array.isArray(images)).toBe(true);
    expect(images.length).toBeGreaterThan(0);
  });

  it('openGraph locale is en_US', () => {
    const og = rootMetadata.openGraph as Record<string, unknown>;
    expect(og.locale).toBe('en_US');
  });

  it('has Twitter card metadata', () => {
    const tw = rootMetadata.twitter as Record<string, unknown>;
    expect(tw).toBeTruthy();
    expect(tw.card).toBe('summary_large_image');
    expect(tw.title).toBeTruthy();
    expect(tw.images).toBeTruthy();
  });

  it('has metadataBase set', () => {
    expect(rootMetadata.metadataBase).toBeInstanceOf(URL);
  });

  it('robots allows indexing', () => {
    const robots = rootMetadata.robots as Record<string, unknown>;
    expect(robots.index).toBe(true);
    expect(robots.follow).toBe(true);
  });

  it('has canonical URL', () => {
    const alt = rootMetadata.alternates as Record<string, unknown>;
    expect(alt?.canonical).toBeTruthy();
  });
});

// ── Trainers page ─────────────────────────────────────────────────────────────

describe('Trainers page metadata', () => {
  it('title mentions personal trainers and Nairobi', () => {
    const title = titleString(trainersMetadata);
    expect(title.toLowerCase()).toContain('trainer');
    expect(hasAnyNairobiArea(title)).toBe(true);
  });

  it('description covers multiple Nairobi areas', () => {
    const desc = descriptionString(trainersMetadata);
    const found = NAIROBI_AREAS.filter((a) => desc.includes(a));
    expect(found.length).toBeGreaterThanOrEqual(4);
  });

  it('keywords target neighbourhood-specific searches', () => {
    const kw = keywordsArray(trainersMetadata);
    const hasGeo = kw.some((k) => NAIROBI_AREAS.some((a) => k.includes(a)));
    expect(hasGeo).toBe(true);
  });

  it('has a canonical URL', () => {
    const alt = trainersMetadata.alternates as Record<string, unknown>;
    expect(String(alt?.canonical)).toContain('/trainers');
  });
});

// ── Community page ────────────────────────────────────────────────────────────

describe('Community page metadata', () => {
  it('title mentions community and Nairobi', () => {
    const title = titleString(communityMetadata);
    expect(title.toLowerCase()).toContain('community');
    expect(hasAnyNairobiArea(title)).toBe(true);
  });

  it('description mentions Nairobi areas', () => {
    const desc = descriptionString(communityMetadata);
    expect(hasAnyNairobiArea(desc)).toBe(true);
  });

  it('has a canonical URL containing /community', () => {
    const alt = communityMetadata.alternates as Record<string, unknown>;
    expect(String(alt?.canonical)).toContain('/community');
  });
});

// ── Goals page ────────────────────────────────────────────────────────────────

describe('Goals page metadata', () => {
  it('title mentions fitness goals', () => {
    const title = titleString(goalsMetadata);
    expect(title.toLowerCase()).toMatch(/goal|fitness/);
  });

  it('description is not empty', () => {
    expect(descriptionString(goalsMetadata).length).toBeGreaterThan(40);
  });
});

describe('Leaderboard page metadata', () => {
  it('title mentions leaderboard or streaks', () => {
    const title = titleString(leaderboardMetadata).toLowerCase();
    expect(title).toMatch(/leaderboard|streak/);
  });

  it('description is not empty', () => {
    expect(descriptionString(leaderboardMetadata).length).toBeGreaterThan(40);
  });
});

describe('SEO landing page metadata', () => {
  it('fitness habit tracker page targets habit tracking', () => {
    const title = titleString(fitnessHabitTrackerMetadata).toLowerCase();
    expect(title).toContain('habit tracker');
  });

  it('crypto fitness app page targets crypto fitness', () => {
    const title = titleString(cryptoFitnessAppMetadata).toLowerCase();
    expect(title).toContain('crypto fitness app');
  });

  it('blockchain rewards page targets blockchain rewards', () => {
    const desc = descriptionString(blockchainRewardsMetadata).toLowerCase();
    expect(desc).toContain('blockchain fitness rewards');
  });

  it('nft badges page targets nft badges', () => {
    const title = titleString(nftFitnessBadgesMetadata).toLowerCase();
    expect(title).toContain('nft fitness badges');
  });

  const guidePages = [
    { name: '30-day workout challenge', metadata: thirtyDayChallengeMetadata, path: '/30-day-workout-challenge', term: '30-day workout challenge' },
    { name: '75 Hard alternative', metadata: seventyFiveHardMetadata, path: '/75-hard-alternative', term: '75 hard alternative' },
    { name: 'study streak tracker', metadata: studyStreakMetadata, path: '/study-streak-tracker', term: 'study streak tracker' },
    { name: 'accountability app', metadata: accountabilityAppMetadata, path: '/accountability-app', term: 'accountability app' },
  ];

  for (const { name, metadata, path, term } of guidePages) {
    it(`${name} page targets its search term`, () => {
      expect(titleString(metadata).toLowerCase()).toContain(term);
    });

    it(`${name} page has a canonical URL and a usable description`, () => {
      const alt = metadata.alternates as Record<string, unknown>;
      expect(String(alt?.canonical)).toContain(path);
      const desc = descriptionString(metadata);
      expect(desc.length).toBeGreaterThanOrEqual(120);
      expect(desc.length).toBeLessThanOrEqual(160);
    });
  }

  it('about page targets FitTribe brand/entity terms', () => {
    const title = titleString(aboutFittribeMetadata).toLowerCase();
    expect(title).toContain('about fittribe');
  });
});

// ── Register page ─────────────────────────────────────────────────────────────

describe('Register page metadata', () => {
  it('title encourages joining', () => {
    const title = titleString(registerMetadata).toLowerCase();
    expect(title).toMatch(/join|register|sign up|free/);
  });

  it('description is goal-neutral and makes no local-only claim', () => {
    const desc = descriptionString(registerMetadata);
    expect(desc.toLowerCase()).toContain('streak');
    expect(hasAnyNairobiArea(desc)).toBe(false);
  });

  it('is indexable (no noindex)', () => {
    const robots = registerMetadata.robots as Record<string, unknown> | undefined;
    if (robots) {
      expect(robots.index).not.toBe(false);
    }
  });
});

// ── Private pages — must be noindex ──────────────────────────────────────────

describe('Private pages are marked noindex', () => {
  const privatePages = [
    { name: 'dashboard', metadata: dashboardMetadata },
    { name: 'login',     metadata: loginMetadata },
    { name: 'check-in',  metadata: checkInMetadata },
    { name: 'messages',  metadata: messagesMetadata },
    { name: 'onboarding', metadata: onboardingMetadata },
    { name: 'profile', metadata: profileMetadata },
    { name: 'progress', metadata: progressMetadata },
    { name: 'tasks', metadata: tasksMetadata },
    { name: 'auth-test', metadata: authTestMetadata },
  ];

  for (const { name, metadata } of privatePages) {
    it(`${name} has robots.index = false`, () => {
      const robots = metadata.robots as Record<string, unknown>;
      expect(robots, `${name} is missing robots config`).toBeTruthy();
      expect(robots.index, `${name} should be noindex`).toBe(false);
    });
  }
});

// ── Achievements page ─────────────────────────────────────────────────────────

describe('Achievements page metadata', () => {
  it('title mentions achievements or rewards', () => {
    const title = titleString(achievementsMetadata).toLowerCase();
    expect(title).toMatch(/achievement|reward|nft/);
  });

  it('is marked noindex', () => {
    const robots = achievementsMetadata.robots as Record<string, unknown>;
    expect(robots.index).toBe(false);
  });
});

// ── JSON-LD schemas ───────────────────────────────────────────────────────────

describe('Organization JSON-LD schema', () => {
  it('has @context and @type', () => {
    expect(organizationSchema['@context']).toBe('https://schema.org');
    expect(organizationSchema['@type']).toBe('Organization');
  });

  it('name is FitTribe', () => {
    expect(organizationSchema.name).toBe('FitTribe');
  });

  it('address country is KE', () => {
    const addr = organizationSchema.address as Record<string, unknown>;
    expect(addr.addressCountry).toBe('KE');
    expect(addr.addressLocality).toBe('Nairobi');
  });

  it('describes the product as streak accountability, not a trainer marketplace', () => {
    const desc = organizationSchema.description.toLowerCase();
    expect(desc).toContain('streak accountability');
    expect(desc).not.toContain('trainer');
  });
});

describe('WebSite JSON-LD schema', () => {
  it('describes a streak accountability app', () => {
    expect(websiteSchema.description.toLowerCase()).toContain('streak');
  });

  it('advertises no site search while trainers are flagged off', () => {
    expect('potentialAction' in websiteSchema).toBe(false);
  });
});

describe('LocalBusiness JSON-LD schema', () => {
  it('type is HealthClub', () => {
    expect(localBusinessSchema['@type']).toBe('HealthClub');
  });

  it('geo coordinates are set for Nairobi', () => {
    const geo = localBusinessSchema.geo as Record<string, unknown>;
    expect(geo['@type']).toBe('GeoCoordinates');
    // Nairobi latitude is approximately -1.28
    expect(Number(geo.latitude)).toBeLessThan(0);
    expect(Number(geo.latitude)).toBeGreaterThan(-2);
  });

  it('areaServed includes all target neighbourhoods', () => {
    const areas = localBusinessSchema.areaServed as string[];
    for (const area of NAIROBI_AREAS) {
      expect(areas, `Missing neighbourhood: ${area}`).toContain(area);
    }
  });

  it('priceRange is KES', () => {
    expect(localBusinessSchema.priceRange).toBe('KES');
  });

  it('is open 24/7', () => {
    const hours = localBusinessSchema.openingHoursSpecification as Record<string, unknown>;
    expect(hours.opens).toBe('00:00');
    expect(hours.closes).toBe('23:59');
  });
});

describe('WebApplication JSON-LD schema', () => {
  it('declares a web application', () => {
    expect(webApplicationSchema['@type']).toBe('WebApplication');
  });

  it('uses a health app category', () => {
    expect(webApplicationSchema.applicationCategory).toBe('HealthApplication');
  });

  it('is free and not limited to one city', () => {
    expect(webApplicationSchema.offers.price).toBe('0');
    expect('areaServed' in webApplicationSchema).toBe(false);
    expect(webApplicationSchema.description.toLowerCase()).not.toContain('trainer');
  });
});

// ── robots route ──────────────────────────────────────────────────────────────

describe('robots route', () => {
  const rules = robots();

  it('allows all crawlers at root', () => {
    expect(rules.rules).toBeTruthy();
    expect(Array.isArray(rules.rules)).toBe(true);
    const globalRule = (rules.rules as Array<Record<string, unknown>>)[0];
    expect(globalRule.userAgent).toBe('*');
    expect(globalRule.allow).toBe('/');
  });

  it('has a Sitemap directive', () => {
    expect(String(rules.sitemap)).toContain('/sitemap.xml');
  });

  it('blocks private routes', () => {
    const globalRule = (rules.rules as Array<Record<string, unknown>>)[0];
    const disallow = globalRule.disallow as string[];
    expect(disallow).toContain('/dashboard');
    expect(disallow).toContain('/api/');
  });
});

// ── sitemap route ─────────────────────────────────────────────────────────────

describe('sitemap route', () => {
  it('lists public pages and leaves out sign-in pages', async () => {
    const urls = (await sitemap()).map((entry) => new URL(entry.url).pathname);
    for (const path of [
      '/30-day-workout-challenge',
      '/75-hard-alternative',
      '/study-streak-tracker',
      '/accountability-app',
      '/fitness-habit-tracker',
      '/leaderboard',
      '/register',
    ]) {
      expect(urls, `Missing from sitemap: ${path}`).toContain(path);
    }
    for (const path of ['/goals', '/community', '/dashboard']) {
      expect(urls, `Should not be in sitemap: ${path}`).not.toContain(path);
    }
  });
});
