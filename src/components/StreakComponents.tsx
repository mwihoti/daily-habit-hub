import { Flame, Trophy, Zap } from "lucide-react";
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
      "relative overflow-hidden rounded-3xl p-8 text-white animate-slide-up",
      isLegendary
        ? "gradient-energy fire-ring"
        : isOnFire
        ? "gradient-hero shadow-fire"
        : "gradient-hero shadow-glow"
    )}>
      {/* Background flame decoration */}
      <div className="absolute inset-0 flex items-center justify-end pointer-events-none pr-6 opacity-10">
        <Flame className="w-48 h-48" />
      </div>

      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-white/70 text-sm font-semibold tracking-widest uppercase mb-1">
            {hasCheckedInToday ? "Today's done ✓" : "Current Streak"}
          </p>
          <div className="flex items-end gap-3 mb-3">
            <span className="font-display font-bold leading-none" style={{ fontSize: "clamp(3.5rem, 8vw, 5rem)" }}>
              {streak}
            </span>
            <div className="mb-2">
              <Flame className="w-10 h-10 text-white/90 animate-bounce-soft" />
            </div>
          </div>
          <p className="text-white/80 font-semibold text-lg">
            {streak === 0
              ? "Start your streak today"
              : streak === 1
              ? "Day 1 — let's gooo!"
              : isLegendary
              ? `${streak} days — you're legendary 🏆`
              : isOnFire
              ? `${streak} days — you're on fire! 🔥`
              : `${streak} days and counting 💪`}
          </p>
        </div>

        {totalWorkouts > 0 && (
          <div className="text-center bg-white/15 rounded-2xl px-5 py-4 backdrop-blur-sm shrink-0">
            <p className="font-display font-bold text-3xl">{totalWorkouts}</p>
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mt-0.5">Total</p>
          </div>
        )}
      </div>

      {/* Milestone indicators */}
      {streak > 0 && (
        <div className="relative mt-5 flex gap-2 flex-wrap">
          {[
            { at: 7,  label: "7 days",  icon: "🔥" },
            { at: 30, label: "30 days", icon: "💎" },
            { at: 100,label: "100",     icon: "🏆" },
          ].map(({ at, label, icon }) => (
            <span
              key={at}
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all",
                streak >= at
                  ? "bg-white text-orange-600"
                  : "bg-white/20 text-white/60"
              )}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </span>
          ))}
        </div>
      )}
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
    primary: "bg-primary/10 border-primary/20",
    streak:  "gradient-energy border-transparent text-secondary-foreground",
    chain:   "gradient-chain border-transparent text-white",
  };

  const isColored = variant === "streak" || variant === "chain";

  return (
    <div className={cn(
      "flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 hover:shadow-medium",
      variants[variant]
    )}>
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
        isColored ? "bg-white/20" : "bg-muted"
      )}>
        <Icon className={cn("w-6 h-6", isColored ? "text-white" : "text-foreground")} />
      </div>
      <div>
        <p className={cn("text-2xl font-display font-bold", isColored ? "text-white" : "text-foreground")}>
          {value}
        </p>
        <p className={cn("text-sm", isColored ? "text-white/80" : "text-muted-foreground")}>
          {label}
        </p>
        {trend && (
          <p className={cn("text-[10px] mt-0.5 font-semibold", isColored ? "text-white/60" : "text-primary")}>
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
              ? "gradient-hero shadow-glow text-white scale-105"
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
                    ? "gradient-hero shadow-glow hover:scale-125 cursor-default"
                    : "bg-muted hover:bg-muted-foreground/30"
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
            className={cn("rounded-sm w-3 h-3", v ? "gradient-hero" : "bg-muted")}
          />
        ))}
        <span className="text-[10px] text-muted-foreground">More</span>
      </div>
    </div>
  );
}
