'use client';

import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StreakBadge } from "@/components/StreakComponents";
import { Heart, MessageCircle, Share2, Filter, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

const workoutEmojis: Record<string, string> = {
  gym: "🏋️",
  run: "🏃",
  home: "🏠",
  yoga: "🧘",
  cycling: "🚴",
  other: "💪",
};

const filters = ["All", "Gym", "Run", "Home", "Yoga", "Cycling"];

export default function CommunityPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState("All");

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['community-posts', activeFilter],
    queryFn: async () => {
      let query = supabase
        .from('workouts')
        .select(`
          *,
          profiles(full_name, username, avatar_url, streak),
          likes(user_id),
          comments(id, user_id, content, created_at, profiles(username, full_name, avatar_url))
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (activeFilter !== "All") {
        query = query.eq('type', activeFilter.toLowerCase());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const likeMutation = useMutation({
    mutationFn: async ({ postId, alreadyLiked }: { postId: string, alreadyLiked: boolean }) => {
      if (!user) {
        toast.error("Please sign in to like posts");
        return;
      }

      if (alreadyLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('workout_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('likes')
          .insert({ workout_id: postId, user_id: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    }
  });

  return (
    <Layout>
      <div className="container py-6 md:py-12 max-w-2xl">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold mb-2">Community 👥</h1>
          <p className="text-muted-foreground">See who's showing up today. You're not alone!</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className="shrink-0 rounded-full"
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-muted-foreground">Loading community feed...</p>
            </div>
          ) : posts.length > 0 ? (
            posts.map((post: any, index: number) => (
              <CommunityPost 
                key={post.id} 
                post={post} 
                currentUser={user} 
                onLike={() => likeMutation.mutate({ 
                  postId: post.id, 
                  alreadyLiked: post.likes.some((l: any) => l.user_id === user?.id) 
                })} 
                index={index}
              />
            ))
          ) : (
            <Card className="p-10 text-center">
              <p className="text-muted-foreground">No public activities yet. Be the first to share! 🚀</p>
            </Card>
          )}
        </div>

        <section className="mt-12 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">Why the FitTribe community matters</h2>
              <p className="text-muted-foreground">
                FitTribe is designed as a workout accountability community, not just a place
                to post updates. The public feed gives members visible momentum, encourages
                regular check-ins, and supports the habit-forming side of fitness tracking.
              </p>
              <p className="text-muted-foreground">
                For people searching for a web3 fitness community or an accountability fitness
                app, this page shows the social layer of the product: real check-ins, activity
                streaks, and a visible record of consistency.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5 space-y-2">
                <h3 className="font-semibold">Track your streak</h3>
                <p className="text-sm text-muted-foreground">
                  Keep your daily workout history moving and build a routine that compounds over time.
                </p>
                <Link href="/fitness-habit-tracker" className="text-sm text-primary hover:underline">
                  Learn about streak tracking
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 space-y-2">
                <h3 className="font-semibold">Earn on-chain rewards</h3>
                <p className="text-sm text-muted-foreground">
                  FitTribe connects consistent activity with blockchain fitness rewards on Avalanche.
                </p>
                <Link href="/blockchain-fitness-rewards" className="text-sm text-primary hover:underline">
                  See how rewards work
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 space-y-2">
                <h3 className="font-semibold">Find coaching support</h3>
                <p className="text-sm text-muted-foreground">
                  Move from self-guided consistency into structured coaching when you need extra support.
                </p>
                <Link href="/trainers" className="text-sm text-primary hover:underline">
                  Browse trainers
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  );
}

function CommunityPost({ post, currentUser, onLike, index }: any) {
  const [commentOpen, setCommentOpen] = useState(false);
  const isLiked = post.likes?.some((l: any) => l.user_id === currentUser?.id);

  const handleShare = async () => {
    const name = post.profiles?.full_name || post.profiles?.username || "Someone";
    const type = post.type ? `${post.type} session` : "workout";
    const text = `${name} just logged a ${type} on FitTribe! 💪`;
    const url = `${window.location.origin}/community#post-${post.id}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "FitTribe", text, url });
      } catch {
        // user cancelled — do nothing
      }
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <Card
      id={`post-${post.id}`}
      className="hover:shadow-medium transition-all animate-fade-in border-border/50"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center text-2xl shrink-0 overflow-hidden border-2 border-primary/20">
            {post.profiles?.avatar_url ? (
              <img src={post.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{post.profiles?.full_name?.charAt(0) || "👤"}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold">{post.profiles?.full_name || post.profiles?.username || "Anonymous"}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-lg">{workoutEmojis[post.type] || "💪"}</span>
              <span className="text-sm font-medium capitalize text-primary/80">{post.type} session</span>
            </div>
          </div>
          <StreakBadge streak={post.profiles?.streak || 0} size="sm" showLabel={false} />
        </div>

        {/* Content */}
        {post.note && (
          <p className="text-foreground mb-4 leading-relaxed whitespace-pre-wrap">{post.note}</p>
        )}

        {post.photo_url && (
          <div className="mb-4 rounded-xl overflow-hidden border border-border/50 bg-muted">
            <img src={post.photo_url} alt="Workout Proof" className="w-full h-auto max-h-[400px] object-cover" />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-6 pt-3 border-t border-border/50">
          <button 
            onClick={onLike}
            className={cn(
              "flex items-center gap-2 text-sm transition-all hover:scale-105",
              isLiked ? "text-secondary" : "text-muted-foreground hover:text-secondary"
            )}
          >
            <Heart className={cn(
              "w-5 h-5 transition-all",
              isLiked && "fill-current scale-110"
            )} />
            <span className="font-medium">{post.likes?.length || 0}</span>
          </button>
          
          <button 
            onClick={() => setCommentOpen(!commentOpen)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all hover:scale-105"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">{post.comments?.length || 0}</span>
          </button>
          
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all hover:scale-105 ml-auto"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Simple Comment Section */}
        {commentOpen && (
          <div className="mt-4 pt-4 border-t border-border/50 space-y-3 animate-slide-up">
            {post.comments?.map((comment: any) => (
              <div key={comment.id} className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs shrink-0 overflow-hidden">
                  {comment.profiles?.avatar_url ? (
                    <img src={comment.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{comment.profiles?.username?.charAt(0)}</span>
                  )}
                </div>
                <div className="bg-muted/50 rounded-2xl px-3 py-2 flex-1">
                  <p className="text-xs font-bold">{comment.profiles?.username}</p>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
            {!currentUser && (
              <p className="text-xs text-center text-muted-foreground py-2">
                <Link href="/login" className="text-primary font-bold">Sign in</Link> to join the conversation
              </p>
            )}
            {currentUser && <CommentInput postId={post.id} />}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CommentInput({ postId }: { postId: string }) {
  const [content, setContent] = useState("");
  const supabase = createClient();
  const queryClient = useQueryClient();

  const commentMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      
      const { error } = await supabase
        .from('comments')
        .insert({
          workout_id: postId,
          user_id: user.id,
          content
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast.success("Comment added!");
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Failed to post comment. Please try again.");
    },
  });

  return (
    <div className="flex gap-2 mt-2">
      <input 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        className="flex-1 h-9 rounded-full bg-muted px-4 text-sm border-none focus:ring-1 focus:ring-primary outline-none"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && content.trim()) commentMutation.mutate();
        }}
      />
      <Button 
        size="sm" 
        className="rounded-full h-9 w-9 p-0" 
        disabled={!content.trim() || commentMutation.isPending}
        onClick={() => commentMutation.mutate()}
      >
        <Loader2 className={cn("w-4 h-4", commentMutation.isPending ? "animate-spin" : "hidden")} />
        {!commentMutation.isPending && <Send className="w-4 h-4" />}
      </Button>
    </div>
  );
}
