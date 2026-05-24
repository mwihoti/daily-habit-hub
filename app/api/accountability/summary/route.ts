import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAccountabilitySummary } from "@/lib/accountability-ai";
import { startOfWeek } from "date-fns";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get("refresh") === "1";

    const [{ data: profile }, { data: workouts, error: workoutsError }, { data: goals }, { data: tasks }] = await Promise.all([
      supabase
        .from("profiles")
        .select("streak, fitness_goal, total_workouts, accountability_preferred_prompt_tone")
        .eq("id", user.id)
        .single(),
      supabase
        .from("workouts")
        .select("created_at, type, activity_title, duration_minutes, energy_level, effort_level")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("goals")
        .select("title, target_date, status, progress")
        .eq("user_id", user.id),
      supabase
        .from("tasks")
        .select("title, due_date, reminder_at, is_completed")
        .eq("user_id", user.id),
    ]);

    if (workoutsError) {
      return NextResponse.json({ error: "Could not load workouts" }, { status: 500 });
    }

    const promptTone = profile?.accountability_preferred_prompt_tone ?? "direct";
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString().slice(0, 10);
    const latestWorkoutAt = workouts?.[0]?.created_at ?? null;
    const workoutCount = profile?.total_workouts ?? workouts?.length ?? 0;

    const { data: cachedSummary } = await supabase
      .from("accountability_weekly_summaries")
      .select("summary, provider, fallback, workout_count, latest_workout_at, generated_at")
      .eq("user_id", user.id)
      .eq("week_start", weekStart)
      .eq("prompt_tone", promptTone)
      .maybeSingle();

    const cacheValid = !forceRefresh
      && !!cachedSummary
      && cachedSummary.workout_count === workoutCount
      && (cachedSummary.latest_workout_at ?? null) === latestWorkoutAt;

    if (cacheValid) {
      return NextResponse.json({
        summary: cachedSummary.summary,
        provider: cachedSummary.provider,
        fallback: cachedSummary.fallback,
        cached: true,
        generatedAt: cachedSummary.generated_at,
      });
    }

    const summary = await generateAccountabilitySummary({
      profile: profile ?? {},
      workouts: workouts ?? [],
      goals: goals ?? [],
      tasks: tasks ?? [],
    });

    await supabase
      .from("accountability_weekly_summaries")
      .upsert({
        user_id: user.id,
        week_start: weekStart,
        prompt_tone: promptTone,
        summary: summary.summary,
        provider: summary.provider,
        fallback: summary.fallback,
        workout_count: workoutCount,
        latest_workout_at: latestWorkoutAt,
        generated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,week_start,prompt_tone",
      });

    await supabase
      .from("profiles")
      .update({ accountability_last_summary_sent_at: new Date().toISOString() })
      .eq("id", user.id);

    return NextResponse.json({
      ...summary,
      cached: false,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[accountability/summary]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
