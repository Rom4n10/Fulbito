import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { getInitials } from "@/lib/utils";

interface TeamsPageProps {
  searchParams: Promise<{ tab?: string; query?: string }>;
}

export default async function TeamsPage({ searchParams }: TeamsPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const activeTab = sp.tab ?? "mis_equipos";
  const searchQuery = sp.query ?? "";

  // 1. Fetch "Mis Equipos" (teams where user is a member)
  const { data: memberships } = await supabase
    .from("team_members")
    .select("team_id, role, team:teams!team_members_team_id_fkey(id, name, logo_url, founder_id, department:departments(name))")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });

  // 2. Fetch "Buscar Equipos" (all teams)
  let allTeamsQuery = supabase
    .from("teams")
    .select("id, name, logo_url, founder_id, department:departments(name)");

  if (searchQuery.trim() !== "") {
    allTeamsQuery = allTeamsQuery.ilike("name", `%${searchQuery.trim()}%`);
  }

  const { data: allTeams } = await allTeamsQuery.order("name").limit(30);

  // Get member counts for all relevant team IDs
  const myTeamIds = memberships?.map((m) => m.team_id) ?? [];
  const searchTeamIds = allTeams?.map((t) => t.id) ?? [];
  const combinedTeamIds = Array.from(new Set([...myTeamIds, ...searchTeamIds]));

  let memberCounts: Record<string, number> = {};
  if (combinedTeamIds.length > 0) {
    const { data: counts } = await supabase
      .from("team_members")
      .select("team_id")
      .in("team_id", combinedTeamIds);

    if (counts) {
      for (const c of counts) {
        memberCounts[c.team_id] = (memberCounts[c.team_id] ?? 0) + 1;
      }
    }
  }

  return (
    <div style={{ paddingTop: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>
          {activeTab === "mis_equipos" ? (
            <>
              Mis <span className="text-gradient">equipos</span>
            </>
          ) : (
            <>
              Buscar <span className="text-gradient">rivales</span>
            </>
          )}
        </h1>
        <Link href="/teams/create" className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>
          + Crear Equipo
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", background: "var(--glass-bg)", borderRadius: "var(--border-radius-sm)", padding: "4px", marginBottom: "20px" }}>
        <Link
          href="/teams?tab=mis_equipos"
          style={{
            flex: 1,
            textAlign: "center",
            textDecoration: "none",
            padding: "8px 12px", borderRadius: "var(--border-radius-sm)",
            fontSize: "0.85rem", fontWeight: 600, transition: "all var(--transition-fast)",
            background: activeTab === "mis_equipos" ? "var(--color-primary)" : "transparent",
            color: activeTab === "mis_equipos" ? "white" : "var(--text-secondary)",
          }}
        >
          🛡️ Mis Equipos
        </Link>
        <Link
          href="/teams?tab=buscar"
          style={{
            flex: 1,
            textAlign: "center",
            textDecoration: "none",
            padding: "8px 12px", borderRadius: "var(--border-radius-sm)",
            fontSize: "0.85rem", fontWeight: 600, transition: "all var(--transition-fast)",
            background: activeTab === "buscar" ? "var(--color-accent-amber)" : "transparent",
            color: activeTab === "buscar" ? "white" : "var(--text-secondary)",
          }}
        >
          🔍 Buscar Rivales
        </Link>
      </div>

      {/* Onboarding Box */}
      <GlassCard
        padding="sm"
        style={{
          marginBottom: "20px",
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(245, 158, 11, 0.05))",
          border: "1px solid rgba(245, 158, 11, 0.15)",
        }}
      >
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <span style={{ fontSize: "1.2rem" }}>💡</span>
          <div>
            <h4 style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-accent-amber)", marginBottom: "2px" }}>
              ¿Cómo funcionan los desafíos?
            </h4>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: "1.3" }}>
              Armá tu equipo, buscá otro club en la pestaña <strong>Buscar Rivales</strong>, y enviales un desafío directo. Cuando lo acepten, se habilitará un botón para coordinar por WhatsApp al instante.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Active Tab Content */}
      {activeTab === "mis_equipos" ? (
        memberships && memberships.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {memberships.map((m, i) => {
              const team = m.team as unknown as { id: string; name: string; logo_url: string | null; founder_id: string; department: { name: string } | null };
              const isFounder = team.founder_id === user.id;

              return (
                <Link key={team.id} href={`/teams/${team.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <GlassCard animate stagger={Math.min(i + 1, 6)} padding="sm">
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div className="avatar" style={{
                        background: team.logo_url ? "transparent" : "linear-gradient(135deg, var(--color-futbol), var(--color-padel))",
                        borderColor: isFounder ? "var(--color-primary)" : "var(--glass-border)",
                      }}>
                        {team.logo_url ? (
                          <img src={team.logo_url} alt={team.name} />
                        ) : (
                          getInitials(team.name, null)
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                          {team.name}
                        </p>
                        <div style={{ display: "flex", gap: "10px", fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "2px" }}>
                          <span>👥 {memberCounts[team.id] ?? 1} miembros</span>
                          {team.department && <span>📍 {team.department.name}</span>}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                        <span className="badge" style={{
                          fontSize: "0.65rem",
                          background: isFounder ? "rgba(99, 102, 241, 0.15)" : m.role === "capitan" ? "rgba(245, 158, 11, 0.15)" : "var(--glass-bg)",
                          color: isFounder ? "var(--color-primary-light)" : m.role === "capitan" ? "var(--color-accent-amber)" : "var(--text-tertiary)",
                          border: `1px solid ${isFounder ? "rgba(99, 102, 241, 0.3)" : m.role === "capitan" ? "rgba(245, 158, 11, 0.3)" : "var(--glass-border)"}`,
                        }}>
                          {isFounder ? "Fundador" : m.role === "capitan" ? "Capitán" : "Jugador"}
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              );
            })}
          </div>
        ) : (
          <GlassCard variant="elevated" padding="lg" className="animate-fade-in-up">
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: "3rem", marginBottom: "12px" }}>⚽</div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "8px" }}>
                No tenés equipos todavía
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "20px" }}>
                Creá tu equipo, sumá a tus amigos y empezá a buscar rivales para jugar partidos épicos.
              </p>
              <Link href="/teams/create" className="btn btn-primary" style={{ textDecoration: "none", display: "inline-flex" }}>
                Crear equipo
              </Link>
            </div>
          </GlassCard>
        )
      ) : (
        /* TAB: BUSCAR */
        <div>
          {/* Search Form */}
          <form method="GET" action="/teams" style={{ marginBottom: "16px", display: "flex", gap: "8px" }}>
            <input type="hidden" name="tab" value="buscar" />
            <input
              type="text"
              name="query"
              placeholder="Buscar por nombre de equipo..."
              defaultValue={searchQuery}
              className="glass-input"
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              🔍 Buscar
            </button>
          </form>

          {allTeams && allTeams.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {allTeams.map((team, i) => {
                const isMemberOfSearch = myTeamIds.includes(team.id);

                return (
                  <Link key={team.id} href={`/teams/${team.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <GlassCard animate stagger={Math.min(i + 1, 6)} padding="sm">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div className="avatar" style={{
                          background: team.logo_url ? "transparent" : "linear-gradient(135deg, var(--color-futbol), var(--color-padel))",
                          borderColor: "var(--glass-border)",
                        }}>
                          {team.logo_url ? (
                            <img src={team.logo_url} alt={team.name} />
                          ) : (
                            getInitials(team.name, null)
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                            {team.name}
                          </p>
                          <div style={{ display: "flex", gap: "10px", fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "2px" }}>
                            <span>👥 {memberCounts[team.id] ?? 1} miembros</span>
                            {team.department && <span>📍 {team.department.name}</span>}
                          </div>
                        </div>
                        {isMemberOfSearch && (
                          <span className="badge" style={{
                            fontSize: "0.65rem",
                            background: "rgba(16, 185, 129, 0.15)",
                            color: "var(--color-accent-green)",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                          }}>
                            ✓ Sos miembro
                          </span>
                        )}
                      </div>
                    </GlassCard>
                  </Link>
                );
              })}
            </div>
          ) : (
            <GlassCard variant="elevated" padding="lg" className="animate-fade-in-up">
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🔍</div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "8px" }}>
                  No se encontraron equipos
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  Probá buscando con otro nombre o creá tu propio equipo para empezar el legado.
                </p>
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}

