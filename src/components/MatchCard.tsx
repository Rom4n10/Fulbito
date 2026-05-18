import Link from "next/link";
import type { Tables } from "@/types/database";
import { formatDate, calculateAge, getInitials } from "@/lib/utils";

interface MatchCardProps {
  match: Tables<"matches"> & {
    team?: { name: string; logo_url: string | null } | null;
  };
  creator: Tables<"users"> | null;
  venueName: string | null;
  currentUserId: string;
  stagger?: number;
}

function buildDynamicTitle(match: Tables<"matches">, venueName: string | null): string {
  let sportLabel: string;
  if (match.sport === "futbol") {
    sportLabel = match.football_type ? `Fútbol ${match.football_type}` : "Fútbol";
  } else {
    sportLabel = "Pádel";
  }

  const location = venueName ?? match.location_name;
  const hora = new Date(match.scheduled_at).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${sportLabel} en ${location} ${hora}`;
}

export function MatchCard({ match, creator, venueName, currentUserId, stagger = 1 }: MatchCardProps) {
  const title = buildDynamicTitle(match, venueName);
  const isOwn = match.creator_id === currentUserId;

  return (
    <Link
      href={`/matches/${match.id}`}
      className={`glass-card animate-fade-in-up stagger-${stagger}`}
      style={{ display: "block", padding: "16px", textDecoration: "none", color: "inherit" }}
      id={`match-${match.id}`}
    >
      {/* Header: badge + type */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <span className={`badge badge-${match.sport}`}>
            {match.sport === "futbol" ? "⚽" : "🎾"} {match.sport}
            {match.football_type && ` ${match.football_type}`}
          </span>
          {match.team && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              padding: "3px 10px", fontSize: "0.7rem", fontWeight: 600,
              borderRadius: "var(--border-radius-full)",
              background: "rgba(99, 102, 241, 0.12)", color: "var(--color-primary-light)",
              border: "1px solid rgba(99, 102, 241, 0.25)",
            }}>
              {match.team.logo_url && (
                <img src={match.team.logo_url} alt="" style={{ width: "14px", height: "14px", borderRadius: "50%" }} />
              )}
              {match.team.name}
            </span>
          )}
        </div>
        <span className="badge badge-status-abierto" style={{ fontSize: "0.7rem" }}>
          {match.type === "busco_rival" ? "Busca rival" : "Busca jugador"}
        </span>
      </div>

      {/* Dynamic Title */}
      <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "8px", lineHeight: 1.3 }}>
        {title}
      </h3>

      {/* Date + Price row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {formatDate(match.scheduled_at)}
        </p>
        {match.price_per_person != null && match.price_per_person > 0 && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            padding: "3px 10px", fontSize: "0.7rem", fontWeight: 700,
            borderRadius: "var(--border-radius-full)",
            background: match.is_paid ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
            color: match.is_paid ? "var(--color-accent-green)" : "var(--color-accent-amber)",
            border: `1px solid ${match.is_paid ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
          }}>
            💰 ${match.price_per_person}/pers
            {match.is_paid && " ✓ Señado"}
          </span>
        )}
      </div>

      {/* Age range if specified */}
      {(match.min_age || match.max_age) && (
        <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginBottom: "12px" }}>
          👥 Edades: {match.min_age ?? "—"} a {match.max_age ?? "—"} años
        </p>
      )}

      {/* Creator */}
      {creator && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "10px", borderTop: "1px solid var(--glass-border)" }}>
          <div className="avatar avatar-sm">
            {creator.avatar_url ? (
              <img src={creator.avatar_url} alt={creator.first_name} />
            ) : (
              getInitials(creator.first_name, creator.last_name)
            )}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "0.8rem", fontWeight: 600 }}>
              {creator.first_name} {creator.last_name}
              {creator.birth_date && (
                <span style={{ fontWeight: 400, color: "var(--text-tertiary)", marginLeft: "6px" }}>
                  {calculateAge(creator.birth_date)} años
                </span>
              )}
            </p>
            <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>
              ⚽ {creator.matches_played ?? 0} partidos
            </p>
          </div>
          {isOwn && (
            <span style={{
              fontSize: "0.7rem", fontWeight: 600, color: "var(--color-primary-light)",
              padding: "2px 8px", borderRadius: "var(--border-radius-full)",
              background: "rgba(99, 102, 241, 0.15)", border: "1px solid rgba(99, 102, 241, 0.3)",
            }}>
              Tu partido
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
