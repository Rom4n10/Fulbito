"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function applyToMatch(matchId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  // Verificar que no sea el creador del partido
  const { data: match } = await supabase
    .from("matches")
    .select("creator_id")
    .eq("id", matchId)
    .single();

  if (!match) {
    return { error: "Partido no encontrado" };
  }

  if (match.creator_id === user.id) {
    return { error: "No podés postularte a tu propio partido" };
  }

  const { error } = await supabase
    .from("match_requests")
    .insert({
      match_id: matchId,
      user_id: user.id,
    });

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya te postulaste a este partido" };
    }
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath(`/matches/${matchId}`);
  return { success: true };
}
