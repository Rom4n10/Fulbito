import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { MatchCard } from "@/components/MatchCard";
import { FreeAgentCard } from "@/components/FreeAgentCard";
import { MatchFilters } from "@/components/MatchFilters";

interface FeedPageProps {
  searchParams: Promise<{ tab?: string; depto?: string; pos?: string; sport?: string }>;
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const sp = await searchParams;
  const activeTab = sp.tab ?? "partidos";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Clean expired matches (free tier workaround for pg_cron)
  await supabase.rpc("update_expired_matches");

  // Fetch active user's profile to check if incomplete
  const { data: profile } = await supabase
    .from("users")
    .select("phone_number, birth_date")
    .eq("id", user.id)
    .single();

  const showProfileWarning = !profile?.phone_number || !profile?.birth_date;

  const profileWarningElement = showProfileWarning && (
    <GlassCard
      padding="md"
      className="animate-fade-in-up"
      style={{
        marginBottom: "16px",
        background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.08))",
        border: "1px solid rgba(245, 158, 11, 0.3)",
      }}
    >
      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: "1.8rem" }}>⚠️</span>
        <div style={{ flex: "1 1 200px" }}>
          <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#f59e0b", marginBottom: "4px" }}>
            ¡Completá tu perfil para jugar!
          </h4>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.4", margin: 0 }}>
            Necesitamos tu <strong>teléfono</strong> (para coordinar por WhatsApp) y tu <strong>fecha de nacimiento</strong> (para calcular tu edad) antes de que puedas postularte a partidos.
          </p>
        </div>
        <Link
          href="/profile"
          className="btn"
          style={{
            textDecoration: "none",
            whiteSpace: "nowrap",
            background: "linear-gradient(to right, #f59e0b, #d97706)",
            border: "none",
            color: "white",
            fontWeight: 600,
            padding: "8px 16px",
            borderRadius: "var(--border-radius-sm)",
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          Completar Perfil
        </Link>
      </div>
    </GlassCard>
  );

  if (activeTab === "agentes") {
    // Free agents tab
    let query = supabase
      .from("users")
      .select("*, department:departments(name)")
      .eq("is_free_agent", true)
      .order("matches_played", { ascending: false });

    if (sp.depto) {
      query = query.eq("department_id", Number(sp.depto));
    }

    const { data: agents } = await query;

    // Get departments for filter
    const { data: departments } = await supabase
      .from("departments")
      .select("id, name")
      .order("name");

    return (
      <div style={{ paddingTop: "16px" }}>
        {/* Tabs */}
        <FeedTabs activeTab={activeTab} />

        {profileWarningElement}

        {/* Filters */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", overflowX: "auto" }}>
          <Link
            href="/?tab=agentes"
            className={`badge ${!sp.depto ? "badge-futbol" : ""}`}
            style={{ textDecoration: "none", whiteSpace: "nowrap", cursor: "pointer" }}
          >
            Todos
          </Link>
          {departments?.map((d) => (
            <Link
              key={d.id}
              href={`/?tab=agentes&depto=${d.id}`}
              className={`badge ${sp.depto === String(d.id) ? "badge-futbol" : ""}`}
              style={{ textDecoration: "none", whiteSpace: "nowrap", cursor: "pointer" }}
            >
              {d.name}
            </Link>
          ))}
        </div>

        {/* Agent List */}
        {agents && agents.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {agents.map((agent, index) => (
              <FreeAgentCard
                key={agent.id}
                user={agent}
                stagger={Math.min(index + 1, 6)}
              />
            ))}
          </div>
        ) : (
          <GlassCard variant="elevated" padding="lg" className="animate-fade-in-up">
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🔍</div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "8px" }}>
                No hay agentes libres
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                Activá "Agente Libre" en tu perfil para aparecer acá
              </p>
            </div>
          </GlassCard>
        )}
      </div>
    );
  }

  // Fetch departments for matches filter
  const { data: departments } = await supabase
    .from("departments")
    .select("id, name")
    .order("name");

  // Partidos tab (default)
  let matches;
  if (sp.depto) {
    let query = supabase
      .from("matches")
      .select("*, creator:users!matches_creator_id_fkey(*), venue:venues!matches_venue_id_fkey!inner(*), team:teams!matches_team_id_fkey(name, logo_url)")
      .eq("status", "abierto")
      .eq("venue.department_id", Number(sp.depto))
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true });
    
    if (sp.sport === "futbol" || sp.sport === "padel") {
      query = query.eq("sport", sp.sport);
    }
    const { data } = await query;
    matches = data;
  } else {
    let query = supabase
      .from("matches")
      .select("*, creator:users!matches_creator_id_fkey(*), venue:venues!matches_venue_id_fkey(*), team:teams!matches_team_id_fkey(name, logo_url)")
      .eq("status", "abierto")
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true });

    if (sp.sport === "futbol" || sp.sport === "padel") {
      query = query.eq("sport", sp.sport);
    }
    const { data } = await query;
    matches = data;
  }

  // Count matches today for alert banner
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todayMatches = matches?.filter((m) => {
    const d = new Date(m.scheduled_at);
    return d >= todayStart && d <= todayEnd;
  }) ?? [];

  return (
    <div style={{ paddingTop: "16px" }}>
      {/* Tabs */}
      <FeedTabs activeTab={activeTab} />

      {profileWarningElement}

      <MatchFilters departments={departments ?? []} />

      {/* Onboarding Card */}
      <GlassCard
        padding="sm"
        style={{
          marginBottom: "16px",
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(16, 185, 129, 0.05))",
          border: "1px solid rgba(99, 102, 241, 0.15)",
        }}
      >
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <span style={{ fontSize: "1.2rem" }}>💡</span>
          <div>
            <h4 style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-primary-light)", marginBottom: "2px" }}>
              ¡Te damos la bienvenida a Fulbito!
            </h4>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: "1.3", margin: 0 }}>
              Explorá partidos disponibles para postularte, o andá a la sección <strong>Equipos</strong> para fundar tu club, sumar jugadores y desafiar a otros equipos en amistosos épicos coordinados directamente por WhatsApp.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Today Alert Banner */}
      {todayMatches.length > 0 && (
        <div className="animate-fade-in-up" style={{
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(14, 165, 233, 0.1))",
          border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "var(--border-radius-sm)",
          padding: "12px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px",
        }}>
          <span style={{ fontSize: "1.3rem" }}>🔥</span>
          <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-accent-green)" }}>
            ¡Hay {todayMatches.length} {todayMatches.length === 1 ? "partido" : "partidos"} buscando jugadores hoy!
          </p>
        </div>
      )}

      {/* Match List */}
      {matches && matches.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {matches.map((match, index) => (
            <MatchCard
              key={match.id}
              match={match}
              creator={match.creator}
              venueName={match.venue?.name ?? null}
              currentUserId={user.id}
              stagger={Math.min(index + 1, 6)}
            />
          ))}
        </div>
      ) : (
        <GlassCard variant="elevated" padding="lg" className="animate-fade-in-up">
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🏟️</div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "8px" }}>
              No hay partidos abiertos
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "20px" }}>
              Sé el primero en crear un partido
            </p>
            <Link href="/matches/create" className="btn btn-primary" style={{ textDecoration: "none", display: "inline-flex" }}>
              Crear partido
            </Link>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

/* ─── Feed Tabs (Server Component) ─── */
function FeedTabs({ activeTab }: { activeTab: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
      <div style={{ display: "flex", gap: "4px", background: "var(--glass-bg)", borderRadius: "var(--border-radius-sm)", padding: "4px" }}>
        <Link
          href="/?tab=partidos"
          style={{
            textDecoration: "none",
            padding: "8px 16px", borderRadius: "var(--border-radius-sm)",
            fontSize: "0.85rem", fontWeight: 600, transition: "all var(--transition-fast)",
            background: activeTab === "partidos" ? "var(--color-primary)" : "transparent",
            color: activeTab === "partidos" ? "white" : "var(--text-secondary)",
          }}
        >
          ⚽ Partidos
        </Link>
        <Link
          href="/?tab=agentes"
          style={{
            textDecoration: "none",
            padding: "8px 16px", borderRadius: "var(--border-radius-sm)",
            fontSize: "0.85rem", fontWeight: 600, transition: "all var(--transition-fast)",
            background: activeTab === "agentes" ? "var(--color-accent-green)" : "transparent",
            color: activeTab === "agentes" ? "white" : "var(--text-secondary)",
          }}
        >
          🟢 Agentes
        </Link>
      </div>
      {activeTab === "partidos" && (
        <Link href="/matches/create" className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>
          + Crear
        </Link>
      )}
    </div>
  );
}
