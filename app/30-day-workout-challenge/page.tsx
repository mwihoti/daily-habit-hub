import type { Metadata } from "next";
import { buildPublicMetadata } from "@/lib/seo";
import { SeoLandingPage } from "@/components/SeoLandingPage";

export const metadata: Metadata = buildPublicMetadata({
  title: "30-Day Workout Challenge | Track Every Day with a Streak",
  description:
    "Run your own 30-day workout challenge on FitTribe. One check-in a day, a streak that shows every day you trained, and a badge when you reach day 30.",
  keywords: [
    "30 day workout challenge",
    "30 day fitness challenge tracker",
    "workout challenge app",
    "30 day challenge streak",
    "daily workout check-in",
  ],
  path: "/30-day-workout-challenge",
});

export default function ThirtyDayWorkoutChallengePage() {
  return (
    <SeoLandingPage
      eyebrow="30-day workout challenge"
      title="A 30-day workout challenge you can actually finish"
      description="Most 30-day challenges fail around day nine, when nobody is watching. FitTribe gives the challenge a simple structure: check in once a day, watch the streak grow, and let other people see that you showed up."
      sections={[
        {
          title: "How to run the challenge",
          body: [
            "Pick a daily minimum you can hit on your worst day: a 20-minute walk, a home workout, a gym session, a run. The challenge is the streak, so the daily bar should be low enough that you never have a reason to skip.",
            "Each day, open FitTribe and check in. It takes about 30 seconds, and you can add a note or a photo if you want a record of what you did.",
          ],
        },
        {
          title: "What keeps you going past week one",
          body: [
            "Your streak count and week calendar make a missed day visible, which is the point. Miss a day and the streak resets, so each check-in protects the ones before it.",
            "Public check-ins appear in the community feed and your streak counts on the leaderboard. You earn milestone badges at 7 days and again at 30, so there is a marker to aim for before the finish.",
          ],
        },
        {
          title: "Rest days still count",
          body: [
            "A 30-day challenge does not mean 30 hard sessions. FitTribe has check-in types for mobility, recovery days and sleep, so an honest rest day keeps the streak alive instead of ending the challenge.",
            "Doing it with friends or a club? Have everyone join and check in publicly so you can follow each other in the feed and compare streaks on the leaderboard.",
          ],
        },
      ]}
      links={[
        {
          href: "/fitness-habit-tracker",
          title: "Fitness habit tracker",
          description: "How daily check-ins and streaks work on FitTribe.",
        },
        {
          href: "/75-hard-alternative",
          title: "A flexible 75 Hard alternative",
          description: "A long daily challenge with one rule instead of five.",
        },
        {
          href: "/leaderboard",
          title: "Streak leaderboard",
          description: "See the longest active streaks.",
        },
      ]}
    />
  );
}
