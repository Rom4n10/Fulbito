"use client";

import { useState } from "react";
import type { Tables } from "@/types/database";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { getInitials } from "@/lib/utils";
import { ReviewModal } from "@/components/ReviewModal";
import Link from "next/link";

interface MatchReviewsProps {
  matchId: string;
  otherParticipants: Tables<"users">[];
  initialReviewedIds: string[];
}

export function MatchReviews({ matchId, otherParticipants, initialReviewedIds }: MatchReviewsProps) {
  const [reviewedIds, setReviewedIds] = useState<string[]>(initialReviewedIds);
  const [activeReviewee, setActiveReviewee] = useState<{ id: string; name: string } | null>(null);

  if (otherParticipants.length === 0) return null;

  return (
    <GlassCard padding="lg" style={{ marginTop: "24px" }} className="animate-fade-in-up">
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
        ⭐ Calificar a tus compañeros
      </h3>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginBottom: "16px" }}>
        Ayudá a mantener la comunidad limpia reportando ausencias o conductas conflictivas.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {otherParticipants.map((player) => {
          const isReviewed = reviewedIds.includes(player.id);
          const name = `${player.first_name} ${player.last_name ?? ""}`.trim();

          return (
            <div
              key={player.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--glass-border)",
                borderRadius: "var(--border-radius-sm)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="avatar avatar-sm">
                  {player.avatar_url ? (
                    <img src={player.avatar_url} alt={player.first_name} />
                  ) : (
                    getInitials(player.first_name, player.last_name)
                  )}
                </div>
                <div>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{name}</span>
                </div>
              </div>

              <div>
                {isReviewed ? (
                  <span
                    className="badge badge-status-abierto"
                    style={{
                      fontSize: "0.7rem",
                      background: "rgba(16, 185, 129, 0.1)",
                      borderColor: "rgba(16, 185, 129, 0.2)",
                    }}
                  >
                    ✓ Calificado
                  </span>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setActiveReviewee({ id: player.id, name })}
                  >
                    Calificar
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {activeReviewee && (
        <ReviewModal
          matchId={matchId}
          revieweeId={activeReviewee.id}
          revieweeName={activeReviewee.name}
          onClose={() => {
            setReviewedIds((prev) => [...prev, activeReviewee.id]);
            setActiveReviewee(null);
          }}
        />
      )}
    </GlassCard>
  );
}
