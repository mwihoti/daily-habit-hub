/**
 * Feature flags. Trainers/coaching (marketplace, profiles, messaging) is
 * fully built but hidden while the product focuses on streak accountability —
 * flip NEXT_PUBLIC_FEATURE_TRAINERS=true (or the default here) to bring the
 * whole surface back: nav items, routes, sitemap entries, and cross-links.
 */
export const FEATURE_TRAINERS = process.env.NEXT_PUBLIC_FEATURE_TRAINERS === "true";
