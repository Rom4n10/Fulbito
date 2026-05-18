"use client";

import { useState } from "react";
import { submitMVPVote } from "@/app/actions/mvp";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { getInitials } from "@/lib/utils";
import type { Tables } from "@/types/database";

type Player = Tables<"users">;

interface MVPVotingProps {
  matchId: string;
  players: Player[];
  currentUserId: string;
  hasVoted: boolean;
}

export function MVPVoting({ matchId, players, currentUserId, hasVoted }: MVPVotingProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState(hasVoted);

  const eligiblePlayers = players.filter((p) => p.id !== currentUserId);

  async function handleVote() {
    if (!selectedId) return;
    setLoading(true);
    const res = await submitMVPVote(matchId, selectedId);
    if (res.success) {
      setVoted(true);
    } else {
      alert(res.error || "Error al votar");
    }
    setLoading(false);
  }

  if (voted) {
    return (
      <GlassCard padding="md" className="text-center">
        <p style={{ color: "var(--color-accent-green)", fontWeight: 600 }}>¡Gracias por votar!</p>
        <p style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", marginTop: "4px" }}>
          Los resultados del MVP se calcularán automáticamente.
        </p>
      </GlassCard>
    );
  }

  if (eligiblePlayers.length === 0) {
    return null;
  }

  return (
    <GlassCard padding="md">
      <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px", textAlign: "center" }}>
        Elegí al Jugador Destacado (MVP) 🏆
      </h3>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
        {eligiblePlayers.map((player) => (
          <button
            key={player.id}
            onClick={() => setSelectedId(player.id)}
            style={{
              padding: "8px",
              borderRadius: "8px",
              background: selectedId === player.id ? "rgba(16, 185, 129, 0.2)" : "var(--glass-bg)",
              border: `1px solid ${selectedId === player.id ? "var(--color-accent-green)" : "var(--glass-border)"}`,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              transition: "all var(--transition-fast)"
            }}
          >
            <div className="avatar avatar-sm">
              {player.avatar_url ? (
                <img src={player.avatar_url} alt={player.first_name} />
              ) : (
                getInitials(player.first_name, player.last_name)
              )}
            </div>
            <span style={{ fontSize: "0.85rem", fontWeight: selectedId === player.id ? 600 : 400 }}>
              {player.first_name} {player.last_name}
            </span>
          </button>
        ))}
      </div>

      <Button
        variant="primary"
        style={{ width: "100%" }}
        disabled={!selectedId}
        loading={loading}
        onClick={handleVote}
      >
        Votar MVP
      </Button>
    </GlassCard>
  );
}
