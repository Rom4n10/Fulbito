import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatDate } from "@/lib/utils";

export default async function MyMatchesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Partidos que creé
  const { data: createdMatches } = await supabase
    .from("matches")
    .select("*")
    .eq("creator_id", user.id)
    .order("scheduled_at", { ascending: false });

  // Partidos donde fui aceptado
  const { data: acceptedRequests } = await supabase
    .from("match_requests")
    .select("*, match:matches!match_requests_match_id_fkey(*)")
    .eq("user_id", user.id)
    .eq("status", "aceptado")
    .order("created_at", { ascending: false });

  return (
    <div style={{ paddingTop: "16px" }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "24px" }}>
        Mis <span className="text-gradient">partidos</span>
      </h1>

      {/* Created */}
      <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "12px", color: "var(--text-secondary)" }}>
        Partidos que creé
      </h2>

      {createdMatches && createdMatches.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
          {createdMatches.map((m, i) => (
            <Link key={m.id} href={`/matches/${m.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <GlassCard animate stagger={Math.min(i + 1, 6)} padding="sm">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                      {m.sport === "futbol" ? "⚽" : "🎾"} {m.location_name}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
                      {formatDate(m.scheduled_at)}
                    </p>
                  </div>
                  <span className={`badge badge-status-${m.status ?? "abierto"}`}>
                    {m.status}
                  </span>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      ) : (
        <p style={{ color: "var(--text-tertiary)", marginBottom: "32px", fontSize: "0.9rem" }}>
          No creaste partidos todavía
        </p>
      )}

      {/* Accepted */}
      <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "12px", color: "var(--text-secondary)" }}>
        Partidos aceptados
      </h2>

      {acceptedRequests && acceptedRequests.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {acceptedRequests.map((req, i) => (
            <Link key={req.id} href={`/matches/${req.match_id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <GlassCard animate stagger={Math.min(i + 1, 6)} padding="sm">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                      {req.match?.sport === "futbol" ? "⚽" : "🎾"} {req.match?.location_name}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
                      {req.match?.scheduled_at ? formatDate(req.match.scheduled_at) : ""}
                    </p>
                  </div>
                  <span className="badge badge-status-abierto">aceptado</span>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      ) : (
        <p style={{ color: "var(--text-tertiary)", fontSize: "0.9rem" }}>
          No fuiste aceptado en ningún partido todavía
        </p>
      )}
    </div>
  );
}
