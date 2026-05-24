import { differenceInCalendarDays, eachDayOfInterval, format, isSameDay, startOfDay, subDays } from "date-fns";
import { ACTIVITY_GROUP_LABELS, getActivityEmoji, getActivityLabel, getActivityOption } from "@/lib/activityTypes";

export interface AccountabilityWorkout {
  created_at: string;
  type?: string | null;
  activity_title?: string | null;
  duration_minutes?: number | null;
  energy_level?: string | null;
  effort_level?: string | null;
}

export interface AccountabilityInsight {
  streakRisk: "safe" | "watch" | "critical";
  daysSinceLastCheckin: number | null;
  weeklyCheckins: number;
  weeklyConsistency: number;
  consistencyScore: number;
  topActivityLabel: string | null;
  topActivityEmoji: string;
  topActivityCount: number;
  focusGroupLabel: string | null;
  focusGroupCount: number;
  averageDuration: number | null;
  recommendedAction: string;
  recoveryPrompt: string;
  momentumSummary: string;
  premiumSummary: string;
  activeDaysLast14: number;
  strongestDayLabel: string | null;
}

export interface GoalInsightInput {
  title?: string | null;
  target_date?: string | null;
  status?: string | null;
  progress?: number | null;
}

export interface TaskInsightInput {
  title?: string | null;
  due_date?: string | null;
  reminder_at?: string | null;
  is_completed?: boolean | null;
}

export interface GoalInsight {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  overdueGoals: number;
  averageProgress: number;
  nextGoalDeadline: string | null;
  recommendedAction: string;
}

export interface TaskInsight {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  dueTodayTasks: number;
  completionRate: number;
  recommendedAction: string;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function buildAccountabilityInsight(
  workouts: AccountabilityWorkout[],
  opts?: { now?: Date; hasCheckedInToday?: boolean },
): AccountabilityInsight {
  const now = opts?.now ?? new Date();
  const today = startOfDay(now);
  const sorted = [...workouts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const lastCheckinDate = sorted[0] ? startOfDay(new Date(sorted[0].created_at)) : null;
  const daysSinceLastCheckin = lastCheckinDate ? differenceInCalendarDays(today, lastCheckinDate) : null;

  const last14Days = eachDayOfInterval({ start: subDays(today, 13), end: today });
  const activeDayKeys = new Set(
    workouts.map((workout) => startOfDay(new Date(workout.created_at)).toISOString()),
  );
  const activeDaysLast14 = last14Days.filter((day) => activeDayKeys.has(day.toISOString())).length;

  const weeklyStart = subDays(today, 6);
  const weeklyCheckins = workouts.filter((workout) => new Date(workout.created_at) >= weeklyStart).length;
  const weeklyConsistency = Math.round((weeklyCheckins / 7) * 100);
  const consistencyScore = Math.round((activeDaysLast14 / 14) * 100);

  const activityCounts = new Map<string, { count: number; type?: string | null }>();
  const groupCounts = new Map<string, number>();
  const weekdayCounts = new Map<number, number>();
  const durations: number[] = [];

  for (const workout of workouts) {
    const label = getActivityLabel(workout.type, workout.activity_title);
    const existing = activityCounts.get(label);
    activityCounts.set(label, {
      count: (existing?.count ?? 0) + 1,
      type: workout.type,
    });

    const group = getActivityOption(workout.type)?.group ?? "build";
    groupCounts.set(group, (groupCounts.get(group) ?? 0) + 1);

    const created = new Date(workout.created_at);
    weekdayCounts.set(created.getDay(), (weekdayCounts.get(created.getDay()) ?? 0) + 1);

    if (typeof workout.duration_minutes === "number" && workout.duration_minutes > 0) {
      durations.push(workout.duration_minutes);
    }
  }

  const topActivity = [...activityCounts.entries()].sort((a, b) => b[1].count - a[1].count)[0];
  const topGroup = [...groupCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const strongestDay = [...weekdayCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const averageDuration = durations.length
    ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)
    : null;

  const hasCheckedInToday = opts?.hasCheckedInToday ?? workouts.some((workout) => isSameDay(new Date(workout.created_at), today));

  let streakRisk: AccountabilityInsight["streakRisk"] = "safe";
  if (!hasCheckedInToday && daysSinceLastCheckin !== null) {
    if (daysSinceLastCheckin >= 2) streakRisk = "critical";
    else if (daysSinceLastCheckin === 1) streakRisk = "watch";
  }

  const topActivityLabel = topActivity?.[0] ?? null;
  const topActivityType = topActivity?.[1]?.type ?? null;
  const topActivityCount = topActivity?.[1]?.count ?? 0;
  const focusGroupLabel = topGroup ? ACTIVITY_GROUP_LABELS[topGroup[0] as keyof typeof ACTIVITY_GROUP_LABELS] : null;
  const focusGroupCount = topGroup?.[1] ?? 0;
  const strongestDayLabel = strongestDay ? WEEKDAY_LABELS[strongestDay[0]] : null;

  const recommendedAction = hasCheckedInToday
    ? "You already protected today. Set tomorrow up now with a low-friction plan."
    : streakRisk === "critical"
      ? "Log any real progress today, even a short recovery or walk, to restart momentum immediately."
      : streakRisk === "watch"
        ? "Protect the streak today with the easiest check-in you can honestly complete."
        : consistencyScore >= 65
          ? "Keep the rhythm tight. Repeat the activity you return to most often."
          : "Shrink the goal for today so showing up feels automatic again.";

  const recoveryPrompt = streakRisk === "critical"
    ? "Momentum slipped. Choose a 10-20 minute recovery, walk, or mobility session instead of waiting for a perfect workout."
    : streakRisk === "watch"
      ? "This is a streak-protection day. A small check-in counts more than intensity."
      : "Your best retention move is to decide the next check-in before you need motivation.";

  const momentumSummary = topActivityLabel
    ? `${getActivityEmoji(topActivityType)} ${topActivityLabel} is your most repeated habit so far.`
    : "Once you stack a few check-ins, the app can surface your strongest habit pattern.";

  const premiumSummary = strongestDayLabel
    ? `Premium accountability should nudge you before your usual ${strongestDayLabel} training window and push recovery when the pattern breaks.`
    : "Premium accountability should learn your timing, then send reminders when you are most likely to follow through.";

  return {
    streakRisk,
    daysSinceLastCheckin,
    weeklyCheckins,
    weeklyConsistency,
    consistencyScore,
    topActivityLabel,
    topActivityEmoji: getActivityEmoji(topActivityType),
    topActivityCount,
    focusGroupLabel,
    focusGroupCount,
    averageDuration,
    recommendedAction,
    recoveryPrompt,
    momentumSummary,
    premiumSummary,
    activeDaysLast14,
    strongestDayLabel,
  };
}

export function getReminderHourLabel(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

export function getWeeklyNarrative(insight: AccountabilityInsight): string {
  const durationPart = insight.averageDuration ? ` Average logged session: ${insight.averageDuration} min.` : "";
  const focusPart = insight.focusGroupLabel ? ` Current focus: ${insight.focusGroupLabel}.` : "";
  return `You checked in ${insight.weeklyCheckins} time${insight.weeklyCheckins === 1 ? "" : "s"} this week with ${insight.weeklyConsistency}% consistency.${focusPart}${durationPart}`;
}

export function getStreakRiskTone(risk: AccountabilityInsight["streakRisk"]): {
  label: string;
  className: string;
} {
  if (risk === "critical") {
    return { label: "Streak Needs Rescue", className: "border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400" };
  }
  if (risk === "watch") {
    return { label: "Streak At Risk", className: "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400" };
  }
  return { label: "Momentum Stable", className: "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400" };
}

export function getNextCheckinPrompt(insight: AccountabilityInsight): string {
  if (insight.strongestDayLabel) {
    return `You most often show up on ${insight.strongestDayLabel}s. Plan the next one now while the pattern is visible.`;
  }
  return `Lock in the next check-in now. Consistency improves when tomorrow is decided today.`;
}

export function formatInsightTimestamp(now = new Date()): string {
  return format(now, "EEE, MMM d");
}

export function buildGoalInsight(goals: GoalInsightInput[], now = new Date()): GoalInsight {
  const totalGoals = goals.length;
  const activeGoals = goals.filter((goal) => goal.status !== "completed").length;
  const completedGoals = goals.filter((goal) => goal.status === "completed").length;
  const overdueGoals = goals.filter((goal) => {
    if (!goal.target_date || goal.status === "completed") return false;
    return startOfDay(new Date(goal.target_date)) < startOfDay(now);
  }).length;
  const progressValues = goals
    .map((goal) => goal.progress)
    .filter((value): value is number => typeof value === "number");
  const averageProgress = progressValues.length
    ? Math.round(progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length)
    : 0;
  const nextGoalDeadline = goals
    .filter((goal) => goal.target_date && goal.status !== "completed")
    .sort((a, b) => new Date(a.target_date as string).getTime() - new Date(b.target_date as string).getTime())[0]?.target_date ?? null;

  const recommendedAction = overdueGoals > 0
    ? "At least one goal is overdue. Narrow focus and move the most urgent one forward today."
    : activeGoals === 0 && completedGoals > 0
      ? "You closed your current goals. Set the next target while momentum is still high."
      : activeGoals > 3
        ? "You have multiple active goals. Pick one priority goal and reduce scattered effort."
        : "Keep one active goal moving with a concrete next step this week.";

  return {
    totalGoals,
    activeGoals,
    completedGoals,
    overdueGoals,
    averageProgress,
    nextGoalDeadline,
    recommendedAction,
  };
}

export function buildTaskInsight(tasks: TaskInsightInput[], now = new Date()): TaskInsight {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.is_completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const overdueTasks = tasks.filter((task) => {
    if (!task.due_date || task.is_completed) return false;
    return new Date(task.due_date) < now;
  }).length;
  const dueTodayTasks = tasks.filter((task) => {
    if (!task.due_date || task.is_completed) return false;
    return isSameDay(new Date(task.due_date), now);
  }).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const recommendedAction = overdueTasks > 0
    ? "Clear one overdue task first. It is the fastest way to reduce drag."
    : dueTodayTasks > 0
      ? "You have tasks due today. Finish the easiest one early to protect momentum."
      : pendingTasks > 0
        ? "Your task list is healthy. Knock out one pending task before adding another."
        : "Your task list is clear. Add the next action that supports your current goal.";

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    dueTodayTasks,
    completionRate,
    recommendedAction,
  };
}
