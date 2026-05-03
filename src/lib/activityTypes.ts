export type ActivityGroup = "move" | "recover" | "build";

export interface ActivityOption {
  id: string;
  label: string;
  emoji: string;
  group: ActivityGroup;
  description: string;
}

export const ACTIVITY_OPTIONS: ActivityOption[] = [
  { id: "gym", label: "Gym Session", emoji: "🏋️", group: "move", description: "Strength, weights, machines" },
  { id: "run", label: "Run", emoji: "🏃", group: "move", description: "Run, jog, cardio block" },
  { id: "walk", label: "Walk", emoji: "🚶", group: "move", description: "Steps, walking, active recovery" },
  { id: "home", label: "Home Workout", emoji: "🏠", group: "move", description: "Bodyweight or home training" },
  { id: "cycling", label: "Cycling", emoji: "🚴", group: "move", description: "Outdoor or indoor ride" },
  { id: "mobility", label: "Mobility / Stretch", emoji: "🧘", group: "recover", description: "Stretching, mobility, yoga" },
  { id: "recovery", label: "Recovery Day", emoji: "🛀", group: "recover", description: "Rest, recovery, light reset" },
  { id: "meal_prep", label: "Meal Prep", emoji: "🥗", group: "build", description: "Nutrition win for the day" },
  { id: "hydration", label: "Hydration Goal", emoji: "💧", group: "build", description: "Hit your hydration target" },
  { id: "sleep", label: "Sleep Target", emoji: "😴", group: "recover", description: "Recovered with good sleep" },
  { id: "coach_task", label: "Coach Task", emoji: "✅", group: "build", description: "Completed a coach-assigned task" },
  { id: "personal_project", label: "Personal Project", emoji: "💻", group: "build", description: "Made progress on a personal project or deep-work block" },
  { id: "custom", label: "Custom Win", emoji: "✨", group: "build", description: "Log any progress that matters" },
];

export const ACTIVITY_GROUP_LABELS: Record<ActivityGroup, string> = {
  move: "Move",
  recover: "Recover",
  build: "Build",
};

export function getActivityOption(type?: string | null): ActivityOption | undefined {
  if (!type) return undefined;
  return ACTIVITY_OPTIONS.find((option) => option.id === type);
}

export function getActivityLabel(type?: string | null, title?: string | null): string {
  if (title?.trim()) return title.trim();
  return getActivityOption(type)?.label ?? "Custom Activity";
}

export function getActivityEmoji(type?: string | null): string {
  return getActivityOption(type)?.emoji ?? "💪";
}

export function getActivityDescription(type?: string | null): string {
  return getActivityOption(type)?.description ?? "Progress logged on FitTribe";
}

export function buildActivityNote(
  reflection: string,
  meta: {
    todayWin?: string;
    energy?: string;
    effort?: string;
    duration?: number | null;
  },
): string {
  const lines = [
    meta.todayWin ? `Today's win: ${meta.todayWin}` : null,
    meta.duration ? `Duration: ${meta.duration} min` : null,
    meta.energy ? `Energy: ${meta.energy}` : null,
    meta.effort ? `Effort: ${meta.effort}` : null,
  ].filter(Boolean);

  const cleanReflection = reflection.trim();
  const header = lines.join(" · ");

  if (header && cleanReflection) return `${header}\n\n${cleanReflection}`;
  if (header) return header;
  return cleanReflection;
}
