'use client';

import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Plus, Trash2, Bell, BellOff, ListTodo, Calendar, Clock, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { format, isPast } from "date-fns";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { cn } from "@/lib/utils";
import { buildTaskInsight } from "@/lib/accountability";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function TasksPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskReminderTime, setNewTaskReminderTime] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Web push subscription — reminders are sent server-side by
  // /api/push/reminders, so they arrive even when the app is closed.
  const { status: pushStatus, subscribe: subscribePush } = usePushNotifications();

  const enablePushReminders = async () => {
    const ok = await subscribePush();
    if (ok) toast.success("Reminders enabled! You'll get a push when tasks are due 🔔");
    else toast.error("Could not enable notifications");
  };

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .order('is_completed', { ascending: true })
        .order('due_date', { ascending: true });
      return data || [];
    }
  });

  // Add task mutation
  const addTaskMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("No user");
      
      let reminder_at = null;
      if (newTaskReminderTime && newTaskDueDate) {
        // Simple logic: Use due date and reminder time (for simplicity let's assume reminder_at is its own timestamp)
        // Here we just use a datetime for simplicity in the input but we'll use reminder_at specifically
        reminder_at = new Date(newTaskReminderTime);
      }

      const { data, error } = await supabase.from('tasks').insert({
        user_id: user.id,
        title: newTaskTitle,
        due_date: newTaskDueDate ? new Date(newTaskDueDate) : null,
        reminder_at: reminder_at,
        is_completed: false
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Task added! Let's get it done! ✅");
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setNewTaskTitle("");
      setNewTaskDueDate("");
      setNewTaskReminderTime("");
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add task");
    }
  });

  // Toggle task mutation
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, is_completed }: { id: string, is_completed: boolean }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: !is_completed })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Task deleted");
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-24 flex items-center justify-center text-muted-foreground animate-pulse">
          <ListTodo className="w-8 h-8 mr-2" />
          Loading tasks...
        </div>
      </Layout>
    );
  }

  const taskInsight = buildTaskInsight(tasks);

  return (
    <Layout>
      <div className="container py-12 max-w-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-primary" />
              Task Tracker
            </h1>
            <p className="text-muted-foreground">Keep your day organized.</p>
          </div>

          <div className="flex gap-2">
            {pushStatus === "default" && (
              <Button
                variant="outline"
                size="icon"
                onClick={enablePushReminders}
                title="Enable push reminders"
                className="rounded-xl border-orange-500/20 text-orange-500 hover:bg-orange-500/10"
              >
                <BellOff className="w-4 h-4" />
              </Button>
            )}
            {pushStatus === "subscribed" && (
              <Button
                variant="outline"
                size="icon"
                disabled
                title="Push reminders are on"
                className="rounded-xl border-green-500/20 text-green-600"
              >
                <Bell className="w-4 h-4" />
              </Button>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl shadow-glow">
                  <Plus className="w-4 h-4" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add a New Task</DialogTitle>
                  <DialogDescription>
                    Organize your fitness and lifestyle tasks.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="task-title">Task Title</Label>
                    <Input 
                      id="task-title" 
                      placeholder="e.g., Drink 2L water, Prep gym bag" 
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="due-date">Due Date/Time (Optional)</Label>
                    <Input 
                      id="due-date" 
                      type="datetime-local"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reminder">Set Reminder At (Optional)</Label>
                    <Input 
                      id="reminder" 
                      type="datetime-local"
                      value={newTaskReminderTime}
                      onChange={(e) => setNewTaskReminderTime(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={() => addTaskMutation.mutate()}
                    disabled={!newTaskTitle || addTaskMutation.isPending}
                  >
                    Add Task
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Pending tasks</p>
              <p className="text-3xl font-bold mt-2">{taskInsight.pendingTasks}</p>
              <p className="text-sm text-muted-foreground mt-1">Tasks still open</p>
            </CardContent>
          </Card>
          <Card className={taskInsight.overdueTasks > 0 ? "border-red-500/20 bg-red-500/5" : ""}>
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Due pressure</p>
              <p className="text-3xl font-bold mt-2">{taskInsight.overdueTasks}</p>
              <p className="text-sm text-muted-foreground mt-1">Overdue tasks to clear</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Task signal</p>
              <p className="text-sm font-semibold mt-2">{taskInsight.recommendedAction}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Completion rate: {taskInsight.completionRate}%
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-3">
          {tasks.length === 0 ? (
            <Card className="border-dashed border-2 py-12 text-center text-muted-foreground">
              <CardContent>
                <ListTodo className="w-12 h-12 mx-auto mb-4 opacity-10" />
                <p>No tasks yet. Your day is clear!</p>
              </CardContent>
            </Card>
          ) : (
            tasks.map((task: any) => (
              <div
                key={task.id}
                className={cn(
                  "group flex items-center justify-between p-4 rounded-2xl border transition-all duration-200",
                  task.is_completed 
                    ? "bg-muted/50 border-transparent opacity-60" 
                    : "bg-card border-border hover:border-primary/30 hover:shadow-soft"
                )}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div 
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors",
                      task.is_completed 
                        ? "bg-primary border-primary text-primary-foreground" 
                        : "border-muted-foreground hover:border-primary"
                    )}
                    onClick={() => toggleTaskMutation.mutate({ id: task.id, is_completed: task.is_completed })}
                  >
                    {task.is_completed && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "font-medium leading-none mb-1",
                      task.is_completed && "line-through"
                    )}>
                      {task.title}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {task.due_date && (
                        <span className={cn(
                          "flex items-center gap-1",
                          isPast(new Date(task.due_date)) && !task.is_completed && "text-destructive"
                        )}>
                          <Clock className="w-3 h-3" />
                          {format(new Date(task.due_date), 'MMM d, h:mm a')}
                        </span>
                      )}
                      {task.reminder_at && (
                        <span className="flex items-center gap-1 text-primary">
                          <Bell className="w-3 h-3" />
                          {format(new Date(task.reminder_at), 'h:mm a')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-muted-foreground hover:text-destructive rounded-full transition-all"
                  onClick={() => deleteTaskMutation.mutate(task.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {tasks.filter((t: any) => !t.is_completed).length > 0 && (
          <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-primary shrink-0" />
            <p className="text-sm text-muted-foreground font-medium">
              You have {tasks.filter((t: any) => !t.is_completed).length} pending tasks for today. Stay on track!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
