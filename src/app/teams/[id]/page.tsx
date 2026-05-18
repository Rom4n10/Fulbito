import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { getInitials, calculateAge } from "@/lib/utils";
import Link from "next/link";
import { TeamMemberActions } from "./TeamMemberActions";
import { AddMemberSearch } from "./AddMemberSearch";
import { ChallengeModal } from "./ChallengeModal";
import { ChallengeList } from "./ChallengeList";

interface TeamDetailProps {
  params: Promise<{ id: string }>;
}

export default async function TeamDetailPage({ params }: TeamDetailProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: team } = await supabase
    .from("teams")
    .select("*, department:departments(name), founder:users!teams_founder_id_fkey(first_name, last_name)")
    .eq("id", id)
    .single();

  if (!team) notFound();

  const isFounder = team.founder_id === user.id;

  // Members with user info
  const { data: members } = await supabase
    .from("team_members")
    .select("*, user:users!team_members_user_id_fkey(id, first_name, last_name, avatar_url, birth_date, matches_played)")
    .eq("team_id", id)
    .order("joined_at", { ascending: true });

  // Team match history
  const { data: teamMatches } = await supabase
    .from("matches")
    .select("id, sport, location_name, scheduled_at, status, venue:venues!matches_venue_id_fkey(name)")
    .eq("team_id", id)
    .order("scheduled_at", { ascending: false })
    .limit(10);

  // Check if current user is captain
  const currentMembership = members?.find((m) => m.user_id === user.id);
  const isCaptain = currentMembership?.role === "capitan";
  const canManage = isFounder || isCaptain;

  // Fetch current user's team memberships to see if they are a member, and their own teams
  const { data: userMemberships } = await supabase
    .from("team_members")
    .select("team_id, role, team:teams!team_members_team_id_fkey(id, name, logo_url, founder_id)")
    .eq("user_id", user.id);

  const isMember = userMemberships?.some((m) => m.team_id === id) ?? false;

  // Fetch teams founded by the user
  const { data: foundedTeams } = await supabase
    .from("teams")
    .select("id, name, logo_url")
    .eq("founder_id", user.id);

  // Combine teams founded by user and teams where they are captains
  const captainTeams = userMemberships
    ?.filter((m) => m.role === "capitan")
    ?.map((m) => m.team as unknown as { id: string; name: string; logo_url: string | null }) ?? [];

  const allUserManageableTeams = [
    ...(foundedTeams ?? []),
    ...captainTeams
  ].filter((t, idx, self) => t && t.id !== id && self.findIndex((x) => x.id === t.id) === idx);

  // Get active challenges to filter out challenge options
  const { data: activeChallenges } = await supabase
    .from("team_challenges")
    .select("challenger_id, status")
    .eq("challenged_id", id)
    .in("status", ["pendiente", "aceptado"]);

  const blockedChallengerIds = activeChallenges?.map(ac => ac.challenger_id) ?? [];
  const challengeableTeams = allUserManageableTeams.filter(t => !blockedChallengerIds.includes(t.id));

  // Fetch challenges
  const { data: incomingChallenges } = await supabase
    .from("team_challenges")
    .select(`
      id,
      created_at,
      message,
      status,
      challenger:teams!team_challenges_challenger_id_fkey(
        id,
        name,
        logo_url,
        founder:users!teams_founder_id_fkey(first_name, last_name, phone_number)
      )
    `)
    .eq("challenged_id", id)
    .order("created_at", { ascending: false });

  const { data: outgoingChallenges } = await supabase
    .from("team_challenges")
    .select(`
      id,
      created_at,
      message,
      status,
      challenged:teams!team_challenges_challenged_id_fkey(
        id,
        name,
        logo_url,
        founder:users!teams_founder_id_fkey(first_name, last_name, phone_number)
      )
    `)
    .eq("challenger_id", id)
    .order("created_at", { ascending: false });

  const cleanIncoming = (incomingChallenges ?? []).map(ch => ({
    id: ch.id,
    created_at: ch.created_at,
    message: ch.message,
    status: ch.status as "pendiente" | "aceptado" | "rechazado",
    challenger: ch.challenger ? {
      id: ch.challenger.id,
      name: ch.challenger.name,
      logo_url: ch.challenger.logo_url,
      founder: ch.challenger.founder ? {
        first_name: ch.challenger.founder.first_name,
        last_name: ch.challenger.founder.last_name,
        phone_number: ch.challenger.founder.phone_number
      } : null
    } : undefined
  }));

  const cleanOutgoing = (outgoingChallenges ?? []).map(ch => ({
    id: ch.id,
    created_at: ch.created_at,
    message: ch.message,
    status: ch.status as "pendiente" | "aceptado" | "rechazado",
    challenged: ch.challenged ? {
      id: ch.challenged.id,
      name: ch.challenged.name,
      logo_url: ch.challenged.logo_url,
      founder: ch.challenged.founder ? {
        first_name: ch.challenged.founder.first_name,
        last_name: ch.challenged.founder.last_name,
        phone_number: ch.challenged.founder.phone_number
      } : null
    } : undefined
  }));


  return (
    <div style={{ paddingTop: "16px" }}>
      {/* Team Header */}
      <GlassCard variant="elevated" padding="lg" className="animate-fade-in-up">
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
          <div className="avatar avatar-lg" style={{
            width: "72px", height: "72px",
            background: team.logo_url ? "transparent" : "linear-gradient(135deg, var(--color-futbol), var(--color-padel))",
            fontSize: "1.5rem",
          }}>
            {team.logo_url ? (
              <img src={team.logo_url} alt={team.name} />
            ) : (
              getInitials(team.name, null)
            )}
          </div>
          <div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 700 }}>{team.name}</h1>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              {team.department && <span>📍 {team.department.name}</span>}
              {team.founder && (
                <span style={{ marginLeft: team.department ? "8px" : 0 }}>
                  👑 {(team.founder as unknown as { first_name: string; last_name: string | null }).first_name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px",
          padding: "12px", background: "var(--glass-bg)", borderRadius: "var(--border-radius-sm)",
        }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--color-primary-light)" }}>
              {members?.length ?? 0}
            </p>
            <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>Miembros</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--color-accent-green)" }}>
              {teamMatches?.length ?? 0}
            </p>
            <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>Partidos</p>
          </div>
        </div>
      </GlassCard>

      {/* Add Member (only for founders/captains) */}
      {canManage && (
        <div style={{ marginTop: "16px" }}>
          <AddMemberSearch teamId={id} />
        </div>
      )}

      {/* Members */}
      <div style={{ marginTop: "24px" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "12px" }}>
          Miembros ({members?.length ?? 0})
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {members?.map((m, i) => {
            const memberUser = m.user as unknown as { id: string; first_name: string; last_name: string | null; avatar_url: string | null; birth_date: string | null; matches_played: number | null };
            const isMemberFounder = m.user_id === team.founder_id;

            return (
              <GlassCard key={m.id} animate stagger={Math.min(i + 1, 6)} padding="sm">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Link href={`/players/${memberUser.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="avatar avatar-sm">
                      {memberUser.avatar_url ? (
                        <img src={memberUser.avatar_url} alt={memberUser.first_name} />
                      ) : (
                        getInitials(memberUser.first_name, memberUser.last_name)
                      )}
                    </div>
                  </Link>
                  <div style={{ flex: 1 }}>
                    <Link href={`/players/${memberUser.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <p style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                        {memberUser.first_name} {memberUser.last_name}
                        {memberUser.birth_date && (
                          <span style={{ fontWeight: 400, color: "var(--text-tertiary)", marginLeft: "4px" }}>
                            {calculateAge(memberUser.birth_date)}a
                          </span>
                        )}
                      </p>
                    </Link>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>
                      ⚽ {memberUser.matches_played ?? 0} partidos
                    </p>
                  </div>
                  <span className="badge" style={{
                    fontSize: "0.65rem",
                    background: isMemberFounder ? "rgba(99, 102, 241, 0.15)" : m.role === "capitan" ? "rgba(245, 158, 11, 0.15)" : "var(--glass-bg)",
                    color: isMemberFounder ? "var(--color-primary-light)" : m.role === "capitan" ? "var(--color-accent-amber)" : "var(--text-tertiary)",
                    border: `1px solid ${isMemberFounder ? "rgba(99, 102, 241, 0.3)" : m.role === "capitan" ? "rgba(245, 158, 11, 0.3)" : "var(--glass-border)"}`,
                  }}>
                    {isMemberFounder ? "👑 Fundador" : m.role === "capitan" ? "🏅 Capitán" : "Jugador"}
                  </span>
                  {canManage && !isMemberFounder && m.user_id !== user.id && (
                    <TeamMemberActions teamId={id} userId={m.user_id} memberName={memberUser.first_name} />
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Challenges Section */}
      <div style={{ marginTop: "24px" }}>
        {isMember ? (
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "12px" }}>
              Desafíos de Equipo
            </h2>
            <ChallengeList
              incoming={cleanIncoming}
              outgoing={cleanOutgoing}
              canManage={canManage}
              teamName={team.name}
            />
          </div>
        ) : (
          challengeableTeams.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <ChallengeModal
                myTeams={challengeableTeams}
                challengedTeamId={id}
                challengedTeamName={team.name}
              />
            </div>
          )
        )}
      </div>

      {/* Match History */}
      {teamMatches && teamMatches.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "12px" }}>
            Historial de partidos
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {teamMatches.map((match) => (
              <Link key={match.id} href={`/matches/${match.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <GlassCard padding="sm">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                        {match.sport === "futbol" ? "⚽" : "🎾"} {(match.venue as { name: string } | null)?.name ?? match.location_name}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                        {new Date(match.scheduled_at).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <span className={`badge badge-status-${match.status ?? "abierto"}`} style={{ fontSize: "0.65rem" }}>
                      {match.status}
                    </span>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
