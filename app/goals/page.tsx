'use client';

import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, Target as TargetIcon, Calendar, TrendingUp, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function GoalsPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTargetDate, setNewGoalTargetDate] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Fetch goals
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Add goal mutation
  const addGoalMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("No user");
      const { data, error } = await supabase.from('goals').insert({
        user_id: user.id,
        title: newGoalTitle,
        target_date: newGoalTargetDate,
        description: newGoalDescription,
        status: 'active'
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Goal added! Aim high! 🎯");
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setNewGoalTitle("");
      setNewGoalTargetDate("");
      setNewGoalDescription("");
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add goal");
    }
  });

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, status, progress }: { id: string, status?: string, progress?: number }) => {
      const updates: any = {};
      if (status) updates.status = status;
      if (progress !== undefined) updates.progress = progress;
      if (status === 'completed') updates.progress = 100; // Auto-fill 100% when marked completed

      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user!.id)
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Goal status updated! Keep it up! 🚀");
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update goal");
    }
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <TargetIcon className="w-8 h-8 text-primary" />
              Goal Tracker
            </h1>
            <p className="text-muted-foreground">What do you want to achieve?</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-xl shadow-glow">
                <Plus className="w-4 h-4" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add a New Goal</DialogTitle>
                <DialogDescription>
                  Set a clear target for yourself.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., Lose 5kg, Run 10km" 
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="target-date">Target Date</Label>
                  <Input 
                    id="target-date" 
                    type="date"
                    value={newGoalTargetDate}
                    onChange={(e) => setNewGoalTargetDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <textarea 
                    id="description" 
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Details about your goal..."
                    value={newGoalDescription}
                    onChange={(e) => setNewGoalDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={() => addGoalMutation.mutate()}
                  disabled={!newGoalTitle || addGoalMutation.isPending}
                >
                  Create Goal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {goals.length === 0 ? (
            <Card className="border-dashed border-2 py-12 text-center text-muted-foreground">
              <CardContent>
                <Target className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No goals set yet. Start by creating one!</p>
              </CardContent>
            </Card>
          ) : (
            goals.map((goal: any) => (
              <Card key={goal.id} className="card-hover">
                <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <CardTitle className="flex items-center gap-2 flex-wrap">
                      {goal.title}
                      {goal.status === 'completed' && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">Completed</span>}
                      {goal.status === 'in_progress' && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">In Progress</span>}
                    </CardTitle>
                    <CardDescription>{goal.description}</CardDescription>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 shrink-0">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {goal.target_date ? format(new Date(goal.target_date), 'MMM d, yyyy') : 'No target date'}
                    </div>
                    <div className="flex gap-2 sm:mt-2">
                      <Button
                        variant={goal.status === 'in_progress' ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => updateGoalMutation.mutate({ id: goal.id, status: 'in_progress' })}
                        disabled={updateGoalMutation.isPending}
                      >
                        In Progress
                      </Button>
                      <Button
                        variant={goal.status === 'completed' ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => updateGoalMutation.mutate({ id: goal.id, status: 'completed' })}
                        disabled={updateGoalMutation.isPending}
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Done
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <TrendingUp className="w-3 h-3" />
                        Progress
                      </span>
                      <span className="font-bold">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-3" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
