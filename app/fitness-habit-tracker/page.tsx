import type { Metadata } from "next";
import { buildPublicMetadata } from "@/lib/seo";
import { SeoLandingPage } from "@/components/SeoLandingPage";

export const metadata: Metadata = buildPublicMetadata({
  title: "Fitness Habit Tracker | Build a Daily Workout Routine with FitTribe",
  description:
    "FitTribe is a fitness habit tracker built for daily workout consistency, streak tracking, accountability, and long-term exercise routines.",
  keywords: [
    "fitness habit tracker",
    "habit tracking app",
    "daily workout tracker",
    "workout streak tracker",
    "build 30-day workout habit",
  ],
  path: "/fitness-habit-tracker",
});

export default function FitnessHabitTrackerPage() {
  return (
    <SeoLandingPage
      eyebrow="Fitness habit tracker"
      title="Build a workout routine you can actually keep"
      description="FitTribe is designed for people who want a practical fitness habit tracker: daily check-ins, visible streaks, accountability, and a structure that makes consistency easier to repeat."
      sections={[
        {
          title: "What makes a good fitness habit tracker",
          body: [
            "A good fitness habit tracker does more than store your workouts. It helps you show up again tomorrow. That means fast daily logging, visible streak progress, and a simple rhythm you can keep over weeks and months.",
            "FitTribe is built around that loop. You check in, keep your streak alive, and see your progress without getting buried under complex setup or unnecessary friction.",
          ],
        },
        {
          title: "Why streaks matter for workout consistency",
          body: [
            "A workout streak tracker creates short-term urgency around a long-term goal. Instead of thinking about a six-month transformation every day, you focus on showing up today and protecting momentum.",
            "That makes FitTribe useful for people trying to build a 30-day workout habit, recover from inconsistency, or stay accountable when motivation drops.",
          ],
        },
        {
          title: "How FitTribe fits into the routine",
          body: [
            "FitTribe combines daily workout tracking with community accountability, optional coaching, and a reward layer that gives consistency more weight. You can use it as a simple habit tracker first and grow into the other features over time.",
          ],
        },
      ]}
      links={[
        {
          href: "/community",
          title: "Workout accountability community",
          description: "See how the social layer supports daily momentum.",
        },
        {
          href: "/leaderboard",
          title: "Workout streak leaderboard",
          description: "Explore public rankings built around consistency.",
        },
        {
          href: "/trainers",
          title: "Coaching marketplace",
          description: "Add trainer support once your habit is in motion.",
        },
      ]}
    />
  );
}
