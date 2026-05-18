"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { getInitials } from "@/lib/utils";
import { submitMVPVote } from "@/app/actions/mvp";

interface Participant {
  id: string;
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
}

interface MVPVotingProps {
  matchId: string;
  participants: Participant[];
  currentUserId: string;
  currentVote: string | null;
  mvpResult: {
    mvpId: string;
    mvpName: string;
    mvpAvatar: string | null;
    voteCount: number;
    totalVotes: number;
  } | null;
}

export function MVPVoting({ matchId, participants, currentUserId, currentVote, mvpResult }: MVPVotingProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [voted, setVoted] = useState<string | null>(currentVote);
  const [error, setError] = useState<string | null>(null);

  async function handleVote(votedForId: string) {
    setLoading(votedForId);
    setError(null);
    const result = await submitMVPVote(matchId, votedForId);
    if (result?.error) {
      setError(result.error);
    } else {
      setVoted(votedForId);
    }
    setLoading(null);
  }

  // Show MVP result if enough votes
  if (mvpResult && mvpResult.voteCount >= 2) {
    return (
      <GlassCard variant="elevated" padding="lg" className="animate-fade-in-up">
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>🏆</div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "4px" }}>
            MVP del partido
          </h3>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginTop: "16px" }}>
            <div className="avatar avatar-lg" style={{
              border: "3px solid var(--color-accent-amber)",
              boxShadow: "0 0 20px rgba(245, 158, 11, 0.4)",
            }}>
              {mvpResult.mvpAvatar ? (
                <img src={mvpResult.mvpAvatar} alt={mvpResult.mvpName} />
              ) : (
                <span style={{ fontSize: "1.1rem" }}>⭐</span>
              )}
            </div>
            <div>
              <p style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-accent-amber)" }}>
                {mvpResult.mvpName}
              </p>
              <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
                {mvpResult.voteCount} de {mvpResult.totalVotes} votos
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  const votableParticipants = participants.filter((p) => p.id !== currentUserId);

  return (
    <GlassCard variant="elevated" padding="lg" className="animate-fade-in-up">
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "4px" }}>
        ⭐ Votá al MVP
      </h3>
      <p style={{ color: "var(--text-tertiary)", fontSize: "0.8rem", marginBottom: "16px" }}>
        {voted ? "¡Gracias por votar!" : "Elegí al mejor jugador del partido"}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {votableParticipants.map((p) => (
          <div key={p.id} style={{
            display: "flex", alignItems: "center", gap: "12px",
            padding: "10px", borderRadius: "var(--border-radius-sm)",
            background: voted === p.id ? "rgba(245, 158, 11, 0.15)" : "var(--glass-bg)",
            border: voted === p.id ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid transparent",
            transition: "all var(--transition-base)",
          }}>
            <div className="avatar avatar-sm">
              {p.avatar_url ? (
                <img src={p.avatar_url} alt={p.first_name} />
              ) : (
                getInitials(p.first_name, p.last_name)
              )}
            </div>
            <span style={{ flex: 1, fontSize: "0.9rem", fontWeight: 500 }}>
              {p.first_name} {p.last_name}
            </span>
            {voted ? (
              voted === p.id && (
                <span style={{ color: "var(--color-accent-amber)", fontWeight: 700 }}>⭐</span>
              )
            ) : (
              <Button
                variant="ghost"
                size="sm"
                loading={loading === p.id}
                onClick={() => handleVote(p.id)}
                style={{ color: "var(--color-accent-amber)" }}
              >
                ⭐ Votar
              </Button>
            )}
          </div>
        ))}
      </div>

      {error && (
        <p style={{ color: "var(--color-accent-red)", fontSize: "0.8rem", marginTop: "8px" }}>{error}</p>
      )}
    </GlassCard>
  );
}
