import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StreakBadge, WeekCalendar } from "@/components/StreakComponents";
import { 
  TrendingUp, TrendingDown, Minus, Calendar, 
  Flame, Target, BarChart3, Scale, Ruler
} from "lucide-react";
import { cn } from "@/lib/utils";

const monthlyData = [
  { month: "Jul", workouts: 12 },
  { month: "Aug", workouts: 15 },
  { month: "Sep", workouts: 18 },
  { month: "Oct", workouts: 14 },
  { month: "Nov", workouts: 20 },
  { month: "Dec", workouts: 17 },
];

const milestones = [
  { title: "First Week", description: "Complete 7 days", achieved: true, emoji: "🌱" },
  { title: "Getting Stronger", description: "30 total workouts", achieved: true, emoji: "💪" },
  { title: "Consistency King", description: "14 day streak", achieved: false, emoji: "👑" },
  { title: "Century Club", description: "100 total workouts", achieved: false, emoji: "🏆" },
];

const metrics = [
  { 
    label: "Weight", 
    current: "72 kg", 
    change: "-3 kg", 
    trend: "down" as const,
    icon: Scale,
  },
  { 
    label: "Avg Workouts/Week", 
    current: "4.2", 
    change: "+0.5", 
    trend: "up" as const,
    icon: BarChart3,
  },
  { 
    label: "Best Streak", 
    current: "12 days", 
    change: "Current!", 
    trend: "up" as const,
    icon: Flame,
  },
];

export default function ProgressPage() {
  const maxWorkouts = Math.max(...monthlyData.map(d => d.workouts));

  return (
    <Layout>
      <div className="container py-6 md:py-12">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold mb-2">Your Progress 📈</h1>
          <p className="text-muted-foreground">
            Celebrating consistency over perfection. Every workout counts!
          </p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {metrics.map((metric, index) => (
            <Card key={metric.label} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <metric.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
                    metric.trend === "up" ? "bg-primary/10 text-primary" :
                    metric.trend === "down" ? "bg-secondary/10 text-secondary" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {metric.trend === "up" ? <TrendingUp className="w-3 h-3" /> :
                     metric.trend === "down" ? <TrendingDown className="w-3 h-3" /> :
                     <Minus className="w-3 h-3" />}
                    {metric.change}
                  </div>
                </div>
                <p className="text-3xl font-bold mb-1">{metric.current}</p>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Monthly Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Last 6 Months
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-48 gap-4">
                {monthlyData.map((month, index) => (
                  <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-sm font-bold">{month.workouts}</span>
                    <div 
                      className="w-full rounded-t-xl gradient-hero transition-all duration-500"
                      style={{ 
                        height: `${(month.workouts / maxWorkouts) * 100}%`,
                        animationDelay: `${index * 100}ms`
                      }}
                    />
                    <span className="text-xs text-muted-foreground font-medium">{month.month}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 rounded-xl bg-muted flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Workouts</p>
                  <p className="text-2xl font-bold">96</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Monthly Average</p>
                  <p className="text-2xl font-bold">16</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* This Week */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">This Week</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <StreakBadge streak={12} size="lg" />
              </div>
              <WeekCalendar checkedDays={[true, true, false, true, true, true, false]} />
              <div className="text-center p-4 rounded-xl bg-primary/10">
                <p className="text-sm text-muted-foreground">Weekly Goal</p>
                <p className="text-xl font-bold text-primary">5/5 ✓</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Milestones */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {milestones.map((milestone, index) => (
                <div 
                  key={milestone.title}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all",
                    milestone.achieved 
                      ? "border-primary/30 bg-primary/5" 
                      : "border-border bg-muted/50 opacity-60"
                  )}
                >
                  <div className="text-3xl mb-2">{milestone.emoji}</div>
                  <h3 className="font-bold mb-1">{milestone.title}</h3>
                  <p className="text-sm text-muted-foreground">{milestone.description}</p>
                  {milestone.achieved && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                      ✓ Achieved
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
