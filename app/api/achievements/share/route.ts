import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAchievementMeta, type MilestoneId } from "@/lib/achievementMeta";

function makeShareSlug(userId: string, milestone: string) {
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  return `${userId.slice(0, 8)}-${milestone}-${suffix}`;
}

function migrationError() {
  return NextResponse.json(
    {
      error:
        "Achievement sharing is not set up yet. Apply Supabase migration 006_achievement_public_sharing.sql first.",
    },
    { status: 503 },
  );
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const milestone = body?.milestone as MilestoneId | undefined;

  if (!milestone || !getAchievementMeta(milestone)) {
    return NextResponse.json({ error: "Invalid milestone" }, { status: 400 });
  }

  const { data: achievement, error } = await supabase
    .from("user_achievements")
    .select("id, milestone, claimed_at, share_slug, is_public")
    .eq("user_id", user.id)
    .eq("milestone", milestone)
    .single();

  if (error?.message?.includes("share_slug")) {
    return migrationError();
  }

  if (error || !achievement?.claimed_at) {
    return NextResponse.json(
      { error: "Achievement must be claimed before it can be shared" },
      { status: 403 },
    );
  }

  const shareSlug = achievement.share_slug || makeShareSlug(user.id, milestone);
  const sharedAt = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("user_achievements")
    .update({
      share_slug: shareSlug,
      is_public: true,
      shared_at: sharedAt,
    })
    .eq("id", achievement.id);

  if (updateError?.message?.includes("share_slug")) {
    return migrationError();
  }
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const origin = new URL(request.url).origin;

  return NextResponse.json({
    success: true,
    shareSlug,
    url: `${origin}/share/achievement/${shareSlug}`,
  });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const milestone = body?.milestone as MilestoneId | undefined;

  if (!milestone || !getAchievementMeta(milestone)) {
    return NextResponse.json({ error: "Invalid milestone" }, { status: 400 });
  }

  const { error } = await supabase
    .from("user_achievements")
    .update({
      is_public: false,
      shared_at: null,
    })
    .eq("user_id", user.id)
    .eq("milestone", milestone);

  if (error?.message?.includes("is_public")) {
    return migrationError();
  }
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
