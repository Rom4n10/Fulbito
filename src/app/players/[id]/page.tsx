import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { calculateAge, getInitials } from "@/lib/utils";
import { getUserReputation } from "@/lib/reputation";

interface PlayerProfileProps {
  params: Promise<{ id: string }>;
}

export default async function PlayerProfilePage({ params }: PlayerProfileProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: player } = await supabase
    .from("users")
    .select("*, department:departments(name, province:provinces(name))")
    .eq("id", id)
    .single();

  if (!player) notFound();

  const reputation = await getUserReputation(id);

  return (
    <div style={{ paddingTop: "16px" }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "24px" }}>
        Perfil de jugador
      </h1>

      <GlassCard variant="elevated" padding="lg" className="animate-fade-in-up">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <div className="avatar avatar-lg">
            {player.avatar_url ? (
              <img src={player.avatar_url} alt={player.first_name} />
            ) : (
              getInitials(player.first_name, player.last_name)
            )}
          </div>
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>
              {player.first_name} {player.last_name}
            </h2>
            <div style={{ display: "flex", gap: "12px", marginTop: "4px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              {player.birth_date && <span>🎂 {calculateAge(player.birth_date)} años</span>}
              {player.department && (
                <span>📍 {player.department.name}</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px",
          padding: "16px", background: "var(--glass-bg)", borderRadius: "var(--border-radius-sm)",
        }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--color-accent-green)" }}>
              {reputation.matchesPlayed}
            </p>
            <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "2px" }}>Partidos</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "1.4rem", fontWeight: 700, color: reputation.flakeCount > 0 ? "var(--color-accent-amber)" : "var(--text-tertiary)" }}>
              {reputation.flakeCount}
            </p>
            <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "2px" }}>Cancelaciones</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "1.4rem", fontWeight: 700, color: reputation.conflictiveCount > 0 ? "var(--color-accent-red)" : "var(--text-tertiary)" }}>
              {reputation.conflictiveCount}
            </p>
            <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "2px" }}>Conflictos</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
