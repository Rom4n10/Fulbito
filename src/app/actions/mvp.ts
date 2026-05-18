"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitMVPVote(matchId: string, votedForId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  // Verify match is completado
  const { data: match } = await supabase
    .from("matches")
    .select("id, status, creator_id")
    .eq("id", matchId)
    .single();

  if (!match || match.status !== "completado") {
    return { error: "Solo se puede votar en partidos completados" };
  }

  // Verify voter participated
  const isCreator = match.creator_id === user.id;
  const { data: request } = await supabase
    .from("match_requests")
    .select("id")
    .eq("match_id", matchId)
    .eq("user_id", user.id)
    .eq("status", "aceptado")
    .maybeSingle();

  if (!isCreator && !request) {
    return { error: "Solo los participantes pueden votar" };
  }

  // Can't vote for yourself
  if (votedForId === user.id) {
    return { error: "No podés votarte a vos mismo" };
  }

  // Check if already voted
  const { data: existing } = await supabase
    .from("mvp_votes")
    .select("id")
    .eq("match_id", matchId)
    .eq("voter_id", user.id)
    .maybeSingle();

  if (existing) {
    return { error: "Ya votaste en este partido" };
  }

  const { error } = await supabase
    .from("mvp_votes")
    .insert({ match_id: matchId, voter_id: user.id, voted_for_id: votedForId });

  if (error) return { error: error.message };

  revalidatePath(`/matches/${matchId}`);
  return { success: true };
}

export async function getMVPResult(matchId: string) {
  const supabase = await createClient();

  const { data: votes } = await supabase
    .from("mvp_votes")
    .select("voted_for_id, user:users!mvp_votes_voted_for_id_fkey(first_name, last_name, avatar_url)")
    .eq("match_id", matchId);

  if (!votes || votes.length === 0) return null;

  // Count votes per player
  const counts: Record<string, { count: number; user: { first_name: string; last_name: string | null; avatar_url: string | null } }> = {};
  for (const v of votes) {
    if (!counts[v.voted_for_id]) {
      counts[v.voted_for_id] = { count: 0, user: v.user as { first_name: string; last_name: string | null; avatar_url: string | null } };
    }
    counts[v.voted_for_id].count++;
  }

  // Find top voted
  const sorted = Object.entries(counts).sort((a, b) => b[1].count - a[1].count);
  const [mvpId, mvpData] = sorted[0];

  return {
    mvpId,
    mvpName: `${mvpData.user.first_name} ${mvpData.user.last_name ?? ""}`.trim(),
    mvpAvatar: mvpData.user.avatar_url,
    voteCount: mvpData.count,
    totalVotes: votes.length,
  };
}
