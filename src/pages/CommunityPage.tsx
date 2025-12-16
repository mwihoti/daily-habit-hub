import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StreakBadge } from "@/components/StreakComponents";
import { Heart, MessageCircle, Share2, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const feedItems = [
  {
    id: 1,
    user: { name: "Sarah M.", location: "Nairobi", avatar: "🏃‍♀️", streak: 45 },
    type: "gym",
    note: "Leg day done! 🦵 Feeling stronger every week. Remember: progress, not perfection!",
    time: "2 mins ago",
    likes: 12,
    comments: 3,
    emoji: "🏋️",
  },
  {
    id: 2,
    user: { name: "James K.", location: "Mombasa", avatar: "💪", streak: 89 },
    type: "run",
    note: "Morning run by the beach 🏖️ 5km done before 7am. The sunrise was beautiful!",
    time: "15 mins ago",
    likes: 24,
    comments: 8,
    emoji: "🏃",
  },
  {
    id: 3,
    user: { name: "Mary W.", location: "Kisumu", avatar: "🧘‍♀️", streak: 32 },
    type: "yoga",
    note: "30 minutes of stretching at home. Small steps count! 🧘‍♀️",
    time: "1 hour ago",
    likes: 18,
    comments: 5,
    emoji: "🧘",
  },
  {
    id: 4,
    user: { name: "Peter O.", location: "Eldoret", avatar: "🚴", streak: 67 },
    type: "cycling",
    note: "20km cycling session! Training for the charity ride next month 🚴‍♂️",
    time: "2 hours ago",
    likes: 31,
    comments: 12,
    emoji: "🚴",
  },
  {
    id: 5,
    user: { name: "Grace N.", location: "Nakuru", avatar: "🏠", streak: 21 },
    type: "home",
    note: "No gym? No problem! YouTube workout at home. Who else is team home workouts? 💪",
    time: "3 hours ago",
    likes: 45,
    comments: 15,
    emoji: "🏠",
  },
  {
    id: 6,
    user: { name: "David M.", location: "Nairobi", avatar: "💪", streak: 156 },
    type: "gym",
    note: "Day 156! Never thought I'd be this consistent. If I can do it, you can too! 🔥",
    time: "4 hours ago",
    likes: 89,
    comments: 24,
    emoji: "🏋️",
  },
];

const filters = ["All", "Gym", "Run", "Home", "Yoga", "Cycling"];

export default function CommunityPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  const toggleLike = (id: number) => {
    setLikedPosts(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const filteredItems = activeFilter === "All" 
    ? feedItems 
    : feedItems.filter(item => item.type.toLowerCase() === activeFilter.toLowerCase());

  return (
    <Layout>
      <div className="container py-6 md:py-12 max-w-2xl">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold mb-2">Community 👥</h1>
          <p className="text-muted-foreground">See who's showing up today. You're not alone!</p>
        </div>

        {/* Live Stats */}
        <Card className="mb-6 gradient-hero text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Active today</p>
                <p className="text-3xl font-bold">247 people</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-80">Check-ins today</p>
                <p className="text-3xl font-bold">312 💪</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className="shrink-0"
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {filteredItems.map((item, index) => (
            <Card 
              key={item.id} 
              className="hover:shadow-medium transition-all animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center text-2xl shrink-0">
                    {item.user.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold">{item.user.name}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{item.user.location}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-lg">{item.emoji}</span>
                      <span className="text-sm text-muted-foreground">{item.time}</span>
                    </div>
                  </div>
                  <StreakBadge streak={item.user.streak} size="sm" showLabel={false} />
                </div>

                {/* Content */}
                {item.note && (
                  <p className="text-foreground mb-4 leading-relaxed">{item.note}</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 pt-2 border-t border-border">
                  <button 
                    onClick={() => toggleLike(item.id)}
                    className={cn(
                      "flex items-center gap-1.5 text-sm transition-colors",
                      likedPosts.includes(item.id) 
                        ? "text-secondary" 
                        : "text-muted-foreground hover:text-secondary"
                    )}
                  >
                    <Heart className={cn(
                      "w-5 h-5 transition-all",
                      likedPosts.includes(item.id) && "fill-current scale-110"
                    )} />
                    <span>{item.likes + (likedPosts.includes(item.id) ? 1 : 0)}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span>{item.comments}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <Button variant="outline" size="lg">
            Load More
          </Button>
        </div>
      </div>
    </Layout>
  );
}
