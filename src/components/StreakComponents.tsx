import { Flame, Trophy, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  streak: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function StreakBadge({ streak, size = "md", showLabel = true }: StreakBadgeProps) {
  const sizeClasses = {
    sm: "text-sm gap-1",
    md: "text-base gap-1.5",
    lg: "text-xl gap-2",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  return (
    <div className={cn(
      "inline-flex items-center font-bold text-streak",
      sizeClasses[size]
    )}>
      <Flame className={cn(iconSizes[size], "animate-pulse-soft")} />
      <span>{streak}</span>
      {showLabel && <span className="text-muted-foreground font-medium">day streak</span>}
    </div>
  );
}

interface StatCardProps {
  icon: typeof Flame;
  value: string | number;
  label: string;
  variant?: "default" | "primary" | "streak";
}

export function StatCard({ icon: Icon, value, label, variant = "default" }: StatCardProps) {
  const variants = {
    default: "bg-card border-border",
    primary: "bg-primary/10 border-primary/20",
    streak: "gradient-energy border-transparent text-secondary-foreground",
  };

  return (
    <div className={cn(
      "flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 hover:shadow-medium",
      variants[variant]
    )}>
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center",
        variant === "streak" ? "bg-white/20" : "bg-muted"
      )}>
        <Icon className={cn(
          "w-6 h-6",
          variant === "streak" ? "text-secondary-foreground" : "text-foreground"
        )} />
      </div>
      <div>
        <p className={cn(
          "text-2xl font-bold",
          variant === "streak" ? "text-secondary-foreground" : "text-foreground"
        )}>{value}</p>
        <p className={cn(
          "text-sm",
          variant === "streak" ? "text-secondary-foreground/80" : "text-muted-foreground"
        )}>{label}</p>
      </div>
    </div>
  );
}

interface WeekCalendarProps {
  checkedDays: boolean[];
}

export function WeekCalendar({ checkedDays }: WeekCalendarProps) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  
  return (
    <div className="flex items-center justify-between gap-2">
      {days.map((day, index) => (
        <div key={index} className="flex flex-col items-center gap-1">
          <span className="text-xs text-muted-foreground font-medium">{day}</span>
          <div className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all duration-200",
            checkedDays[index] 
              ? "gradient-hero shadow-glow" 
              : "bg-muted"
          )}>
            {checkedDays[index] ? "✓" : ""}
          </div>
        </div>
      ))}
    </div>
  );
}
