import type { Metadata } from "next";
import { buildPublicMetadata } from "@/lib/seo";
import { SeoLandingPage } from "@/components/SeoLandingPage";

export const metadata: Metadata = buildPublicMetadata({
  title: "Accountability App | Stay Consistent with Daily Check-Ins",
  description:
    "FitTribe is a free accountability app. Check in once a day on any goal, keep a public streak, and stay consistent with a community that sees when you show up.",
  keywords: [
    "accountability app",
    "accountability partner app",
    "habit accountability",
    "daily check-in app",
    "goal accountability app",
  ],
  path: "/accountability-app",
});

export default function AccountabilityAppPage() {
  return (
    <SeoLandingPage
      eyebrow="Accountability app"
      title="An accountability app for people who quit when nobody is watching"
      description="Most habit trackers are private checklists, which makes them easy to ignore. FitTribe adds the part that changes behavior: other people can see whether you showed up today."
      sections={[
        {
          title: "Accountability from a visible streak",
          body: [
            "You check in once a day on the goal you chose. Your streak grows with each day and resets when you miss one.",
            "Public check-ins go to the community feed, where other members can like and comment, and your streak is ranked on the leaderboard. Going quiet is noticeable, and that is what keeps most people going.",
          ],
        },
        {
          title: "No accountability partner? Use the community",
          body: [
            "Finding one reliable partner is hard, and the arrangement ends when either of you stops. A community feed does not depend on a single person.",
            "If you already have a partner, a club or a group chat, join together and check in publicly. You will each see when the other has shown up.",
          ],
        },
        {
          title: "Nudges before you slip",
          body: [
            "Optional push reminders arrive when the day is ending and you have not checked in. A weekly accountability summary tells you plainly whether you are building momentum or drifting.",
            "It works for fitness, study, building a business or any daily habit, and it is free to use.",
          ],
        },
      ]}
      links={[
        {
          href: "/30-day-workout-challenge",
          title: "30-day workout challenge",
          description: "Put the streak to work on a fixed target.",
        },
        {
          href: "/study-streak-tracker",
          title: "Study streak tracker",
          description: "Use daily check-ins for studying.",
        },
        {
          href: "/leaderboard",
          title: "Streak leaderboard",
          description: "See who is holding the longest streaks.",
        },
      ]}
    />
  );
}
