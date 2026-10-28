import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── StreakBadge ──────────────────────────────────────────────────────────────
interface StreakBadgeProps {
  streak: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function StreakBadge({ streak, size = "md", showLabel = true }: StreakBadgeProps) {
  const sizeClasses = { sm: "text-sm gap-1", md: "text-base gap-1.5", lg: "text-xl gap-2" };
  const iconSizes   = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-7 h-7" };

  return (
    <div className={cn("inline-flex items-center font-bold font-display text-streak", sizeClasses[size])}>
      <Flame className={cn(iconSizes[size], "animate-pulse-soft")} />
      <span>{streak}</span>
      {showLabel && <span className="text-muted-foreground font-medium font-body">day streak</span>}
    </div>
  );
}

// ─── StreakHero — Full-width banner, the dominant UI element ──────────────────
interface StreakHeroProps {
  streak: number;
  totalWorkouts?: number;
  hasCheckedInToday?: boolean;
}

export function StreakHero({ streak, totalWorkouts = 0, hasCheckedInToday = false }: StreakHeroProps) {
  const isOnFire = streak >= 7;
  const isLegendary = streak >= 30;

  return (
    <div className={cn(
      "relative overflow-hidden rounded-3xl border p-6 md:p-8 animate-slide-up",
      isLegendary || isOnFire
        ? "border-primary/40 bg-gradient-to-b from-primary/15 to-card shadow-fire"
        : "border-border bg-card"
    )}>
      <div className="absolute -right-6 -top-8 pointer-events-none text-primary/10">
        <Flame className="h-40 w-40" />
      </div>

      <div className="relative flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            {hasCheckedInToday ? "Today is locked in" : "Current streak"}
          </p>
          <div className="flex items-end gap-3">
            <span className="font-display font-extrabold leading-none text-foreground" style={{ fontSize: "clamp(3.5rem, 8vw, 5rem)" }}>
              {streak}
            </span>
            <Flame className="mb-2 h-8 w-8 text-primary" aria-hidden />
          </div>
          <p className="mt-2 text-sm font-medium text-muted-foreground md:text-base">
            {streak === 0
              ? "Check in once today to start."
              : streak === 1
              ? "Day 1. Come back tomorrow."
              : isLegendary
              ? `${streak} days. This is a record you own.`
              : isOnFire
              ? `${streak} days. The streak is doing the work.`
              : `${streak} days and counting.`}
          </p>
        </div>

        {totalWorkouts > 0 && (
          <div className="shrink-0 rounded-2xl border border-border bg-background px-4 py-3 text-center">
            <p className="font-display text-2xl font-bold text-foreground">{totalWorkouts}</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Total</p>
          </div>
        )}
      </div>

      <div className="relative mt-5 flex flex-wrap gap-2">
        {[
          { at: 7, label: "7 days" },
          { at: 30, label: "30 days" },
          { at: 100, label: "100 days" },
        ].map(({ at, label }) => {
          const reached = streak >= at;
          return (
            <span
              key={at}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold",
                reached
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-border bg-background text-muted-foreground"
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", reached ? "bg-primary" : "bg-muted-foreground/40")} />
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: typeof Flame;
  value: string | number;
  label: string;
  variant?: "default" | "primary" | "streak" | "chain";
  trend?: string;
}

export function StatCard({ icon: Icon, value, label, variant = "default", trend }: StatCardProps) {
  const variants = {
    default: "bg-card border-border",
    primary: "bg-primary/10 border-primary/25",
    streak:  "bg-card border-primary/30",
    chain:   "bg-card border-accent/30",
  };

  const iconTone = variant === "chain" ? "text-accent" : variant === "default" ? "text-foreground" : "text-primary";

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-2xl border p-4",
      variants[variant]
    )}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background">
        <Icon className={cn("h-5 w-5", iconTone)} aria-hidden />
      </div>
      <div>
        <p className="font-display text-2xl font-bold text-foreground">
          {value}
        </p>
        <p className="text-sm text-muted-foreground">
          {label}
        </p>
        {trend && (
          <p className="mt-0.5 text-[10px] font-semibold text-primary">
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── WeekCalendar ─────────────────────────────────────────────────────────────
interface WeekCalendarProps {
  checkedDays: boolean[];
}

export function WeekCalendar({ checkedDays }: WeekCalendarProps) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="flex items-center justify-between gap-1">
      {days.map((day, index) => (
        <div key={index} className="flex flex-col items-center gap-1 flex-1">
          <span className="text-xs text-muted-foreground font-semibold">{day}</span>
          <div className={cn(
            "w-full aspect-square rounded-xl flex items-center justify-center text-base transition-all duration-300",
            checkedDays?.[index]
              ? "bg-primary text-primary-foreground shadow-glow"
              : "bg-muted text-muted-foreground"
          )}>
            {checkedDays?.[index] ? <Flame className="w-4 h-4" /> : ""}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── WorkoutHeatmap — GitHub-style contribution grid ─────────────────────────
interface WorkoutHeatmapProps {
  workoutDates: string[];   // ISO date strings of workout days
  weeksBack?: number;       // how many weeks to show (default 16)
}

export function WorkoutHeatmap({ workoutDates, weeksBack = 16 }: WorkoutHeatmapProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build a set of "YYYY-MM-DD" strings for O(1) lookup
  const workedOutSet = new Set(
    workoutDates.map((d) => new Date(d).toISOString().slice(0, 10))
  );

  // Build the grid: weeksBack × 7 days, oldest first
  const totalDays = weeksBack * 7;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - totalDays + 1);

  // Align to Monday
  const dayOfWeek = (startDate.getDay() + 6) % 7; // 0=Mon
  startDate.setDate(startDate.getDate() - dayOfWeek);

  const cells: { date: Date; worked: boolean; future: boolean }[] = [];
  for (let i = 0; i < weeksBack * 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    cells.push({
      date:   d,
      worked: workedOutSet.has(d.toISOString().slice(0, 10)),
      future: d > today,
    });
  }

  const weeks: typeof cells[] = [];
  for (let w = 0; w < weeksBack; w++) {
    weeks.push(cells.slice(w * 7, w * 7 + 7));
  }

  const monthLabels: { label: string; col: number }[] = [];
  weeks.forEach((week, wIdx) => {
    const first = week[0].date;
    if (first.getDate() <= 7) {
      monthLabels.push({ label: first.toLocaleString("default", { month: "short" }), col: wIdx });
    }
  });

  return (
    <div className="overflow-x-auto pb-2">
      {/* Month labels */}
      <div className="flex mb-1" style={{ gap: "3px" }}>
        <div className="w-0 shrink-0" />
        {weeks.map((_, wIdx) => {
          const label = monthLabels.find((m) => m.col === wIdx);
          return (
            <div key={wIdx} className="flex-1 min-w-[12px] text-[9px] text-muted-foreground font-semibold text-center">
              {label ? label.label : ""}
            </div>
          );
        })}
      </div>

      {/* Grid — transposed (columns = weeks, rows = day of week) */}
      <div className="flex" style={{ gap: "3px" }}>
        {weeks.map((week, wIdx) => (
          <div key={wIdx} className="flex flex-col" style={{ gap: "3px" }}>
            {week.map((cell, dIdx) => (
              <div
                key={dIdx}
                title={cell.date.toLocaleDateString("en-KE", { day: "numeric", month: "short" }) + (cell.worked ? " ✓" : "")}
                className={cn(
                  "rounded-sm transition-all duration-200",
                  cell.future
                    ? "bg-muted/40"
                    : cell.worked
                    ? "bg-primary"
                    : "bg-muted"
                )}
                style={{ width: "12px", height: "12px" }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[10px] text-muted-foreground">Less</span>
        {[false, true].map((v, i) => (
          <div
            key={i}
            className={cn("h-3 w-3 rounded-sm", v ? "bg-primary" : "bg-muted")}
          />
        ))}
        <span className="text-[10px] text-muted-foreground">More</span>
      </div>
    </div>
  );
}
