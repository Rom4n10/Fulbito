import Link from "next/link";
import type { Tables } from "@/types/database";
import { calculateAge, getInitials } from "@/lib/utils";
import { WhatsAppButton } from "./WhatsAppButton";

interface FreeAgentCardProps {
  user: Tables<"users"> & {
    department?: { name: string } | null;
  };
  stagger?: number;
}

function getPositionLabel(
  sport: string | null,
  footballPos: string | null,
  padelPos: string | null
): string | null {
  if (sport === "futbol" && footballPos) {
    const labels: Record<string, string> = {
      arquero: "🧤 Arquero",
      defensa: "🛡️ Defensa",
      mediocampista: "🎯 Mediocampista",
      delantero: "⚡ Delantero",
    };
    return labels[footballPos] ?? footballPos;
  }
  if (sport === "padel" && padelPos) {
    const labels: Record<string, string> = {
      drive: "💪 Drive (Derecha)",
      reves: "🎾 Revés (Izquierda)",
    };
    return labels[padelPos] ?? padelPos;
  }
  return null;
}

export function FreeAgentCard({ user, stagger = 1 }: FreeAgentCardProps) {
  const position = getPositionLabel(
    user.preferred_sport,
    user.preferred_football_position,
    user.preferred_padel_position
  );

  const sportLabel = user.preferred_sport === "futbol" ? "⚽ Fútbol" : user.preferred_sport === "padel" ? "🎾 Pádel" : null;

  return (
    <div className={`glass-card animate-fade-in-up stagger-${stagger}`} style={{ padding: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Link href={`/players/${user.id}`} style={{ textDecoration: "none", color: "inherit" }}>
          <div className="avatar" style={{ border: "2px solid var(--color-accent-green)" }}>
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.first_name} />
            ) : (
              getInitials(user.first_name, user.last_name)
            )}
          </div>
        </Link>

        <div style={{ flex: 1 }}>
          <Link href={`/players/${user.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>
              {user.first_name} {user.last_name}
              <span style={{
                display: "inline-block", marginLeft: "8px", padding: "2px 8px",
                fontSize: "0.65rem", fontWeight: 700, borderRadius: "var(--border-radius-full)",
                background: "rgba(16, 185, 129, 0.15)", color: "var(--color-accent-green)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}>
                AGENTE LIBRE 🟢
              </span>
            </p>
          </Link>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px", fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
            {user.birth_date && <span>{calculateAge(user.birth_date)} años</span>}
            {user.department && <span>📍 {user.department.name}</span>}
            <span>⚽ {user.matches_played ?? 0} partidos</span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
            {sportLabel && (
              <span className={`badge badge-${user.preferred_sport}`} style={{ fontSize: "0.65rem" }}>
                {sportLabel}
              </span>
            )}
            {position && (
              <span style={{
                fontSize: "0.7rem", fontWeight: 500, color: "var(--color-primary-light)",
                padding: "2px 8px", borderRadius: "var(--border-radius-full)",
                background: "rgba(99, 102, 241, 0.12)", border: "1px solid rgba(99, 102, 241, 0.25)",
              }}>
                {position}
              </span>
            )}
          </div>
        </div>
      </div>

      {user.phone_number && (
        <div style={{ marginTop: "10px" }}>
          <WhatsAppButton
            phoneNumber={user.phone_number}
            sport={user.preferred_sport ?? "futbol"}
            locationName=""
            scheduledAt=""
            context="generic"
          />
        </div>
      )}
    </div>
  );
}
