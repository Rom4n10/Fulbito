"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateRequestStatus(
  requestId: string,
  matchId: string,
  status: "aceptado" | "rechazado"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  // Verificar que el usuario es el creador del partido
  const { data: match } = await supabase
    .from("matches")
    .select("creator_id")
    .eq("id", matchId)
    .single();

  if (!match || match.creator_id !== user.id) {
    return { error: "No tenés permisos" };
  }

  const { error } = await supabase
    .from("match_requests")
    .update({ status })
    .eq("id", requestId);

  if (error) return { error: error.message };

  revalidatePath(`/matches/${matchId}`);
  return { success: true };
}

export async function confirmMatch(matchId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  const { data: match } = await supabase
    .from("matches")
    .select("creator_id, status")
    .eq("id", matchId)
    .single();

  if (!match || match.creator_id !== user.id) {
    return { error: "No tenés permisos" };
  }

  if (match.status !== "abierto") {
    return { error: "El partido ya no está abierto" };
  }

  const { error } = await supabase
    .from("matches")
    .update({ status: "confirmado" })
    .eq("id", matchId);

  if (error) return { error: error.message };

  revalidatePath(`/matches/${matchId}`);
  return { success: true };
}

export async function cancelMatch(matchId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  const { data: match } = await supabase
    .from("matches")
    .select("creator_id")
    .eq("id", matchId)
    .single();

  if (!match || match.creator_id !== user.id) {
    return { error: "No tenés permisos" };
  }

  const { error } = await supabase
    .from("matches")
    .update({ status: "cancelado" })
    .eq("id", matchId);

  if (error) return { error: error.message };

  revalidatePath(`/matches/${matchId}`);
  return { success: true };
}

export async function completeMatch(matchId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  const { data: match } = await supabase
    .from("matches")
    .select("creator_id, status")
    .eq("id", matchId)
    .single();

  if (!match || match.creator_id !== user.id) {
    return { error: "No tenés permisos" };
  }

  if (match.status !== "confirmado") {
    return { error: "El partido debe estar confirmado para finalizarse" };
  }

  const { error } = await supabase
    .from("matches")
    .update({ status: "completado" })
    .eq("id", matchId);

  if (error) return { error: error.message };

  revalidatePath(`/matches/${matchId}`);
  return { success: true };
}
