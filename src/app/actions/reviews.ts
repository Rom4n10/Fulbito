"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitReview(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  const matchId = formData.get("match_id") as string;
  const revieweeId = formData.get("reviewee_id") as string;
  const comment = formData.get("comment") as string;
  const isConflictive = formData.get("is_conflictive") === "true";
  const isFlake = formData.get("is_flake") === "true";

  if (!matchId || !revieweeId) {
    return { error: "Datos incompletos" };
  }

  const { error } = await supabase.from("reviews").insert({
    reviewer_id: user.id,
    reviewee_id: revieweeId,
    match_id: matchId,
    comment: comment || null,
    is_conflictive: isConflictive,
    is_flake: isFlake,
  });

  if (error) {
    if (error.code === "23505") return { error: "Ya evaluaste a este jugador en este partido" };
    return { error: error.message };
  }

  revalidatePath(`/matches/${matchId}`);
  return { success: true };
}
