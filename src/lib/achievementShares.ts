import { createClient } from "@/lib/supabase/server";
import { getAchievementMeta } from "@/lib/achievementMeta";

export interface PublicAchievementShare {
  slug: string;
  milestone: string;
  claimedAt: string | null;
  txHash: string | null;
  userId: string;
  fullName: string | null;
  username: string | null;
  avatarUrl: string | null;
  walletAddress: string | null;
  meta: ReturnType<typeof getAchievementMeta>;
}

export async function getPublicAchievementShareBySlug(
  slug: string,
): Promise<PublicAchievementShare | null> {
  const supabase = await createClient();

  const { data: achievement } = await supabase
    .from("user_achievements")
    .select("user_id, milestone, claimed_at, tx_hash, share_slug, is_public")
    .eq("share_slug", slug)
    .eq("is_public", true)
    .single();

  if (!achievement) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username, avatar_url, wallet_address")
    .eq("id", achievement.user_id)
    .single();

  const meta = getAchievementMeta(achievement.milestone);

  return {
    slug: achievement.share_slug,
    milestone: achievement.milestone,
    claimedAt: achievement.claimed_at,
    txHash: achievement.tx_hash,
    userId: achievement.user_id,
    fullName: profile?.full_name ?? null,
    username: profile?.username ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    walletAddress: profile?.wallet_address ?? null,
    meta,
  };
}
