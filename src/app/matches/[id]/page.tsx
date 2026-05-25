import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { ApplicantList } from "./ApplicantList";
import { formatDate, getInitials, calculateAge } from "@/lib/utils";
import { getUserReputation } from "@/lib/reputation";
import Link from "next/link";
import { MatchActions } from "./MatchActions";
import { MatchShareButton } from "./MatchShareButton";
import { MVPVoting } from "./MVPVoting";
import { MVPWinner } from "./MVPWinner";
import { getMVPResult } from "@/app/actions/mvp";
import { ApplyMatchButton } from "./ApplyMatchButton";
import type { Tables } from "@/types/database";
import { MatchReviews } from "./MatchReviews";

interface MatchDetailProps {
  params: Promise<{ id: string }>;
}

export default async function MatchDetailPage({ params }: MatchDetailProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: match } = await supabase
    .from("matches")
    .select("*, creator:users!matches_creator_id_fkey(*), venue:venues!matches_venue_id_fkey(name)")
    .eq("id", id)
    .single();

  if (!match) notFound();

  const isCreator = match.creator_id === user.id;

  // Fetch requests with user data
  const { data: requests } = await supabase
    .from("match_requests")
    .select("*, user:users!match_requests_user_id_fkey(*)")
    .eq("match_id", id)
    .order("created_at", { ascending: true });

  // Creator reputation
  const creatorRep = match.creator_id ? await getUserReputation(match.creator_id) : null;

  // Check if current user has applied
  const userRequest = requests?.find((r) => r.user_id === user.id);
  const isParticipant = isCreator || userRequest?.status === "aceptado";

  // Get accepted participants (rival or players)
  const acceptedRequests = requests?.filter((r) => r.status === "aceptado") || [];
  const acceptedPlayers = acceptedRequests.map((r) => r.user).filter(Boolean) as Tables<"users">[];

  // Check MVP and reviews state if match is completed
  let mvpResult = null;
  let hasVoted = false;
  let mvpEligiblePlayers: Tables<"users">[] = [];
  let otherParticipants: Tables<"users">[] = [];
  let initialReviewedIds: string[] = [];

  if (match.status === "completado") {
    mvpResult = await getMVPResult(id);
    if (isParticipant) {
      const { data: vote } = await supabase
        .from("mvp_votes")
        .select("id")
        .eq("match_id", id)
        .eq("voter_id", user.id)
        .maybeSingle();
      hasVoted = !!vote;
      
      // Get all participants (creator + accepted requests)
      const participants = [...acceptedPlayers];
      if (match.creator) participants.push(match.creator);
      
      // Deduplicate participants
      const seen = new Set();
      mvpEligiblePlayers = participants.filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });

      // Other participants for reviews
      otherParticipants = mvpEligiblePlayers.filter((p) => p.id !== user.id);

      // Fetch reviews written by the current user
      const { data: userReviews } = await supabase
        .from("reviews")
        .select("reviewee_id")
        .eq("match_id", id)
        .eq("reviewer_id", user.id);
      initialReviewedIds = userReviews?.map((r) => r.reviewee_id).filter(Boolean) as string[] ?? [];
    }
  }

  const sportEmoji = match.sport === "futbol" ? "⚽" : "🎾";
  const sportLabel = match.sport === "futbol"
    ? match.football_type ? `Fútbol ${match.football_type}` : "Fútbol"
    : "Pádel";
  const typeLabel = match.type === "busco_rival" ? "Busco rival" : "Busco jugador";
  const locationDisplay = match.venue?.name ?? match.location_name;

  return (
    <div style={{ paddingTop: "16px" }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "24px" }}>
        Detalle del partido
      </h1>

      {/* Match Info Card */}
      <GlassCard variant="elevated" padding="lg" className="animate-fade-in-up">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
            <span className={`badge badge-${match.sport}`}>
              {sportEmoji} {sportLabel}
            </span>
            {match.skill_level && match.skill_level !== "cualquiera" && (
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "3px 10px",
                fontSize: "0.7rem",
                fontWeight: 600,
                borderRadius: "var(--border-radius-full)",
                background: "rgba(255, 255, 255, 0.05)",
                color: "var(--text-secondary)",
                border: "1px solid var(--glass-border)",
              }}>
                {match.skill_level === "principiante" && "⭐ Principiante"}
                {match.skill_level === "intermedio" && "⚡ Intermedio"}
                {match.skill_level === "avanzado" && "🏆 Avanzado"}
              </span>
            )}
            {match.type === "busco_jugador" && match.slots_needed && (
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "3px 10px",
                fontSize: "0.7rem",
                fontWeight: 700,
                borderRadius: "var(--border-radius-full)",
                background: match.sport === "futbol" ? "rgba(34, 197, 94, 0.12)" : "rgba(59, 130, 246, 0.12)",
                color: match.sport === "futbol" ? "var(--color-futbol)" : "var(--color-padel)",
                border: match.sport === "futbol" ? "1px solid rgba(34, 197, 94, 0.25)" : "1px solid rgba(59, 130, 246, 0.25)",
              }}>
                👥 Faltan {match.slots_needed}
              </span>
            )}
          </div>
          <span className={`badge badge-status-${match.status ?? "abierto"}`}>
            {match.status}
          </span>
        </div>

        <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "4px" }}>
          📍{" "}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationDisplay)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "inherit", textDecoration: "underline", textDecorationStyle: "dotted", cursor: "pointer" }}
            title="Ver ubicación en Google Maps"
          >
            {locationDisplay}
          </a>
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "4px" }}>
          🗓️ {formatDate(match.scheduled_at)}
        </p>
        <p style={{ color: "var(--text-tertiary)", fontSize: "0.85rem", marginBottom: "16px" }}>
          🎯 {typeLabel}
          {(match.min_age || match.max_age) && (
            <span> · 👥 {match.min_age ?? "?"}-{match.max_age ?? "?"} años</span>
          )}
        </p>

        {/* Creator with reputation */}
        {match.creator && (
          <Link href={`/players/${match.creator.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              paddingTop: "12px", borderTop: "1px solid var(--glass-border)",
              transition: "opacity var(--transition-fast)",
            }}>
              <div className="avatar avatar-sm">
                {match.creator.avatar_url ? (
                  <img src={match.creator.avatar_url} alt={match.creator.first_name} />
                ) : (
                  getInitials(match.creator.first_name, match.creator.last_name)
                )}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "0.85rem" }}>
                  Creado por <strong>{match.creator.first_name}</strong>
                  {match.creator.birth_date && (
                    <span style={{ color: "var(--text-tertiary)" }}> · {calculateAge(match.creator.birth_date)} años</span>
                  )}
                </span>
                {creatorRep && (
                  <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "2px" }}>
                    ⚽ {creatorRep.matchesPlayed} partidos
                    {creatorRep.flakeCount > 0 && <span> · 👻 {creatorRep.flakeCount}</span>}
                    {creatorRep.conflictiveCount > 0 && <span> · ⚠️ {creatorRep.conflictiveCount}</span>}
                  </p>
                )}
              </div>
            </div>
          </Link>
        )}

        {/* Share Button */}
        {match.creator && (
          <MatchShareButton
            sportEmoji={sportEmoji}
            sportLabel={sportLabel}
            typeLabel={typeLabel}
            locationDisplay={locationDisplay}
            scheduledAt={match.scheduled_at}
            pricePerPerson={match.price_per_person}
            creatorName={match.creator.first_name}
            creatorAvatar={match.creator.avatar_url}
          />
        )}
      </GlassCard>

      {/* Creator Actions */}
      {isCreator && (match.status === "abierto" || match.status === "confirmado") && (
        <div style={{ marginTop: "16px" }}>
          <MatchActions
            matchId={id}
            matchStatus={match.status ?? "abierto"}
            matchType={match.type}
            acceptedPlayers={acceptedPlayers}
          />
        </div>
      )}

      {/* Player Actions / Application Status */}
      {!isCreator && match.status === "abierto" && (
        <div style={{ marginTop: "16px" }}>
          {!userRequest ? (
            <ApplyMatchButton matchId={id} />
          ) : (
            <GlassCard padding="md" style={{
              border: `1px solid ${
                userRequest.status === "aceptado"
                  ? "rgba(16, 185, 129, 0.3)"
                  : userRequest.status === "rechazado"
                  ? "rgba(239, 68, 68, 0.3)"
                  : "rgba(255, 255, 255, 0.1)"
              }`,
              background: `${
                userRequest.status === "aceptado"
                  ? "rgba(16, 185, 129, 0.05)"
                  : userRequest.status === "rechazado"
                  ? "rgba(239, 68, 68, 0.05)"
                  : "var(--glass-bg)"
              }`
            }}>
              <p style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                textAlign: "center",
                color: `${
                  userRequest.status === "aceptado"
                    ? "var(--color-accent-green)"
                    : userRequest.status === "rechazado"
                    ? "var(--color-accent-red)"
                    : "var(--text-primary)"
                }`
              }}>
                {userRequest.status === "aceptado" && "🟢 ¡Fuiste aceptado en este partido!"}
                {userRequest.status === "rechazado" && "🔴 El organizador rechazó tu postulación."}
                {userRequest.status === "pendiente" && "🟡 Tu postulación está pendiente de aprobación."}
              </p>
            </GlassCard>
          )}
        </div>
      )}

      {/* MVP Section for completed matches */}
      {match.status === "completado" && (
        <div style={{ marginTop: "24px" }}>
          {mvpResult ? (
            <MVPWinner
              mvpId={mvpResult.mvpId}
              mvpName={mvpResult.mvpName}
              mvpAvatar={mvpResult.mvpAvatar}
              voteCount={mvpResult.voteCount}
              totalVotes={mvpResult.totalVotes}
              sport={match.sport}
            />
          ) : isParticipant ? (
            <MVPVoting
              matchId={id}
              players={mvpEligiblePlayers}
              currentUserId={user.id}
              hasVoted={hasVoted}
            />
          ) : (
            <GlassCard padding="md" className="text-center">
              <p style={{ color: "var(--text-tertiary)", fontSize: "0.9rem" }}>
                El partido ha finalizado. Esperando resultados del MVP.
              </p>
            </GlassCard>
          )}
        </div>
      )}

      {/* Reviews Section for completed matches */}
      {match.status === "completado" && isParticipant && (
        <MatchReviews
          matchId={id}
          otherParticipants={otherParticipants}
          initialReviewedIds={initialReviewedIds}
        />
      )}

      {/* Applicants Section */}
      <div style={{ marginTop: "24px" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "16px" }}>
          Postulaciones ({requests?.length ?? 0})
        </h2>
        <ApplicantList
          requests={requests ?? []}
          matchId={id}
          matchSport={match.sport}
          matchLocation={locationDisplay}
          scheduledAt={match.scheduled_at}
          isCreator={isCreator}
        />
      </div>
    </div>
  );
}
