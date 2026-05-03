export type MilestoneId =
  | "genesis"
  | "iron_will"
  | "three_weeks"
  | "month_champion"
  | "consistency_legend";

export interface AchievementMeta {
  id: MilestoneId;
  title: string;
  description: string;
  unlockLabel: string;
  threshold: number;
  thresholdType: "workouts" | "streak";
  color: string;
  bg: string;
  borderColor: string;
  emoji: string;
  onChainType?: number;
  onChainNote?: string;
}

export const ACHIEVEMENT_META: AchievementMeta[] = [
  {
    id: "genesis",
    title: "Genesis Badge",
    description: "You showed up. That first step is the hardest — and you did it.",
    unlockLabel: "1 Check-in",
    threshold: 1,
    thresholdType: "workouts",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    emoji: "⭐",
  },
  {
    id: "iron_will",
    title: "Iron Will",
    description: "Seven days of showing up. Habits are officially forming.",
    unlockLabel: "7-Day Streak",
    threshold: 7,
    thresholdType: "streak",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    emoji: "🛡️",
    onChainType: 0,
    onChainNote: "On-chain NFT auto-minted by contract at 7 check-ins",
  },
  {
    id: "three_weeks",
    title: "Three Weeks Strong",
    description: "Science says 21 days builds a habit. You've proven it.",
    unlockLabel: "21 Check-ins",
    threshold: 21,
    thresholdType: "workouts",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    emoji: "🔥",
  },
  {
    id: "month_champion",
    title: "Month Champion",
    description: "A full month of commitment. You are the definition of consistency.",
    unlockLabel: "30-Day Streak",
    threshold: 30,
    thresholdType: "streak",
    color: "text-red-500",
    bg: "bg-red-500/10",
    borderColor: "border-red-500/30",
    emoji: "🏆",
    onChainType: 1,
    onChainNote: "On-chain NFT auto-minted by contract at 30 check-ins",
  },
  {
    id: "consistency_legend",
    title: "Consistency Legend",
    description: "7 consecutive weeks — this is no longer a habit. It's who you are.",
    unlockLabel: "49-Day Streak",
    threshold: 49,
    thresholdType: "streak",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    emoji: "👑",
  },
];

export function getAchievementMeta(id: string): AchievementMeta | undefined {
  return ACHIEVEMENT_META.find((item) => item.id === id);
}
