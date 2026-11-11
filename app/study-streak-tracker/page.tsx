import type { Metadata } from "next";
import { buildPublicMetadata } from "@/lib/seo";
import { SeoLandingPage } from "@/components/SeoLandingPage";

export const metadata: Metadata = buildPublicMetadata({
  title: "Study Streak Tracker | Build a Daily Study Habit",
  description:
    "Use FitTribe as a study streak tracker. Check in after each study session, keep your daily streak alive, and stay consistent through exams and long courses.",
  keywords: [
    "study streak tracker",
    "study habit tracker",
    "daily study streak",
    "study accountability app",
    "exam study tracker",
  ],
  path: "/study-streak-tracker",
});

export default function StudyStreakTrackerPage() {
  return (
    <SeoLandingPage
      eyebrow="Study streak tracker"
      title="Keep a study streak that survives exam season"
      description="Studying a little every day beats cramming, but daily study is hard to keep up alone. FitTribe was built for workout streaks and works the same way for study: one check-in a day and a streak you do not want to break."
      sections={[
        {
          title: "How to track study on FitTribe",
          body: [
            "After a study session, check in with the Personal Project or Custom Win type and add a short note about what you covered. That note becomes a log you can scroll back through before an exam.",
            "Set goals for the course or exam date and add daily tasks with reminders for specific chapters or problem sets.",
          ],
        },
        {
          title: "Why a streak works for studying",
          body: [
            "A streak turns a long course into one small decision a day. You stop asking whether you are on track for the exam and ask only whether you have studied today.",
            "The week calendar and monthly heatmap show gaps early, while there is still time to fix them.",
          ],
        },
        {
          title: "Study alongside other people",
          body: [
            "Make your check-ins public and they appear in the community feed next to people working on fitness, side projects and other goals. Seeing others show up daily makes it easier to do the same.",
            "FitTribe is free, runs in the browser and can be installed on your phone's home screen.",
          ],
        },
      ]}
      links={[
        {
          href: "/accountability-app",
          title: "Accountability app",
          description: "Stay consistent with a community that notices.",
        },
        {
          href: "/fitness-habit-tracker",
          title: "Fitness habit tracker",
          description: "Use the same streak for your workouts.",
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
