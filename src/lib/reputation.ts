import { createClient } from "@/lib/supabase/server";

export interface UserReputation {
  matchesPlayed: number;
  flakeCount: number;
  conflictiveCount: number;
  mvpCount: number;
}

/**
 * Obtiene las estadísticas de reputación de un usuario.
 * Incluye partidos jugados, faltas, conflictos y votos MVP recibidos.
 */
export async function getUserReputation(userId: string): Promise<UserReputation> {
  const supabase = await createClient();

  const [{ data: user }, { data: reviews }, { data: mvpVotes }] = await Promise.all([
    supabase.from("users").select("matches_played").eq("id", userId).single(),
    supabase
      .from("reviews")
      .select("is_flake, is_conflictive")
      .eq("reviewee_id", userId),
    supabase
      .from("mvp_votes")
      .select("id")
      .eq("voted_for_id", userId),
  ]);

  const flakeCount = reviews?.filter((r) => r.is_flake).length ?? 0;
  const conflictiveCount = reviews?.filter((r) => r.is_conflictive).length ?? 0;

  return {
    matchesPlayed: user?.matches_played ?? 0,
    flakeCount,
    conflictiveCount,
    mvpCount: mvpVotes?.length ?? 0,
  };
}

/**
 * Componente inline de reputación para mostrar en cards.
 * Retorna las badges formateadas como string para uso en Server Components.
 */
export function formatReputation(rep: UserReputation): string {
  const parts: string[] = [`⚽ ${rep.matchesPlayed}`];
  if (rep.mvpCount > 0) parts.push(`🏆 ${rep.mvpCount}`);
  if (rep.flakeCount > 0) parts.push(`👻 ${rep.flakeCount}`);
  if (rep.conflictiveCount > 0) parts.push(`⚠️ ${rep.conflictiveCount}`);
  return parts.join(" · ");
}
