import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StreakBadge, StatCard, WeekCalendar } from "@/components/StreakComponents";
import { Link } from "react-router-dom";
import { 
  Flame, Trophy, Target, TrendingUp, Calendar, 
  CheckCircle, Plus, BarChart3, Users 
} from "lucide-react";

const weeklyData = [
  { day: "Mon", workouts: 1 },
  { day: "Tue", workouts: 1 },
  { day: "Wed", workouts: 0 },
  { day: "Thu", workouts: 1 },
  { day: "Fri", workouts: 1 },
  { day: "Sat", workouts: 1 },
  { day: "Sun", workouts: 0 },
];

const recentActivity = [
  { type: "gym", date: "Today", note: "Leg day 🦵" },
  { type: "run", date: "Yesterday", note: "Morning 5K run" },
  { type: "home", date: "2 days ago", note: "HIIT workout" },
  { type: "yoga", date: "3 days ago", note: "Stretch session" },
];

const workoutEmojis: Record<string, string> = {
  gym: "🏋️",
  run: "🏃",
  home: "🏠",
  yoga: "🧘",
  cycling: "🚴",
  other: "💪",
};

export default function DashboardPage() {
  return (
    <Layout>
      <div className="container py-6 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 animate-slide-up">
          <div>
            <h1 className="text-3xl font-bold mb-1">Hey there! 👋</h1>
            <p className="text-muted-foreground">Keep showing up. You're doing amazing!</p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/check-in">
              <Plus className="w-5 h-5" />
              Check In
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            icon={Flame} 
            value={12} 
            label="Day Streak" 
            variant="streak" 
          />
          <StatCard 
            icon={Target} 
            value={5} 
            label="This Week" 
            variant="primary" 
          />
          <StatCard 
            icon={Trophy} 
            value={47} 
            label="Total Workouts" 
          />
          <StatCard 
            icon={TrendingUp} 
            value="+23%" 
            label="vs Last Month" 
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Week Overview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <WeekCalendar checkedDays={[true, true, false, true, true, true, false]} />
              
              {/* Weekly Chart */}
              <div className="flex items-end justify-between h-32 gap-2 pt-4">
                {weeklyData.map((day, index) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        day.workouts > 0 
                          ? "gradient-hero" 
                          : "bg-muted"
                      }`}
                      style={{ 
                        height: day.workouts > 0 ? "100%" : "20%",
                        animationDelay: `${index * 100}ms`
                      }}
                    />
                    <span className="text-xs text-muted-foreground font-medium">{day.day}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-muted">
                <div>
                  <p className="text-sm text-muted-foreground">Weekly Goal</p>
                  <p className="text-xl font-bold">5/5 Complete! 🎉</p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">100%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                        {workoutEmojis[activity.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{activity.note}</p>
                        <p className="text-xs text-muted-foreground">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/progress">
                    <BarChart3 className="w-4 h-4" />
                    View Progress
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/community">
                    <Users className="w-4 h-4" />
                    Community Feed
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/trainers">
                    <Target className="w-4 h-4" />
                    Find a Coach
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
