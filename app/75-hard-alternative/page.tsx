import type { Metadata } from "next";
import { buildPublicMetadata } from "@/lib/seo";
import { SeoLandingPage } from "@/components/SeoLandingPage";

export const metadata: Metadata = buildPublicMetadata({
  title: "75 Hard Alternative | A Daily Streak You Can Sustain",
  description:
    "Looking for a 75 Hard alternative? FitTribe is a daily streak challenge with one rule: check in every day. Walks, recovery and sleep all count.",
  keywords: [
    "75 hard alternative",
    "75 soft challenge tracker",
    "daily challenge app",
    "streak challenge",
    "discipline challenge app",
  ],
  path: "/75-hard-alternative",
});

export default function SeventyFiveHardAlternativePage() {
  return (
    <SeoLandingPage
      eyebrow="75 Hard alternative"
      title="A 75 Hard alternative with one rule: show up every day"
      description="Strict multi-rule challenges work for some people and burn out many more. If you want the daily discipline without two workouts, a fixed diet and a gallon of water, a streak is a simpler version of the same idea."
      sections={[
        {
          title: "One daily check-in instead of five tasks",
          body: [
            "On FitTribe the only requirement is one check-in a day. You decide what counts: a gym session, a run, a walk, a home workout, mobility work, meal prep or a hydration target.",
            "That keeps the part of a hard challenge that works, an unbroken chain of days, and drops the rules that make people quit in week two.",
          ],
        },
        {
          title: "The streak still has stakes",
          body: [
            "A missed day resets your streak to zero, so there is a real cost to skipping. Your streak is visible on your profile and on the public leaderboard.",
            "Milestone badges mark 7, 21, 30 and 49 days. There is no fixed end date, so day 75 is a target you can set yourself and then keep going past.",
          ],
        },
        {
          title: "Built for the days you would normally quit",
          body: [
            "Recovery days and sleep targets are valid check-ins, so illness, travel or a heavy week does not have to end the run.",
            "Optional reminders nudge you if the day is ending and you have not checked in, and a weekly summary shows whether your consistency is building or drifting.",
          ],
        },
      ]}
      links={[
        {
          href: "/30-day-workout-challenge",
          title: "30-day workout challenge",
          description: "Start with a shorter target.",
        },
        {
          href: "/accountability-app",
          title: "Accountability app",
          description: "How the community keeps you honest.",
        },
        {
          href: "/register",
          title: "Start your streak",
          description: "Create a free account in under a minute.",
        },
      ]}
    />
  );
}
